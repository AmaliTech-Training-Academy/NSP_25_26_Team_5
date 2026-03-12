-- =============================================================================
-- analytics_queries.sql
-- CommunityBoard — Production-Grade Analytics SQL Queries
-- =============================================================================
-- Conventions:
--   • All queries filter: is_deleted = FALSE for posts/comments
--                          is_active  = TRUE  for users
--   • Parameterised date ranges use :start_date / :end_date placeholders
--   • Visualisation type noted in the header comment of each query
--
-- Run against: communityboard PostgreSQL 15
-- =============================================================================


-- ---------------------------------------------------------------------------
-- KPI OVERVIEW — 4 scalar values for the dashboard header cards
-- Viz: metric cards
-- ---------------------------------------------------------------------------
SELECT
    (SELECT COUNT(*) FROM posts    WHERE is_deleted = FALSE)   AS total_posts,
    (SELECT COUNT(*) FROM comments WHERE is_deleted = FALSE)   AS total_comments,
    (SELECT COUNT(*) FROM users    WHERE is_active  = TRUE)    AS total_active_users,
    (SELECT COUNT(*) FROM categories)                          AS total_categories;


-- ---------------------------------------------------------------------------
-- QUERY 1: Posts per category
-- Viz: pie chart
-- ---------------------------------------------------------------------------
SELECT
    c.name          AS category,
    COUNT(p.id)     AS post_count
FROM categories c
LEFT JOIN posts p
       ON c.id = p.category_id
      AND p.is_deleted = FALSE
GROUP BY c.name
ORDER BY post_count DESC;


-- ---------------------------------------------------------------------------
-- QUERY 2: Daily post trend — last 30 days, broken down by category
-- Viz: multi-series line chart
-- ---------------------------------------------------------------------------
SELECT
    DATE(p.created_at)  AS post_date,
    c.name              AS category,
    COUNT(*)            AS post_count
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND p.is_deleted  = FALSE
GROUP BY DATE(p.created_at), c.name
ORDER BY post_date, category;


-- ---------------------------------------------------------------------------
-- QUERY 3: Top 10 most commented posts
-- Viz: horizontal bar chart
-- ---------------------------------------------------------------------------
SELECT
    p.title                     AS post_title,
    c.name                      AS category,
    u.name                      AS author,
    COUNT(cm.id)                AS comment_count
FROM posts p
LEFT JOIN comments   cm ON p.id  = cm.post_id   AND cm.is_deleted = FALSE
LEFT JOIN categories c  ON p.category_id = c.id
JOIN  users          u  ON p.author_id   = u.id
WHERE p.is_deleted = FALSE
GROUP BY p.id, p.title, c.name, u.name
ORDER BY comment_count DESC
LIMIT 10;


-- ---------------------------------------------------------------------------
-- QUERY 4: User activity leaderboard
-- Viz: sortable table
-- ---------------------------------------------------------------------------
SELECT
    u.name                                                         AS user_name,
    u.email                                                        AS user_email,
    COUNT(DISTINCT p.id)                                           AS posts_created,
    COUNT(DISTINCT cm.id)                                          AS comments_made,
    COUNT(DISTINCT p.id) + COUNT(DISTINCT cm.id)                   AS total_activity,
    ROUND(
        (COUNT(DISTINCT p.id) * 3.0 + COUNT(DISTINCT cm.id))::NUMERIC
        / NULLIF(COUNT(DISTINCT p.id) + COUNT(DISTINCT cm.id), 0),
        2
    )                                                              AS weighted_score
FROM users u
LEFT JOIN posts    p  ON u.id = p.author_id    AND p.is_deleted  = FALSE
LEFT JOIN comments cm ON u.id = cm.author_id   AND cm.is_deleted = FALSE
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email
HAVING COUNT(DISTINCT p.id) + COUNT(DISTINCT cm.id) > 0
ORDER BY total_activity DESC;


-- ---------------------------------------------------------------------------
-- QUERY 5: Daily comment trend — last 30 days
-- Viz: line chart
-- ---------------------------------------------------------------------------
SELECT
    DATE(created_at)    AS comment_date,
    COUNT(*)            AS comment_count
FROM comments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND is_deleted  = FALSE
GROUP BY DATE(created_at)
ORDER BY comment_date;


-- ---------------------------------------------------------------------------
-- QUERY 6: Average comments per post by category
-- Viz: bar chart
-- ---------------------------------------------------------------------------
SELECT
    c.name                                                             AS category,
    COUNT(DISTINCT p.id)                                               AS total_posts,
    COUNT(cm.id)                                                       AS total_comments,
    ROUND(
        COUNT(cm.id)::DECIMAL / NULLIF(COUNT(DISTINCT p.id), 0),
        2
    )                                                                  AS avg_comments_per_post
