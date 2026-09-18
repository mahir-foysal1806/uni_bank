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