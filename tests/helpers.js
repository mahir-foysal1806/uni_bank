const path = require("path");

process.env.NODE_ENV = "test";
process.env.ADMIN_PASSWORD = "test-password-not-real";
process.env.ADMIN_JWT_SECRET = "x".repeat(40);

/**
 * In-memory fake of the pg Pool. Matches queries by substring so the
 * real models/controllers/routes run unmodified.
 */
function installFakePool() {
  const state = {
    questions: [
      { id: 1, department: "CSE", semester: "1st", course_code: "CSE101", course_title: "Intro", exam_type: "Final", session_year: "2023", file_name: "CSE101.pdf", original_name: "a.pdf", file_size: 10, storage_key: "questions/CSE101.pdf", download_count: 0, is_hidden: false },
      { id: 2, department: "EEE", semester: "2nd", course_code: "EEE201", course_title: "Circuits", exam_type: "Mid", session_year: "2022", file_name: "EEE201.pdf", original_name: "b.pdf", file_size: 10, storage_key: "questions/EEE201.pdf", download_count: 0, is_hidden: true },
    ],
    reports: [],
    queries: [],
  };

  const fake = {
    async query(sql, values = []) {
      const q = sql.replace(/\s+/g, " ").trim();
      state.queries.push({ q, values });

      if (q.startsWith("SELECT 1")) return { rows: [{ "?column?": 1 }] };
      if (q.includes("COUNT(*)::INTEGER AS total FROM questions")) {
        const rows = state.questions.filter((x) => !x.is_hidden);
        return { rows: [{ total: rows.length }] };
      }
      if (q.startsWith("SELECT * FROM questions") && q.includes("ORDER BY uploaded_at")) {
        return { rows: state.questions.filter((x) => !x.is_hidden) };
      }
      if (q.startsWith("SELECT DISTINCT")) return { rows: [] };
      if (q.startsWith("SELECT * FROM questions WHERE id = $1")) {
        const hiddenOk = !q.includes("is_hidden = FALSE");
        const row = state.questions.find((x) => x.id === values[0] && (hiddenOk || !x.is_hidden));
        return { rows: row ? [row] : [] };
      }
      if (q.startsWith("UPDATE questions SET download_count")) {
        state.questions.find((x) => x.id === values[0]).download_count++;
        return { rows: [] };
      }
      if (q.startsWith("UPDATE questions SET is_hidden")) {
        const row = state.questions.find((x) => x.id === values[1]);
        if (row) row.is_hidden = values[0];
        return { rows: row ? [row] : [] };
      }
      if (q.includes("INSERT INTO reports")) {
        const row = { id: state.reports.length + 1, question_id: values[0], reason: values[1], description: values[2], status: "pending" };
        state.reports.push(row);
        return { rows: [row] };
      }
      if (q.startsWith("SELECT * FROM reports WHERE id")) {
        const row = state.reports.find((x) => x.id === values[0]);
        return { rows: row ? [row] : [] };
      }
      if (q.startsWith("UPDATE reports")) {
        const row = state.reports.find((x) => x.id === values[3]);
        if (row) row.status = values[0];
        return { rows: row ? [row] : [] };
      }
      if (q.includes("FROM reports GROUP BY status")) {
        return { rows: [{ status: "pending", total: state.reports.filter((r) => r.status === "pending").length }] };
      }
      if (q.includes("FROM reports r") && q.includes("COUNT(*)")) return { rows: [{ total: state.reports.length }] };
      if (q.includes("FROM reports r")) return { rows: state.reports };
      throw new Error("Unmocked query: " + q.slice(0, 80));
    },
    async end() {},
    on() {},
  };

  const dbPath = require.resolve(path.join(__dirname, "..", "config", "db.js"));
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fake };

  const stPath = require.resolve(path.join(__dirname, "..", "services", "storageService.js"));
  require.cache[stPath] = {
    id: stPath, filename: stPath, loaded: true,
    exports: {
      testConnection: async () => true,
      uploadFile: async () => ({}),
      deleteFile: async () => {},
      downloadFile: async (key, res, type, onReady) => {
        if (key.includes("missing")) { const e = new Error("x"); e.name = "NoSuchKey"; throw e; }
        await onReady();
        res.setHeader("Content-Type", type);
        res.end("file");
      },
    },
  };
  return state;
}

async function startServer() {
  const state = installFakePool();
  const createApp = require("../app");
  const server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { state, base, close: () => new Promise((r) => server.close(r)) };
}

async function adminToken(base) {
  const res = await fetch(`${base}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  });
  return (await res.json()).data.token;
}

module.exports = { startServer, adminToken };
