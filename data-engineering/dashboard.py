"""
dashboard.py — CommunityBoard Analytics Dashboard (Streamlit).

Reads from analytics_* tables populated by etl_pipeline.py and renders
interactive visualisations. Auto-refreshes every 5 minutes.

Layout:
  ┌──────────────────────────────────────────────────────┐
  │  CommunityBoard Analytics Dashboard                  │
  ├────────┬────────┬────────┬─────────────────────────  │
  │ Posts  │Comments│ Users  │ Categories                 │
  ├────────┴────────┴────────┴─────────────────────────  │
  │  Daily Activity (30 days) — line chart               │
  ├────────────────────────┬────────────────────────── │
  │  Category Split (pie)  │  Top Contributors (bar)    │
  ├────────────────────────┴────────────────────────── │
  │  Posting Patterns — hour of day bar chart           │
  ├─────────────────────────────────────────────────── │
  │  Comment Engagement by Category — bar chart         │
  └─────────────────────────────────────────────────── │

Run: streamlit run dashboard.py
"""
import time

import pandas as pd
import plotly.express as px
import streamlit as st
from sqlalchemy import text

from db import get_engine, setup_logging

logger = setup_logging("dashboard")

# ---------------------------------------------------------------------------
# Page config
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="CommunityBoard Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ---------------------------------------------------------------------------
# Data loading helpers — cached to avoid hammering the DB on every rerun
# ---------------------------------------------------------------------------
TTL_SECONDS = 300  # 5-minute cache aligns with auto-refresh interval


@st.cache_data(ttl=TTL_SECONDS)
def load_table(table_name: str) -> pd.DataFrame:
    """Load an analytics table, returning an empty DataFrame on any error."""
    engine = get_engine()
    try:
        with engine.connect() as conn:
            return pd.read_sql(text(f"SELECT * FROM {table_name}"), conn)
    except Exception as exc:
        logger.warning("Could not load table '%s': %s", table_name, exc)
        return pd.DataFrame()


@st.cache_data(ttl=TTL_SECONDS)
def load_kpis() -> dict:
    """Load overall KPI counts directly from source tables."""
    engine = get_engine()
    sql = text("""
        SELECT
            (SELECT COUNT(*) FROM posts    WHERE is_deleted = FALSE) AS total_posts,
            (SELECT COUNT(*) FROM comments WHERE is_deleted = FALSE) AS total_comments,
            (SELECT COUNT(*) FROM users    WHERE is_active  = TRUE)  AS total_users,
            (SELECT COUNT(*) FROM categories)                        AS total_categories
    """)
    try:
        with engine.connect() as conn:
            row = conn.execute(sql).fetchone()
        return {
            "total_posts":       int(row[0] or 0),
            "total_comments":    int(row[1] or 0),
            "total_users":       int(row[2] or 0),
            "total_categories":  int(row[3] or 0),
        }
    except Exception as exc:
        logger.warning("Could not load KPIs: %s", exc)
        return {"total_posts": 0, "total_comments": 0, "total_users": 0, "total_categories": 0}


# ---------------------------------------------------------------------------
# Layout helpers
# ---------------------------------------------------------------------------

def _kpi_card(col, icon: str, label: str, value: int) -> None:
    col.metric(label=f"{icon} {label}", value=f"{value:,}")


def _unavailable(label: str) -> None:
    st.info(f"📭 {label} data not yet available. Run the ETL pipeline first.")


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

