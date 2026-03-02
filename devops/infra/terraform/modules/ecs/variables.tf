variable "project_name" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "private_subnet_ids" {
  type = list(string)
}
variable "backend_sg_id" {
  type = string
}
variable "target_group_arn" {
  type = string
}
variable "backend_image" {
  type = string
}
variable "db_host" {
  type = string
}
variable "db_port" {
  type = string
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

# Optional: append to JDBC URL for RDS (e.g. "?sslmode=disable" for same-VPC, or "?sslmode=require" if RDS enforces SSL)
variable "db_connection_params" {
  type        = string
  default     = ""
  description = "Query string for JDBC URL (e.g. ?sslmode=disable). Leave empty for default."
}
