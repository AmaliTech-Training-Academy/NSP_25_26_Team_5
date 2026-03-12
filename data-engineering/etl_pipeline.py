"""
etl_pipeline.py — CommunityBoard Analytics ETL Pipeline.

Extract → Transform → Load pipeline that reads from the application DB
and writes analytics-ready aggregate tables.

Analytics tables produced:
  analytics_daily_activity        — daily posts by category
  analytics_user_engagement       — per-user posts + comments + score
  analytics_category_popularity   — posts, comments, avg per category
  analytics_content_metrics       — avg word count / length by category
  analytics_hourly_activity       — post/comment counts by hour of day
  analytics_top_contributors      — leaderboard of most active users
  analytics_comment_response_time — avg hours from post to first comment

All queries filter is_deleted = FALSE / is_active = TRUE (soft-delete convention).
"""
import pandas as pd
from sqlalchemy import text

from db import get_engine, setup_logging, ensure_schema

logger = setup_logging("etl_pipeline")

# ---------------------------------------------------------------------------
# Extraction
# ---------------------------------------------------------------------------

def extract_posts() -> pd.DataFrame:
    """Extract all non-deleted posts with author and category metadata."""
    sql = text("""
        SELECT
            p.id,
            p.title,
            p.content,
            p.created_at,
            p.updated_at,
            u.name  AS author_name,
            u.email AS author_email,
            c.name  AS category_name
        FROM posts p
        JOIN users u           ON p.author_id   = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_deleted = FALSE
          AND u.is_active   = TRUE
    """)
    engine = get_engine()
    with engine.connect() as conn:
        df = pd.read_sql(sql, conn)
    logger.info("Extracted %d posts.", len(df))
    return df


def extract_comments() -> pd.DataFrame:
    """Extract all non-deleted comments with post and author metadata."""
    sql = text("""
        SELECT
            c.id,
            c.content,
            c.created_at,
            c.post_id,
            u.name  AS author_name,
            u.email AS author_email
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.is_deleted = FALSE
          AND u.is_active   = TRUE
    """)
    engine = get_engine()
    with engine.connect() as conn:
        df = pd.read_sql(sql, conn)
    logger.info("Extracted %d comments.", len(df))
    return df


# ---------------------------------------------------------------------------
# Transformations
# ---------------------------------------------------------------------------

