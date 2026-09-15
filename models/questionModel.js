// models/questionModel.js
// Database access layer for the `questions` table.
// All functions return Promises and use parameterized queries.

const pool = require('../config/db');

/**
 * Insert a newly uploaded question paper record.
 *
 * @param {Object} data
 * @returns {Promise<Object>} inserted row
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
    filePath,
    fileSize,
    // Google Drive file details
    driveFileId,
    driveWebViewLink,
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
      file_path,
      file_size,
      drive_file_id,
      drive_web_view_link
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    filePath,
    fileSize,
    driveFileId || null,
    driveWebViewLink || null,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}

/**
 * Fetch all questions, newest first.
 *
 * @returns {Promise<Array>}
 */
async function getAllQuestions(page,limit) {
  const offset=(page-1)*limit;
    
  const query = `
    SELECT *
    FROM questions
    ORDER BY uploaded_at DESC
    LIMIT $1
    OFFSET $2;
  `;

  const { rows } = await pool.query(query,[limit,offset]);

  return rows;
}

/**
 * Normalize department search terms.
 *
 * This allows users to search using:
 *
 * CSE
 * cse
 * Computer Science
 * Computer Science Engineering
 * Computer Science & Engineering
 *
 * and find the same department.
 */
function getDepartmentSearchTerms(department) {
  if (!department || !String(department).trim()) {
    return [];
  }

  const value = String(department)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  const aliases = {
    cse: [
      'cse',
      'computer science',
      'computer science engineering',
      'computer science & engineering',
    ],

    'computer science': [
      'cse',
      'computer science',
      'computer science engineering',
      'computer science & engineering',
    ],

    'computer science engineering': [
      'cse',
      'computer science',
      'computer science engineering',
      'computer science & engineering',
    ],

    'computer science & engineering': [
      'cse',
      'computer science',
      'computer science engineering',
      'computer science & engineering',
    ],

    eee: [
      'eee',
      'electrical engineering',
      'electrical and electronic engineering',
      'electrical & electronic engineering',
    ],

    'electrical engineering': [
      'eee',
      'electrical engineering',
      'electrical and electronic engineering',
      'electrical & electronic engineering',
    ],

    'electrical and electronic engineering': [
      'eee',
      'electrical engineering',
      'electrical and electronic engineering',
      'electrical & electronic engineering',
    ],

    'electrical & electronic engineering': [
      'eee',
      'electrical engineering',
      'electrical and electronic engineering',
      'electrical & electronic engineering',
    ],

    ce: [
      'ce',
      'civil',
      'civil engineering',
    ],

    civil: [
      'ce',
      'civil',
      'civil engineering',
    ],

    'civil engineering': [
      'ce',
      'civil',
      'civil engineering',
    ],

    me: [
      'me',
      'mechanical',
      'mechanical engineering',
    ],

    mechanical: [
      'me',
      'mechanical',
      'mechanical engineering',
    ],

    'mechanical engineering': [
      'me',
      'mechanical',
      'mechanical engineering',
    ],

    bba: [
      'bba',
      'business',
      'business administration',
    ],

    business: [
      'bba',
      'business',
      'business administration',
    ],

    'business administration': [
      'bba',
      'business',
      'business administration',
    ],

    math: [
      'math',
      'maths',
      'mathematics',
    ],

    maths: [
      'math',
      'maths',
      'mathematics',
    ],

    mathematics: [
      'math',
      'maths',
      'mathematics',
    ],

    english: [
      'english',
    ],

    economics: [
      'economics',
      'eco',
    ],

    eco: [
      'economics',
      'eco',
    ],

    physics: [
      'physics',
    ],

    chemistry: [
      'chemistry',
    ],

    law: [
      'law',
    ],
  };

  return aliases[value] || [value];
}

