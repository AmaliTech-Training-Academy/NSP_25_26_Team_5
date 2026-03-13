"""
verify.py — End-to-end test of the data engineering pipeline.

Runs all checks in order and prints a clear PASS/FAIL for each.
Run this BEFORE connecting to the real database.

Usage:
    python verify.py
"""
import sys
import traceback
import pandas as pd
from sqlalchemy import inspect, text
from db import get_engine, get_logger

logger  = get_logger("verify")
engine  = get_engine()

PASS = "  ✓ PASS"
FAIL = "  ✗ FAIL"

results = []


def check(name: str, fn):
    """Run a single check, catch any exception, record result."""
    try:
        fn()
        print(f"{PASS}  {name}")
        results.append((name, True, None))
    except AssertionError as e:
        print(f"{FAIL}  {name}")
        print(f"         → {e}")
        results.append((name, False, str(e)))
    except Exception as e:
        print(f"{FAIL}  {name}")
        print(f"         → {type(e).__name__}: {e}")
        results.append((name, False, traceback.format_exc()))


# ─────────────────────────────────────────
# CONNECTIVITY
# ─────────────────────────────────────────

def test_db_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).fetchone()
    assert result[0] == 1, "DB did not return 1"


# ─────────────────────────────────────────
# SOURCE TABLE CHECKS
# ─────────────────────────────────────────

def test_source_tables_exist():
    inspector = inspect(engine)
    existing  = set(inspector.get_table_names())
    required  = {"users", "posts", "comments", "categories"}
    missing   = required - existing
    assert not missing, f"Missing source tables: {missing}"


def test_categories_seeded():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT name FROM categories ORDER BY name")).fetchall()
    names = {r[0] for r in rows}
    expected = {"NEWS", "EVENT", "DISCUSSION", "ALERT"}
    missing  = expected - names
    assert not missing, f"Missing categories: {missing}"


def test_users_seeded():
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM users WHERE role = 'USER'")).scalar()
    assert count >= 10, f"Expected ≥10 users, got {count}"


def test_posts_seeded():
    with engine.connect() as conn:
        count = conn.execute(text(
            "SELECT COUNT(*) FROM posts WHERE (is_deleted IS NULL OR is_deleted = FALSE)"
        )).scalar()
    assert count >= 50, f"Expected ≥50 posts, got {count}. Requirement: 50+ posts."


def test_comments_seeded():
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM comments")).scalar()
    assert count >= 200, f"Expected ≥200 comments, got {count}. Requirement: 200+ comments."


