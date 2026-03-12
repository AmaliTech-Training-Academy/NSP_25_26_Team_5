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

# Wait for IAM instance profile to be available (propagation delay)
for i in 1 2 3 4 5 6 7 8 9 10; do
  if aws sts get-caller-identity --region "$AWS_REGION" 2>/dev/null; then break; fi
  sleep 3
done

# ECR login (instance role has ECR read); $$ escapes for Terraform template
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$${ECR_BACKEND%%/*}"

# Docker network for app <-> postgres
docker network create appnet 2>/dev/null || true

docker volume create pgdata 2>/dev/null || true

# Postgres on same host (only backend container needs it)
docker run -d --name postgres --restart unless-stopped --network appnet \
  -e POSTGRES_DB="$DB_NAME" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASS" \
  -v pgdata:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 \
  postgres:15-alpine

# Wait for Postgres to accept connections
until docker exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME"; do sleep 2; done
sleep 5

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

# Persist config and deploy script for in-place updates (CD runs via SSM: /opt/app/deploy.sh <new-tag>)
mkdir -p /opt/app
cat > /opt/app/app.env << 'APPENV'
AWS_REGION=${aws_region}
ECR_BACKEND=${ecr_backend_repo}
ECR_FRONTEND=${ecr_frontend_repo}
DB_NAME=${db_name}
DB_USER=${db_username}
DB_PASS=${db_password}
JWT_SECRET=${jwt_secret}
APPENV
chmod 600 /opt/app/app.env

cat > /opt/app/deploy.sh << 'DEPLOYSH'
#!/bin/bash
set -e
TAG="$$1"
if [ -z "$$TAG" ]; then echo "Usage: deploy.sh <image-tag>"; exit 1; fi
source /opt/app/app.env
export AWS_REGION ECR_BACKEND ECR_FRONTEND DB_NAME DB_USER DB_PASS JWT_SECRET
aws ecr get-login-password --region "$$AWS_REGION" | docker login --username AWS --password-stdin "$${ECR_BACKEND%%/*}"
docker pull "$$ECR_BACKEND:$$TAG"
docker pull "$$ECR_FRONTEND:$$TAG"
docker stop backend frontend 2>/dev/null || true
docker rm backend frontend 2>/dev/null || true
docker run -d --name backend --restart unless-stopped --network appnet \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://postgres:5432/$$DB_NAME" \
  -e SPRING_DATASOURCE_USERNAME="$$DB_USER" \
  -e SPRING_DATASOURCE_PASSWORD="$$DB_PASS" \
  -e JWT_SECRET="$$JWT_SECRET" \
  -p 8080:8080 \
  "$$ECR_BACKEND:$$TAG"
docker run -d --name frontend --restart unless-stopped \
  -p 80:80 \
  "$$ECR_FRONTEND:$$TAG"
echo "Deploy completed: tag=$$TAG"
DEPLOYSH
chmod +x /opt/app/deploy.sh
