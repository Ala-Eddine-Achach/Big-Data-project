CREATE TABLE IF NOT EXISTS pull_requests (
    id BIGINT PRIMARY KEY,
    number INTEGER,
    title TEXT,
    state TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    closed_at TIMESTAMP,
    merged_at TIMESTAMP,
    user_login TEXT,
    html_url TEXT
);
