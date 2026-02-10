#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
# index-search.sh  –  Build the Pagefind search index
#
# Run this BEFORE deploying to GitHub Pages so the /pagefind
# directory is included in the published site.
#
# Usage:
#   chmod +x index-search.sh   # first time only
#   ./index-search.sh
# ───────────────────────────────────────────────────────────

set -euo pipefail

SITE_DIR="."          # repo root is the site output folder
OUTPUT_DIR="pagefind" # index written to ./pagefind/

echo "🔎 Building Pagefind search index..."
echo "   Site directory : $SITE_DIR"
echo "   Output folder  : $SITE_DIR/$OUTPUT_DIR"
echo ""

npx pagefind --site "$SITE_DIR" --output-subdir "$OUTPUT_DIR" \
  --glob "**/*.html" \
  --exclude-selectors ".auth-container, .admin-container, #login-section"

echo ""
echo "✅ Search index built successfully in ./$OUTPUT_DIR/"
echo "   Commit the pagefind/ folder and deploy to GitHub Pages."
