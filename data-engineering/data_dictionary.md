# CommunityBoard — Data Dictionary

## Overview

The data engineering layer owns the `analytics_*` tables. They are:
- **Populated by** `etl_pipeline.py` (replaces tables on every run)
- **Read by** `dashboard.py` and the Spring Boot analytics endpoints
- **Never written to** by the application runtime

---

## Source Tables (application DB — read only by ETL)

### `users`
| Column    | Type    | Nullable | Description                        |
|-----------|---------|----------|------------------------------------|
| id        | BIGINT  | NO       | Primary key                        |
| name      | VARCHAR | NO       | Full display name                  |
| email     | VARCHAR | NO       | Unique login email                 |
| password  | VARCHAR | NO       | BCrypt-hashed password             |
| role      | VARCHAR | NO       | `ADMIN` or `USER`                  |
| is_active | BOOLEAN | YES      | Soft-enable/disable (may not exist)|

### `categories`
| Column | Type    | Nullable | Description                              |
|--------|---------|----------|------------------------------------------|
| id     | BIGINT  | NO       | Primary key                              |
| name   | VARCHAR | NO       | `NEWS`, `EVENT`, `DISCUSSION`, `ALERT`   |

### `posts`
| Column      | Type      | Nullable | Description                  |
|-------------|-----------|----------|------------------------------|
| id          | BIGINT    | NO       | Primary key                  |
| title       | VARCHAR   | NO       | Post headline                |
| content     | TEXT      | NO       | Full post body               |
| created_at  | TIMESTAMP | NO       | Creation timestamp           |
| updated_at  | TIMESTAMP | NO       | Last edit timestamp          |
| author_id   | BIGINT    | NO       | FK → users.id                |
| category_id | BIGINT    | YES      | FK → categories.id           |
| is_deleted  | BOOLEAN   | YES      | Soft-delete flag (may not exist) |

### `comments`
| Column     | Type      | Nullable | Description              |
|------------|-----------|----------|--------------------------|
| id         | BIGINT    | NO       | Primary key              |
| content    | TEXT      | NO       | Comment body             |
| created_at | TIMESTAMP | NO       | Creation timestamp       |
| post_id    | BIGINT    | NO       | FK → posts.id            |
| author_id  | BIGINT    | NO       | FK → users.id            |

---

## Analytics Tables (ETL output — replaced on every run)

> All analytics tables are rebuilt from scratch on each ETL run using `if_exists="replace"`.
> Never manually edit these tables.

---

### `analytics_daily_activity`
Post counts aggregated by calendar date and category.

| Column     | Type    | Description                            |
|------------|---------|----------------------------------------|
| date       | DATE    | Calendar date                          |
| category   | VARCHAR | Category name (NEWS/EVENT/DISCUSSION/ALERT) |
| post_count | INTEGER | Number of posts created on that date   |

**Source transform:** `transform_daily_activity(posts_df)`

---

### `analytics_user_engagement`
Engagement metrics per user across all their activity.

| Column               | Type    | Description                            |
|----------------------|---------|----------------------------------------|
| author_email         | VARCHAR | User email                             |
| author_name          | VARCHAR | User display name                      |
| posts_created        | INTEGER | Total posts authored                   |
| comments_made        | INTEGER | Total comments written                 |
| engagement_score     | INTEGER | Score = (posts × 2) + comments         |
| user_name            | VARCHAR | Alias of author_name (dashboard compat)|
| total_contributions  | INTEGER | Alias of engagement_score (dashboard compat) |

**Source transform:** `transform_user_engagement(posts_df, comments_df)`

**Engagement score formula:** Posts are weighted ×2 over comments because writing a post requires more effort and contributes more to community value.

---

### `analytics_category_popularity`
Aggregate statistics per category.

| Column               | Type    | Description                              |
|----------------------|---------|------------------------------------------|
| category             | VARCHAR | Category name                            |
| total_posts          | INTEGER | Total posts in this category             |
| comment_count        | INTEGER | Total comments on posts in this category |
| avg_comments_per_post| FLOAT   | comment_count / total_posts              |
| avg_content_length   | FLOAT   | Average post body character count        |

**Source transform:** `transform_category_popularity(posts_df, comments_df)`

---

### `analytics_content_metrics`
Content length and readability statistics per category.

| Column             | Type    | Description                             |
|--------------------|---------|-----------------------------------------|
| category           | VARCHAR | Category name                           |
| avg_title_length   | FLOAT   | Average post title character count      |
| avg_content_length | FLOAT   | Average post body character count       |
| avg_word_count     | FLOAT   | Average number of words in post body    |
| total_posts        | INTEGER | Total posts analyzed                    |

**Source transform:** `transform_content_metrics(posts_df)`

---

### `analytics_hourly_activity`
Post and comment counts by hour of day (0–23). Reveals community peak hours.

| Column        | Type    | Description                              |
|---------------|---------|------------------------------------------|
| hour          | INTEGER | Hour of day (0 = midnight, 12 = noon)    |
| post_count    | INTEGER | Posts created during this hour           |
| comment_count | INTEGER | Comments written during this hour        |

**Note:** All 24 hours always present, even if count is 0.

**Source transform:** `transform_hourly_activity(posts_df, comments_df)`

---

### `analytics_top_contributors`
Top 5 users ranked by engagement score.

| Column              | Type    | Description                        |
|---------------------|---------|------------------------------------|
| rank                | INTEGER | 1 = highest engagement             |
| user_name           | VARCHAR | User display name                  |
| author_email        | VARCHAR | User email                         |
| posts_created       | INTEGER | Total posts authored               |
| comments_made       | INTEGER | Total comments written             |
| engagement_score    | INTEGER | Score = (posts × 2) + comments     |
| total_contributions | INTEGER | Alias of engagement_score          |

**Source transform:** `transform_top_contributors(user_engagement_df, top_n=5)`

---

### `analytics_comment_response_time`
How quickly each category generates discussion after a post is published.

| Column                       | Type    | Description                                  |
|------------------------------|---------|----------------------------------------------|
| category                     | VARCHAR | Category name                                |
| avg_hours_to_first_comment   | FLOAT   | Mean hours from post created → first comment |
| median_hours_to_first_comment| FLOAT   | Median hours (robust to outliers)            |
| post_count                   | INTEGER | Posts included in calculation                |

**Note:** Only posts that received at least one comment are included.

**Source transform:** `transform_comment_response_time(posts_df, comments_df)`

---

## ID Conventions

| Range   | Owner                                               |
|---------|-----------------------------------------------------|
| 1–99    | Backend (`backend/src/main/resources/data.sql`)     |
| 100–999 | Data Engineering (`seed_data.py`)                   |
| 1000+   | Application runtime (auto-increment from sequences) |

After running `seed_data.py`, all PostgreSQL sequences are advanced to 1000+ automatically to prevent conflicts.

---

## Soft-Delete Conventions

All ETL queries use null-safe filters:
```sql
WHERE (posts.is_deleted IS NULL OR posts.is_deleted = FALSE)
  AND (users.is_active  IS NULL OR users.is_active  = TRUE)
```
This means the ETL works correctly whether or not the backend has implemented these columns.

---

## Run Order

```
1. python seed_data.py          # Insert sample data (first time only)
2. python etl_pipeline.py       # Build all 7 analytics tables
3. streamlit run dashboard.py   # View results at http://localhost:8501
4. python analytics_queries.sql # (optional) run raw SQL to verify
```

## Scheduling (production)

Run ETL hourly via cron:
```bash
0 * * * * cd /app && python etl_pipeline.py >> /var/log/etl.log 2>&1
```