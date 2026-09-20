import test from "node:test";
import assert from "node:assert/strict";

// -----------------------------------------------------------------------------
// 1. STATUTORY EVENT TYPE & EGM GOVERNANCE SPECIFICATION
// -----------------------------------------------------------------------------
const VALID_EVENT_TYPES = new Set(["AGM", "EGM", "GENERAL_MEETING", "POSTAL_BALLOT"]);
const VALID_EGM_REQUISITIONS = new Set([
  "BOARD_CONVENED",
  "MEMBER_REQUISITION_SEC_100",
  "NCLT_DIRECTED"
]);

function validateEventPayload(payload) {
  if (!VALID_EVENT_TYPES.has(payload.event_type)) {
    throw new Error(`Invalid event_type: ${payload.event_type}. Must be AGM, EGM, GENERAL_MEETING, or POSTAL_BALLOT.`);
  }

  if (payload.event_type === "EGM") {
    if (payload.egm_requisition_type && !VALID_EGM_REQUISITIONS.has(payload.egm_requisition_type)) {
      throw new Error(`Invalid egm_requisition_type: ${payload.egm_requisition_type}`);
    }
  }

  if (!payload.voting_start || !payload.voting_end) {
    throw new Error("Canonical voting_start and voting_end are mandatory.");
  }

  const start = new Date(payload.voting_start).getTime();
  const end = new Date(payload.voting_end).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) {
    throw new Error("voting_end must be strictly after voting_start.");
  }

  return true;
}

// -----------------------------------------------------------------------------
// 2. SERVER-SIDE LIFECYCLE STATE MACHINE
// -----------------------------------------------------------------------------
const ALLOWED_TRANSITIONS = {
  draft: new Set(["published"]),
  published: new Set(["open"]),
  open: new Set(["closed"]),
  closed: new Set(["results_finalized", "open"]), // "open" allowed for emergency administrative reopen
  results_finalized: new Set(["archived"]),
  archived: new Set([]), // Terminal state
};

function transitionEventStatus(currentStatus, targetStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.has(targetStatus)) {
    throw new Error(
      `Illegal voting event lifecycle transition from '${currentStatus}' to '${targetStatus}'.`
    );
  }
  return targetStatus;
}

// -----------------------------------------------------------------------------
// 3. SECTION 114 STATUTORY MAJORITY DETERMINATION
// -----------------------------------------------------------------------------
export function evaluateResolutionOutcome(resolutionType, forVotes, againstVotes) {
  const validVotes = forVotes + againstVotes;

  if (validVotes === 0) {
    return { passed: false, reason: "NO_VALID_VOTES_CAST" };
  }

  switch (resolutionType.toLowerCase()) {
    case "special": {
      // Companies Act, 2013 Section 114(2):
      // Votes cast in favor must be not less than three times the number of votes cast against
      const passed = forVotes >= 3 * againstVotes;
      return {
        passed,
        statute: "Section 114(2)",
        approvalRatio: forVotes / validVotes,
        condition: `${forVotes} >= 3 * ${againstVotes} (${3 * againstVotes})`
      };
    }
    case "unanimous": {
      const passed = forVotes > 0 && againstVotes === 0;
      return {
        passed,
        statute: "Unanimous Consent",
        approvalRatio: againstVotes === 0 ? 1.0 : 0.0,
        condition: `${forVotes} > 0 && ${againstVotes} === 0`
      };
    }
    case "ordinary":
    default: {
      // Companies Act, 2013 Section 114(1):
      // Votes cast in favor must exceed the votes cast against
      const passed = forVotes > againstVotes;
      return {
        passed,
        statute: "Section 114(1)",
        approvalRatio: forVotes / validVotes,
        condition: `${forVotes} > ${againstVotes}`
      };
    }
  }
}

// -----------------------------------------------------------------------------
// 4. MOCK DATA STORE FOR ENROLLMENT & IDOR VERIFICATION
// -----------------------------------------------------------------------------
class MockDatabase {
  constructor() {
    this.sessions = new Map();
    this.voterMaster = [];
    this.votes = [];
  }

  addSession(session) {
    this.sessions.set(session.id, session);
  }

  enrollShareholder(sessionId, shareholderId, sharesCount, isEligible = true) {
    this.voterMaster.push({
      session_id: sessionId,
      shareholder_id: shareholderId,
      shares_count: sharesCount,
      is_eligible: isEligible
    });
  }

