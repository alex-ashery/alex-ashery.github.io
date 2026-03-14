output "asset_bucket_name" {
  description = "R2 bucket name for public static site assets."
  value       = cloudflare_r2_bucket.static_assets.name
}

output "asset_bucket_custom_domain" {
  description = "Public hostname for the site asset bucket."
  value       = cloudflare_r2_custom_domain.static_assets.domain
}

output "managed_dns_record_ids" {
  description = "Managed DNS record IDs keyed by logical name."
  value       = { for key, record in cloudflare_dns_record.managed : key => record.id }
}
