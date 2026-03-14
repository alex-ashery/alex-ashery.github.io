variable "account_id" {
  description = "Cloudflare account ID that owns the R2 buckets."
  type        = string
  default     = "42543bef9cdb648f8a7547015a04e4f9"
}

variable "zone_id" {
  description = "Cloudflare zone ID for alexashery.com."
  type        = string
  default     = "7a3191a90dc847d88751c14664d3b8ab"
}

variable "asset_bucket_name" {
  description = "R2 bucket name for public site assets."
  type        = string
  default     = "alexasherydotcom"
}

variable "asset_bucket_location" {
  description = "R2 bucket location hint for the public asset bucket."
  type        = string
  default     = "enam"
}

variable "asset_bucket_custom_domain" {
  description = "Custom domain that exposes the public asset bucket."
  type        = string
  default     = "site.alexashery.com"
}

variable "asset_bucket_min_tls" {
  description = "Minimum TLS version for the asset bucket custom domain."
  type        = string
  default     = "1.2"
}

variable "github_pages_origin" {
  description = "GitHub Pages origin hostname for the www CNAME record."
  type        = string
  default     = "alex-ashery.github.io"
}

variable "additional_dns_records" {
  description = "Additional DNS records to manage on top of the default GitHub Pages records."
  type = map(object({
    name    = string
    type    = string
    content = string
    priority = optional(number)
    ttl     = optional(number, 1)
    proxied = optional(bool, false)
    comment = optional(string)
  }))
  default = {}
}
