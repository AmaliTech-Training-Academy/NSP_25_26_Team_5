variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, production)"
  default     = "production"
}

variable "project_name" {
  type    = string
  default = "community-board"
}

variable "vpc_cidr" {
  type    = string
  default = "10.2.0.0/16"
}

variable "aws_availability_zones" {
  type        = list(string)
  description = "List of AZs for subnets"
  default     = ["eu-north-1a", "eu-north-1b"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDRs for public subnets (one per AZ)"
  default     = ["10.2.1.0/24", "10.2.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDRs for private subnets (one per AZ)"
  default     = ["10.2.10.0/24", "10.2.11.0/24"]
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

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t3.small"
}

# --- ECS backend ---
variable "backend_image" {
  type        = string
  default     = null
  description = "Full ECR image URI (optional). If unset, uses ECR repo + backend_image_tag."
}

variable "backend_image_tag" {
  type        = string
  default     = "latest"
  description = "Image tag when backend_image is not set"
}

variable "ecr_repository_name" {
  type        = string
  default     = "communityboard-backend"
  description = "ECR repository base name; becomes <this>-<environment>."
}

variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT signing secret for backend"
}

# --- Amplify frontend ---
variable "repo_url" {
  type        = string
  description = "GitHub repo URL for Amplify"
}

variable "github_token" {
  type        = string
  sensitive   = true
  default     = ""
  description = "GitHub token for Amplify (optional if public repo)"
}

# --- SNS ---
variable "alert_email" {
  type        = string
  default     = ""
  description = "Email for SNS notifications (alerts). Empty = no subscription."
}
