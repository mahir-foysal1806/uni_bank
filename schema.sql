CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,

    department VARCHAR(100) NOT NULL,
    semester VARCHAR(100) NOT NULL,

    course_code VARCHAR(100),
    course_title VARCHAR(255),

    exam_type VARCHAR(100),
    session_year VARCHAR(100),

    file_name VARCHAR(255),
    original_name VARCHAR(255) NOT NULL,

    file_size BIGINT,

    storage_key TEXT NOT NULL,

    download_count INTEGER DEFAULT 0,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional extra safety net at the database level, in addition to the
-- application-level duplicate check in questionController.js.
-- Only run this if your existing data has no duplicates yet, otherwise
-- it will fail to create. Prevents two uploads with the same
-- department + semester + course_code + exam_type + session_year
-- (case-insensitive) from both being saved, even if they happen at
-- the exact same time.
-- CREATE UNIQUE INDEX IF NOT EXISTS unique_question_combo
--   ON questions (
--     LOWER(department),
--     LOWER(semester),
--     LOWER(COALESCE(course_code, '')),
--     LOWER(COALESCE(exam_type, '')),
--     LOWER(COALESCE(session_year, ''))
--   );