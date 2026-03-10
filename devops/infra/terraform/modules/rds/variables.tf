variable "project_name" {
  type = string
}
variable "db_username" {
  type = string
}
variable "db_password" {
  type      = string
  sensitive = true
}
variable "db_name" {
  type    = string
  default = "communityboard"
}
variable "db_instance_class" {
  type        = string
  description = "RDS instance class (e.g. db.t3.micro, db.t3.small)"
  default     = "db.t3.micro"
}
variable "private_subnet_ids" {
  type = list(string)
}
variable "rds_sg_id" {
  type = string
}
