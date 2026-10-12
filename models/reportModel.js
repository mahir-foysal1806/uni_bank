const pool = require("../config/db");

/**
 * Allowed report reasons (kept in sync with the frontend modal)
 */
const REPORT_REASONS = [
  "Wrong information",
  "Duplicate question paper",
  "Wrong file",
  "Unreadable file",
  "Copyright concern",
  "Inappropriate content",
  "Other",
];

/**
 * Allowed report statuses
 */
const REPORT_STATUSES = ["pending", "resolved", "dismissed"];

/**
 * Create a new report against a question paper
 */
async function insertReport({ questionId, reason, description }) {
  const query = `
    INSERT INTO reports (
      question_id,
      reason,
      description
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    questionId,
    reason,
    (description || "").trim() || null,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}

/**
 * List reports (for the admin dashboard), joined with the
 * reported question's basic info, with optional status filter
 * and pagination.
 */
async function listReports({ status = "", page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (safePage - 1) * safeLimit;

  const conditions = [];
  const values = [];

  if (status.trim()) {
    values.push(status.trim());
    conditions.push(`r.status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*)::INTEGER AS total
    FROM reports r
    ${whereClause};
  `;

  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0].total;

  const dataValues = [...values];
  dataValues.push(safeLimit);
  const limitIndex = dataValues.length;

  dataValues.push(offset);
  const offsetIndex = dataValues.length;

  const query = `
    SELECT
      r.id,
      r.question_id,
      r.reason,
      r.description,
      r.status,
      r.reviewed_by,
      r.review_note,
      r.created_at,
      r.reviewed_at,

      q.department,
      q.semester,
      q.course_code,
      q.course_title,
      q.exam_type,
      q.session_year,
      q.original_name,
      q.is_hidden
    FROM reports r
    LEFT JOIN questions q ON q.id = r.question_id
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex};
  `;

  const { rows } = await pool.query(query, dataValues);

  const totalPages = total === 0 ? 0 : Math.ceil(total / safeLimit);

  return {
    reports: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

/**
 * Get a single report by id
 */
async function getReportById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM reports WHERE id = $1;`,
    [id]
  );

  return rows[0];
}

/**
 * Count how many pending reports exist for a specific question
 */
async function countPendingReportsForQuestion(questionId) {
  const { rows } = await pool.query(
    `
      SELECT COUNT(*)::INTEGER AS total
      FROM reports
      WHERE question_id = $1
        AND status = 'pending';
    `,
    [questionId]
  );

  return rows[0].total;
}

/**
 * Get report counts grouped by status, for the moderation
 * dashboard summary (Pending / Resolved / Dismissed).
 */
async function getReportStatusCounts() {
  const { rows } = await pool.query(`
    SELECT status, COUNT(*)::INTEGER AS total
    FROM reports
    GROUP BY status;
  `);

  const counts = { pending: 0, resolved: 0, dismissed: 0 };

  for (const row of rows) {
    counts[row.status] = row.total;
  }

  return counts;
}

/**
 * Update a report's status (resolve / dismiss), optionally
 * recording who reviewed it and a short internal note.
 */
async function updateReportStatus(id, { status, reviewedBy, reviewNote }) {
  const query = `
    UPDATE reports
    SET
      status = $1,
      reviewed_by = $2,
      review_note = $3,
      reviewed_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;

  const values = [
    status,
    (reviewedBy || "").trim() || null,
    (reviewNote || "").trim() || null,
    id,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}

module.exports = {
  REPORT_REASONS,
  REPORT_STATUSES,
  insertReport,
  listReports,
  getReportById,
  countPendingReportsForQuestion,
  getReportStatusCounts,
  updateReportStatus,
};
