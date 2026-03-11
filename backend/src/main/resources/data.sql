-- Seed categories
INSERT INTO categories (id, name, description) VALUES
    (1, 'News', 'Community news and announcements'),
    (2, 'Event', 'Upcoming community events'),
    (3, 'Discussion', 'Community discussions and recommendations'),
    (4, 'Alert', 'Urgent community alerts')
ON CONFLICT (id) DO NOTHING;

-- Seed admin and test users
-- Password: "password123" (BCrypt encoded, verified via Spring)
INSERT INTO users (id, email, name, password, role, created_at) VALUES
  (1, 'admin@amalitech.com', 'Admin User',
      '$2a$10$SX1DpH4/X4ArxYC6xvbHBOhO19VFRndFpULZrbBe6sjTrcOU7AM3i',
      'ADMIN', NOW()),
  (2, 'user@amalitech.com', 'Test User',
      '$2a$10$SX1DpH4/X4ArxYC6xvbHBOhO19VFRndFpULZrbBe6sjTrcOU7AM3i',
      'USER', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed sample posts
INSERT INTO posts (id, title, content, category_id, author_id, created_at, updated_at) VALUES
  (1, 'Upcoming Team Building Event',
      'We are organizing a cross-location team building event next Friday. Details to follow.',
      1, 1, NOW(), NOW()),
  (2, 'Lost keys near the park',
      'I found a set of keys near the central park entrance. Please PM me to describe them.',
      2, 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to avoid PK collisions on new inserts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));