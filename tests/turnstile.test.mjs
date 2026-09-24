import test from "node:test";
import assert from "node:assert/strict";

// Cloudflare Turnstile Server Verification logic matching supabase/functions/_shared/turnstile.ts
const CLOUDFLARE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const CLOUDFLARE_TEST_SECRET = "1x0000000000000000000000000000000AA";
const CLOUDFLARE_ALWAYS_FAILS_SECRET = "2x0000000000000000000000000000000AA";

async function verifyTurnstileToken(token, clientIp, secretKey = CLOUDFLARE_TEST_SECRET) {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "Missing Turnstile challenge token. Bot verification is required.",
      errorCodes: ["missing-input-response"],
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Verification service temporarily unavailable. Please retry.",
        errorCodes: ["service-unavailable"],
      };
    }

    const data = await response.json();

    if (data.success === true) {
      return {
        success: true,
        challengeTs: data.challenge_ts,
        hostname: data.hostname,
      };
    }

    return {
      success: false,
      error: "Bot protection verification failed. Please try again.",
      errorCodes: data["error-codes"] || ["invalid-token"],
    };
  } catch (err) {
    return {
      success: false,
      error: "Verification request failed. Please check network and retry.",
      errorCodes: ["internal-error"],
    };
  }
}

test("Turnstile rejects null, undefined, or empty token immediately without network call", async () => {
  const resultNull = await verifyTurnstileToken(null);
  assert.strictEqual(resultNull.success, false);
  assert.ok(resultNull.error.includes("Missing Turnstile challenge token"));

  const resultUndefined = await verifyTurnstileToken(undefined);
  assert.strictEqual(resultUndefined.success, false);

  const resultEmpty = await verifyTurnstileToken("   ");
  assert.strictEqual(resultEmpty.success, false);

  const resultNumber = await verifyTurnstileToken(123456);
  assert.strictEqual(resultNumber.success, false);
});

test("Turnstile passes validation using Cloudflare test pass key", async () => {
  // Cloudflare test token for 1x00000000000000000000AA sitekey
  const dummyToken = "XXXX.DUMMY.TOKEN.XXXX";
  const result = await verifyTurnstileToken(dummyToken, "127.0.0.1", CLOUDFLARE_TEST_SECRET);
  assert.strictEqual(result.success, true, "Cloudflare official test pass secret should validate test token");
});

test("Turnstile rejects validation using Cloudflare always-fails test key", async () => {
  const dummyToken = "XXXX.DUMMY.TOKEN.XXXX";
  const result = await verifyTurnstileToken(dummyToken, "127.0.0.1", CLOUDFLARE_ALWAYS_FAILS_SECRET);
  assert.strictEqual(result.success, false, "Cloudflare always-fails secret must reject");
  assert.ok(result.error.includes("failed"), "Error message must indicate failure");
});

test("Protected endpoint pipeline blocks execution before expensive operations", async () => {
  let dbQueried = false;
  let otpDispatched = false;

  async function mockShareholderAuth(turnstileToken) {
    // Pipeline Step 1: Turnstile Verification
    const turnstile = await verifyTurnstileToken(turnstileToken, "127.0.0.1", CLOUDFLARE_ALWAYS_FAILS_SECRET);
    if (!turnstile.success) {
      return { status: 403, error: turnstile.error };
    }

    // Pipeline Step 2: Database query
    dbQueried = true;

    // Pipeline Step 3: OTP dispatch
    otpDispatched = true;
    return { status: 200, success: true };
  }

  // Attempt without token
  const resNoToken = await mockShareholderAuth("");
  assert.strictEqual(resNoToken.status, 403);
  assert.strictEqual(dbQueried, false, "Database must not be queried when Turnstile is missing");
  assert.strictEqual(otpDispatched, false, "OTP must not be dispatched when Turnstile is missing");

  // Attempt with invalid token
  const resBadToken = await mockShareholderAuth("invalid-token-123");
  assert.strictEqual(resBadToken.status, 403);
  assert.strictEqual(dbQueried, false, "Database must not be queried when Turnstile fails");
  assert.strictEqual(otpDispatched, false, "OTP must not be dispatched when Turnstile fails");
});
