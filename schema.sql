-- schema.sql
-- UniQBank database schema.
-- Run with: psql "$DATABASE_URL" -f schema.sql

-- Enable trigram search for fast partial/keyword matching on text columns.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS questions (
    id              SERIAL PRIMARY KEY,
    department      VARCHAR(100)  NOT NULL,
    semester        VARCHAR(50)   NOT NULL,
    course_code     VARCHAR(50)   NOT NULL,
    course_title    VARCHAR(255)  NOT NULL,
    exam_type       VARCHAR(50)   NOT NULL,       -- e.g. Midterm, Final, Quiz, Class Test
    session_year    VARCHAR(20)   NOT NULL,       -- e.g. 2023, 2023-2024, Spring 2023
    file_name       VARCHAR(255)  NOT NULL,       -- stored (disk) file name
    original_name   VARCHAR(255)  NOT NULL,       -- original uploaded file name
    file_path       VARCHAR(500)  NOT NULL,       -- relative path, e.g. /public/uploads/xxx.pdf
    file_size       INTEGER,                      -- bytes
    download_count  INTEGER       NOT NULL DEFAULT 0,
    uploaded_at     TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes for fast filtering and searching
-- ---------------------------------------------------------------------------

-- Exact-match filters (dropdowns)
CREATE INDEX IF NOT EXISTS idx_questions_department ON questions (department);
CREATE INDEX IF NOT EXISTS idx_questions_semester   ON questions (semester);

-- Sorting by newest uploads
CREATE INDEX IF NOT EXISTS idx_questions_uploaded_at ON questions (uploaded_at DESC);

-- Trigram indexes for fast fuzzy/partial keyword search (ILIKE '%term%')
CREATE INDEX IF NOT EXISTS idx_questions_course_code_trgm
    ON questions USING GIN (course_code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_questions_course_title_trgm
    ON questions USING GIN (course_title gin_trgm_ops);

-- Composite index to speed up the common "department + semester" filter combo
CREATE INDEX IF NOT EXISTS idx_questions_dept_sem ON questions (department, semester);
