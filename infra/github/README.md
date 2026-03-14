# GitHub Infrastructure

This stack manages GitHub-side repository configuration for the site.

## Scope

- GitHub Pages configuration for the `alex-ashery/personal-site` repository
- Pages build type
- Pages custom domain

## Secrets

Create or update `secrets/infra.sops.yaml` and populate:

- `github.token`

The `just github-*` commands decrypt `github.token` from `secrets/infra.sops.yaml` and export it as `GITHUB_TOKEN` automatically.

## Backend

This stack uses the same private R2 remote state bucket pattern as the Cloudflare stack, but with a different key:

```text
github/personal-site/site.tfstate
```

Review [`backend.hcl`](/Users/aashery/Development/alex-ashery/personal-site/infra/github/backend.hcl) before the first `init`.

## Workflow

1. Create or update [`secrets/infra.sops.yaml`](/Users/aashery/Development/alex-ashery/personal-site/secrets/infra.sops.yaml).
2. Review [`backend.hcl`](/Users/aashery/Development/alex-ashery/personal-site/infra/github/backend.hcl).
3. Run `just github-init`.
4. Import the existing repository if it already exists.
5. Run `just github-plan`.
6. Run `just github-apply`.

## Import

GitHub Pages is managed through the repository resource, so import the repository itself:

```bash
just github-import github_repository.site personal-site
```

## Notes

- This repo uses GitHub Pages with `GitHub Actions` as the source, so the stack is configured with `build_type = "workflow"`.
- The stack does not set a Pages `source` block, because this repository uses the Actions-based Pages flow rather than branch-based publishing.
- The current GitHub provider schema does not expose Pages HTTPS enforcement here, so that setting remains unmanaged.
- Because Pages is configured through `github_repository`, this stack may surface unrelated repository drift after import if the repo has settings that are not yet represented in Terraform.
