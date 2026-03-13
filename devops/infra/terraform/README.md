# Community Board – Terraform (AWS)

Infrastructure: VPC, ALB, **ECR**, ECS (backend), RDS (Postgres), Amplify (frontend), **SNS** (notifications/alerts). Backend is private (only ALB is public). **ECR is created by Terraform** so CI can push without manual repo creation.

## Multi-environment (CD)

**CD uses environment folders**, not the root: `devops/infra/terraform/environments/<env>/`. Branch → env: **dev** → `environments/dev`, **staging** → `environments/staging`, **main** → `environments/production`. Each env has its own state key, ECR repo, and variable defaults (e.g. `db_instance_class`, `vpc_cidr`, `alert_email`). See **[environments/README.md](environments/README.md)**.

## Prerequisites

- Terraform >= 1.0
- AWS CLI / credentials (or OIDC in CI)
- Required variables set (see below)

## Quick start  

```bash
cd devops/infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit: set db_username, db_password, repo_url, api_url (and jwt_secret, github_token if needed)  
terraform init
terraform plan
terraform apply
# ECR repo is created; use output backend_image_url or ecr_repository_url for CI/CD.
```

## Required variables (no default)

| Variable         | Description |
|------------------|-------------|
| `db_username`    | RDS master username |
| `db_password`    | RDS master password (use `TF_VAR_db_password` or `-var`) |
| `repo_url`       | GitHub repo URL for Amplify |
| `api_url`        | Backend API URL for frontend (e.g. `http://<alb-dns-name>` after first apply) |

Optional/sensitive: `jwt_secret`, `github_token` (for Amplify private repo).

**Backend image:** No longer required. Terraform creates an ECR repository and uses `ecr_repository_url:backend_image_tag` (default tag `latest`). Override with `backend_image` if you need a full URI. CI should push to the same repo name (`ecr_repository_name`, default `communityboard-backend`).

## Outputs (image URL)

- **ecr_repository_url** – ECR repo URL without tag (e.g. for `docker push`).
- **backend_image_url** – Full image URI used by ECS (`repo_url:tag`). Use this or pass `backend_image_tag` in CD.

## CI/CD (GitHub Actions)

- **CI** (`ci.yml`): Builds and pushes backend image (per-env ECR repo created by Terraform in each environment folder).
- **CD** (`cd.yml`): Runs from `environments/<env>` where env = branch (dev/staging) or production (main). Terraform validate → plan → apply ECR only → build & push image to `communityboard-backend-<env>:<sha>` → full apply. Each GitHub Environment (dev, staging, production) can have different secrets.

Required **secrets** (per env or repo): `AWS_ROLE_ARN`, `AWS_REGION`, `TF_STATE_BUCKET`, `TF_LOCK_TABLE`, `TF_VAR_DB_USERNAME`, `TF_VAR_DB_PASSWORD`, `TF_VAR_JWT_SECRET`; optional `TF_VAR_GITHUB_TOKEN`.  
Required **vars**: `TF_VAR_REPO_URL`; optional `TF_VAR_API_URL`, `TF_VAR_ALERT_EMAIL` (SNS).  
State key is derived: `community-board/<env>/terraform.tfstate`.

## SonarQube / SonarCloud

- **CI**: Job `sonar` runs after `backend`; uses `SONAR_TOKEN` and optional `SONAR_HOST_URL` (self-hosted).
- **Variables** (optional): `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION`.

## Remote state (recommended)

Uncomment the `backend "s3"` block in `versions.tf` and create the bucket + DynamoDB table for locking (e.g. via `devops/infra/terraform/backend/`).
