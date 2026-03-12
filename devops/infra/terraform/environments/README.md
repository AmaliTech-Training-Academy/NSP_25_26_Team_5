# Terraform environments

Each subfolder (**dev**, **staging**, **production**) is a separate Terraform root for that environment. **CD runs from the folder that matches the branch:** `dev` → `environments/dev`, `staging` → `environments/staging`, `main` → `environments/production`.

## Stack (all environments)

- **VPC** – Public and private subnets (2 AZs), IGW, NAT Gateway.
- **Security groups** – ALB (80 from internet); app (80, 8080 from ALB).
- **ALB** – Path `/api/*` → backend target group :8080; default → frontend target group :80.
- **ECR** – Two repos: `communityboard-<env>`, `communityboard-frontend-<env>` (lifecycle: keep last 10 images).
- **EC2** – Single instance (Amazon Linux 2023). User_data installs Docker and runs:
  - Postgres container (port 5432 on localhost)
  - Backend container (Spring Boot, port 8080)
  - Frontend container (Nginx, port 80)
- **SNS** – Optional topic per environment for alerts.

Postgres runs **on EC2** in a container (not RDS). There is no ECS or Amplify; the app is fully hosted on one EC2 instance behind the ALB.

## State backend (once, for all environments)

Create a shared **S3 bucket** and **DynamoDB table** for state and locking. All environments use the same bucket and table; each uses a different state **key**.

1. Create the bucket and table (e.g. via AWS Console, CLI, or a one-off Terraform config). Ensure:
   - Bucket has versioning if desired.
   - DynamoDB table has a primary key `LockID` (String).
2. Set **GitHub secrets** (or equivalent) for CD:
   - `TF_STATE_BUCKET` = bucket name
   - `TF_LOCK_TABLE` = DynamoDB table name

No `backend` folder is required in this repo; CD passes backend config via `-backend-config` at init.

## State keys

| Environment  | State key |
|-------------|-----------|
| dev         | `community-board/dev/terraform.tfstate` |
| staging     | `community-board/staging/terraform.tfstate` |
| production  | `community-board/production/terraform.tfstate` |

## Naming

- **Name prefix:** `community-<env>` (e.g. `community-dev`) for most resources (VPC, ALB, SG, EC2).
- **ECR backend:** `communityboard-<env>` (e.g. `communityboard-dev`).
- **ECR frontend:** `communityboard-frontend-<env>`.

## Variables per environment

- **variables.tf** – Defines variables and defaults (e.g. `vpc_cidr`, `aws_region`, `instance_type`, `alert_email`). Defaults can differ per env by editing the file in that env folder.
- **terraform.tfvars** – Copy from `terraform.tfvars.example` and set values. Do not commit if it contains secrets.
- **CI/CD** – GitHub Environment secrets (e.g. `TF_VAR_DB_USERNAME`, `TF_VAR_DB_PASSWORD`, `TF_VAR_JWT_SECRET`) can be set per environment. Repo-level vars like `TF_VAR_ALERT_EMAIL` apply to all unless overridden per environment.

### Required (no default)

| Variable       | Description |
|----------------|-------------|
| `db_username`  | Postgres username for the container on EC2. |
| `db_password`  | Postgres password (sensitive). |
| `jwt_secret`   | Backend JWT signing secret (sensitive). |

### Optional / with defaults

- `db_name` (default `communityboard`)
- `backend_image_tag`, `frontend_image_tag` (default `latest`; CD often overrides with commit SHA)
- `alert_email` (empty = no SNS subscription)
- `instance_type` (default `t3.small`)
- `vpc_cidr`, `aws_availability_zones`, `public_subnet_cidrs`, `private_subnet_cidrs`

## SNS

Each environment has an SNS topic (e.g. `community-dev-notifications`). Set `alert_email` (or `TF_VAR_ALERT_EMAIL`) to subscribe; leave empty to skip.

## Local runs

Use the same S3 bucket and DynamoDB table as CD; only the state **key** changes per env.

**Option A – backend config on the command line**

```bash
cd devops/infra/terraform/environments/dev
terraform init \
  -backend-config="bucket=YOUR_TF_STATE_BUCKET" \
  -backend-config="key=community-board/dev/terraform.tfstate" \
  -backend-config="region=eu-north-1" \
  -backend-config="dynamodb_table=YOUR_TF_LOCK_TABLE"
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with secrets (db_username, db_password, jwt_secret)
terraform plan
terraform apply
```

**Option B – backend config file**

```bash
cd devops/infra/terraform/environments/dev
cp backend.hcl.example backend.hcl
# Edit backend.hcl: set bucket and dynamodb_table
terraform init -backend-config=backend.hcl
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars
terraform plan
terraform apply
```


