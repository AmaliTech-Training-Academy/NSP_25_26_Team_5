-- Seed categories
INSERT INTO categories (id, name, description) VALUES
  (1, 'Events', 'Upcoming community events'),
  (2, 'Lost & Found', 'Report lost or found items'),
  (3, 'Recommendations', 'Community recommendations and endorsements'),
  (4, 'Help Requests', 'Ask the community for help')
ON CONFLICT (id) DO NOTHING;

-- Seed admin and test users
-- Password: "password123" (BCrypt encoded)
INSERT INTO users (id, email, name, password, role, created_at) VALUES
  (1, 'admin@amalitech.com', 'Admin User',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
      'ADMIN', NOW()),
  (2, 'user@amalitech.com', 'Test User',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
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
