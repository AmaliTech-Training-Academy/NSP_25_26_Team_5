"""
ETL Pipeline for CommunityBoard Analytics — 7 transforms.

Run order:
  1. python seed_data.py      (first time only)
  2. python etl_pipeline.py
"""
import pandas as pd
from sqlalchemy import text
from db import get_engine, get_logger, validate_schema

logger = get_logger("etl_pipeline")
engine = get_engine()


# ─────────────────────────────────────────
# EXTRACT
# ─────────────────────────────────────────

def extract_posts() -> pd.DataFrame:
    """Active posts with author and category info."""
    with engine.connect() as conn:
        return pd.read_sql(text("""
            SELECT  p.id,
                    p.title,
                    p.content,
                    p.created_at,
                    p.updated_at,
                    u.name        AS author_name,
                    u.email       AS author_email,
                    c.name        AS category_name
            FROM    posts         p
            JOIN    users         u  ON p.author_id   = u.id
            LEFT JOIN categories  c  ON p.category_id = c.id
            WHERE   (p.is_deleted IS NULL OR p.is_deleted = FALSE)
              AND   (u.is_active  IS NULL OR u.is_active  = TRUE)
        """), conn)


def extract_comments() -> pd.DataFrame:
    """Active comments with author and parent-post info."""
    with engine.connect() as conn:
        return pd.read_sql(text("""
            SELECT  c.id,
                    c.content,
                    c.created_at,
                    c.post_id,
                    u.name   AS author_name,
                    u.email  AS author_email,
                    p.created_at AS post_created_at
            FROM    comments  c
            JOIN    users     u  ON c.author_id = u.id
            JOIN    posts     p  ON c.post_id   = p.id
            WHERE   (p.is_deleted IS NULL OR p.is_deleted = FALSE)
              AND   (u.is_active  IS NULL OR u.is_active  = TRUE)
        """), conn)


# ─────────────────────────────────────────
# TRANSFORM — 7 functions
# ─────────────────────────────────────────

def transform_daily_activity(posts_df: pd.DataFrame) -> pd.DataFrame:
    """[1] Posts per calendar date per category."""
    if posts_df.empty:
        return pd.DataFrame(columns=["date", "category", "post_count"])
    df = posts_df.copy()
    df["date"] = pd.to_datetime(df["created_at"]).dt.date
    return (
        df.groupby(["date", "category_name"])
          .size()
          .reset_index(name="post_count")
          .rename(columns={"category_name": "category"})
    )


def transform_user_engagement(posts_df: pd.DataFrame,
                               comments_df: pd.DataFrame) -> pd.DataFrame:
    """[2] Engagement metrics per user. Score = posts×2 + comments."""
    post_counts    = posts_df.groupby(["author_email", "author_name"]).size().reset_index(name="posts_created")
    comment_counts = comments_df.groupby(["author_email", "author_name"]).size().reset_index(name="comments_made")

    merged = post_counts.merge(comment_counts, on=["author_email", "author_name"], how="outer").fillna(0)
    merged["posts_created"]   = merged["posts_created"].astype(int)
    merged["comments_made"]   = merged["comments_made"].astype(int)
    merged["engagement_score"]   = merged["posts_created"] * 2 + merged["comments_made"]
    # Alias columns expected by dashboard.py
    merged["user_name"]           = merged["author_name"]
    merged["total_contributions"] = merged["engagement_score"]
    return merged.sort_values("engagement_score", ascending=False).reset_index(drop=True)


def transform_category_popularity(posts_df: pd.DataFrame,
                                   comments_df: pd.DataFrame) -> pd.DataFrame:
    """[3] Post/comment counts + avg comments per post per category."""
    if posts_df.empty:
        return pd.DataFrame(columns=[
            "category", "total_posts", "comment_count",
            "avg_comments_per_post", "avg_content_length"
        ])

    post_stats = (
        posts_df.groupby("category_name")
                .agg(
                    total_posts=("id", "count"),
                    avg_content_length=("content", lambda x: round(x.str.len().mean(), 1))
                )
                .reset_index()
                .rename(columns={"category_name": "category"})
    )

    if not comments_df.empty:
        post_cat = posts_df[["id", "category_name"]].rename(columns={"id": "post_id"})
        comment_counts = (
            comments_df.merge(post_cat, on="post_id", how="left")
                       .groupby("category_name")
                       .size()
                       .reset_index(name="comment_count")
                       .rename(columns={"category_name": "category"})
        )
        post_stats = post_stats.merge(comment_counts, on="category", how="left").fillna(0)
        post_stats["comment_count"] = post_stats["comment_count"].astype(int)
    else:
        post_stats["comment_count"] = 0

    post_stats["avg_comments_per_post"] = (
        post_stats["comment_count"] / post_stats["total_posts"].replace(0, 1)
    ).round(2)
    # Alias: dashboard.py queries post_count, verify.py checks total_posts — keep both
    post_stats["post_count"] = post_stats["total_posts"]
    return post_stats


def transform_content_metrics(posts_df: pd.DataFrame) -> pd.DataFrame:
    """[4] Avg title/content character length + word count per category."""
    if posts_df.empty:
        return pd.DataFrame(columns=[
            "category", "avg_title_length", "avg_content_length",
            "avg_word_count", "total_posts"
        ])
    df = posts_df.copy()
    df["title_len"]  = df["title"].str.len()
    df["content_len"] = df["content"].str.len()
    df["word_count"]  = df["content"].str.split().str.len()
    return (
        df.groupby("category_name")
          .agg(
              avg_title_length  =("title_len",   lambda x: round(x.mean(), 1)),
              avg_content_length=("content_len", lambda x: round(x.mean(), 1)),
              avg_word_count    =("word_count",  lambda x: round(x.mean(), 1)),
              total_posts       =("id", "count")
          )
          .reset_index()
          .rename(columns={"category_name": "category"})
    )


