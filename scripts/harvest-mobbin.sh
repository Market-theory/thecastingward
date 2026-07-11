#!/usr/bin/env bash
# Runs on a GitHub Actions runner (open internet). Fetches Mobbin's public
# (logged-out, server-rendered) pages, extracts cdn.mobbin.com screenshot
# URLs, and downloads a capped set into docs/design-refs/raw/ so the design
# session can view them. The build container itself cannot reach mobbin.com.
set -uo pipefail

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
OUT="docs/design-refs/raw"
MAX_PER_PAGE=8
mkdir -p "$OUT"

pages_file=$(mktemp)
# Seed pages: the iOS discover feed, plus any app pages it links to.
echo "https://mobbin.com/discover/apps/ios/latest" > "$pages_file"
curl -sL -A "$UA" "https://mobbin.com/discover/apps/ios/latest" -o /tmp/discover.html
grep -oE 'href="/apps/[a-zA-Z0-9_-]+' /tmp/discover.html \
  | sed 's|href="|https://mobbin.com|' | sort -u | head -10 >> "$pages_file"

echo "Pages to harvest:"
cat "$pages_file"

total=0
while read -r page; do
  echo "== $page"
  curl -sL -A "$UA" "$page" -o /tmp/page.html || continue
  grep -oE 'https://cdn\.mobbin\.com/[A-Za-z0-9/._%-]+\.(png|jpg|jpeg|webp)' /tmp/page.html \
    | sort -u | head -"$MAX_PER_PAGE" | while read -r img; do
      name=$(basename "$img" | cut -c1-120)
      [ -f "$OUT/$name" ] && continue
      curl -sL -A "$UA" "$img" -o "$OUT/$name" && echo "  + $name" || rm -f "$OUT/$name"
    done
  total=$((total + 1))
done < "$pages_file"

echo "Harvested files:"
ls -la "$OUT" | head -60
