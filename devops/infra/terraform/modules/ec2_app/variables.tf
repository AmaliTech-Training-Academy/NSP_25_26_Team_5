variable "project_name" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets; first one used for the app instance"
}
variable "app_sg_id" {
  type = string
}
variable "backend_target_group_arn" {
  type = string
}
variable "frontend_target_group_arn" {
  type = string
}
variable "ecr_backend_repo" {
  type        = string
  description = "Full ECR repo URL for backend (without tag), e.g. 123456789012.dkr.ecr.region.amazonaws.com/repo-name"
}
variable "ecr_frontend_repo" {
  type        = string
  description = "Full ECR repo URL for frontend (without tag)"
}
variable "backend_image_tag" {
  type    = string
  default = "latest"
}
variable "frontend_image_tag" {
  type    = string
  default = "latest"
}
variable "db_name" {
  type = string
}
variable "db_username" {
  type = string
}
variable "db_password" {
  type      = string
  sensitive = true
}
variable "jwt_secret" {
  type      = string
  sensitive = true
}
variable "aws_region" {
  type = string
}
variable "instance_type" {
  type    = string
  default = "t3.small"
}
