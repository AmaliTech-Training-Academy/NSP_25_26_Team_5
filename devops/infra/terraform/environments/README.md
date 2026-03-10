# Terraform environments

Each subfolder (**dev**, **staging**, **production**) is a separate Terraform root for that environment. CD runs from the folder matching the branch: `dev` → `environments/dev`, `staging` → `environments/staging`, `main` → `environments/production`.

## Creating the backend (once, for all environments)

Before using any environment, create the shared state backend (one S3 bucket + one DynamoDB table). All environments use the same bucket/table; each uses a different state **key**.

1. **Bootstrap the backend**
   ```bash
   cd devops/infra/terraform/backend
   cp terraform.tfvars.example terraform.tfvars
   # Edit: set state_bucket_name (globally unique), lock_table_name, aws_region
   terraform init
   terraform apply
   ```
2. **Set GitHub secrets** from the Terraform output:
   - `TF_STATE_BUCKET` = output `state_bucket_name`
   - `TF_LOCK_TABLE` = output `lock_table_name`

Full steps and options: **[../backend/README.md](../backend/README.md)**.

## Layout

- **dev** – development (smaller RDS, optional SNS subscription)
- **staging** – pre-production (e.g. `db.t3.small`, different VPC CIDR `10.1.0.0/16`)
- **production** – production (VPC CIDR `10.2.0.0/16`)

Each environment has its own:

- **State:** `community-board/<env>/terraform.tfstate` in the same S3 bucket
- **ECR repo:** `communityboard-backend-<env>`
- **Resources:** namespaced `community-board-<env>-*` (VPC, ALB, ECS, RDS, SNS, Amplify)

## Variables per environment

- **variables.tf** – defaults (e.g. `db_instance_class`, `vpc_cidr`, `alert_email`) differ by env.
- **terraform.tfvars** – copy from `terraform.tfvars.example` and set secrets (do not commit).
- **CI/CD** – GitHub Environment secrets (e.g. `TF_VAR_DB_USERNAME`, `TF_VAR_JWT_SECRET`) can be set per env (dev, staging, production). Repo vars like `TF_VAR_REPO_URL` and optional `TF_VAR_ALERT_EMAIL` apply to all unless overridden per environment.

## SNS

Each environment includes an SNS topic (`community-board-<env>-notifications`). Optional email subscription via `alert_email` (or `TF_VAR_alert_email` in CI). Use the topic ARN for CloudWatch alarms or other publishers.

## Local

Use the same bucket/table from the backend bootstrap; only the state **key** changes per env.

**Option A – inline backend config**
```bash
cd devops/infra/terraform/environments/dev
terraform init \
  -backend-config="bucket=YOUR_TF_STATE_BUCKET" \
  -backend-config="key=community-board/dev/terraform.tfstate" \
  -backend-config="region=eu-north-1" \
  -backend-config="dynamodb_table=YOUR_TF_LOCK_TABLE"
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with secrets
terraform plan
terraform apply
```

**Option B – backend config file**
```bash
cd devops/infra/terraform/environments/dev
cp backend.hcl.example backend.hcl
# Edit backend.hcl: set bucket and dynamodb_table (from backend bootstrap outputs)
terraform init -backend-config=backend.hcl
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars
terraform plan
terraform apply
```
