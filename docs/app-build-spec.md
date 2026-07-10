# The Casting Ward — Dashboard App Build Spec (v1, for approval)

**What this is:** the build sheet for the custom casting-director dashboard — the branded, fast, phone-friendly front end over the Airtable base. Airtable stays the database and ops layer (imports, automations, intake form); the app is where Natasha *searches*. Decision made 2026-07-10: **live Airtable API** data layer (no static exports).

**Design:** per the approved **`casting-ward-design`** artifact (garnet/brass, iOS-style). ⚠️ The artifact isn't readable from this environment (403) — before the UI build starts, paste the mockup HTML/screenshots into the session so the build matches it exactly, not from memory.

---

## 1. Ground rules (inherited from plan.md)

- Solo non-technical operator: **nothing to maintain**. No servers, no databases to run — one Vercel project that redeploys on git push.
- Airtable remains the single source of truth. The app never becomes a second database.
- Personal data stays out of git: no talent data in the repo or build; the app reads it at runtime with a server-held token.

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (app router) + Tailwind | One codebase for UI + server API routes; Vercel-native; I can build all of it |
| Hosting | **Vercel** (Hobby free to start; Pro $20/mo only if usage demands) | Zero-ops, auto-deploy from `main` of this repo |
| Data | **Airtable REST API**, server-side only | Live data, no export step. Token never reaches the browser |
| Auth | **Shared-password gate** (middleware + HTTP-only cookie, password in env var) | 2 users (Natasha + Lechon). No accounts system to run. Upgradeable later |
| Repo layout | `app/` directory in this repo; Vercel "root directory" = `app/` | Keeps crawlers/docs/scripts alongside |

## 3. Data layer design (the important part)

Airtable's API allows ~5 requests/sec and pages 100 records at a time — a naive "search 20,786 records" would take ~210 requests. So:

1. **Server-side roster cache.** A route handler pulls the full Talent table (~210 paged requests, ~60–90s) into a cached in-memory index, revalidated in the background every 15 minutes and on demand via a "Refresh data" button. Search/filter queries hit this index — results are instant (<50ms), no Airtable round-trip per keystroke.
2. **Record detail fetches live** by record ID (1 request) so the profile view is always current.
3. **Fields cached:** exactly the Talent Search interface card set (name, headshot URL, union, height + inches, weight, skills, vocal range, rep + detail, submitted/shortlist for, engagement, submission notes, BE appearances, AA URL, BE Resume ID, data confidence, lane, assessed tier). Headshots render from the public S3 `Headshot URL` field — no attachment-URL expiry issues, no image proxying needed.
4. **Write-back (in v1):** two PATCH endpoints — set **Assessed Tier** and **Data Confidence** from the record detail view. That makes the app Natasha's verification loop, not just a viewer. Everything else stays edit-in-Airtable.

**Needs from you (Lechon), 5 min:** create an Airtable **personal access token** (airtable.com/create/tokens) scoped to `data.records:read` + `data.records:write` on this one base; add it as `AIRTABLE_TOKEN` in Vercel env vars along with `APP_PASSWORD`.

## 4. Screens (v1)

Matching the approved mockup's direction; exact visual spec locked once the artifact is shared into the build session.

1. **Search** (home) — search-as-you-type on name/skills; filter row: Union, Height range slider (inches), Skills contains, Agency, Submitted For (role/breakdown), Assessed Tier, Data Confidence, Lane; responsive headshot card grid (name, union badge, height); count of matches; saveable filter presets (localStorage v1).
2. **Talent profile** — full-bleed headshot, all operational fields, links out (Actors Access, IMDb when present), submission history, and the two write-back controls (Assessed Tier, Data Confidence) as one-tap segmented controls.
3. **Stats strip** (on home, not a separate page) — total roster, filter-matched count, intake pipeline counts once the form is live. (The Airtable interface Dashboard page remains the deeper ops view.)

Explicitly **not** in v1: multi-user accounts, editing arbitrary fields, the funnel/marketing site (separate workstream D), producers/investors views beyond the Lane filter.

## 5. Build sequence

| Step | What | Gate |
|---|---|---|
| 1 | Mockup shared into session → visual spec extracted | you paste artifact/screenshots |
| 2 | Scaffold Next.js app in `app/`, password gate, Airtable client + cache | — |
| 3 | Search screen with live data | deployed preview link for feedback |
| 4 | Profile view + write-back | test on 3 real records |
| 5 | Design polish pass against mockup, mobile QA | Natasha walkthrough |
| 6 | Production deploy + hand-off doc | — |

Estimate: steps 2–4 are one working session; 5–6 a second.

## 6. Costs

| Item | Cost |
|---|---|
| Vercel Hobby | $0 (Pro $20/mo only if we hit limits) |
| Airtable API | included in existing Team plan |
| Domain (optional, e.g. app.thecastingward.com) | ~$12/yr if wanted; a `*.vercel.app` URL works day one |

## 7. Open questions (answer before step 2)

1. **Whose Vercel account?** (Recommend: a Casting Ward account Natasha owns, Lechon operates.)
2. **Write-back in v1 confirmed?** (Spec says yes — Assessed Tier + Data Confidence only.)
3. **Repo layout OK?** App lives in `app/` of `thecastingward` and deploys from `main` once merged.
4. **Mockup hand-off** — paste the `casting-ward-design` artifact contents (or screenshots) into the build session.