FROM categories c
LEFT JOIN posts    p  ON c.id   = p.category_id AND p.is_deleted  = FALSE
LEFT JOIN comments cm ON p.id   = cm.post_id    AND cm.is_deleted = FALSE
GROUP BY c.name
ORDER BY avg_comments_per_post DESC;


-- ---------------------------------------------------------------------------
-- QUERY 7: New users per week (last 60 days)
-- Viz: bar chart
-- ---------------------------------------------------------------------------
SELECT
    DATE_TRUNC('week', created_at)::DATE    AS week_start,
    COUNT(*)                                AS new_users
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'
  AND is_active   = TRUE
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start;


-- ---------------------------------------------------------------------------
-- QUERY 8: Peak posting hours (hour of day, 0–23)
-- Viz: bar chart
-- ---------------------------------------------------------------------------
SELECT
    EXTRACT(HOUR FROM created_at)::INT  AS hour_of_day,
    COUNT(*)                            AS post_count
FROM posts
WHERE is_deleted = FALSE
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;


-- ---------------------------------------------------------------------------
-- QUERY 9: Post content length distribution by category
-- Viz: box plot data (one row per post)
-- ---------------------------------------------------------------------------
SELECT
    c.name                                                          AS category,
    LENGTH(p.content)                                               AS content_length,
    array_length(string_to_array(TRIM(p.content), ' '), 1)         AS word_count,
    ROUND(array_length(string_to_array(TRIM(p.content), ' '), 1) / 200.0, 1)
                                                                    AS est_reading_minutes
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE p.is_deleted = FALSE
ORDER BY c.name, content_length;


-- ---------------------------------------------------------------------------
-- QUERY 10: Engagement ratio per user (comments / posts)
-- Viz: scatter plot
-- ---------------------------------------------------------------------------
SELECT
    u.name                                                               AS user_name,
    COUNT(DISTINCT p.id)                                                 AS posts,
    COUNT(DISTINCT cm.id)                                                AS comments,
    CASE
        WHEN COUNT(DISTINCT p.id) > 0
        THEN ROUND(COUNT(DISTINCT cm.id)::DECIMAL / COUNT(DISTINCT p.id), 2)
        ELSE 0
    END                                                                  AS comment_to_post_ratio
FROM users u
LEFT JOIN posts    p  ON u.id = p.author_id    AND p.is_deleted  = FALSE
LEFT JOIN comments cm ON u.id = cm.author_id   AND cm.is_deleted = FALSE
WHERE u.is_active = TRUE
GROUP BY u.id, u.name
HAVING COUNT(DISTINCT p.id) > 0 OR COUNT(DISTINCT cm.id) > 0
ORDER BY posts DESC;


-- ---------------------------------------------------------------------------
-- QUERY 11: Category trend over time — cumulative posts (last 30 days)
-- Viz: stacked area chart
-- ---------------------------------------------------------------------------
SELECT
    DATE(p.created_at)                                                        AS post_date,
    c.name                                                                     AS category,
    COUNT(*)                                                                   AS daily_posts,
    SUM(COUNT(*)) OVER (
        PARTITION BY c.name
        ORDER BY DATE(p.created_at)
    )                                                                          AS cumulative_posts
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND p.is_deleted  = FALSE
GROUP BY DATE(p.created_at), c.name
ORDER BY post_date, category;


-- ---------------------------------------------------------------------------
-- QUERY 12: Average time to first comment per post (response speed KPI)
-- Viz: KPI card + optional histogram
-- ---------------------------------------------------------------------------
SELECT
    ROUND(
        AVG(EXTRACT(EPOCH FROM (fc.first_comment - p.created_at)) / 3600)::NUMERIC,
        1
    )                   AS avg_hours_to_first_comment,
    MIN(EXTRACT(EPOCH FROM (fc.first_comment - p.created_at)) / 3600)
                        AS min_hours,
    MAX(EXTRACT(EPOCH FROM (fc.first_comment - p.created_at)) / 3600)
                        AS max_hours,
    COUNT(p.id)         AS posts_with_comments
FROM posts p
JOIN LATERAL (
    SELECT MIN(created_at) AS first_comment
    FROM comments
    WHERE post_id   = p.id
      AND is_deleted = FALSE
) fc ON TRUE
WHERE p.is_deleted     = FALSE
  AND fc.first_comment IS NOT NULL;
