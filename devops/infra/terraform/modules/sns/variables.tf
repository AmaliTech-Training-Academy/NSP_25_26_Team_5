variable "project_name" {
  type = string
}

variable "alert_email" {
  type        = string
  default     = ""
  description = "Email for SNS notifications (alerts). Leave empty to skip subscription."
}

variable "kms_key_id" {
  type        = string
  default     = null
  description = "Optional KMS key ID for SNS topic encryption"
}
