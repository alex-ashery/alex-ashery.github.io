set shell := ["bash", "-euo", "pipefail", "-c"]

js-build:
	cd site && npm run build:js

serve:
	cd site && npm run build:js
	hugo server --source site

build:
	cd site && npm run build:js
	hugo --source site

cloudflare-fmt:
	tofu -chdir=infra/cloudflare fmt -recursive

cf-init backend="backend.hcl":
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare init -reconfigure -backend-config={{backend}}

cf-plan:
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare plan

cf-apply:
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare apply

cf-import address id:
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare import '{{address}}' '{{id}}'

gh-fmt:
	tofu -chdir=infra/github fmt -recursive

gh-init backend="backend.hcl":
	./scripts/with-github-env.sh tofu -chdir=infra/github init -reconfigure -backend-config={{backend}}

gh-plan:
	./scripts/with-github-env.sh tofu -chdir=infra/github plan

gh-apply:
	./scripts/with-github-env.sh tofu -chdir=infra/github apply

gh-import address id:
	./scripts/with-github-env.sh tofu -chdir=infra/github import '{{address}}' '{{id}}'
