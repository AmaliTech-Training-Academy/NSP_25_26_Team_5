variable "project_name" {
  type        = string
  description = "Project name for resource naming"
}
variable "repo_url" {
  type        = string
  description = "GitHub repo URL (e.g. https://github.com/org/repo)"
}
variable "api_url" {
  type        = string
  description = "Backend API URL for frontend env (e.g. http://alb-dns-name)"
}
variable "github_token" {
  type        = string
  default     = ""
  sensitive   = true
  description = "GitHub token for Amplify (optional for public repos)"
}
