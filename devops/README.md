# DevOps – CI/CD & Infrastructure

This folder contains the **CI/CD pipelines** (GitHub Actions) and **AWS infrastructure** (Terraform) for the Community Board application. **One ALB** fronts a single **EC2** instance that runs **PostgreSQL**, the **backend** (Spring Boot), and the **frontend** (Nginx serving static assets). Path-based routing: `/api/*` → backend:8080, everything else → frontend:80. Terraform state is stored in S3 with DynamoDB locking.

---

## Table of Contents

- [Setup steps](#setup-steps)
- [Overview](#overview)
- [Architecture Diagrams](#architecture-diagrams)
- [Repository Layout](#repository-layout)
- [CI Pipeline](#ci-pipeline)
- [CD Pipeline](#cd-pipeline)
- [Infrastructure (Terraform)](#infrastructure-terraform)
- [Local Deployment](#local-deployment)
- [Backend for all environments](#backend-for-all-environments)
- [Required Secrets & Variables](#required-secrets--variables)
- [Runbook](#runbook)

---

## Setup steps

Follow in order to get CI/CD and all environments (dev, staging, production) running.

### 1. AWS: OIDC for GitHub Actions

- In **AWS IAM**, create an OIDC identity provider for GitHub (e.g. `token.actions.githubusercontent.com`).
- Create an IAM role that:
  - Trusts the GitHub OIDC provider (with your repo/org in the condition).
  - Has permissions for: S3 (state bucket), DynamoDB (lock table), ECR, EC2, VPC/ALB, IAM (instance profiles), etc. (or use a policy that matches what Terraform needs).
- Note the role **ARN** → you’ll set it as GitHub secret `AWS_ROLE_ARN`.

### 2. Terraform state backend (once, for all environments)

```bash
cd devops/infra/terraform/backend
cp terraform.tfvars.example terraform.tfvars
# Edit: state_bucket_name (globally unique), lock_table_name, aws_region
terraform init
terraform apply
```

- From the output, note **state_bucket_name** and **lock_table_name** for the next step.

### 3. GitHub: Environments

- Repo **Settings → Environments → New environment**.
- Create: **dev**, **staging**, **production**.
- (Optional) On **production**, add required reviewers or a wait timer.

### 4. GitHub: Repository secrets

- Repo **Settings → Secrets and variables → Actions → Secrets → New repository secret**.
- Add these (shared by CD for all environments; can be overridden per environment if you set the same name under **Environments → [dev|staging|production] → Environment secrets**):

| Secret | Required | Description |
|--------|----------|-------------|
| `AWS_ROLE_ARN` | Yes | IAM role ARN for OIDC (GitHub → AWS). |
| `AWS_REGION` | Yes | AWS region (e.g. `eu-north-1`). |
| `TF_STATE_BUCKET` | Yes | S3 bucket name (from backend bootstrap output). |
| `TF_LOCK_TABLE` | Yes | DynamoDB table name (from backend bootstrap output). |
| `TF_VAR_DB_USERNAME` | Yes | Postgres username on EC2 (or set per env). |
| `TF_VAR_DB_PASSWORD` | Yes | Postgres password (or set per env). |
| `TF_VAR_JWT_SECRET` | Yes | Backend JWT signing secret (or set per env). |

### 5. GitHub: Environment secrets (optional overrides)

- To use **different** DB credentials or JWT per environment: **Settings → Environments → [dev | staging | production] → Environment secrets**.
- Add the same secret names (e.g. `TF_VAR_DB_USERNAME`, `TF_VAR_DB_PASSWORD`, `TF_VAR_JWT_SECRET`). The deploy job uses `environment: ${{ env.ENVIRONMENT }}`, so it reads that environment’s secrets; environment values override repository secrets.

### 6. GitHub: Repository variables

- **Settings → Secrets and variables → Actions → Variables**.
- These are **repository-level** (same value for all environments unless you add environment-specific variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `TF_VAR_ALERT_EMAIL` | No | Email for SNS alerts; empty = no subscription. |

### 7. GitHub: Environment variables (optional overrides)

- **Settings → Environments → [dev | staging | production] → Environment variables**.
- Use when a variable must differ per env (e.g. different `TF_VAR_ALERT_EMAIL` per environment). Same names as repository variables; environment value overrides repo.

### 8. CI secrets (repository)

- **Settings → Secrets and variables → Actions → Secrets**.
- Used by **CI** (build/test): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_URL`. Optional: `SONAR_TOKEN` (and Sonar vars if you use SonarCloud).

### 9. First deploy

- Push to **dev** / **staging** / **main**. CI runs, then CD runs for that branch’s environment.
- App URL: `http://<alb_dns_name>` (from Terraform output or AWS console). Frontend and `/api` use the same origin (ALB).

---

## Overview

| Component        | Technology              | Purpose                                      |
|-----------------|-------------------------|----------------------------------------------|
| **CI**          | GitHub Actions (`ci.yml`) | Build, test backend/frontend; Docker build (images pushed in CD) |
| **CD**          | GitHub Actions (`cd.yml`) | Terraform validate → apply ECR (backend + frontend) → build & push both images → Terraform apply (EC2, ALB, etc.) |
| **Infrastructure** | Terraform (AWS)       | VPC, ALB (path /api→backend, default→frontend), EC2 (Postgres + backend + frontend containers), ECR (backend + frontend) |
| **State**       | S3 + DynamoDB          | Remote Terraform state with locking          |
| **Auth (CD)**   | OIDC                    | GitHub Actions → AWS via `AWS_ROLE_ARN`      |

**Flow:** Push to `main`/`dev`/`staging` → **CI** runs. When CI succeeds → **CD** runs: Terraform validate → apply ECR only (both repos) → build & push backend and frontend images (tag = commit SHA) → Terraform apply full stack. EC2 user-data pulls the images and runs Postgres, backend, and frontend containers; ALB routes traffic to the single instance.

---

## Architecture Diagrams

### CI/CD pipeline flow

```mermaid
flowchart LR
  subgraph trigger["Trigger"]
    P[Push/PR to main or dev]
  end

  subgraph ci["CI Pipeline (ci.yml)"]
    B[backend build & test]
    F[frontend build]
    S[SonarCloud]
    Q[CodeQL]
    D[docker-build-scan]
    B --> S
    B --> Q
    B --> D
    F --> D
  end

  subgraph cd["CD Pipeline (cd.yml) — after CI success"]
    V[terraform validate]
    E[apply ECR only]
    I[build & push backend + frontend :sha]
    A[terraform apply full]
    V --> E --> I --> A
  end

  P --> ci
  ci -->|"main + success"| cd
```

### AWS infrastructure (Terraform)

```mermaid
flowchart TB
  subgraph internet["Internet"]
    User[Users]
  end

  subgraph public["Public subnets"]
    ALB[Application Load Balancer<br/>/api/* → :8080, default → :80]
  end

  subgraph private["Private subnets"]
    EC2[EC2 instance]
    EC2 --> Postgres[(Postgres container)]
    EC2 --> Backend[Backend :8080]
    EC2 --> Frontend[Frontend Nginx :80]
  end

  subgraph aws_services["AWS services"]
    ECR_B[ECR Backend]
    ECR_F[ECR Frontend]
    S3[(S3 + DynamoDB<br/>Terraform state)]
  end

  User --> ALB
  ALB --> Backend
  ALB --> Frontend
  Backend --> Postgres
  EC2 -.->|pull| ECR_B
  EC2 -.->|pull| ECR_F
  cd[GitHub Actions CD] -.->|push images| ECR_B
  cd -.->|push images| ECR_F
  cd -.->|apply| S3
```

---

## Repository Layout

```
devops/
├── README.md                 # This file
├── infra/
│   └── terraform/
│       ├── environments/     # dev, staging, production (each: network → security → alb → ecr + ecr_frontend → ec2_app → sns)
│       │   ├── dev/
│       │   ├── staging/
│       │   └── production/
│       └── modules/
│           ├── network/      # VPC, public/private subnets, IGW, NAT
│           ├── security/    # ALB SG, app SG (80 + 8080 from ALB)
│           ├── alb/         # ALB, backend TG :8080, frontend TG :80, listener /api/* → backend, default → frontend
│           ├── ecr/         # ECR repo + lifecycle (backend and frontend repos)
│           ├── ec2_app/     # EC2 + IAM, user-data: Postgres + backend + frontend containers
│           └── sns/         # Notifications
│       └── backend/         # Terraform state bootstrap (S3 + DynamoDB), one-time
 

.github/workflows/
├── ci.yml                    # CI: backend/frontend build & test, Sonar, CodeQL, Docker build
└── cd.yml                    # CD: Terraform validate → apply ECR → build & push backend + frontend → apply full
```

---

## CI Pipeline

**Workflow:** `.github/workflows/ci.yml`  
**Triggers:** `push` / `pull_request` to `main` or `dev` (and PRs targeting `main`).

| Job                 | Runs on    | Description |
|---------------------|------------|-------------|
| **backend**         | ubuntu-latest | PostgreSQL 15 service; JDK 17; Maven build (`mvn clean package -DskipTests`); then `mvn test` with DB secrets. |
| **frontend**        | ubuntu-latest | Node 18; `npm ci`; `npm run build` in `frontend/`. |
| **sonar**           | After backend | SonarCloud (or SonarQube) scan on backend; uses `SONAR_TOKEN`, optional `SONAR_HOST_URL`, `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION`. |
| **codeql**          | ubuntu-latest | CodeQL init/autobuild/analyze for Java + JavaScript. |
| **docker-build-scan** | After backend, frontend, sonar, codeql | Builds backend Docker image `communityboard-backend:${{ github.sha }}`. Trivy scan is present but commented out. |

**Secrets used (CI):** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_URL`, `SONAR_TOKEN`.  
**Variables (optional):** `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION`, `SONAR_HOST_URL`.

---

## CD Pipeline

**Workflow:** `.github/workflows/cd.yml`  
**Trigger:** Runs after **CI Pipeline** completes on **main**, **dev**, or **staging** (`workflow_run`). Only runs when CI conclusion is **success**.  
**Working directory:** `devops/infra/terraform/environments/<env>` (env = production for main, else branch name).

### Jobs

1. **terraform-validate**
   - Checkout → Setup Terraform 1.5 → Configure AWS via OIDC (`AWS_ROLE_ARN`, `AWS_REGION`).
   - `terraform init` with S3 backend (bucket, key, region, DynamoDB lock table from secrets).
   - `terraform validate` and `terraform fmt -check -recursive`.

2. **terraform-deploy** (needs `terraform-validate`, uses GitHub Environment = env)
   - Terraform init (same backend).
   - **Plan** with `TF_VAR_backend_image_tag` and `TF_VAR_frontend_image_tag` = commit SHA; DB, JWT, alert email from secrets/vars.
   - **Apply ECR only:** `terraform apply -target=module.ecr -target=module.ecr_frontend` so both repos exist.
   - **Login to ECR** → **Build & push** backend image from `./backend`, then **build & push** frontend image from `./frontend` (tag = commit SHA).
   - **Full apply:** `terraform apply` so EC2, ALB, target groups, etc. use the new images.

**Important:** ECR is applied first so the CD job can push both images; the rest of the stack (EC2, ALB) is applied after. EC2 user-data pulls `backend_image_tag` and `frontend_image_tag` (commit SHA).

---

## Infrastructure (Terraform)

### Architecture

- **VPC** (e.g. `10.0.0.0/16`): public and private subnets in 2 AZs; IGW for public; NAT Gateway for private outbound (ECR pull).
- **Security groups:** ALB (80 from internet); app SG (80 and 8080 from ALB only).
- **ALB:** Public; one listener :80; path `/api/*` → backend target group (port 8080); default → frontend target group (port 80). Health: backend `/api/categories`, frontend `/`.
- **EC2:** Single instance in private subnet; IAM role for ECR pull; user-data installs Docker and runs three containers: Postgres 15, backend (Spring Boot :8080), frontend (Nginx :80). Backend connects to Postgres on Docker network.
- **ECR:** Two repositories (backend, frontend); lifecycle keeps last 10 images each.
- **SNS:** Optional alert topic per environment.

### State & Lock

- **Backend:** S3 bucket + DynamoDB table (see each env `versions.tf`). In CI/CD, config via secrets: `TF_STATE_BUCKET`, key `community-board/<env>/terraform.tfstate`, `AWS_REGION`, `TF_LOCK_TABLE`.

### Apply order (in code)

1. **network** → **security** → **alb** (two target groups), **ecr**, **ecr_frontend**.
2. **ec2_app** (depends on ALB target groups, app SG, both ECR URLs; registers instance to both TGs).

### Variables

- **Required (no default):** `db_username`, `db_password`; sensitive: `jwt_secret`.
- **Image tags:** `backend_image_tag`, `frontend_image_tag` (CD sets both to commit SHA).
- See each env `terraform.tfvars.example` for full list.

### Outputs

- `vpc_id`, `alb_dns_name`, `alb_zone_id`, `ec2_instance_id`, `ecr_backend_url`, `ecr_frontend_url`, `sns_topic_arn`

---

## Local Deployment

For local dev (no AWS):

```bash
./devops/scripts/deploy.sh [environment]
# default environment: development
```

This runs `docker-compose down`, `docker-compose build --no-cache`, `docker-compose up -d`, then a simple health check against `http://localhost:8080/api-docs`. Backend at 8080, frontend at 3000.

---

## Backend for all environments

Terraform state for **dev**, **staging**, and **production** uses one shared **S3 bucket** and one **DynamoDB** lock table. You create them once; each environment uses a different state **key** in the same bucket.

### 1. Create the backend (one-time)

```bash
cd devops/infra/terraform/backend
cp terraform.tfvars.example terraform.tfvars
# Edit: state_bucket_name (globally unique), lock_table_name, aws_region
terraform init
terraform apply
```

Details: **[infra/terraform/backend/README.md](infra/terraform/backend/README.md)**.

### 2. Set GitHub secrets from backend outputs

After `terraform apply`, use the outputs:

| Secret | Value (from backend apply output) |
|--------|-----------------------------------|
| `TF_STATE_BUCKET` | `state_bucket_name` |
| `TF_LOCK_TABLE`   | `lock_table_name`   |

In GitHub: **Settings → Secrets and variables → Actions → New repository secret** (or set per environment under **Settings → Environments**).

### 3. State keys (no secret needed)

CD derives the state key from the environment:

- **dev** → `community-board/dev/terraform.tfstate`
- **staging** → `community-board/staging/terraform.tfstate`
- **production** → `community-board/production/terraform.tfstate`

---

## Required Secrets & Variables

All names used by CI/CD, with **where** to set them (repository vs environment) and **required** vs optional. Environment-level values override repository-level when the deploy job runs with `environment: dev | staging | production`.

### Repository secrets (shared; used by CD and optionally by CI)

Set under **Settings → Secrets and variables → Actions → Secrets**.

| Secret | Required | Used by | Description |
|--------|----------|---------|-------------|
| `AWS_ROLE_ARN` | Yes | CD | IAM role ARN for OIDC (GitHub → AWS). |
| `AWS_REGION` | Yes | CD | AWS region (e.g. `eu-north-1`). |
| `TF_STATE_BUCKET` | Yes | CD | S3 bucket for Terraform state (from backend bootstrap). |
| `TF_LOCK_TABLE` | Yes | CD | DynamoDB table for state lock (from backend bootstrap). |
| `TF_VAR_DB_USERNAME` | Yes | CD | Postgres username (EC2 container). |
| `TF_VAR_DB_PASSWORD` | Yes | CD | Postgres password. |
| `TF_VAR_JWT_SECRET` | Yes | CD | Backend JWT signing secret. |
| `POSTGRES_USER` | Yes | CI | Postgres user for CI test DB. |
| `POSTGRES_PASSWORD` | Yes | CI | Postgres password for CI test DB. |
| `SPRING_DATASOURCE_URL` | Yes | CI | JDBC URL for CI tests (e.g. `jdbc:postgresql://localhost:5432/communityboard`). |
| `SONAR_TOKEN` | No | CI | Only if using SonarCloud/SonarQube. |

### Environment secrets (per dev / staging / production)

Set under **Settings → Environments → [dev | staging | production] → Environment secrets**.

Use these when a value must **differ per environment** (e.g. different DB credentials or JWT per env). Same names as in the table above; environment secret overrides repository secret for the deploy job.

| Secret | When to use per env |
|--------|----------------------|
| `TF_VAR_DB_USERNAME` | Different DB user per env. |
| `TF_VAR_DB_PASSWORD` | Different DB password per env. |
| `TF_VAR_JWT_SECRET` | Different JWT secret per env. |

### Repository variables (shared; used by CD)

Set under **Settings → Secrets and variables → Actions → Variables**.

| Variable | Required | Used by | Description |
|----------|----------|---------|-------------|
| `TF_VAR_ALERT_EMAIL` | No | CD | Email for SNS alerts; empty = no subscription. |

### Environment variables (per dev / staging / production)

Set under **Settings → Environments → [dev | staging | production] → Environment variables**.

Use when a variable must **differ per environment** (e.g. different alert email per env). Same names as above; environment variable overrides repository variable.

| Variable | When to use per env |
|----------|----------------------|
| `TF_VAR_ALERT_EMAIL` | Different alert email per env. |

### Summary

- **Repository** = one value for the whole repo; use for shared config (AWS, state backend, shared DB/JWT).
- **Environment** = one value per GitHub Environment (dev, staging, production); use for env-specific config (different DB, JWT, alert email). The CD deploy job uses `environment: ${{ env.ENVIRONMENT }}`, so it reads that environment’s secrets and variables.
- **Secrets** = sensitive (passwords, JWT). **Variables** = non-sensitive (e.g. alert email); can still be overridden per environment.
- State key is derived as `community-board/<env>/terraform.tfstate`. ECR repos: `communityboard-<env>` (backend), `communityboard-frontend-<env>` (frontend).

---

## Runbook

1. **First-time Terraform (e.g. new account)**  
   Create S3 bucket and DynamoDB table for state; configure OIDC in AWS for GitHub; set CD secrets/vars.

2. **Redeploy app (backend + frontend)**
   Push to the branch for the env (e.g. `main` → production); CI passes → CD runs, builds and pushes both images (tag = SHA), then Terraform apply. EC2 user-data runs on new instance and pulls the new images (or replace instance to pick up new tags).

3. **Terraform changes only (no app code)**
   Change Terraform under `devops/infra/terraform/environments/<env>` and push. CI runs; CD runs Terraform with same image tags as last run.

4. **Local dev**
   Use `devops/scripts/deploy.sh`; no Terraform or GitHub Actions required.

6. **EC2 app / backend can't connect to Postgres**  
   - **Security groups:** RDS SG must allow ingress 5432 from the **backend** SG (Terraform does this). In AWS Console → RDS → instance → VPC security groups, confirm the RDS SG has a rule “Postgres from backend” with source = backend SG.  
   - **Credentials:** Ensure `TF_VAR_DB_USERNAME` and `TF_VAR_DB_PASSWORD` match what user-data passes to the Postgres container (same GitHub Environment as deploy).  
   - **RDS not ready:** After first apply, RDS can stay in “creating” for a few minutes. If tasks fail immediately, wait until RDS status is “Available”, then force a new ECS deployment (ECS → Service → Update → Force new deployment).  
   - **SSL:** If the app fails with an SSL-related error, set the ECS module variable `db_connection_params` to `?sslmode=disable` (same-VPC) or `?sslmode=require` (if RDS enforces SSL). Add the variable in the environment’s `main.tf` (e.g. `db_connection_params = "?sslmode=disable"`) or via `TF_VAR_db_connection_params` in CD.  
   - **ALB health:** If target groups are unhealthy, check app SG allows 80 and 8080 from ALB and containers listen on 80 and 8080.

For more detail on Terraform modules and variables, see **`devops/infra/terraform/README.md`**.
