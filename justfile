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

infra-init backend="backend.hcl":
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare init -reconfigure -backend-config={{backend}}

infra-plan:
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare plan

infra-apply:
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare apply

infra-import address id:
	./scripts/with-cloudflare-env.sh tofu -chdir=infra/cloudflare import '{{address}}' '{{id}}'
