# Community Board – Terraform (AWS)

Infrastructure for the Community Board app: **VPC**, **ALB**, **ECR** (backend + frontend), **EC2** (single instance running Postgres, backend, and frontend in Docker), and **SNS** (optional alerts). The ALB is public; the EC2 instance runs in a public or private subnet and pulls images from ECR. **ECR repositories are created by Terraform**; CD builds and pushes images from GitHub Actions.

## Where to run Terraform

**CD runs from environment folders**, not the repo root:

- `devops/infra/terraform/environments/dev/` → **dev**
- `devops/infra/terraform/environments/staging/` → **staging**
- `devops/infra/terraform/environments/production/` → **production**

Branch mapping: **dev** → dev, **staging** → staging, **main** → production. Each environment has its own state key, ECR repos, and (optionally) variable defaults.

See **[environments/README.md](environments/README.md)** for per-environment layout, backend config, and variables.

## What gets created

| Component   | Purpose |
|------------|---------|
| **network** | VPC, public/private subnets (2 AZs), IGW, NAT Gateway. |
| **security** | ALB security group (80 from internet); app SG (80, 8080 from ALB). |
| **alb** | ALB, listener :80; `/api/*` → backend :8080; default → frontend :80. |
| **ecr** / **ecr_frontend** | ECR repos: `communityboard-<env>`, `communityboard-frontend-<env>`; lifecycle keep last 10 images. |
| **ec2_app** | One EC2 (Amazon Linux 2023); IAM (ECR pull, optional SSM); user_data runs Postgres + backend + frontend containers; instance registered to both ALB target groups. |
| **sns** | Optional SNS topic per environment for alerts. |

Postgres runs **on the EC2 instance** in a Docker container. Backend and frontend also run as containers on the same instance.

## Prerequisites

- Terraform >= 1.0
- AWS CLI / credentials (or OIDC in GitHub Actions for CD)
- S3 bucket and DynamoDB table for remote state (create once; see [environments/README.md](environments/README.md))

## Required variables (per environment)

Set via `terraform.tfvars`, `TF_VAR_*` in CI/CD, or `-var`:

| Variable          | Description |
|-------------------|-------------|
| `db_username`     | Postgres username (used by the Postgres container on EC2). |
| `db_password`     | Postgres password (sensitive). |
| `jwt_secret`      | Backend JWT signing secret (sensitive). |

Optional / with defaults: `db_name` (default `communityboard`), `backend_image_tag` / `frontend_image_tag` (default `latest`), `alert_email`, `instance_type`, `vpc_cidr`, `aws_region`, etc. See each environment’s `variables.tf` and `terraform.tfvars.example`.

## Outputs (per environment)

Typical outputs: `environment`, `vpc_id`, `alb_dns_name`, `alb_zone_id`, `ec2_instance_id`, `ec2_public_ip` (if in public subnet), `ecr_backend_url`, `ecr_frontend_url`, `sns_topic_arn`. App URL: `http://<alb_dns_name>`.

## CI/CD (GitHub Actions)

- **CD** (`cd.yml`): Runs after CI succeeds on `main`, `dev`, or `staging`. Working directory: `devops/infra/terraform/environments/<env>`. Steps: Terraform init (S3 backend) → validate → plan → apply ECR only → build & push backend and frontend images → Terraform apply full. Image tags are set by CD (e.g. commit SHA or `latest`).

**Secrets (repo or environment):** `AWS_ROLE_ARN`, `AWS_REGION`, `TF_STATE_BUCKET`, `TF_LOCK_TABLE`, `TF_VAR_DB_USERNAME`, `TF_VAR_DB_PASSWORD`, `TF_VAR_JWT_SECRET`.

**Variables (optional):** `TF_VAR_ALERT_EMAIL`.  
State key: `community-board/<env>/terraform.tfstate`.

## Repository layout

```
devops/infra/terraform/
├── README.md                 # This file
├── variables.tf              # Root-level vars (some envs may not use)
├── terraform.tfvars.example  # Root-level example (CD uses environments/)
├── environments/
│   ├── README.md             # Environment-specific docs
│   ├── dev/
│   ├── staging/
│   └── production/
└── modules/
    ├── network/
    ├── security/
    ├── alb/
    ├── ecr/
    ├── ec2_app/
    └── sns/
```

Use **environments/<env>** for all CD and for local runs targeting that environment.
