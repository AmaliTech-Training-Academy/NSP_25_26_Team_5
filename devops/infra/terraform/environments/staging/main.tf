locals {
  name_prefix            = "${var.project_name}-${var.environment}"
  ecr_backend_repo_name  = "${var.ecr_repository_name}-${var.environment}"
  ecr_frontend_repo_name = "${var.ecr_repository_name}-frontend-${var.environment}"
}

# --- Networking ---
module "network" {
  source                 = "../../modules/network"
  project_name           = local.name_prefix
  vpc_cidr               = var.vpc_cidr
  aws_availability_zones = var.aws_availability_zones
  public_subnet_cidrs    = var.public_subnet_cidrs
  private_subnet_cidrs   = var.private_subnet_cidrs
}

# --- Security groups ---
module "security" {
  source       = "../../modules/security"
  vpc_id       = module.network.vpc_id
  project_name = local.name_prefix
}

# --- ALB (single: path /api/* -> backend:8080, default -> frontend:80) ---
module "alb" {
  source            = "../../modules/alb"
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  project_name      = local.name_prefix
}

# --- ECR: backend + frontend ---
module "ecr" {
  source          = "../../modules/ecr"
  project_name    = local.name_prefix
  repository_name = local.ecr_backend_repo_name
}

module "ecr_frontend" {
  source          = "../../modules/ecr"
  project_name    = local.name_prefix
  repository_name = local.ecr_frontend_repo_name
}

# --- EC2: Postgres + Backend + Frontend (one instance, one ALB) ---
module "ec2_app" {
  source                    = "../../modules/ec2_app"
  project_name              = local.name_prefix
  vpc_id                    = module.network.vpc_id
  private_subnet_ids        = module.network.private_subnet_ids
  app_sg_id                 = module.security.backend_sg_id
  backend_target_group_arn  = module.alb.backend_target_group_arn
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  ecr_backend_repo          = module.ecr.repository_url
  ecr_frontend_repo         = module.ecr_frontend.repository_url
  backend_image_tag         = var.backend_image_tag
  frontend_image_tag        = var.frontend_image_tag
  db_name                   = var.db_name
  db_username               = var.db_username
  db_password               = var.db_password
  jwt_secret                = var.jwt_secret
  aws_region                = var.aws_region
  instance_type             = var.instance_type
}

# --- SNS (notifications / alerts) ---
module "sns" {
  source       = "../../modules/sns"
  project_name = local.name_prefix
  alert_email  = var.alert_email
}
