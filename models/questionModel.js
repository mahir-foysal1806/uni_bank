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
 * Search and filter questions with pagination
 */
async function searchQuestions(filters = {}) {
  const {
    keyword = "",
    department = "",
    semester = "",
    courseCode = "",
    examType = "",
    sessionYear = "",
    page = 1,
    limit = 12,
  } = filters;

  const safePage = Math.max(1, parseInt(page, 10) || 1);

  const safeLimit = Math.min(
    50,
    Math.max(1, parseInt(limit, 10) || 12)
  );

  const offset = (safePage - 1) * safeLimit;

  const conditions = [];
  const values = [];

  /**
   * Keyword search
   *
   * Searches across:
   * - course code
   * - course title
   * - department
   * - original filename
   */
  if (keyword.trim()) {
    const keywords = keyword
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    for (const word of keywords) {
      values.push(`%${word}%`);

      const index = values.length;

      conditions.push(`
        (
          course_code ILIKE $${index}
          OR course_title ILIKE $${index}
          OR department ILIKE $${index}
          OR original_name ILIKE $${index}
        )
      `);
    }
  }

  /**
   * Department filter
   */
  if (department.trim()) {
    values.push(`%${department.trim()}%`);

    conditions.push(`
      department ILIKE $${values.length}
    `);
  }

  /**
   * Semester filter
   */
  if (semester.trim()) {
    values.push(`%${semester.trim()}%`);

    conditions.push(`
      semester ILIKE $${values.length}
    `);
  }

  /**
   * Course code filter
   */
  if (courseCode.trim()) {
    values.push(`%${courseCode.trim()}%`);

    conditions.push(`
      course_code ILIKE $${values.length}
    `);
  }

  /**
   * Exam type filter
   */
  if (examType.trim()) {
    values.push(`%${examType.trim()}%`);

    conditions.push(`
      exam_type ILIKE $${values.length}
    `);
  }

  /**
   * Session year filter
   */
  if (sessionYear.trim()) {
    values.push(`%${sessionYear.trim()}%`);

    conditions.push(`
      session_year ILIKE $${values.length}
    `);
  }

  /**
   * WHERE clause
   */
  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  /**
   * Count total matching records
   */
  const countQuery = `
    SELECT COUNT(*)::INTEGER AS total
    FROM questions
    ${whereClause};
  `;

  const countResult = await pool.query(
    countQuery,
    values
  );

  const total = countResult.rows[0].total;

  /**
   * Get paginated records
   */
  const dataValues = [...values];

  dataValues.push(safeLimit);
  const limitIndex = dataValues.length;

  dataValues.push(offset);
  const offsetIndex = dataValues.length;

  const query = `
    SELECT *
    FROM questions
    ${whereClause}
    ORDER BY uploaded_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex};
  `;

  const { rows } = await pool.query(
    query,
    dataValues
  );

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(total / safeLimit);

  return {
    questions: rows,

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

/**
 * Get distinct exam types
 */
async function getDistinctExamTypes() {
  const query = `
    SELECT DISTINCT exam_type
    FROM questions
    WHERE exam_type IS NOT NULL
      AND exam_type <> ''
    ORDER BY exam_type ASC;
  `;

  const { rows } = await pool.query(query);

  return rows.map((row) => row.exam_type);
}

/**
 * Get distinct session years
 */
async function getDistinctSessionYears() {
  const query = `
    SELECT DISTINCT session_year
    FROM questions
    WHERE session_year IS NOT NULL
      AND session_year <> ''
    ORDER BY session_year DESC;
  `;

  const { rows } = await pool.query(query);

  return rows.map((row) => row.session_year);
}

module.exports = {
  insertQuestion,
  searchQuestions,
  getQuestionById,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
  getDistinctExamTypes,
  getDistinctSessionYears,
};