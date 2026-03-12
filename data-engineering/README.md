# CommunityBoard — Data Engineering

Owns the analytics layer of the CommunityBoard application.

## Scope

| What | Where |
|------|-------|
| DB config | `config.py` |
| Shared helpers (engine, logging, schema) | `db.py` |
| Seed data (realistic neighbourhood content) | `seed_data.py` |
| ETL pipeline (7 analytics transforms) | `etl_pipeline.py` |
| Analytics SQL reference | `analytics_queries.sql` |
| Streamlit dashboard | `dashboard.py` |
| Docker image | `Dockerfile` |
| Runtime logs (git-ignored) | `logs/` |

> **Team boundary**: This folder is exclusively owned by the Data Engineering team. No files outside `data-engineering/` (except `docker-compose.yml` service blocks) are modified by this team.

---

## Quick Start (Docker)

```bash
# From project root — seeds data, runs ETL, starts dashboard
docker-compose up --build data-seed data-etl data-dashboard

# Dashboard available at:
open http://localhost:8501
```

## Local Development

```bash
cd data-engineering

# Copy and configure credentials
cp .env.example .env        # then edit .env with your local DB values

# Install dependencies
pip install -r requirements.txt

# Ensure backend is running first (creates DB tables via JPA ddl-auto: update)
# Then run in order:
python seed_data.py          # insert realistic seed data (idempotent)
python etl_pipeline.py       # build analytics aggregate tables
streamlit run dashboard.py   # launch dashboard at http://localhost:8501
```

---

## Architecture

```
PostgreSQL 15 (application DB)
        │
        │  extract_posts() / extract_comments()
        ▼
etl_pipeline.py
        │
        │  7 transforms
        ▼
Analytics tables (same PostgreSQL DB — cost-efficient, no extra infra)
  analytics_daily_activity
  analytics_user_engagement
  analytics_category_popularity
  analytics_content_metrics
  analytics_hourly_activity
  analytics_top_contributors
  analytics_comment_response_time
        │
        ▼
dashboard.py (Streamlit — reads analytics tables, renders charts)
```

### Why same DB?
Keeping analytics tables in the same PostgreSQL instance avoids:
- Extra infra cost (no separate data warehouse for this scale)
- Cross-DB network latency
- Additional secrets to manage

Analytics tables are prefixed `analytics_` and are owned/replaced by the ETL. The backend never reads them.

---

## Security

- **Zero hardcoded credentials** — all connection details come from `.env` (local) or Docker `env_file`
- `.env` is git-ignored; `.env.example` is committed with placeholder values
- Docker services use `env_file: ./data-engineering/.env` — never inline `environment:` with secrets
- Non-root user (`appuser`) in Docker container

## ID Conventions

| Range | Owner |
|-------|-------|
| 1–99 | Backend (`backend/src/main/resources/data.sql`) |
| 100–999 | Data Engineering (`seed_data.py`) |
| 1000+ | Application runtime |

## Soft-Delete Conventions

All queries respect:
- `WHERE is_deleted = FALSE` for posts and comments
- `WHERE is_active  = TRUE`  for users

---

## Files

| File | Responsibility |
|------|---------------|
| `config.py` | DB env-var config only |
| `db.py` | Engine factory, logging setup, schema validation |
| `seed_data.py` | Idempotent realistic seed data |
| `etl_pipeline.py` | Extract → Transform → Load (7 analytics tables) |
| `analytics_queries.sql` | 12 production analytics SQL queries (reference) |
| `dashboard.py` | Streamlit dashboard with 6 visualisation panels |
| `requirements.txt` | All Python dependencies |
| `Dockerfile` | Multi-purpose image (seed / etl / dashboard) |
| `.env.example` | Credential template (committed) |
| `.env` | Real credentials (git-ignored, never committed) |
