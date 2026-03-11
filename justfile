js-build:
	cd site && npm run build:js

serve:
	cd site && npm run build:js
	hugo server --source site

build:
	cd site && npm run build:js
	hugo --source site
