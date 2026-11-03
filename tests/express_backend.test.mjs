import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { default: app } = await import("../server/index.js");

test("Express Backend Integration Tests", async (t) => {
  let server;
  const TEST_PORT = 5098;
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

  await new Promise((resolve, reject) => {
    server = app.listen(TEST_PORT, "127.0.0.1", (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  t.after(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  await t.test("GET /api/health should return status ok", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.status, "ok");
    assert.equal(json.service, "Vote India Secure Express Backend");
  });

  await t.test("POST /api/companies/register without body should return 400", async () => {
    const res = await fetch(`${BASE_URL}/api/companies/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error);
  });

  await t.test("POST /api/voting/cast-vote without required fields should return 400", async () => {
    const res = await fetch(`${BASE_URL}/api/voting/cast-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error);
  });

  await t.test("POST /api/shareholders/auth/initiate with empty credentials should return 400", async () => {
    const res = await fetch(`${BASE_URL}/api/shareholders/auth/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: "", password: "" }),
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.error);
  });

  await t.test("POST /api/cast-vote top-level alias route validates payload", async () => {
    const res = await fetch(`${BASE_URL}/api/cast-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });
});
