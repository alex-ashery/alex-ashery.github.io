# Cloudflare Infrastructure

This repo manages Cloudflare infrastructure with OpenTofu under [`infra/cloudflare`](./).

## Layout

- `site`: Manages the website DNS records plus the public R2 bucket and custom domain at `site.alexashery.com`.

The remote state bucket is intentionally managed outside this repo and remains separate from the public asset bucket:

- The state bucket has no custom domain.
- The state bucket is not publicly readable.
- The site stack stores state under a namespaced key so the same bucket can be reused later for other Cloudflare projects.

Current key layout:

```text
cloudflare/personal-site/site.tfstate
```

Future stacks can reuse the same bucket with keys such as:

```text
cloudflare/resume-site/site.tfstate
cloudflare/shared/dns.tfstate
```

## Secrets

Secrets are stored with `sops` using the repo-level [`.sops.yaml`](/Users/aashery/Development/alex-ashery/personal-site/.sops.yaml) age recipient.

Create the encrypted secret file from the example:

```bash
cp secrets/infra.sops.yaml.example secrets/infra.sops.yaml
sops secrets/infra.sops.yaml
```

Populate these keys:

- `cloudflare.api_token`
- `tofu_state.r2_access_key_id`
- `tofu_state.r2_secret_access_key`

The dev shell provides `sops`, `age`, and `tofu`.

The `just infra-*` commands decrypt and export the required environment variables automatically from `secrets/infra.sops.yaml`.

If you want to run `tofu` directly instead of using `just`, export:

```bash
export CLOUDFLARE_API_TOKEN="$(sops --decrypt --extract '["cloudflare"]["api_token"]' secrets/infra.sops.yaml)"
export AWS_ACCESS_KEY_ID="$(sops --decrypt --extract '["tofu_state"]["r2_access_key_id"]' secrets/infra.sops.yaml)"
export AWS_SECRET_ACCESS_KEY="$(sops --decrypt --extract '["tofu_state"]["r2_secret_access_key"]' secrets/infra.sops.yaml)"
```

OpenTofu reads:

- `CLOUDFLARE_API_TOKEN` for the Cloudflare provider
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for the R2-backed `s3` remote state backend

## Site Stack

1. Enter the dev shell with `direnv allow` or `nix develop`.
2. Create `secrets/infra.sops.yaml` from [`secrets/infra.sops.yaml.example`](/Users/aashery/Development/alex-ashery/personal-site/secrets/infra.sops.yaml.example).
3. Provision a private shared R2 bucket for OpenTofu state outside this repo.
4. Review [`backend.hcl`](/Users/aashery/Development/alex-ashery/personal-site/infra/cloudflare/backend.hcl) and confirm the bucket name, key path, and R2 endpoint.
5. Copy [`terraform.tfvars.example`](/Users/aashery/Development/alex-ashery/personal-site/infra/cloudflare/terraform.tfvars.example) to `infra/cloudflare/terraform.tfvars`.
6. Fill in the Cloudflare account and zone IDs.
7. Run `just infra-init`.
8. Import existing DNS records before the first apply with `just infra-import 'cloudflare_dns_record.managed["apex_1"]' '<zone_id>/<dns_record_id>'`.
9. Run `just infra-plan`.
10. Run `just infra-apply`.

The `just infra-*` commands load the Cloudflare API token and R2 backend credentials from `secrets/infra.sops.yaml` automatically.

The site stack configures:

- Default GitHub Pages DNS records for the apex and `www`
- A dedicated R2 asset bucket
- Public access for that bucket only through `site.alexashery.com`
- The R2 managed domain disabled, so the bucket is not exposed on an `r2.dev` hostname

The `site` stack includes built-in defaults for GitHub Pages:

- Four apex `A` records for GitHub Pages
- One `www` `CNAME` derived from `github_pages_origin`

Add anything else through `additional_dns_records`.

## Import-first rollout

The default GitHub Pages records are already modeled. Set `github_pages_origin` if your Pages origin differs from the default, then add any non-pages records in `additional_dns_records`. Import each live record into the matching resource instance before the first apply.

Example import shape:

```bash
just infra-import 'cloudflare_dns_record.managed["apex_1"]' '<zone_id>/<dns_record_id>'
```

Example additional-record import:

```bash
just infra-import 'cloudflare_dns_record.managed["mail"]' '<zone_id>/<dns_record_id>'
```

You can obtain record IDs from the Cloudflare dashboard or with Cloudflare's import tooling.
