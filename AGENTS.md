# AGENTS.md

## Scope

These notes apply to the entire repository at `/Users/aashery/Development/alex-ashery/personal-site`.

## Repo Layout

- `site/`: Hugo site source, including custom layouts, JS, SCSS, and the `coder` theme submodule.
- `infra/cloudflare/`: Cloudflare DNS and R2 infrastructure managed with OpenTofu.
- `infra/github/`: GitHub infrastructure managed with OpenTofu.
- `scripts/`: small wrapper scripts for loading secrets into infra commands.
- `justfile`: primary task entrypoint for local build and infra workflows.

## Local Workflow

- Preferred dev environment: `direnv allow` or `nix develop`.
- JS build: `just js-build`
- Local Hugo server: `just serve`
- Production site build: `just build`

The Hugo site lives under `site/`, so use `hugo --source site` semantics when invoking Hugo directly.

## Resume Architecture

This is the main non-obvious part of the repo.

- The resume page route is backed by `site/content/resume.md` with layout `resume`.
- The template is `site/layouts/_default/resume.html`.
- The template passes `site.params.jsonResumeUrl` into the page as `data-endpoint`.
- Current endpoint is configured in `site/hugo.yaml`.
- Resume data is fetched client-side by `site/assets/js/resume/index.js`.
- The bundled artifact checked into the repo is `site/static/js/resume.bundle.js`.
- The resume fetch is runtime browser behavior, not Hugo build-time behavior.
- Hugo is not currently ingesting, transforming, or caching the resume content from the separate resume repo.
- The current configured source is `raw.githubusercontent.com`, not `api.github.com`.
- The frontend uses `fetch(endpoint, { cache: "no-store" })`, so visits to `/resume/` can trigger a fresh fetch of the resume document.

## Caching Notes

- `site/hugo.yaml` contains Hugo cache configuration for Hugo-managed resources.
- That cache configuration does not control the resume page's client-side fetch.
- If the goal is to reduce runtime requests for the resume content, move resume retrieval into the build pipeline or serve a local generated artifact.

## Frontend Editing Notes

- Resume-specific source files live under `site/assets/js/resume/` and `site/assets/scss/resume.scss`.
- After editing resume JS, rebuild the browser bundle with `just js-build`.
- `site/static/js/resume.bundle.js` is generated output; keep it in sync with source changes if source JS is changed.
- The site theme is mostly vendored via `site/themes/coder/`; prefer changes in `site/layouts/`, `site/assets/`, or Hugo config before modifying the theme directly unless the change truly belongs in the theme.

## Infra Boundaries

- Cloudflare files describe DNS and R2 resources. They do not affect the resume page fetch path unless you explicitly change hosting/proxying strategy.
- GitHub infra files are for repository/platform configuration and are unrelated to normal Hugo rendering questions.

## Practical Heuristics

- For questions about page behavior, check `site/layouts/`, `site/assets/`, and `site/hugo.yaml` first.
- For questions about "does Hugo cache/fetch X", verify whether the fetch is in Hugo templates or in browser JS before reasoning about Hugo caches.
- Prefer `rg` for discovery because the repo includes a vendored theme subtree.
