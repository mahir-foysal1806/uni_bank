const pool = require("../config/db");

/**
 * Small in-memory TTL cache for stable metadata lists (filter options,
 * autocomplete suggestions). Invalidated on every insert / visibility change.
 */
const META_TTL_MS = 60 * 1000;
const metaCache = new Map();

async function cached(key, loader) {
  const hit = metaCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await loader();
  metaCache.set(key, { value, expires: Date.now() + META_TTL_MS });
  return value;
}

function clearMetaCache() {
  metaCache.clear();
}

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

  clearMetaCache();

  return rows[0];
}

/**
 * Check whether the same question paper (same department,
 * semester, course code, exam type and session year) has
 * already been uploaded, so duplicate uploads can be blocked.
 */
async function findDuplicateQuestion({
  department,
  semester,
  courseCode,
  examType,
  sessionYear,
}) {
  const query = `
    SELECT *
    FROM questions
    WHERE LOWER(department) = LOWER($1)
      AND LOWER(semester) = LOWER($2)
      AND LOWER(COALESCE(course_code, '')) = LOWER($3)
      AND LOWER(COALESCE(exam_type, '')) = LOWER($4)
      AND LOWER(COALESCE(session_year, '')) = LOWER($5)
    LIMIT 1;
  `;

  const values = [
    (department || "").trim(),
    (semester || "").trim(),
    (courseCode || "").trim(),
    (examType || "").trim(),
    (sessionYear || "").trim(),
  ];

  const { rows } = await pool.query(query, values);

  return rows[0] || null;
}

/**
 * Get all file_name values already used for a given course code.
 * Used by the upload controller to generate a unique, human-
 * readable stored filename (CourseCode + original extension)
 * without overwriting an existing file when the same course code
 * is uploaded multiple times.
 */
async function getFileNamesByCourseCode(courseCode) {
  const query = `
    SELECT file_name
    FROM questions
    WHERE LOWER(TRIM(COALESCE(course_code, ''))) = LOWER($1)
      AND file_name IS NOT NULL;
  `;

  const values = [(courseCode || "").trim()];

  const { rows } = await pool.query(query, values);

  return rows.map((row) => row.file_name);
}

function sanitizeFilters(filters = {}) {
  const str = (v) => (typeof v === "string" ? v.slice(0, 100) : "");
  return {
    keyword: str(filters.keyword),
    department: str(filters.department),
    semester: str(filters.semester),
    courseCode: str(filters.courseCode),
    examType: str(filters.examType),
    sessionYear: str(filters.sessionYear),
    page: filters.page,
    limit: filters.limit,
  };
}

/**
 * Search and filter questions with pagination
 * (hidden/moderated papers are excluded).
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
  } = sanitizeFilters(filters);

  const safePage = Math.max(1, parseInt(page, 10) || 1);

  const safeLimit = Math.min(
    50,
    Math.max(1, parseInt(limit, 10) || 12)
  );

  const offset = (safePage - 1) * safeLimit;

  const conditions = ["is_hidden = FALSE"];
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
 * Parse a route id; returns null when it is not a positive 32-bit integer.
 */
function parseId(id) {
  if (!/^\d{1,9}$/.test(String(id))) return null;
  const n = parseInt(id, 10);
  return n > 0 ? n : null;
}

/**
 * Get one question by ID. Hidden papers are only returned
 * when includeHidden is true (admin moderation).
 */
async function getQuestionById(id, { includeHidden = false } = {}) {
  const safeId = parseId(id);
  if (safeId === null) return undefined;

  const { rows } = await pool.query(
    `SELECT * FROM questions WHERE id = $1 ${includeHidden ? "" : "AND is_hidden = FALSE"};`,
    [safeId]
  );

  return rows[0];
}

/**
 * Soft-hide / restore a question (row and file are kept).
 */
async function setQuestionHidden(id, hidden) {
  const safeId = parseId(id);
  if (safeId === null) return undefined;

  const { rows } = await pool.query(
    `UPDATE questions SET is_hidden = $1 WHERE id = $2 RETURNING *;`,
    [Boolean(hidden), safeId]
  );

  clearMetaCache();
  return rows[0];
}

/**
 * Increment download count
 */
async function incrementDownloadCount(id) {
  await pool.query(
    `UPDATE questions SET download_count = download_count + 1 WHERE id = $1;`,
    [id]
  );
}

/**
 * Get distinct departments
 */
async function getDistinctDepartments() {
  return cached("departments", async () => {
    const { rows } = await pool.query(`
    SELECT DISTINCT department
    FROM questions
    WHERE is_hidden = FALSE
      AND department IS NOT NULL
      AND department <> ''
    ORDER BY department ASC;
  `);
    return rows.map((row) => row.department);
  });
}

/**
 * Get distinct semesters
 */
async function getDistinctSemesters() {
  return cached("semesters", async () => {
    const { rows } = await pool.query(`
    SELECT DISTINCT semester
    FROM questions
    WHERE is_hidden = FALSE
      AND semester IS NOT NULL
      AND semester <> ''
    ORDER BY semester ASC;
  `);
    return rows.map((row) => row.semester);
  });
}

/**
 * Get distinct exam types
 */
async function getDistinctExamTypes() {
  return cached("examTypes", async () => {
    const { rows } = await pool.query(`
    SELECT DISTINCT exam_type
    FROM questions
    WHERE is_hidden = FALSE
      AND exam_type IS NOT NULL
      AND exam_type <> ''
    ORDER BY exam_type ASC;
  `);
    return rows.map((row) => row.exam_type);
  });
}

/**
 * Get distinct session years
 */
async function getDistinctSessionYears() {
  return cached("sessionYears", async () => {
    const { rows } = await pool.query(`
    SELECT DISTINCT session_year
    FROM questions
    WHERE is_hidden = FALSE
      AND session_year IS NOT NULL
      AND session_year <> ''
    ORDER BY session_year DESC;
  `);
    return rows.map((row) => row.session_year);
  });
}

/**
 * Get distinct course codes (for autocomplete suggestions)
 */
async function getDistinctCourseCodes() {
  return cached("courseCodes", async () => {
    const { rows } = await pool.query(`
    SELECT DISTINCT course_code
    FROM questions
    WHERE is_hidden = FALSE
      AND course_code IS NOT NULL
      AND course_code <> ''
    ORDER BY course_code ASC;
  `);
    return rows.map((row) => row.course_code);
  });
}

/**
 * Get distinct course titles (for autocomplete suggestions)
 */
async function getDistinctCourseTitles() {
  return cached("courseTitles", async () => {
    const { rows } = await pool.query(`
    SELECT DISTINCT course_title
    FROM questions
    WHERE is_hidden = FALSE
      AND course_title IS NOT NULL
      AND course_title <> ''
    ORDER BY course_title ASC;
  `);
    return rows.map((row) => row.course_title);
  });
}

module.exports = {
  insertQuestion,
  findDuplicateQuestion,
  getFileNamesByCourseCode,
  searchQuestions,
  getQuestionById,
  setQuestionHidden,
  parseId,
  clearMetaCache,
  incrementDownloadCount,
  getDistinctDepartments,
  getDistinctSemesters,
  getDistinctExamTypes,
  getDistinctSessionYears,
  getDistinctCourseCodes,
  getDistinctCourseTitles,
};