def transform_hourly_activity(posts_df: pd.DataFrame,
                               comments_df: pd.DataFrame) -> pd.DataFrame:
    """[5] Post AND comment counts by hour-of-day (0–23)."""
    all_hours = pd.DataFrame({"hour": range(24)})
    if posts_df.empty:
        return all_hours.assign(post_count=0, comment_count=0)

    posts_h = (
        posts_df.copy()
                .assign(hour=lambda df: pd.to_datetime(df["created_at"]).dt.hour)
                .groupby("hour").size()
                .reset_index(name="post_count")
    )
    result = all_hours.merge(posts_h, on="hour", how="left").fillna(0)

    if not comments_df.empty:
        comments_h = (
            comments_df.copy()
                       .assign(hour=lambda df: pd.to_datetime(df["created_at"]).dt.hour)
                       .groupby("hour").size()
                       .reset_index(name="comment_count")
        )
        result = result.merge(comments_h, on="hour", how="left").fillna(0)
    else:
        result["comment_count"] = 0

    return result.astype({"post_count": int, "comment_count": int})


def transform_top_contributors(engagement_df: pd.DataFrame,
                                top_n: int = 5) -> pd.DataFrame:
    """[6] Top N users by engagement score."""
    return (
        engagement_df.nlargest(top_n, "engagement_score")
                     .reset_index(drop=True)
                     .assign(rank=lambda df: df.index + 1)
                     .assign(author_name=lambda df: df["user_name"])
                     [[
                         "rank", "user_name", "author_name", "author_email",
                         "posts_created", "comments_made",
                         "engagement_score", "total_contributions"
                     ]]
    )


def transform_comment_response_time(posts_df: pd.DataFrame,
                                     comments_df: pd.DataFrame) -> pd.DataFrame:
    """[7] Avg and median hours from post creation to first comment, per category."""
    if posts_df.empty or comments_df.empty:
        return pd.DataFrame(columns=[
            "category", "avg_hours_to_first_comment",
            "median_hours_to_first_comment", "post_count"
        ])

    first_comments = (
        comments_df[["post_id", "created_at"]]
        .rename(columns={"created_at": "comment_at"})
        .sort_values("comment_at")
        .groupby("post_id")
        .first()
        .reset_index()
    )

    merged = posts_df[["id", "created_at", "category_name"]].merge(
        first_comments, left_on="id", right_on="post_id", how="inner"
    )
    merged["hours_to_first"] = (
        (pd.to_datetime(merged["comment_at"]) - pd.to_datetime(merged["created_at"]))
        .dt.total_seconds() / 3600
    ).clip(lower=0)

    return (
        merged.groupby("category_name")
              .agg(
                  avg_hours_to_first_comment   =("hours_to_first", lambda x: round(x.mean(), 2)),
                  median_hours_to_first_comment=("hours_to_first", lambda x: round(x.median(), 2)),
                  post_count                   =("id", "count")
              )
              .reset_index()
              .rename(columns={"category_name": "category"})
    )


# ─────────────────────────────────────────
# LOAD
# ─────────────────────────────────────────

def load_analytics(df: pd.DataFrame, table_name: str) -> None:
    """Replace analytics table with transformed data."""
    df.to_sql(table_name, engine, if_exists="replace", index=False)
    logger.info("  ✓ %d rows → %s", len(df), table_name)


# ─────────────────────────────────────────
# PIPELINE RUNNER
# ─────────────────────────────────────────

def run_pipeline() -> None:
    logger.info("=" * 55)
    logger.info("CommunityBoard ETL Pipeline")
    logger.info("=" * 55)

    validate_schema()

    # ── Extract ──────────────────────────────────────────
    logger.info("[1/3] Extracting from source tables...")
    posts_df    = extract_posts()
    comments_df = extract_comments()
    logger.info("  posts=%d  comments=%d", len(posts_df), len(comments_df))

    if posts_df.empty:
        logger.warning("No posts found. Run seed_data.py first, then re-run.")
        return

    # ── Transform ────────────────────────────────────────
    logger.info("[2/3] Running 7 transforms...")

    # Compute user engagement once — reused by both [2] and [6]
    user_engagement = transform_user_engagement(posts_df, comments_df)

    transforms = {
        "analytics_daily_activity"      : transform_daily_activity(posts_df),
        "analytics_user_engagement"     : user_engagement,
        "analytics_category_popularity" : transform_category_popularity(posts_df, comments_df),
        "analytics_content_metrics"     : transform_content_metrics(posts_df),
        "analytics_hourly_activity"     : transform_hourly_activity(posts_df, comments_df),
        "analytics_top_contributors"    : transform_top_contributors(user_engagement),
        "analytics_comment_response_time": transform_comment_response_time(posts_df, comments_df),
    }

    # ── Load ─────────────────────────────────────────────
    logger.info("[3/3] Loading %d analytics tables...", len(transforms))
    for table_name, df in transforms.items():
        load_analytics(df, table_name)

    logger.info("=" * 55)
    logger.info("ETL complete. All 7 analytics tables updated.")
    logger.info("=" * 55)


if __name__ == "__main__":
    run_pipeline()