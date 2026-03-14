locals {
  default_dns_records = {
    apex_1 = {
      name    = "@"
      type    = "A"
      content = "185.199.108.153"
      ttl     = 1
      proxied = false
    }

    apex_2 = {
      name    = "@"
      type    = "A"
      content = "185.199.109.153"
      ttl     = 1
      proxied = false
    }

    apex_3 = {
      name    = "@"
      type    = "A"
      content = "185.199.110.153"
      ttl     = 1
      proxied = false
    }

    apex_4 = {
      name    = "@"
      type    = "A"
      content = "185.199.111.153"
      ttl     = 1
      proxied = false
    }

    www = {
      name    = "www"
      type    = "CNAME"
      content = var.github_pages_origin
      ttl     = 1
      proxied = false
    }

    mx_1 = {
      name     = "@"
      type     = "MX"
      content  = "eforward1.registrar-servers.com"
      ttl      = 1
      proxied  = false
      priority = 10
    }

    mx_2 = {
      name     = "@"
      type     = "MX"
      content  = "eforward2.registrar-servers.com"
      ttl      = 1
      proxied  = false
      priority = 10
    }

    mx_3 = {
      name     = "@"
      type     = "MX"
      content  = "eforward3.registrar-servers.com"
      ttl      = 1
      proxied  = false
      priority = 10
    }

    mx_4 = {
      name     = "@"
      type     = "MX"
      content  = "eforward4.registrar-servers.com"
      ttl      = 1
      proxied  = false
      priority = 15
    }

    mx_5 = {
      name     = "@"
      type     = "MX"
      content  = "eforward5.registrar-servers.com"
      ttl      = 1
      proxied  = false
      priority = 20
    }

    spf = {
      name    = "@"
      type    = "TXT"
      content = "\"v=spf1 include:spf.efwd.registrar-servers.com ~all\""
      ttl     = 1
      proxied = false
    }
  }

  dns_records = merge(local.default_dns_records, var.additional_dns_records)
}

resource "cloudflare_dns_record" "managed" {
  for_each = local.dns_records

  zone_id  = var.zone_id
  name     = each.value.name
  type     = each.value.type
  content  = each.value.content
  ttl      = try(each.value.ttl, 1)
  proxied  = try(each.value.proxied, false)
  comment  = try(each.value.comment, null)
  priority = try(each.value.priority, null)
}

resource "cloudflare_r2_bucket" "static_assets" {
  account_id = var.account_id
  name       = var.asset_bucket_name
  location   = var.asset_bucket_location
}

resource "cloudflare_r2_managed_domain" "static_assets" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.static_assets.name
  enabled     = false
}

resource "cloudflare_r2_custom_domain" "static_assets" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.static_assets.name
  domain      = var.asset_bucket_custom_domain
  enabled     = true
  min_tls     = var.asset_bucket_min_tls
  zone_id     = var.zone_id
}
