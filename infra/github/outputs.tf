output "repository_name" {
  description = "GitHub repository managed by this stack."
  value       = github_repository.site.name
}

output "pages_cname" {
  description = "Configured GitHub Pages custom domain."
  value       = var.pages_cname
}
