-- 001: reports table, question visibility, and query indexes.
-- Idempotent and non-destructive: safe to run repeatedly on an existing DB.
-- Never drops or rewrites existing rows.

BEGIN;

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

ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR(100),
    review_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reports_status_check'
    ) THEN
        ALTER TABLE reports
            ADD CONSTRAINT reports_status_check
            CHECK (status IN ('pending', 'resolved', 'dismissed'));
    END IF;
END $$;

-- Indexes matching the actual queries (listing order, filters, reports).
CREATE INDEX IF NOT EXISTS idx_questions_visible_uploaded
    ON questions (uploaded_at DESC) WHERE is_hidden = FALSE;
CREATE INDEX IF NOT EXISTS idx_questions_department ON questions (department);
CREATE INDEX IF NOT EXISTS idx_questions_semester ON questions (semester);
CREATE INDEX IF NOT EXISTS idx_questions_course_code_lower
    ON questions (LOWER(TRIM(COALESCE(course_code, ''))));
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_question_id ON reports (question_id);

COMMIT;
