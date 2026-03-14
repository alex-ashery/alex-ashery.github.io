#!/usr/bin/env bash
set -euo pipefail

export CLOUDFLARE_API_TOKEN="$(sops --decrypt --extract '["cloudflare_api_token"]' secrets/cloudflare.sops.yaml)"
export AWS_ACCESS_KEY_ID="$(sops --decrypt --extract '["tofu_state_r2_access_key_id"]' secrets/cloudflare.sops.yaml)"
export AWS_SECRET_ACCESS_KEY="$(sops --decrypt --extract '["tofu_state_r2_secret_access_key"]' secrets/cloudflare.sops.yaml)"

exec "$@"
