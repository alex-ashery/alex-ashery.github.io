hugo-js-build:
	cd site && npm run build:js

hugo-serve:
	cd site && npm run build:js
	hugo server --source site

hugo-build:
	cd site && npm run build:js
	hugo --source site
