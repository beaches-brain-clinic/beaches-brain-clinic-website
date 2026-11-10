#!/bin/sh
# Cloudflare build: copy ONLY the public site into dist/.
# An allow-list, so internal files (CLAUDE.md, README.md, editor configs, any new
# notes) are never published. Add a path here when you add a page or top-level file.
# Cloudflare Workers Builds: build command `sh scripts/build.sh`; wrangler.jsonc serves dist/.
set -eu
rm -rf dist
mkdir -p dist
cp index.html about.html adult-assessment.html child-assessment.html \
   referrals.html privacy.html 404.html \
   _headers _redirects robots.txt sitemap.xml site.webmanifest \
   dist/
cp -R assets dist/assets
echo "Built dist/:"; find dist -type f | sort