def render_dashboard() -> None:
    st.title("📊 CommunityBoard Analytics Dashboard")
    st.caption(
        "Data refreshes every 5 minutes. "
        "Run `python etl_pipeline.py` to update analytics tables."
    )

    # ── KPI cards ──────────────────────────────────────────────────────────
    kpis = load_kpis()
    c1, c2, c3, c4 = st.columns(4)
    _kpi_card(c1, "📝", "Total Posts",    kpis["total_posts"])
    _kpi_card(c2, "💬", "Total Comments", kpis["total_comments"])
    _kpi_card(c3, "👥", "Active Users",   kpis["total_users"])
    _kpi_card(c4, "📂", "Categories",     kpis["total_categories"])

    st.divider()

    # ── Daily Activity ──────────────────────────────────────────────────────
    st.subheader("📈 Daily Post Activity — Last 30 Days")
    daily = load_table("analytics_daily_activity")
    if daily.empty:
        _unavailable("Daily activity")
    else:
        daily["date"] = pd.to_datetime(daily["date"])
        cutoff = pd.Timestamp.now() - pd.Timedelta(days=30)
        daily = daily[daily["date"] >= cutoff]
        fig = px.line(
            daily,
            x="date",
            y="post_count",
            color="category",
            markers=True,
            labels={"post_count": "Posts", "date": "Date", "category": "Category"},
        )
        fig.update_layout(legend_title_text="Category", hovermode="x unified")
        st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # ── Category split + Top contributors ──────────────────────────────────
    col_left, col_right = st.columns(2)

    with col_left:
        st.subheader("🥧 Posts by Category")
        cat = load_table("analytics_category_popularity")
        if cat.empty:
            _unavailable("Category popularity")
        else:
            fig = px.pie(
                cat,
                names="category",
                values="total_posts",
                hole=0.35,
            )
            fig.update_traces(textinfo="percent+label")
            st.plotly_chart(fig, use_container_width=True)

    with col_right:
        st.subheader("🏆 Top Contributors")
        top = load_table("analytics_top_contributors")
        if top.empty:
            _unavailable("Top contributors")
        else:
            top_n = top.head(10).sort_values("total_contributions")
            fig = px.bar(
                top_n,
                x="total_contributions",
                y="user_name",
                orientation="h",
                color="total_contributions",
                color_continuous_scale="Blues",
                labels={"total_contributions": "Total Activity", "user_name": "User"},
            )
            fig.update_layout(coloraxis_showscale=False)
            st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # ── Posting patterns ────────────────────────────────────────────────────
    st.subheader("⏰ Posting Patterns — Hour of Day")
    hourly = load_table("analytics_hourly_activity")
    if hourly.empty:
        _unavailable("Hourly activity")
    else:
        fig = px.bar(
            hourly,
            x="hour",
            y=["post_count", "comment_count"],
            barmode="group",
            labels={"hour": "Hour of Day (UTC)", "value": "Count", "variable": "Type"},
        )
        fig.update_layout(
            xaxis=dict(tickmode="linear", dtick=1),
            legend_title_text="Activity Type",
        )
        st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # ── Comment engagement by category ─────────────────────────────────────
    st.subheader("💬 Average Comments per Post by Category")
    cat_eng = load_table("analytics_category_popularity")
    if cat_eng.empty:
        _unavailable("Comment engagement")
    else:
        fig = px.bar(
            cat_eng.sort_values("avg_comments_per_post", ascending=False),
            x="category",
            y="avg_comments_per_post",
            color="category",
            text="avg_comments_per_post",
            labels={"avg_comments_per_post": "Avg Comments / Post", "category": "Category"},
        )
        fig.update_traces(textposition="outside")
        fig.update_layout(showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # ── Content metrics ────────────────────────────────────────────────────
    st.subheader("📏 Content Metrics by Category")
    content = load_table("analytics_content_metrics")
    if content.empty:
        _unavailable("Content metrics")
    else:
        fig = px.bar(
            content.sort_values("avg_word_count", ascending=False),
            x="category",
            y=["avg_word_count", "avg_content_length"],
            barmode="group",
            labels={
                "value":    "Value",
                "variable": "Metric",
                "category": "Category",
            },
        )
        st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # ── Response time KPI ─────────────────────────────────────────────────
    st.subheader("⚡ Comment Response Time")
    rt = load_table("analytics_comment_response_time")
    if rt.empty or rt["avg_hours_to_first_comment"].iloc[0] == 0:
        _unavailable("Response time")
    else:
        avg_h = rt["avg_hours_to_first_comment"].iloc[0]
        st.metric(
            label="⏱ Average Hours to First Comment",
            value=f"{avg_h:.1f} hrs",
        )
        if "computed_at" in rt.columns:
            st.caption(f"Computed at: {rt['computed_at'].iloc[0]}")

    # ── Auto-refresh footer ────────────────────────────────────────────────
    st.divider()
    st.caption("🔄 Dashboard auto-refreshes every 5 minutes via Streamlit cache TTL.")


# ---------------------------------------------------------------------------
# Auto-refresh loop
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Streamlit re-runs this file on every interaction/rerun.
    # The st_autorefresh component or time.sleep is NOT used here because
    # Streamlit's cache TTL + the browser meta-refresh approach is more reliable.
    render_dashboard()

    # Trigger a background rerun every 5 minutes using Streamlit's rerun mechanism.
    # This works in Streamlit ≥ 1.27 which supports st.rerun().
    try:
        import streamlit.components.v1 as components
        # Inject a meta-refresh every 300 seconds as a cost-free auto-refresh
        components.html(
            "<meta http-equiv='refresh' content='300'>",
            height=0,
        )
    except Exception:
        pass  # Non-fatal — dashboard still works, just without auto-refresh
