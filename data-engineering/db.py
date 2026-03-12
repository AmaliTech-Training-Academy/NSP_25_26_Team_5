"""
db.py — Shared database helpers for CommunityBoard data-engineering.

Responsibilities:
- Engine factory (single instance via get_engine())
- Structured logging setup (setup_logging())
- Schema validation (ensure_schema())
- Parameterised query helper (execute_query())

All other scripts import from here — never build engines or loggers inline.
"""
import logging
import os
from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine

from config import DATABASE_URL

# ---------------------------------------------------------------------------
# Engine — one instance, reused across the process
# ---------------------------------------------------------------------------
_engine: Optional[Engine] = None


def get_engine() -> Engine:
    """Return a SQLAlchemy engine, creating it once per process."""
    global _engine
    if _engine is None:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,        # health-check connections before use
            pool_size=5,
            max_overflow=10,
            connect_args={"connect_timeout": 10},
        )
    return _engine


# ---------------------------------------------------------------------------
# Logging — structured, file-based, no print()
# ---------------------------------------------------------------------------
def setup_logging(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Configure and return a named logger that writes to:
      - data-engineering/logs/<name>.log  (file handler)
      - stderr                            (stream handler)

    The logs/ directory is git-ignored. Never committed.
    """
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / f"{name.replace('.', '_')}.log"

    logger = logging.getLogger(name)
    if logger.handlers:
        return logger  # already configured — idempotent

    logger.setLevel(level)
    fmt = logging.Formatter(
        "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # File handler
    fh = logging.FileHandler(log_file, encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    # Stream handler (stderr)
    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    logger.addHandler(sh)

    return logger


# ---------------------------------------------------------------------------
# Expected schema — single source of truth for column validation
# ---------------------------------------------------------------------------
EXPECTED_SCHEMA: dict[str, list[str]] = {
    "users": ["id", "email", "name", "password", "role", "created_at", "is_active"],
    "categories": ["id", "name", "description"],
    "posts": [
        "id", "title", "content", "category_id", "author_id",
        "created_at", "updated_at", "is_deleted",
    ],
    "comments": ["id", "content", "post_id", "author_id", "created_at", "is_deleted"],
    # Analytics tables — created by ETL, validated to exist
    "analytics_daily_activity": ["date", "category", "post_count"],
    "analytics_user_engagement": [
        "user_email", "user_name", "posts_created", "comments_made", "engagement_score"
    ],
    "analytics_category_popularity": [
        "category", "total_posts", "total_comments", "avg_comments_per_post"
    ],
    "analytics_content_metrics": [
        "category", "avg_word_count", "avg_content_length", "total_posts"
    ],
    "analytics_hourly_activity": ["hour", "post_count", "comment_count"],
    "analytics_top_contributors": [
        "user_name", "user_email", "posts", "comments", "total_contributions"
    ],
    "analytics_comment_response_time": ["avg_hours_to_first_comment", "computed_at"],
}

# Core application tables that MUST exist before any seed/ETL work
CORE_TABLES = ["users", "categories", "posts", "comments"]


def ensure_schema(conn, logger: logging.Logger) -> bool:
    """
    Validate that core application tables exist and have expected columns.

    - Missing core table  → ERROR logged; returns False (caller should abort)
    - Missing column      → WARNING logged (schema drift from backend)
    - Extra column        → INFO logged (backend may have added it)
    - Analytics tables    → created automatically if missing (ETL owns them)

    Returns True if all core tables are present (even with column drift).
    """
    inspector = inspect(conn)
    existing_tables = set(inspector.get_table_names())
    all_ok = True

    for table, expected_cols in EXPECTED_SCHEMA.items():
        if table not in existing_tables:
            if table in CORE_TABLES:
                logger.error(
                    "Core table '%s' does not exist. "
                    "Ensure the backend has started and run migrations first.",
                    table,
                )
                all_ok = False
            else:
                # Analytics table — ETL will create it via to_sql / DDL
                logger.info("Analytics table '%s' not yet created (will be by ETL).", table)
            continue

        actual_cols = {c["name"] for c in inspector.get_columns(table)}
        expected_set = set(expected_cols)

        missing = expected_set - actual_cols
        extra = actual_cols - expected_set

        if missing:
            logger.warning(
                "Table '%s' is missing expected columns: %s. "
                "Check backend migrations for schema drift.",
                table,
                ", ".join(sorted(missing)),
            )
        if extra:
            logger.info(
                "Table '%s' has extra columns (added by backend): %s",
                table,
                ", ".join(sorted(extra)),
            )
        if not missing and not extra:
            logger.info("Table '%s' schema OK.", table)

    return all_ok


# ---------------------------------------------------------------------------
# Parameterised query helper
# ---------------------------------------------------------------------------
def execute_query(conn, sql: str, params: Optional[dict] = None):
    """Execute a SQL statement with optional named parameters."""
    stmt = text(sql)
    return conn.execute(stmt, params or {})
