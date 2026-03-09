variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "project_name" {
  type    = string
  default = "community-board"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "aws_availability_zones" {
  type        = list(string)
  description = "List of AZs for subnets (e.g. eu-north-1a, eu-north-1b)"
  default     = ["eu-north-1a", "eu-north-1b"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDRs for public subnets (one per AZ)"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDRs for private subnets (one per AZ)"
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# --- RDS ---
variable "db_username" {
  type        = string
  description = "RDS master username"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "RDS master password"
}

variable "db_name" {
  type    = string
  default = "communityboard"
}

# --- ECS backend ---
variable "backend_image" {
  type        = string
  default     = null
  description = "Full ECR image URI (optional). If unset, uses ECR repo from this Terraform + backend_image_tag."
}
variable "backend_image_tag" {
  type        = string
  default     = "latest"
  description = "Image tag when backend_image is not set (e.g. latest or git sha). CI often pushes :latest and :sha."
}
variable "ecr_repository_name" {
  type        = string
  default     = "communityboard-backend"
  description = "ECR repository name (must match CI workflow ECR_REPOSITORY)."
}

variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT signing secret for backend"
}

# --- Amplify frontend ---
variable "repo_url" {
  type        = string
  description = "GitHub repo URL for Amplify (e.g. https://github.com/org/repo)"
}



variable "github_token" {
  type        = string
  sensitive   = true
  description = "GitHub token for Amplify to clone repo (optional if public repo)"
  default     = ""
}
