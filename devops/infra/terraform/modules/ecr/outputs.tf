output "repository_url" {
  value       = aws_ecr_repository.main.repository_url
  description = "ECR repository URL (without tag), e.g. 123456789012.dkr.ecr.eu-north-1.amazonaws.com/community-board-backend"
}
output "repository_name" {
  value       = aws_ecr_repository.main.name
  description = "ECR repository name"
}