bucket                      = "tfstate"
key                         = "cloudflare/personal-site/site.tfstate"
region                      = "auto"
use_lockfile                = true
use_path_style              = true
skip_credentials_validation = true
skip_metadata_api_check     = true
skip_region_validation      = true
skip_requesting_account_id  = true
skip_s3_checksum            = true

endpoints = { s3 = "https://42543bef9cdb648f8a7547015a04e4f9.r2.cloudflarestorage.com" }