  // Simulates service-role-only get_eligible_events_for_shareholder
  getEligibleEventsForShareholder(shareholderId) {
    const enrolledSessionIds = new Set(
      this.voterMaster
        .filter((vm) => vm.shareholder_id === shareholderId && vm.is_eligible)
        .map((vm) => vm.session_id)
    );

    const results = [];
    for (const [id, s] of this.sessions) {
      if (enrolledSessionIds.has(id) && ["published", "open"].includes(s.status)) {
        results.push({
          session_id: s.id,
          event_type: s.event_type,
          title: s.title,
          status: s.status,
          voting_start: s.voting_start,
          voting_end: s.voting_end
        });
      }
    }
    return results;
  }

  // Simulates service-role-only get_event_details_for_shareholder
  getEventDetailsForShareholder(shareholderId, sessionId) {
    const enrollment = this.voterMaster.find(
      (vm) => vm.session_id === sessionId && vm.shareholder_id === shareholderId && vm.is_eligible
    );

    if (!enrollment) return null; // Not enrolled -> returns 0 rows

    const session = this.sessions.get(sessionId);
    if (!session || !["published", "open"].includes(session.status)) {
      return null;
    }

    return {
      session_id: session.id,
      event_type: session.event_type,
      title: session.title,
      status: session.status,
      shares_count: enrollment.shares_count,
      voting_start: session.voting_start,
      voting_end: session.voting_end,
      is_short_notice: !!session.is_short_notice,
      egm_requisition_type: session.egm_requisition_type || null,
      explanatory_statement_reference: session.explanatory_statement_reference || null
    };
  }

