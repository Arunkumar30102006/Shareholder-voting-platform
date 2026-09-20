import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

function computeVoteHash(previousHash, shareholderId, resolutionId, choice, weight, timestamp) {
  const payload = `${previousHash}|${shareholderId}|${resolutionId}|${choice}|${weight}|${timestamp}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

class MockVotingDatabase {
  constructor() {
    this.votes = new Map(); // key: `${resolutionId}:${shareholderId}`
    this.ledger = []; // ordered array of hashes
    this.lastHash = "0000000000000000000000000000000000000000000000000000000000000000";
    this.voterMaster = new Map(); // key: shareholderId -> { record_date_shares, live_shares }
    this.resolutions = new Map(); // key: resolutionId -> { for_shares, against_shares, abstain_shares }
    this.mutex = Promise.resolve();
  }

  setupShareholder(id, recordDateShares, liveShares) {
    this.voterMaster.set(id, { record_date_shares: recordDateShares, live_shares: liveShares });
  }

  setupResolution(id) {
    this.resolutions.set(id, { for_shares: 0, against_shares: 0, abstain_shares: 0 });
  }

  // Atomic vote execution simulating PostgreSQL SERIALIZABLE transaction with UNIQUE constraint
  async castVote(shareholderId, resolutionId, choice) {
    // Acquire transaction lock simulating PostgreSQL table/row locks
    let unlock;
    const prevMutex = this.mutex;
    this.mutex = new Promise((resolve) => {
      unlock = resolve;
    });

    try {
      await prevMutex;

      // Small async tick to simulate network/disk IO
      await new Promise((r) => setTimeout(r, Math.random() * 5));

      const key = `${resolutionId}:${shareholderId}`;

      // Invariant 1: Duplicate check (enforced by UNIQUE (resolution_id, shareholder_id))
      if (this.votes.has(key)) {
        throw new Error("23505: unique_violation - Shareholder has already voted on this resolution");
      }

      // Invariant 2: Frozen record date shares (not live mutable balance)
      const voter = this.voterMaster.get(shareholderId);
      if (!voter) {
        throw new Error("Shareholder not found in voter master");
      }
      const weight = voter.record_date_shares; // Always use frozen record date shares!

      const timestamp = Date.now();
      const prevHash = this.lastHash;
      const voteHash = computeVoteHash(prevHash, shareholderId, resolutionId, choice, weight, timestamp);

      // Record vote
      const voteRecord = {
        vote_id: crypto.randomUUID(),
        shareholder_id: shareholderId,
        resolution_id: resolutionId,
        vote_choice: choice,
        vote_weight: weight,
        vote_hash: voteHash,
        previous_hash: prevHash,
        created_at: timestamp
      };

      this.votes.set(key, voteRecord);
      this.ledger.push(voteRecord);
      this.lastHash = voteHash;

      // Update resolution tallies
      const res = this.resolutions.get(resolutionId);
      if (choice === "FOR") res.for_shares += weight;
      else if (choice === "AGAINST") res.against_shares += weight;
      else if (choice === "ABSTAIN") res.abstain_shares += weight;

      return { success: true, vote: voteRecord };
    } finally {
      unlock();
    }
  }
}

test("Concurrent duplicate voting attempts: exactly 1 succeeds, all others encounter unique violation", async () => {
  const db = new MockVotingDatabase();
  const shareholderId = "sh-test-101";
  const resolutionId = "res-test-999";

  db.setupShareholder(shareholderId, 5000, 5000);
  db.setupResolution(resolutionId);

  // Fire 10 concurrent requests to vote on the exact same resolution and shareholder
  const concurrentAttempts = 10;
  const promises = [];

  for (let i = 0; i < concurrentAttempts; i++) {
    const choice = i % 2 === 0 ? "FOR" : "AGAINST";
    promises.push(
      db.castVote(shareholderId, resolutionId, choice)
        .then((res) => ({ success: true, res }))
        .catch((err) => ({ success: false, error: err.message }))
    );
  }

  const results = await Promise.all(promises);

  const successes = results.filter((r) => r.success);
  const failures = results.filter((r) => !r.success);

  assert.strictEqual(successes.length, 1, "Exactly one concurrent vote must succeed");
  assert.strictEqual(failures.length, concurrentAttempts - 1, "All redundant concurrent attempts must fail");

  for (const failure of failures) {
    assert.ok(
      failure.error.includes("23505") || failure.error.includes("already voted"),
      "Error must indicate unique constraint violation"
    );
  }

  // Tally must accurately reflect only 1 vote
  const res = db.resolutions.get(resolutionId);
  const totalTalliedShares = res.for_shares + res.against_shares + res.abstain_shares;
  assert.strictEqual(totalTalliedShares, 5000, "Resolution tally must reflect exactly 5000 shares");
});

test("Voting uses frozen record-date shares, immune to subsequent share changes", async () => {
  const db = new MockVotingDatabase();
  const shareholderId = "sh-whale-202";
  const resolutionId = "res-board-approval";

  // Shareholder had 100,000 shares on record date, but sold 90,000 shares post-record date (now has 10,000)
  db.setupShareholder(shareholderId, 100000, 10000);
  db.setupResolution(resolutionId);

  const voteResult = await db.castVote(shareholderId, resolutionId, "FOR");
  assert.strictEqual(voteResult.success, true);
  assert.strictEqual(voteResult.vote.vote_weight, 100000, "Vote weight must use frozen record date shares");

  const res = db.resolutions.get(resolutionId);
  assert.strictEqual(res.for_shares, 100000, "Resolution tally must be credited with 100,000 shares");
});

test("SHA-256 tamper-evident hash chaining validates integrity and detects alteration", async () => {
  const db = new MockVotingDatabase();
  const resolutionId = "res-audit-chain";
  db.setupResolution(resolutionId);

  // Cast 3 successive votes from distinct shareholders
  for (let i = 1; i <= 3; i++) {
    const sId = `shareholder-${i}`;
    db.setupShareholder(sId, i * 1000, i * 1000);
    await db.castVote(sId, resolutionId, "FOR");
  }

  assert.strictEqual(db.ledger.length, 3);

  // Validate chain
  for (let i = 0; i < db.ledger.length; i++) {
    const record = db.ledger[i];
    const expectedPrev = i === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : db.ledger[i - 1].vote_hash;
    assert.strictEqual(record.previous_hash, expectedPrev, "Previous hash must match predecessor's hash");

    const calculatedHash = computeVoteHash(
      record.previous_hash,
      record.shareholder_id,
      record.resolution_id,
      record.vote_choice,
      record.vote_weight,
      record.created_at
    );
    assert.strictEqual(record.vote_hash, calculatedHash, "Hash must be verifiable");
  }

  // Tamper detection: alter a vote record's choice
  const tamperedVote = { ...db.ledger[1], vote_choice: "AGAINST" };
  const recalculatedTamperedHash = computeVoteHash(
    tamperedVote.previous_hash,
    tamperedVote.shareholder_id,
    tamperedVote.resolution_id,
    tamperedVote.vote_choice,
    tamperedVote.vote_weight,
    tamperedVote.created_at
  );

  assert.notStrictEqual(
    tamperedVote.vote_hash,
    recalculatedTamperedHash,
    "Tampered vote must fail cryptographic hash verification"
  );
});
