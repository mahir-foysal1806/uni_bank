const test = require("node:test");
const assert = require("node:assert/strict");
const { startServer, adminToken } = require("./helpers");

let ctx;
test.before(async () => { ctx = await startServer(); });
test.after(async () => { await ctx.close(); });

const json = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("health and readiness endpoints", async () => {
  assert.equal((await fetch(`${ctx.base}/api/health`)).status, 200);
  assert.equal((await fetch(`${ctx.base}/api/ready`)).status, 200);
});

test("question list excludes hidden papers and paginates", async () => {
  const res = await fetch(`${ctx.base}/api/questions?limit=500&page=-3`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.data.questions.length, 1);
  assert.equal(body.data.pagination.limit, 50);
  assert.equal(body.data.pagination.page, 1);
});

test("invalid / hidden question ids", async () => {
  assert.equal((await fetch(`${ctx.base}/api/questions/abc`)).status, 400);
  assert.equal((await fetch(`${ctx.base}/api/questions/2`)).status, 404);
  assert.equal((await fetch(`${ctx.base}/api/questions/1`)).status, 200);
});

test("download increments the counter; missing file gives 404", async () => {
  const before = ctx.state.questions[0].download_count;
  assert.equal((await fetch(`${ctx.base}/api/questions/1/download`)).status, 200);
  assert.equal(ctx.state.questions[0].download_count, before + 1);
  ctx.state.questions.push({ id: 9, storage_key: "questions/missing.pdf", original_name: "m.pdf", is_hidden: false, download_count: 0 });
  assert.equal((await fetch(`${ctx.base}/api/questions/9/download`)).status, 404);
  assert.equal(ctx.state.questions.find((q) => q.id === 9).download_count, 0);
});

test("upload without a file is rejected", async () => {
  const res = await fetch(`${ctx.base}/api/questions`, { method: "POST", body: new FormData() });
  assert.equal(res.status, 400);
});

test("upload with disallowed extension or spoofed content is rejected", async () => {
  const exe = new FormData();
  exe.append("file", new Blob(["MZ"], { type: "application/pdf" }), "x.exe");
  assert.equal((await fetch(`${ctx.base}/api/questions`, { method: "POST", body: exe })).status, 400);

  const fake = new FormData();
  fake.append("file", new Blob(["not a pdf at all"], { type: "application/pdf" }), "x.pdf");
  assert.equal((await fetch(`${ctx.base}/api/questions`, { method: "POST", body: fake })).status, 400);
});

test("report submission validates input", async () => {
  assert.equal((await fetch(`${ctx.base}/api/reports`, json({ questionId: "x", reason: "Other" }))).status, 400);
  assert.equal((await fetch(`${ctx.base}/api/reports`, json({ questionId: 1, reason: "Nope" }))).status, 400);
  assert.equal((await fetch(`${ctx.base}/api/reports`, json({ questionId: 999, reason: "Other" }))).status, 404);
  const ok = await fetch(`${ctx.base}/api/reports`, json({ questionId: 1, reason: "Wrong file", description: "bad" }));
  assert.equal(ok.status, 201);
});

test("admin endpoints require a valid token", async () => {
  assert.equal((await fetch(`${ctx.base}/api/reports`)).status, 401);
  assert.equal((await fetch(`${ctx.base}/api/reports/stats`, { headers: { Authorization: "Bearer junk" } })).status, 401);
  assert.equal((await fetch(`${ctx.base}/api/reports/1`, { ...json({ status: "resolved" }), method: "PATCH" })).status, 401);
  assert.equal((await fetch(`${ctx.base}/api/questions/1/hide`, { method: "PATCH" })).status, 401);
});

test("admin login rejects wrong password", async () => {
  assert.equal((await fetch(`${ctx.base}/api/auth/admin-login`, json({ password: "wrong" }))).status, 401);
  assert.equal((await fetch(`${ctx.base}/api/auth/admin-login`, json({ password: { $ne: 1 } }))).status, 401);
});

test("admin can resolve/dismiss reports and hide/restore questions", async () => {
  const token = await adminToken(ctx.base);
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  assert.equal((await fetch(`${ctx.base}/api/reports`, { headers: auth })).status, 200);

  const bad = await fetch(`${ctx.base}/api/reports/1`, { method: "PATCH", headers: auth, body: JSON.stringify({ status: "deleted" }) });
  assert.equal(bad.status, 400);

  const resolved = await fetch(`${ctx.base}/api/reports/1`, { method: "PATCH", headers: auth, body: JSON.stringify({ status: "resolved" }) });
  assert.equal(resolved.status, 200);
  assert.equal(ctx.state.reports[0].status, "resolved");

  const hide = await fetch(`${ctx.base}/api/questions/1/hide`, { method: "PATCH", headers: auth, body: JSON.stringify({ hidden: true }) });
  assert.equal(hide.status, 200);
  assert.equal((await fetch(`${ctx.base}/api/questions/1`)).status, 404);
  await fetch(`${ctx.base}/api/questions/1/hide`, { method: "PATCH", headers: auth, body: JSON.stringify({ hidden: false }) });
  assert.equal((await fetch(`${ctx.base}/api/questions/1`)).status, 200);
});

test("AI endpoint validates input and fails closed without a key", async () => {
  delete process.env.GEMINI_API_KEY;
  assert.equal((await fetch(`${ctx.base}/api/ai/chat`, json({}))).status, 400);
  assert.equal((await fetch(`${ctx.base}/api/ai/chat`, json({ message: "a".repeat(2001) }))).status, 400);
  const res = await fetch(`${ctx.base}/api/ai/chat`, json({ message: "hello" }));
  assert.equal(res.status, 503);
  assert.ok(!JSON.stringify(await res.json()).includes("GEMINI"));
});

test("unknown API route and malformed JSON return clean errors", async () => {
  assert.equal((await fetch(`${ctx.base}/api/nope`)).status, 404);
  const res = await fetch(`${ctx.base}/api/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" });
  assert.equal(res.status, 400);
});