  // Simulates cast_authorized_vote RPC
  castVote(shareholderId, sessionId, resolutionId, voteValue, currentTime = new Date()) {
    const enrollment = this.voterMaster.find(
      (vm) => vm.session_id === sessionId && vm.shareholder_id === shareholderId && vm.is_eligible
    );
    if (!enrollment) {
      throw new Error("UNAUTHORIZED_VOTER: Shareholder is not on the record-date roster.");
    }

    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");

    if (session.status !== "open") {
      throw new Error(`BALLOT_LOCKED: Voting event is in status '${session.status}', must be 'open'.`);
    }

    const now = currentTime.getTime();
    const start = new Date(session.voting_start).getTime();
    const end = new Date(session.voting_end).getTime();

    if (now < start) {
      throw new Error("VOTING_NOT_STARTED: The canonical voting window has not opened yet.");
    }
    if (now > end) {
      throw new Error("VOTING_EXPIRED: The canonical voting cutoff has elapsed.");
    }

    const existing = this.votes.find(
      (v) => v.session_id === sessionId && v.resolution_id === resolutionId && v.shareholder_id === shareholderId
    );
    if (existing) {
      throw new Error("DUPLICATE_VOTE: Ballot has already been cast for this resolution.");
    }

    const record = {
      session_id: sessionId,
      resolution_id: resolutionId,
      shareholder_id: shareholderId,
      vote_value: voteValue,
      weighted_votes: enrollment.shares_count,
      created_at: currentTime.toISOString()
    };
    this.votes.push(record);
    return record;
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE: GENERIC EVENT ENGINE & EGM PLATFORM
// -----------------------------------------------------------------------------

test("Event Classification: rejects invalid meeting types and accepts AGM, EGM, GENERAL_MEETING, POSTAL_BALLOT", () => {
  assert.doesNotThrow(() =>
    validateEventPayload({
      event_type: "AGM",
      voting_start: "2026-10-01T09:00:00Z",
      voting_end: "2026-10-03T17:00:00Z"
    })
  );

  assert.doesNotThrow(() =>
    validateEventPayload({
      event_type: "EGM",
      egm_requisition_type: "MEMBER_REQUISITION_SEC_100",
      voting_start: "2026-10-01T09:00:00Z",
      voting_end: "2026-10-03T17:00:00Z"
    })
  );

  assert.doesNotThrow(() =>
    validateEventPayload({
      event_type: "POSTAL_BALLOT",
      voting_start: "2026-10-01T09:00:00Z",
      voting_end: "2026-10-31T17:00:00Z"
    })
  );

  assert.throws(
    () =>
      validateEventPayload({
        event_type: "BOARD_MEETING",
        voting_start: "2026-10-01T09:00:00Z",
        voting_end: "2026-10-03T17:00:00Z"
      }),
    /Invalid event_type: BOARD_MEETING/
  );

  assert.throws(
    () =>
      validateEventPayload({
        event_type: "EGM",
        egm_requisition_type: "INVALID_REQUISITION",
        voting_start: "2026-10-01T09:00:00Z",
        voting_end: "2026-10-03T17:00:00Z"
      }),
    /Invalid egm_requisition_type/
  );
});

test("Lifecycle State Machine: allows legitimate sequential transitions and blocks illegal jumps", () => {
  // Valid progression: draft -> published -> open -> closed -> results_finalized -> archived
  assert.strictEqual(transitionEventStatus("draft", "published"), "published");
  assert.strictEqual(transitionEventStatus("published", "open"), "open");
  assert.strictEqual(transitionEventStatus("open", "closed"), "closed");
  assert.strictEqual(transitionEventStatus("closed", "results_finalized"), "results_finalized");
  assert.strictEqual(transitionEventStatus("results_finalized", "archived"), "archived");

  // Emergency reopen allowed from closed -> open
  assert.strictEqual(transitionEventStatus("closed", "open"), "open");

  // Disallowed illegal transitions
  assert.throws(() => transitionEventStatus("draft", "results_finalized"), /Illegal voting event lifecycle/);
  assert.throws(() => transitionEventStatus("closed", "published"), /Illegal voting event lifecycle/);
  assert.throws(() => transitionEventStatus("archived", "draft"), /Illegal voting event lifecycle/);
  assert.throws(() => transitionEventStatus("results_finalized", "open"), /Illegal voting event lifecycle/);
});

test("Section 114 Statutory Majority: Ordinary Resolution requires FOR > AGAINST", () => {
  // 51 For, 49 Against -> passes
  const res1 = evaluateResolutionOutcome("ordinary", 51, 49);
  assert.strictEqual(res1.passed, true);

  // 50 For, 50 Against -> fails (not strictly greater)
  const res2 = evaluateResolutionOutcome("ordinary", 50, 50);
  assert.strictEqual(res2.passed, false);

  // 49 For, 51 Against -> fails
  const res3 = evaluateResolutionOutcome("ordinary", 49, 51);
  assert.strictEqual(res3.passed, false);

  // 100 For, 0 Against -> passes
  const res4 = evaluateResolutionOutcome("ordinary", 100, 0);
  assert.strictEqual(res4.passed, true);
});

test("Section 114 Statutory Majority: Special Resolution requires FOR >= 3 * AGAINST (>= 75%)", () => {
  // Exact 75% threshold: 75 For, 25 Against -> 75 >= 3 * 25 (75) -> passes
  const resExact = evaluateResolutionOutcome("special", 75, 25);
  assert.strictEqual(resExact.passed, true, "Exact 75% assent must pass Section 114(2)");

  // 76 For, 24 Against -> 76 >= 72 -> passes
  const resAbove = evaluateResolutionOutcome("special", 76, 24);
  assert.strictEqual(resAbove.passed, true);

  // 74 For, 26 Against -> 74 < 78 -> fails (fell below 75%)
  const resBelow = evaluateResolutionOutcome("special", 74, 26);
  assert.strictEqual(resBelow.passed, false, "74% assent must fail Section 114(2)");

  // 2 For, 1 Against (66.7%) -> 2 < 3 -> fails
  const resTwoToOne = evaluateResolutionOutcome("special", 2, 1);
  assert.strictEqual(resTwoToOne.passed, false);

  // 3 For, 1 Against (75%) -> 3 >= 3 -> passes
  const resThreeToOne = evaluateResolutionOutcome("special", 3, 1);
  assert.strictEqual(resThreeToOne.passed, true);

  // 10 For, 0 Against -> passes
  const resUnanimousAssent = evaluateResolutionOutcome("special", 10, 0);
  assert.strictEqual(resUnanimousAssent.passed, true);

  // 0 For, 0 Against -> fails (no valid votes cast)
  const resNoVotes = evaluateResolutionOutcome("special", 0, 0);
  assert.strictEqual(resNoVotes.passed, false);
});

test("Test A: Event Switching IDOR Protection — Shareholder cannot query un-enrolled event ballots", () => {
  const db = new MockDatabase();

  const companyA_AGM = {
    id: "session-company-a-agm",
    event_type: "AGM",
    title: "Company A 2026 AGM",
    status: "open",
    voting_start: "2026-09-01T00:00:00Z",
    voting_end: "2026-10-01T00:00:00Z"
  };

  const companyB_EGM = {
    id: "session-company-b-egm",
    event_type: "EGM",
    title: "Company B Extraordinary General Meeting",
    status: "open",
    voting_start: "2026-09-01T00:00:00Z",
    voting_end: "2026-10-01T00:00:00Z",
    is_short_notice: true,
    egm_requisition_type: "MEMBER_REQUISITION_SEC_100",
    explanatory_statement_reference: "Annexure-B1"
  };

  db.addSession(companyA_AGM);
  db.addSession(companyB_EGM);

  const shareholderAlice = "shareholder-alice-id";
  const shareholderBob = "shareholder-bob-id";

  // Alice is ONLY enrolled in Company A's AGM
  db.enrollShareholder(companyA_AGM.id, shareholderAlice, 500);

  // Bob is enrolled in Company B's EGM
  db.enrollShareholder(companyB_EGM.id, shareholderBob, 1200);

  // 1. Alice lists eligible events -> sees ONLY Company A's AGM
  const aliceEvents = db.getEligibleEventsForShareholder(shareholderAlice);
  assert.strictEqual(aliceEvents.length, 1);
  assert.strictEqual(aliceEvents[0].session_id, companyA_AGM.id);

  // 2. Alice requests details for her eligible event -> succeeds
  const aliceDetail = db.getEventDetailsForShareholder(shareholderAlice, companyA_AGM.id);
  assert.ok(aliceDetail);
  assert.strictEqual(aliceDetail.shares_count, 500);

  // 3. IDOR Attack: Alice tries to supply ?event=session-company-b-egm
  // The server checks enrollment for Alice on Company B's session -> returns null (404/403)
  const aliceIdorAttempt = db.getEventDetailsForShareholder(shareholderAlice, companyB_EGM.id);
  assert.strictEqual(aliceIdorAttempt, null, "Server must block access to un-enrolled event regardless of ?event parameter");

  // 4. Bob queries Company B's EGM -> succeeds and receives EGM governance fields
  const bobDetail = db.getEventDetailsForShareholder(shareholderBob, companyB_EGM.id);
  assert.ok(bobDetail);
  assert.strictEqual(bobDetail.event_type, "EGM");
  assert.strictEqual(bobDetail.is_short_notice, true);
  assert.strictEqual(bobDetail.egm_requisition_type, "MEMBER_REQUISITION_SEC_100");
  assert.strictEqual(bobDetail.explanatory_statement_reference, "Annexure-B1");
});

test("Test B: Closed Event Ballot Access — Server strictly blocks voting on closed or expired sessions", () => {
  const db = new MockDatabase();

  const now = new Date("2026-09-20T12:00:00Z");

  const closedSession = {
    id: "session-closed-egm",
    event_type: "EGM",
    title: "Closed EGM",
    status: "closed", // Closed status
    voting_start: "2026-09-10T00:00:00Z",
    voting_end: "2026-09-19T00:00:00Z"
  };

  const activeSession = {
    id: "session-active-egm",
    event_type: "EGM",
    title: "Active EGM",
    status: "open",
    voting_start: "2026-09-15T00:00:00Z",
    voting_end: "2026-09-25T00:00:00Z"
  };

  db.addSession(closedSession);
  db.addSession(activeSession);

  const shareholder = "shareholder-charlie";
  db.enrollShareholder(closedSession.id, shareholder, 300);
  db.enrollShareholder(activeSession.id, shareholder, 300);

  // 1. Voting on closed session fails immediately at server boundary
  assert.throws(
    () => db.castVote(shareholder, closedSession.id, "res-1", "FOR", now),
    /BALLOT_LOCKED: Voting event is in status 'closed'/
  );

  // 2. Voting on active session succeeds
  const vote = db.castVote(shareholder, activeSession.id, "res-1", "FOR", now);
  assert.strictEqual(vote.weighted_votes, 300);
  assert.strictEqual(vote.vote_value, "FOR");

  // 3. Duplicate voting on same resolution is strictly rejected
  assert.throws(
    () => db.castVote(shareholder, activeSession.id, "res-1", "AGAINST", now),
    /DUPLICATE_VOTE/
  );

  // 4. Voting outside window (e.g. future date) is rejected
  const futureTime = new Date("2026-09-26T00:00:00Z");
  assert.throws(
    () => db.castVote(shareholder, activeSession.id, "res-2", "FOR", futureTime),
    /VOTING_EXPIRED/
  );
});
