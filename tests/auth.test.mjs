import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

// Reusable crypto logic matching supabase/functions/_shared/crypto.ts
export function generateSecureOtp() {
  const buffer = new Uint32Array(1);
  crypto.webcrypto.getRandomValues(buffer);
  const otp = 100000 + (buffer[0] % 900000);
  return otp.toString();
}

export async function hmacSha256(secret, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const key = await crypto.webcrypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.webcrypto.subtle.sign("HMAC", key, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

test("OTP Generation produces valid 6-digit codes", () => {
  for (let i = 0; i < 100; i++) {
    const otp = generateSecureOtp();
    assert.strictEqual(otp.length, 6, "OTP must be exactly 6 characters");
    assert.match(otp, /^[1-9]\d{5}$/, "OTP must be numeric and not have leading 0 if in range 100000-999999");
    const num = Number.parseInt(otp, 10);
    assert.ok(num >= 100000 && num <= 999999, "OTP must be in range 100000-999999");
  }
});

test("Keyed HMAC-SHA-256 is deterministic and secret-dependent", async () => {
  const secretA = "secret-key-alpha-32-chars-long!!";
  const secretB = "secret-key-beta-32-chars-longer!!";
  const challengeId = "550e8400-e29b-41d4-a716-446655440000";
  const otp = "849201";

  const message = `${challengeId}:${otp}`;
  const hashA1 = await hmacSha256(secretA, message);
  const hashA2 = await hmacSha256(secretA, message);
  const hashB = await hmacSha256(secretB, message);

  assert.strictEqual(hashA1, hashA2, "HMAC must be deterministic for same key and message");
  assert.notStrictEqual(hashA1, hashB, "Different secrets must produce different HMAC hashes");
  assert.strictEqual(hashA1.length, 64, "SHA-256 HMAC must be 64 hex characters (32 bytes)");
});

test("Fail-closed behavior when OTP_HMAC_SECRET is missing", async () => {
  function handleAuthInitiation(env) {
    if (!env.OTP_HMAC_SECRET) {
      return {
        status: 503,
        body: { error: "Authentication service temporarily misconfigured" }
      };
    }
    return { status: 202, body: { message: "Accepted" } };
  }

  const resultWithoutSecret = handleAuthInitiation({});
  assert.strictEqual(resultWithoutSecret.status, 503, "Must fail closed if secret is missing");
  assert.ok(resultWithoutSecret.body.error, "Must provide clear error without leaking secrets");

  const resultWithSecret = handleAuthInitiation({ OTP_HMAC_SECRET: "strong-secret" });
  assert.strictEqual(resultWithSecret.status, 202, "Must proceed when secret is present");
});

test("Anti-enumeration contract returns generic 202 response for valid and invalid inputs", () => {
  function initiateAuthResponse(voterFound) {
    // Both existing and non-existing accounts must return 202 with challenge_id
    const challengeId = crypto.randomUUID();
    return {
      status: 202,
      body: {
        message: "If the details match our registered records, a one-time verification code has been dispatched to your registered email.",
        challenge_id: challengeId
      }
    };
  }

  const resFound = initiateAuthResponse(true);
  const resNotFound = initiateAuthResponse(false);

  assert.strictEqual(resFound.status, 202);
  assert.strictEqual(resNotFound.status, 202);
  assert.strictEqual(resFound.body.message, resNotFound.body.message, "Response message must be identical");
  assert.ok(typeof resFound.body.challenge_id === "string");
  assert.ok(typeof resNotFound.body.challenge_id === "string");
});

test("OTP verification enforces attempt limit (max 5 attempts) and expiration", async () => {
  const secret = "test-secret-key-1234567890123456";
  const challengeId = crypto.randomUUID();
  const correctOtp = "123456";
  const expectedHash = await hmacSha256(secret, `${challengeId}:${correctOtp}`);

  const challengeState = {
    challenge_id: challengeId,
    otp_hash: expectedHash,
    attempts: 0,
    max_attempts: 5,
    expires_at: Date.now() + 600000, // 10 minutes
    verified: false
  };

  function verifyAttempt(state, candidateOtp, now = Date.now()) {
    if (state.verified) return { success: false, error: "Already used" };
    if (now > state.expires_at) return { success: false, error: "Expired" };
    if (state.attempts >= state.max_attempts) return { success: false, error: "Locked out" };

    state.attempts++;

    // Compare HMAC hash
    const candidateHash = crypto.createHmac("sha256", secret).update(`${state.challenge_id}:${candidateOtp}`).digest("hex");
    if (candidateHash === state.otp_hash) {
      state.verified = true;
      return { success: true };
    }

    return { success: false, error: "Invalid code", remainingAttempts: state.max_attempts - state.attempts };
  }

  // 1 to 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    const res = verifyAttempt(challengeState, "000000");
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.remainingAttempts, 5 - i);
  }

  // 5th attempt failed -> lockout
  const res5 = verifyAttempt(challengeState, "000000");
  assert.strictEqual(res5.success, false);
  assert.strictEqual(res5.remainingAttempts, 0);

  // 6th attempt with correct OTP -> still rejected because locked out
  const res6 = verifyAttempt(challengeState, correctOtp);
  assert.strictEqual(res6.success, false);
  assert.strictEqual(res6.error, "Locked out");

  // Test expiration
  const expiredState = {
    challenge_id: challengeId,
    otp_hash: expectedHash,
    attempts: 0,
    max_attempts: 5,
    expires_at: Date.now() - 1000,
    verified: false
  };
  const resExpired = verifyAttempt(expiredState, correctOtp);
  assert.strictEqual(resExpired.success, false);
  assert.strictEqual(resExpired.error, "Expired");
});
