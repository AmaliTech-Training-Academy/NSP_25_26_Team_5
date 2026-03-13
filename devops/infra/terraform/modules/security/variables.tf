variable "project_name" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "allowed_ssh_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR allowed to SSH to app instance (e.g. 0.0.0.0/0 for GitHub Actions)"
}