/**
 * Search/filter questions.
 *
 * Features:
 *
 * 1. Department alias search
 * 2. Case-insensitive search
 * 3. Partial keyword search
 * 4. Multiple keyword search
 * 5. Search across:
 *    - course code
 *    - course title
 *    - department
 *    - semester
 *    - exam type
 *    - session year
 *
 * Explicit department and semester filters use AND.
 *
 * Example:
 *
 * Search:
 *   cse
 *
 * Can find:
 *   CSE
 *   Computer Science
 *   Computer Science & Engineering
 *
 * Search:
 *   database systems
 *
 * Can find questions containing:
 *   database
 *   systems
 *
 * Search:
 *   cse database
 *
 * Can find CSE questions related to database.
 *
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
async function searchQuestions(filters = {}) {
  const {
    department,
    semester,
    keyword,
  } = filters;

  const conditions = [];
  const values = [];

  let paramIndex = 1;

  // -------------------------------------------------------------------------
  // Department filter
  // -------------------------------------------------------------------------

  if (department && String(department).trim()) {
    const departmentTerms = getDepartmentSearchTerms(department);

    const departmentConditions = [];

    for (const term of departmentTerms) {
      departmentConditions.push(`
        department ILIKE $${paramIndex}
      `);

      values.push(`%${term}%`);

      paramIndex++;
    }

    if (departmentConditions.length > 0) {
      conditions.push(`
        (
          ${departmentConditions.join(' OR ')}
        )
      `);
    }
  }

  // -------------------------------------------------------------------------
  // Semester filter
  // -------------------------------------------------------------------------

  if (
    semester !== undefined &&
    semester !== null &&
    String(semester).trim() !== ''
  ) {
    conditions.push(`
      semester ILIKE $${paramIndex}
    `);

    values.push(`%${String(semester).trim()}%`);

    paramIndex++;
  }

  // -------------------------------------------------------------------------
  // Google-like keyword search
  // -------------------------------------------------------------------------

  if (keyword && String(keyword).trim()) {
    const words = String(keyword)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const keywordConditions = [];

    for (const word of words) {
      keywordConditions.push(`
        (
          course_code ILIKE $${paramIndex}
          OR course_title ILIKE $${paramIndex}
          OR department ILIKE $${paramIndex}
          OR CAST(semester AS TEXT) ILIKE $${paramIndex}
          OR exam_type ILIKE $${paramIndex}
          OR CAST(session_year AS TEXT) ILIKE $${paramIndex}
        )
      `);

      values.push(`%${word}%`);

      paramIndex++;
    }

    /*
     * ANY keyword can match.
     *
     * Example:
     *
     * "database management"
     *
     * database OR management
     */
    conditions.push(`
      (
        ${keywordConditions.join(' OR ')}
      )
    `);
  }

  // -------------------------------------------------------------------------
  // WHERE clause
  // -------------------------------------------------------------------------

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // -------------------------------------------------------------------------
  // Final query
  // -------------------------------------------------------------------------

  const query = `
    SELECT *
    FROM questions
    ${whereClause}
    ORDER BY uploaded_at DESC;
  `;

  const { rows } = await pool.query(query, values);

  return rows;
}

/**
 * Fetch a single question by ID.
 *
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function getQuestionById(id) {
  const query = `
    SELECT *
    FROM questions
    WHERE id = $1;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
}

/**
 * Increment download counter.
 *
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function incrementDownloadCount(id) {
  const query = `
    UPDATE questions
    SET download_count = download_count + 1
    WHERE id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
}

/**
 * Get distinct departments.
 *
 * @returns {Promise<Array<string>>}
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
 * Get distinct semesters.
 *
 * @returns {Promise<Array<string>>}
 */
async function getDistinctSemesters() {
  const query = `
    SELECT DISTINCT semester
    FROM questions
    WHERE semester IS NOT NULL
    ORDER BY semester ASC;
  `;

  const { rows } = await pool.query(query);

  return rows.map((row) => row.semester);
}

/*
 * ---------------------------------------------------------------------------
 * Export all functions
 * ---------------------------------------------------------------------------
 */
module.exports = {
  insertQuestion,
  getAllQuestions,
  searchQuestions,
  getQuestionById,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
};