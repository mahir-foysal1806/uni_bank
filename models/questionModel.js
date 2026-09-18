const pool = require("../config/db");


/**
 * Insert a new question paper
 */
async function insertQuestion(data) {
  const {
    department,
    semester,
    courseCode,
    courseTitle,
    examType,
    sessionYear,
    fileName,
    originalName,
    fileSize,
    storageKey,
  } = data;

  const query = `
    INSERT INTO questions (
      department,
      semester,
      course_code,
      course_title,
      exam_type,
      session_year,
      file_name,
      original_name,
      file_size,
      storage_key
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    )
    RETURNING *;
  `;

  const values = [
    department,
    semester,
    courseCode,
    courseTitle,
    examType,
    sessionYear,
    fileName,
    originalName,
    fileSize,
    storageKey,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}


/**
 * Get all questions with pagination
 */
async function getAllQuestions(page = 1, limit = 12) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT *
    FROM questions
    ORDER BY uploaded_at DESC
    LIMIT $1
    OFFSET $2;
  `;

  const { rows } = await pool.query(query, [
    limit,
    offset,
  ]);

  return rows;
}


/**
 * Search questions
 */
async function searchQuestions(filters = {}) {
  const {
    department = "",
    semester = "",
    keyword = "",
  } = filters;

  const conditions = [];
  const values = [];

  if (department) {
    values.push(`%${department}%`);

    conditions.push(`
      (
        department ILIKE $${values.length}
        OR department ILIKE $${values.length + 1}
      )
    `);

    values.push(`%${department}%`);
  }

  if (semester) {
    values.push(`%${semester}%`);

    conditions.push(`
      semester ILIKE $${values.length}
    `);
  }

  if (keyword) {
    const keywords = keyword
      .split(/\s+/)
      .filter(Boolean);

    for (const word of keywords) {
      values.push(`%${word}%`);

      const index = values.length;

      conditions.push(`
        (
          course_code ILIKE $${index}
          OR course_title ILIKE $${index}
          OR original_name ILIKE $${index}
          OR department ILIKE $${index}
        )
      `);
    }
  }

  let query = `
    SELECT *
    FROM questions
  `;

  if (conditions.length > 0) {
    query += `
      WHERE ${conditions.join(" AND ")}
    `;
  }

  query += `
    ORDER BY uploaded_at DESC;
  `;

  const { rows } = await pool.query(query, values);

  return rows;
}


/**
 * Get one question by ID
 */
async function getQuestionById(id) {
  const query = `
    SELECT *
    FROM questions
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0];
}


/**
 * Increment download count
 */
async function incrementDownloadCount(id) {
  const query = `
    UPDATE questions
    SET download_count = download_count + 1
    WHERE id = $1;
  `;

  await pool.query(query, [id]);
}


/**
 * Get distinct departments
 */
async function getDistinctDepartments() {
  const query = `
    SELECT DISTINCT department
    FROM questions
    WHERE department IS NOT NULL
      AND department <> ''
    ORDER BY department ASC;
  `;

  const { rows } = await pool.query(query);

  return rows.map((row) => row.department);
}


/**
 * Get distinct semesters
 */
async function getDistinctSemesters() {
  const query = `
    SELECT DISTINCT semester
    FROM questions
    WHERE semester IS NOT NULL
      AND semester <> ''
    ORDER BY semester ASC;
  `;

  const { rows } = await pool.query(query);

  return rows.map((row) => row.semester);
}


module.exports = {
  insertQuestion,
  getAllQuestions,
  searchQuestions,
  getQuestionById,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
};