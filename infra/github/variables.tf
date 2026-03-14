variable "github_owner" {
  description = "GitHub owner for the repository."
  type        = string
  default     = "alex-ashery"
}

variable "github_repository" {
  description = "GitHub repository name."
  type        = string
  default     = "alex-ashery.github.io"
}

variable "pages_cname" {
  description = "Custom domain configured for GitHub Pages."
  type        = string
  default     = "www.alexashery.com"
}

variable "pages_build_type" {
  description = "GitHub Pages build type."
  type        = string
  default     = "workflow"
}
