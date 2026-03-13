-- schema.sql
-- Mirrors the tables Spring Boot/JPA creates at runtime.
-- Run this ONCE on the test DB before seeding.
-- Usage: psql -h localhost -p 5433 -U postgres -d communityboard_test -f schema.sql

CREATE TABLE IF NOT EXISTS categories (
    id    BIGSERIAL PRIMARY KEY,
    name  VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    role       VARCHAR(20)         NOT NULL DEFAULT 'USER',
    is_active  BOOLEAN             NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS posts (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    author_id   BIGINT       NOT NULL REFERENCES users(id),
    category_id BIGINT       REFERENCES categories(id),
    is_deleted  BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS comments (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT      NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    post_id     BIGINT    NOT NULL REFERENCES posts(id),
    author_id   BIGINT    NOT NULL REFERENCES users(id)
);

-- Indexes matching what JPA would create
CREATE INDEX IF NOT EXISTS idx_posts_author    ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_comments_post   ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);