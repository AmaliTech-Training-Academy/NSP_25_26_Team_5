"""
db.py — Shared database utilities for the data-engineering layer.

Provides:
  - get_engine()        : SQLAlchemy engine (singleton, lazily created)
  - get_logger(name)    : Consistent file + console logger
  - validate_schema()   : Assert required app tables exist before ETL runs
"""
import logging
import os
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from config import DATABASE_URL

# ─────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────

LOGS_DIR = Path(__file__).parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

def get_logger(name: str) -> logging.Logger:
    """
    Returns a logger that writes to both console and logs/<name>.log.
    Calling get_logger with the same name twice returns the same logger.
    """
    logger = logging.getLogger(name)
    if logger.handlers:          # already configured
        return logger

    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
                            datefmt="%Y-%m-%d %H:%M:%S")

    # Console handler
    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    # File handler
    fh = logging.FileHandler(LOGS_DIR / f"{name}.log", encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    return logger


# ─────────────────────────────────────────
# ENGINE (singleton)
# ─────────────────────────────────────────

_engine = None

def get_engine():
    """Return a cached SQLAlchemy engine. Created once per process."""
    global _engine
    if _engine is None:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,     # discard stale connections
            pool_size=5,
            max_overflow=2,
        )
    return _engine


# ─────────────────────────────────────────
# SCHEMA VALIDATION
# ─────────────────────────────────────────

REQUIRED_TABLES = ["users", "posts", "comments", "categories"]

def validate_schema() -> bool:
    """
    Assert that all application tables exist in the database.
    Raises RuntimeError if any are missing — prevents ETL from running
    on an uninitialised database.
    """
    logger = get_logger("db")
    engine = get_engine()

    inspector = inspect(engine)
    existing  = set(inspector.get_table_names())
    missing   = [t for t in REQUIRED_TABLES if t not in existing]

    if missing:
        msg = (
            f"Schema validation failed. Missing tables: {missing}. "
            "Ensure the Spring Boot backend has run at least once "
            "(JPA ddl-auto: update creates the tables)."
        )
        logger.error(msg)
        raise RuntimeError(msg)

    # Soft-delete column presence check (warn only — don't block)
    with engine.connect() as conn:
        for table, col in [("posts", "is_deleted"), ("users", "is_active")]:
            cols = [c["name"] for c in inspector.get_columns(table)]
            if col not in cols:
                logger.warning(
                    "Column '%s.%s' not found — soft-delete filtering disabled for this table.",
                    table, col
                )

    logger.info("Schema validation passed. Tables present: %s", REQUIRED_TABLES)
    return True

# Alias used by dashboard.py
setup_logging = get_logger