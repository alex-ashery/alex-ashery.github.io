#!/usr/bin/env bash
set -euo pipefail

export GITHUB_TOKEN="$(sops --decrypt --extract '["github"]["token"]' secrets/infra.sops.yaml)"
export AWS_ACCESS_KEY_ID="$(sops --decrypt --extract '["tofu_state"]["r2_access_key_id"]' secrets/infra.sops.yaml)"
export AWS_SECRET_ACCESS_KEY="$(sops --decrypt --extract '["tofu_state"]["r2_secret_access_key"]' secrets/infra.sops.yaml)"

exec "$@"
