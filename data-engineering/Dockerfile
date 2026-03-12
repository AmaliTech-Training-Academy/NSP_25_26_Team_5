# =============================================================================
# data-engineering/Dockerfile
# Multi-purpose image: seed_data | etl_pipeline | dashboard
# Override CMD at service level in docker-compose.yml
# =============================================================================

FROM python:3.11-slim

# Security: run as non-root user
RUN groupadd --gid 1001 appgroup \
 && useradd  --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Install deps first (layer cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory and set permissions
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

# Default: run ETL pipeline.
# Override with: command: ["python", "seed_data.py"]
#                command: ["streamlit", "run", "dashboard.py", "--server.port=8501", "--server.address=0.0.0.0"]
CMD ["python", "etl_pipeline.py"]