def transform_daily_activity(posts_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate post counts by date and category."""
    if posts_df.empty:
        logger.warning("transform_daily_activity: posts_df is empty — returning empty frame.")
        return pd.DataFrame(columns=["date", "category", "post_count"])

    posts_df = posts_df.copy()
    posts_df["date"] = pd.to_datetime(posts_df["created_at"]).dt.date
    daily = (
        posts_df
        .groupby(["date", "category_name"])
        .size()
        .reset_index(name="post_count")
    )
    daily.columns = ["date", "category", "post_count"]
    logger.info("transform_daily_activity: %d rows produced.", len(daily))
    return daily


def transform_user_engagement(posts_df: pd.DataFrame, comments_df: pd.DataFrame) -> pd.DataFrame:
    """
    Per-user engagement: posts created + comments made + composite score.
    Engagement score = posts_created * 3 + comments_made
    """
    if posts_df.empty and comments_df.empty:
        logger.warning("transform_user_engagement: both frames empty — returning empty frame.")
        return pd.DataFrame(
            columns=["user_email", "user_name", "posts_created", "comments_made", "engagement_score"]
        )

    post_counts = (
        posts_df.groupby(["author_email", "author_name"]).size()
        .reset_index(name="posts_created")
    ) if not posts_df.empty else pd.DataFrame(columns=["author_email", "author_name", "posts_created"])

    comment_counts = (
        comments_df.groupby(["author_email", "author_name"]).size()
        .reset_index(name="comments_made")
    ) if not comments_df.empty else pd.DataFrame(columns=["author_email", "author_name", "comments_made"])

    merged = pd.merge(
        post_counts, comment_counts,
        on=["author_email", "author_name"], how="outer"
    ).fillna(0)

    merged["posts_created"]    = merged["posts_created"].astype(int)
    merged["comments_made"]    = merged["comments_made"].astype(int)
    merged["engagement_score"] = merged["posts_created"] * 3 + merged["comments_made"]

    result = (
        merged
        .rename(columns={"author_email": "user_email", "author_name": "user_name"})
        .sort_values("engagement_score", ascending=False)
        .reset_index(drop=True)
    )
    logger.info("transform_user_engagement: %d users profiled.", len(result))
    return result


def transform_category_popularity(posts_df: pd.DataFrame, comments_df: pd.DataFrame) -> pd.DataFrame:
    """Posts and comments per category, plus average comments per post."""
    if posts_df.empty:
        logger.warning("transform_category_popularity: posts_df is empty — returning empty frame.")
        return pd.DataFrame(columns=["category", "total_posts", "total_comments", "avg_comments_per_post"])

    post_counts = (
        posts_df.groupby("category_name").size()
        .reset_index(name="total_posts")
        .rename(columns={"category_name": "category"})
    )

    if not comments_df.empty:
        posts_slim = posts_df[["id", "category_name"]].rename(columns={"id": "post_id"})
        comments_with_cat = comments_df.merge(posts_slim, on="post_id", how="left")
        comment_counts = (
            comments_with_cat.groupby("category_name").size()
            .reset_index(name="total_comments")
            .rename(columns={"category_name": "category"})
        )
    else:
        comment_counts = pd.DataFrame(columns=["category", "total_comments"])

    merged = post_counts.merge(comment_counts, on="category", how="left").fillna(0)
    merged["total_comments"]       = merged["total_comments"].astype(int)
    merged["avg_comments_per_post"] = (merged["total_comments"] / merged["total_posts"].replace(0, 1)).round(2)
    merged = merged.sort_values("total_posts", ascending=False).reset_index(drop=True)

    logger.info("transform_category_popularity: %d categories summarised.", len(merged))
    return merged


def transform_content_metrics(posts_df: pd.DataFrame) -> pd.DataFrame:
    """Average word count and character length of post content, grouped by category."""
    if posts_df.empty:
        logger.warning("transform_content_metrics: posts_df is empty — returning empty frame.")
        return pd.DataFrame(columns=["category", "avg_word_count", "avg_content_length", "total_posts"])

    posts_df = posts_df.copy()
    posts_df["word_count"]     = posts_df["content"].str.split().str.len().fillna(0).astype(int)
    posts_df["content_length"] = posts_df["content"].str.len().fillna(0).astype(int)

    result = (
        posts_df.groupby("category_name")
        .agg(
            avg_word_count     =("word_count",     "mean"),
            avg_content_length =("content_length", "mean"),
            total_posts        =("id",             "count"),
        )
        .round(1)
        .reset_index()
        .rename(columns={"category_name": "category"})
    )
    logger.info("transform_content_metrics: %d category rows produced.", len(result))
    return result


def transform_hourly_activity(posts_df: pd.DataFrame, comments_df: pd.DataFrame) -> pd.DataFrame:
    """Count posts and comments created by hour of day (0–23)."""
    hours = pd.DataFrame({"hour": range(24)})

    if not posts_df.empty:
        post_h = pd.to_datetime(posts_df["created_at"]).dt.hour.value_counts().reset_index()
        post_h.columns = ["hour", "post_count"]
    else:
        post_h = pd.DataFrame(columns=["hour", "post_count"])

    if not comments_df.empty:
        comment_h = pd.to_datetime(comments_df["created_at"]).dt.hour.value_counts().reset_index()
        comment_h.columns = ["hour", "comment_count"]
    else:
        comment_h = pd.DataFrame(columns=["hour", "comment_count"])

    result = (
        hours
        .merge(post_h,    on="hour", how="left")
        .merge(comment_h, on="hour", how="left")
        .fillna(0)
    )
    result["post_count"]    = result["post_count"].astype(int)
    result["comment_count"] = result["comment_count"].astype(int)
    result = result.sort_values("hour").reset_index(drop=True)

    logger.info("transform_hourly_activity: 24 hour-buckets produced.")
    return result


def transform_top_contributors(posts_df: pd.DataFrame, comments_df: pd.DataFrame) -> pd.DataFrame:
    """Leaderboard: users ranked by total posts + comments."""
    if posts_df.empty and comments_df.empty:
        logger.warning("transform_top_contributors: both frames empty — returning empty frame.")
        return pd.DataFrame(columns=["user_name", "user_email", "posts", "comments", "total_contributions"])

    post_c = (
        posts_df.groupby(["author_email", "author_name"]).size().reset_index(name="posts")
    ) if not posts_df.empty else pd.DataFrame(columns=["author_email", "author_name", "posts"])

    comment_c = (
        comments_df.groupby(["author_email", "author_name"]).size().reset_index(name="comments")
    ) if not comments_df.empty else pd.DataFrame(columns=["author_email", "author_name", "comments"])

    merged = pd.merge(post_c, comment_c, on=["author_email", "author_name"], how="outer").fillna(0)
    merged["posts"]               = merged["posts"].astype(int)
    merged["comments"]            = merged["comments"].astype(int)
    merged["total_contributions"] = merged["posts"] + merged["comments"]

    result = (
        merged
        .rename(columns={"author_email": "user_email", "author_name": "user_name"})
        .sort_values("total_contributions", ascending=False)
        .reset_index(drop=True)
    )
    logger.info("transform_top_contributors: %d contributors ranked.", len(result))
    return result


def transform_comment_response_time() -> pd.DataFrame:
    """Avg time (hours) from post creation to first comment — computed via SQL LATERAL join."""
    from datetime import datetime as _dt
    sql = text("""
        SELECT
            ROUND(
                AVG(EXTRACT(EPOCH FROM (fc.first_comment - p.created_at)) / 3600)::NUMERIC,
                1
            ) AS avg_hours_to_first_comment
        FROM posts p
        JOIN LATERAL (
            SELECT MIN(created_at) AS first_comment
            FROM comments
            WHERE post_id   = p.id
              AND is_deleted = FALSE
        ) fc ON TRUE
        WHERE p.is_deleted     = FALSE
          AND fc.first_comment IS NOT NULL
    """)
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(sql).fetchone()

    avg_hours = float(row[0]) if row and row[0] is not None else 0.0
    result = pd.DataFrame([{
        "avg_hours_to_first_comment": avg_hours,
        "computed_at": _dt.utcnow().isoformat(),
    }])
    logger.info("transform_comment_response_time: avg = %.1f hours.", avg_hours)
    return result


# ---------------------------------------------------------------------------
# Load
# ---------------------------------------------------------------------------

def load_analytics(df: pd.DataFrame, table_name: str) -> None:
    """Write a DataFrame to an analytics table (replace strategy, cost-efficient)."""
    if df.empty:
        logger.warning("load_analytics: skipping '%s' — DataFrame is empty.", table_name)
        return
    engine = get_engine()
    df.to_sql(table_name, engine, if_exists="replace", index=False)
    logger.info("Loaded %d rows into '%s'.", len(df), table_name)


# ---------------------------------------------------------------------------
# Pipeline orchestration
# ---------------------------------------------------------------------------

def run_pipeline() -> None:
    """Execute the full ETL pipeline end-to-end with error isolation per transform."""
    logger.info("=== CommunityBoard ETL pipeline starting ===")

    engine = get_engine()
    with engine.connect() as conn:
        if not ensure_schema(conn, logger):
            logger.error("Schema check failed. Aborting pipeline.")
            return

    # --- Extract ---
    try:
        posts_df    = extract_posts()
        comments_df = extract_comments()
    except Exception as exc:
        logger.error("Extraction failed: %s", exc, exc_info=True)
        return

    logger.info("Extraction complete — %d posts, %d comments.", len(posts_df), len(comments_df))

    # --- Transform + Load (error-isolated per table) ---
    transforms = [
        ("analytics_daily_activity",
         lambda: transform_daily_activity(posts_df)),
        ("analytics_user_engagement",
         lambda: transform_user_engagement(posts_df, comments_df)),
        ("analytics_category_popularity",
         lambda: transform_category_popularity(posts_df, comments_df)),
        ("analytics_content_metrics",
         lambda: transform_content_metrics(posts_df)),
        ("analytics_hourly_activity",
         lambda: transform_hourly_activity(posts_df, comments_df)),
        ("analytics_top_contributors",
         lambda: transform_top_contributors(posts_df, comments_df)),
        ("analytics_comment_response_time",
         lambda: transform_comment_response_time()),
    ]

    for table_name, transform_fn in transforms:
        try:
            df = transform_fn()
            load_analytics(df, table_name)
        except Exception as exc:
            logger.error("Transform/load failed for '%s': %s", table_name, exc, exc_info=True)

    logger.info("=== CommunityBoard ETL pipeline complete ===")


if __name__ == "__main__":
    run_pipeline()
