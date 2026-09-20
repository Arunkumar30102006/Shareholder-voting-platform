import test from "node:test";
import assert from "node:assert/strict";

const ALLOWED_ORIGINS = [
  "https://www.shareholdervoting.in",
  "https://shareholdervoting.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

function validateOrigin(method, originHeader, refererHeader) {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    if (!originHeader) {
      if (!refererHeader) return false;
      try {
        const refUrl = new URL(refererHeader);
        return ALLOWED_ORIGINS.includes(refUrl.origin);
      } catch {
        return false;
      }
    }
    return ALLOWED_ORIGINS.includes(originHeader);
  }
  return true;
}

function buildSessionCookie(token, maxAgeSeconds = 7200) {
  return `voting_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSeconds}`;
}

function verifyCsrfToken(requestCsrfHeader, sessionCsrfToken) {
  if (!requestCsrfHeader || !sessionCsrfToken) {
    return false;
  }
  return requestCsrfHeader === sessionCsrfToken;
}

test("Origin validation allows legitimate origins on state-changing POST", () => {
  for (const origin of ALLOWED_ORIGINS) {
    assert.strictEqual(
      validateOrigin("POST", origin, null),
      true,
      `Origin ${origin} should be allowed`
    );
  }
});

test("Origin validation blocks untrusted origins on POST", () => {
  const evilOrigins = [
    "https://evil-hacker.com",
    "https://shareholdervoting.in.attacker.org",
    "http://untrusted-site.net",
    "null"
  ];

  for (const origin of evilOrigins) {
    assert.strictEqual(
      validateOrigin("POST", origin, null),
      false,
      `Origin ${origin} must be rejected`
    );
  }
});

test("Origin validation blocks state-changing requests without Origin or Referer", () => {
  assert.strictEqual(validateOrigin("POST", null, null), false);
  assert.strictEqual(validateOrigin("DELETE", "", ""), false);
});

test("Origin validation safely handles Referer fallback if Origin header is missing", () => {
  assert.strictEqual(
    validateOrigin("POST", null, "https://www.shareholdervoting.in/voting"),
    true
  );
  assert.strictEqual(
    validateOrigin("POST", null, "https://phishing.com/vote"),
    false
  );
  assert.strictEqual(
    validateOrigin("POST", null, "invalid-url"),
    false
  );
});

test("Origin validation allows safe read-only methods (GET, OPTIONS)", () => {
  assert.strictEqual(validateOrigin("GET", "https://untrusted.com", null), true);
  assert.strictEqual(validateOrigin("OPTIONS", "https://untrusted.com", null), true);
});

test("CSRF token verification accepts identical token and rejects missing or forged tokens", () => {
  const genuineCsrfToken = "a1b2c3d4e5f6789012345678abcdef01";

  // Matching token
  assert.strictEqual(
    verifyCsrfToken(genuineCsrfToken, genuineCsrfToken),
    true,
    "Valid matching CSRF token must be accepted"
  );

  // Missing header
  assert.strictEqual(
    verifyCsrfToken(null, genuineCsrfToken),
    false,
    "Missing CSRF token must be rejected"
  );

  // Forged or wrong token
  assert.strictEqual(
    verifyCsrfToken("forged-token-attempt", genuineCsrfToken),
    false,
    "Forged CSRF token must be rejected"
  );
});

test("Session cookie has strict security attributes", () => {
  const cookie = buildSessionCookie("sample-session-token-xyz");

  assert.ok(cookie.includes("HttpOnly"), "Must include HttpOnly flag");
  assert.ok(cookie.includes("Secure"), "Must include Secure flag");
  assert.ok(cookie.includes("SameSite=Strict"), "Must include SameSite=Strict flag");
  assert.ok(cookie.includes("Path=/"), "Must include Path=/");
  assert.ok(cookie.includes("Max-Age=7200"), "Must specify proper Max-Age");
});
