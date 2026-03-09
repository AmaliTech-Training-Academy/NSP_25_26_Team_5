# --- Networking ---
module "network" {
  source                 = "./modules/network"
  project_name           = var.project_name
  vpc_cidr               = var.vpc_cidr
  aws_availability_zones = var.aws_availability_zones
  public_subnet_cidrs    = var.public_subnet_cidrs
  private_subnet_cidrs   = var.private_subnet_cidrs
}

# --- Security groups (ALB -> backend -> RDS) ---
module "security" {
  source       = "./modules/security"
  vpc_id       = module.network.vpc_id
  project_name = var.project_name
}

# --- Application Load Balancer (public) ---
module "alb" {
  source            = "./modules/alb"
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  project_name      = var.project_name
}

# --- RDS (private) ---
module "rds" {
  source             = "./modules/rds"
  project_name       = var.project_name
  db_username        = var.db_username
  db_password        = var.db_password
  db_name            = var.db_name
  private_subnet_ids = module.network.private_subnet_ids
  rds_sg_id          = module.security.rds_sg_id
}

module "ecr" {
  source          = "./modules/ecr"
  project_name    = var.project_name
  repository_name = var.ecr_repository_name
}

# --- ECS backend (private, behind ALB) ---
module "ecs" {
  source             = "./modules/ecs"
  project_name       = var.project_name
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  backend_sg_id      = module.security.backend_sg_id
  target_group_arn   = module.alb.backend_target_group_arn
  backend_image      = var.backend_image != null ? var.backend_image : "${module.ecr.repository_url}:${var.backend_image_tag}"
  db_host            = module.rds.db_endpoint_address
  db_port            = module.rds.db_endpoint_port
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
  jwt_secret         = var.jwt_secret
}


# --- Amplify frontend ---
module "amplify" {
  source       = "./modules/amplify"
  project_name = var.project_name
  repo_url     = var.repo_url
  api_url      = "http://${module.alb.alb_dns_name}"
  github_token = var.github_token
}
