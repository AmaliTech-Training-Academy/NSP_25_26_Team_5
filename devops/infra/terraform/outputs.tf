output "vpc_id" {
  value       = module.network.vpc_id
  description = "VPC ID"
}

output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "ALB DNS name (use for API URL or CORS)"
}

output "alb_zone_id" {
  value       = module.alb.alb_zone_id
  description = "ALB Route53 zone ID for alias records"
}

output "rds_endpoint" {
  value       = module.rds.db_endpoint_address
  sensitive   = true
  description = "RDS instance endpoint address"
}

output "ecs_cluster_name" {
  value       = module.ecs.cluster_name
  description = "ECS cluster name"
}

output "ecs_service_name" {
  value       = module.ecs.service_name
  description = "ECS backend service name"
}

output "ecr_repository_url" {
  value       = module.ecr.repository_url
  description = "ECR repository URL (no tag). Use with :latest or :<sha> for full image URI."
}
output "backend_image_url" {
  value       = "${module.ecr.repository_url}:${var.backend_image_tag}"
  description = "Full backend image URI used by ECS (repo_url:tag)."
}
