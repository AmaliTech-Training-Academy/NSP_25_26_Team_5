output "environment" {
  value       = var.environment
  description = "Environment name"
}

output "vpc_id" {
  value       = module.network.vpc_id
  description = "VPC ID"
}

output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "ALB DNS name (app URL: http://<this>)"
}

output "alb_zone_id" {
  value       = module.alb.alb_zone_id
  description = "ALB Route53 zone ID for alias records"
}

output "ec2_instance_id" {
  value       = module.ec2_app.instance_id
  description = "EC2 app instance ID"
}

output "ecr_backend_url" {
  value       = module.ecr.repository_url
  description = "ECR backend repository URL (no tag)"
}

output "ecr_frontend_url" {
  value       = module.ecr_frontend.repository_url
  description = "ECR frontend repository URL (no tag)"
}

output "sns_topic_arn" {
  value       = module.sns.topic_arn
  description = "SNS topic ARN for alarms or notifications"
}
