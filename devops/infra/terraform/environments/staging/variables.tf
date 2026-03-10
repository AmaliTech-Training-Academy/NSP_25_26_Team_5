variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, production)"
  default     = "staging"
}

variable "project_name" {
  type    = string
  default = "community-board"
}

variable "vpc_cidr" {
  type    = string
  default = "10.1.0.0/16"
}

variable "aws_availability_zones" {
  type        = list(string)
  description = "List of AZs for subnets"
  default     = ["eu-north-1a", "eu-north-1b"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDRs for public subnets (one per AZ)"
  default     = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDRs for private subnets (one per AZ)"
  default     = ["10.1.10.0/24", "10.1.11.0/24"]
}

# --- Database (Postgres on EC2) ---
variable "db_username" {
  type        = string
  description = "Postgres username"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Postgres password"
}

variable "db_name" {
  type    = string
  default = "communityboard"
}

# --- EC2 app ---
variable "backend_image_tag" {
  type        = string
  default     = "latest"
  description = "Backend Docker image tag"
}

variable "frontend_image_tag" {
  type        = string
  default     = "latest"
  description = "Frontend Docker image tag"
}

variable "ecr_repository_name" {
  type        = string
  default     = "communityboard"
  description = "ECR repo base name; backend = <this>-<env>, frontend = <this>-frontend-<env>"
}

variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT signing secret for backend"
}

variable "instance_type" {
  type        = string
  default     = "t3.small"
  description = "EC2 instance type"
}

# --- SNS ---
variable "alert_email" {
  type        = string
  default     = ""
  description = "Email for SNS notifications (alerts). Empty = no subscription."
}
