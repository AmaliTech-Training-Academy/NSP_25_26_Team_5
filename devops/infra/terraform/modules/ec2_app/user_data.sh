#!/bin/bash
set -e
export AWS_REGION="${aws_region}"
export ECR_BACKEND="${ecr_backend_repo}"
export ECR_FRONTEND="${ecr_frontend_repo}"
export BACKEND_TAG="${backend_image_tag}"
export FRONTEND_TAG="${frontend_image_tag}"
export DB_NAME="${db_name}"
export DB_USER="${db_username}"
export DB_PASS="${db_password}"
export JWT_SECRET="${jwt_secret}"

# Install and start Docker (Amazon Linux 2023)
dnf install -y docker
systemctl enable docker
systemctl start docker

# ECR login (instance role has ECR read); $$ escapes for Terraform template
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$${ECR_BACKEND%%/*}"

# Docker network for app <-> postgres
docker network create appnet 2>/dev/null || true

# Postgres on same host (only backend container needs it)
docker run -d --name postgres --restart unless-stopped --network appnet \
  -e POSTGRES_DB="$DB_NAME" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASS" \
  -p 127.0.0.1:5432:5432 \
  postgres:15-alpine

# Wait for Postgres to accept connections
until docker exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME"; do sleep 2; done

# Backend: connect to postgres via container name
docker run -d --name backend --restart unless-stopped --network appnet \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://postgres:5432/$DB_NAME" \
  -e SPRING_DATASOURCE_USERNAME="$DB_USER" \
  -e SPRING_DATASOURCE_PASSWORD="$DB_PASS" \
  -e JWT_SECRET="$JWT_SECRET" \
  -p 8080:8080 \
  "$ECR_BACKEND:$BACKEND_TAG"

# Frontend: nginx on 80 (ALB routes /api to backend; nginx serves static only)
docker run -d --name frontend --restart unless-stopped \
  -p 80:80 \
  "$ECR_FRONTEND:$FRONTEND_TAG"
