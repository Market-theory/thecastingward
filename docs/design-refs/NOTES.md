# Design reference notes — Mobbin harvest (2026-07-11)

Harvested autonomously via `.github/workflows/design-refs.yml` (Playwright on an
Actions runner, logged-in via `MOBBIN_COOKIE` secret). Screenshots in `raw/`;
full logged-in link inventory in `links.json` (Mobbin search URL scheme:
`/search/apps/ios?content_type=screens|flows|ui-elements&filter=…`).

## What each sheet shows

- `_page-discover-*.png` — logged-in iOS discover feed. Key refs: **Depop**
  photo search grid (dense 2-col photo cards, metadata under photo), **Etsy**
  product detail (inset sections), Instacart home.
- `_page-filter-sort-*.png` — the "Filter & Sort" screen pattern (3,124
  screens). Key refs: **Depop filter** (chip groups w/ check-in-chip selected
  state, Clear all top-right, full-width black Apply), **Zocdoc** (checkbox
  groups + live-count CTA "Show 491 results"), **Etsy sort sheet** (radio list
  + checkmark), **Mindvalley** (option counts beside each choice).
- `_page-filtering-sorting-*.png` — full filter flows. Key refs: **Instacart
  results header** (chip row under search: `⇅ Sort` + per-filter chips showing
  active count e.g. "Brands (3)"; sheet with Reset + "Show results" CTA),
  **Mindvalley** "757 RESULTS" count line, **Cosmos** labeled-row filter panel
  (Reset/Apply footer).
- `_page-bottom-sheet-*.png` — bottom-sheet element treatments (rounded-top
  sheet, drag affordance, footer CTA).

## Patterns adopted for the app (v2 search UX)

1. Results header: search bar → chip row: `⇅ Sort` chip + `Filters (n)` chip +
   removable active-filter chips. (Instacart)
2. Filter sheet: bottom sheet on mobile / centered dialog on desktop; sections
   as chip groups (Union, Tier, Confidence, Lane) + height min/max + skill &
   agency text inputs; **Clear all** in header; sticky garnet **Apply** button
   with live count "Show N actors". (Depop + Zocdoc)
3. Sort sheet: radio list with checkmark — Name, Height ↑/↓, BE appearances.
   (Etsy/UNIQLO)
4. Count line above grid: "N ACTORS". (Mindvalley)
5. Cards: photo-first with gradient name overlay — validated by Depop's grid.