def test_all_categories_have_posts():
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT c.name, COUNT(p.id) AS cnt
            FROM   categories c
            LEFT JOIN posts p ON p.category_id = c.id
                AND (p.is_deleted IS NULL OR p.is_deleted = FALSE)
            GROUP BY c.name
        """)).fetchall()
    empty = [r[0] for r in rows if r[1] == 0]
    assert not empty, f"Categories with zero posts: {empty}"


def test_posts_have_valid_authors():
    with engine.connect() as conn:
        orphans = conn.execute(text("""
            SELECT COUNT(*) FROM posts p
            WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.author_id)
        """)).scalar()
    assert orphans == 0, f"{orphans} posts have no valid author"


def test_comments_have_valid_posts():
    with engine.connect() as conn:
        orphans = conn.execute(text("""
            SELECT COUNT(*) FROM comments c
            WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.id = c.post_id)
        """)).scalar()
    assert orphans == 0, f"{orphans} comments reference non-existent posts"


def test_sequences_advanced():
    """Sequences must be above 999 so Spring Boot auto-increment starts at 1000+."""
    with engine.connect() as conn:
        for table in ["users", "posts", "comments"]:
            next_val = conn.execute(text(
                f"SELECT nextval(pg_get_serial_sequence('{table}', 'id'))"
            )).scalar()
            # Roll it back so we don't waste a sequence value
            conn.execute(text(
                f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), {next_val - 1})"
            ))
            assert next_val > 999, (
                f"Sequence for {table} is at {next_val} — must be >999. "
                "Run seed_data.py again."
            )


# ─────────────────────────────────────────
# ANALYTICS TABLE CHECKS
# ─────────────────────────────────────────

ANALYTICS_TABLES = [
    "analytics_daily_activity",
    "analytics_user_engagement",
    "analytics_category_popularity",
    "analytics_content_metrics",
    "analytics_hourly_activity",
    "analytics_top_contributors",
    "analytics_comment_response_time",
]


def test_all_analytics_tables_exist():
    inspector = inspect(engine)
    existing  = set(inspector.get_table_names())
    missing   = [t for t in ANALYTICS_TABLES if t not in existing]
    assert not missing, f"Missing analytics tables: {missing}"


def test_analytics_tables_not_empty():
    with engine.connect() as conn:
        for table in ANALYTICS_TABLES:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            assert count > 0, f"{table} is empty"


def test_daily_activity_columns():
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT * FROM analytics_daily_activity LIMIT 1"), conn)
    required = {"date", "category", "post_count"}
    missing  = required - set(df.columns)
    assert not missing, f"analytics_daily_activity missing columns: {missing}"


def test_daily_activity_covers_30_days():
    with engine.connect() as conn:
        count = conn.execute(text("""
            SELECT COUNT(DISTINCT date) FROM analytics_daily_activity
            WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        """)).scalar()
    assert count >= 20, f"Only {count} active days in last 30 days — expected ≥20"


def test_category_popularity_columns():
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT * FROM analytics_category_popularity LIMIT 1"), conn)
    required = {"category", "total_posts", "comment_count", "avg_comments_per_post", "avg_content_length"}
    missing  = required - set(df.columns)
    assert not missing, f"analytics_category_popularity missing columns: {missing}"


def test_category_popularity_has_all_4():
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT category FROM analytics_category_popularity")).fetchall()
    found    = {r[0] for r in rows}
    expected = {"NEWS", "EVENT", "DISCUSSION", "ALERT"}
    missing  = expected - found
    assert not missing, f"Missing categories in popularity table: {missing}"


def test_top_contributors_columns():
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT * FROM analytics_top_contributors LIMIT 1"), conn)
    required = {"rank", "user_name", "author_email", "posts_created",
                "comments_made", "engagement_score", "total_contributions"}
    missing  = required - set(df.columns)
    assert not missing, f"analytics_top_contributors missing columns: {missing}"


def test_top_contributors_rank_is_ordered():
    with engine.connect() as conn:
        ranks = [r[0] for r in conn.execute(
            text("SELECT rank FROM analytics_top_contributors ORDER BY rank")
        ).fetchall()]
    assert ranks == list(range(1, len(ranks) + 1)), f"Ranks not sequential: {ranks}"


def test_hourly_activity_has_24_rows():
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM analytics_hourly_activity")).scalar()
    assert count == 24, f"Expected 24 rows (one per hour), got {count}"


def test_hourly_activity_columns():
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT * FROM analytics_hourly_activity LIMIT 1"), conn)
    required = {"hour", "post_count", "comment_count"}
    missing  = required - set(df.columns)
    assert not missing, f"analytics_hourly_activity missing columns: {missing}"


def test_content_metrics_has_word_count():
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT * FROM analytics_content_metrics LIMIT 1"), conn)
    assert "avg_word_count" in df.columns, "analytics_content_metrics missing avg_word_count"


def test_engagement_scores_are_correct():
    """Verify score = posts*2 + comments for every user."""
    with engine.connect() as conn:
        df = pd.read_sql(text("""
            SELECT posts_created, comments_made, engagement_score
            FROM   analytics_user_engagement
        """), conn)
    df["expected_score"] = df["posts_created"] * 2 + df["comments_made"]
    wrong = df[df["engagement_score"] != df["expected_score"]]
    assert len(wrong) == 0, f"{len(wrong)} users have wrong engagement scores:\n{wrong}"


def test_response_time_values_positive():
    with engine.connect() as conn:
        df = pd.read_sql(text("SELECT * FROM analytics_comment_response_time"), conn)
    if df.empty:
        return  # No data — skip rather than fail
    neg = df[df["avg_hours_to_first_comment"] < 0]
    assert len(neg) == 0, f"{len(neg)} categories have negative response times"


def test_no_null_categories_in_daily():
    with engine.connect() as conn:
        nulls = conn.execute(text(
            "SELECT COUNT(*) FROM analytics_daily_activity WHERE category IS NULL"
        )).scalar()
    assert nulls == 0, f"{nulls} rows have NULL category in daily_activity"


def test_post_counts_are_positive():
    with engine.connect() as conn:
        bad = conn.execute(text(
            "SELECT COUNT(*) FROM analytics_daily_activity WHERE post_count <= 0"
        )).scalar()
    assert bad == 0, f"{bad} rows have post_count ≤ 0"


# ─────────────────────────────────────────
# ANALYTICS ACCURACY CROSS-CHECKS
# ─────────────────────────────────────────

def test_total_posts_consistent():
    """Sum of category_popularity.total_posts == COUNT(*) of non-deleted posts."""
    with engine.connect() as conn:
        analytics_total = conn.execute(text(
            "SELECT SUM(total_posts) FROM analytics_category_popularity"
        )).scalar() or 0
        source_total = conn.execute(text(
            "SELECT COUNT(*) FROM posts WHERE (is_deleted IS NULL OR is_deleted = FALSE)"
        )).scalar() or 0
    assert analytics_total == source_total, (
        f"Post count mismatch: analytics={analytics_total}, source={source_total}"
    )


def test_total_comments_consistent():
    """Sum of category_popularity.comment_count == COUNT(*) of all comments."""
    with engine.connect() as conn:
        analytics_total = conn.execute(text(
            "SELECT SUM(comment_count) FROM analytics_category_popularity"
        )).scalar() or 0
        source_total = conn.execute(text("SELECT COUNT(*) FROM comments")).scalar() or 0
    assert analytics_total == source_total, (
        f"Comment count mismatch: analytics={analytics_total}, source={source_total}"
    )


def test_top_contributors_are_subset_of_engagement():
    """Every user in top_contributors must exist in user_engagement."""
    with engine.connect() as conn:
        top_emails = {r[0] for r in conn.execute(
            text("SELECT author_email FROM analytics_top_contributors")
        ).fetchall()}
        eng_emails = {r[0] for r in conn.execute(
            text("SELECT author_email FROM analytics_user_engagement")
        ).fetchall()}
    orphans = top_emails - eng_emails
    assert not orphans, f"Top contributors not in engagement table: {orphans}"


# ─────────────────────────────────────────
# RUNNER
# ─────────────────────────────────────────

def run_all():
    print()
    print("=" * 55)
    print("  CommunityBoard Data Engineering — Verify")
    print("=" * 55)

    print("\n── Connectivity ──")
    check("DB connection",               test_db_connection)

    print("\n── Source tables ──")
    check("Source tables exist",         test_source_tables_exist)
    check("Categories seeded",           test_categories_seeded)
    check("Users seeded (≥10)",          test_users_seeded)
    check("Posts seeded (≥50)",          test_posts_seeded)
    check("Comments seeded (≥200)",      test_comments_seeded)
    check("All categories have posts",   test_all_categories_have_posts)
    check("Posts have valid authors",    test_posts_have_valid_authors)
    check("Comments have valid posts",   test_comments_have_valid_posts)
    check("Sequences advanced to 1000+", test_sequences_advanced)

    print("\n── Analytics tables exist ──")
    check("All 7 analytics tables exist",test_all_analytics_tables_exist)
    check("No analytics table is empty", test_analytics_tables_not_empty)

    print("\n── analytics_daily_activity ──")
    check("Correct columns",             test_daily_activity_columns)
    check("Covers ≥20 days",             test_daily_activity_covers_30_days)
    check("No NULL categories",          test_no_null_categories_in_daily)
    check("All post_counts positive",    test_post_counts_are_positive)

    print("\n── analytics_category_popularity ──")
    check("Correct columns",             test_category_popularity_columns)
    check("All 4 categories present",    test_category_popularity_has_all_4)

    print("\n── analytics_top_contributors ──")
    check("Correct columns",             test_top_contributors_columns)
    check("Ranks are sequential",        test_top_contributors_rank_is_ordered)

    print("\n── analytics_hourly_activity ──")
    check("Exactly 24 rows",             test_hourly_activity_has_24_rows)
    check("Has comment_count column",    test_hourly_activity_columns)

    print("\n── analytics_content_metrics ──")
    check("Has avg_word_count column",   test_content_metrics_has_word_count)

    print("\n── Analytics accuracy ──")
    check("Engagement score formula",    test_engagement_scores_are_correct)
    check("Response times positive",     test_response_time_values_positive)
    check("Post totals match source",    test_total_posts_consistent)
    check("Comment totals match source", test_total_comments_consistent)
    check("Top contributors in engagement", test_top_contributors_are_subset_of_engagement)

    # ── Summary ──
    passed = sum(1 for _, ok, _ in results if ok)
    failed = sum(1 for _, ok, _ in results if not ok)
    total  = len(results)

    print()
    print("=" * 55)
    print(f"  Results: {passed}/{total} passed", end="")
    if failed:
        print(f"   ← {failed} FAILED")
    else:
        print("  ✓ ALL CLEAR")
    print("=" * 55)

    if failed:
        print("\nFailed checks:")
        for name, ok, err in results:
            if not ok:
                print(f"  • {name}")
        print()
        sys.exit(1)
    else:
        print("\nSafe to connect to the real database.\n")
        sys.exit(0)


if __name__ == "__main__":
    run_all()