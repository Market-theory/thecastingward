# The Casting Ward — dashboard app

Internal talent-search app over the Airtable base (`appwOxqLtl8mJYFv3`). Next.js 15, deployed on Vercel. See `docs/app-build-spec.md` for the full spec.

## Deploy (Lechon, ~10 min, once)

1. **Vercel** → New Project → import `market-theory/thecastingward` → set **Root Directory = `app`** → Framework: Next.js (auto) → Deploy.
2. **Airtable token:** airtable.com/create/tokens → scopes `data.records:read` + `data.records:write` → access: only The Casting Ward base → copy token.
3. **Vercel → Project → Settings → Environment Variables:**
   - `AIRTABLE_TOKEN` = the token
   - `APP_PASSWORD` = the shared password for Natasha + you
4. Redeploy. Done — send Natasha the URL + password.

Without `AIRTABLE_TOKEN` the app serves labeled **demo data** (safe for previews). Without `APP_PASSWORD` the login gate is off (never leave it unset in production).

## How data flows

- The server pulls the full Talent + Representation + Roles tables into an in-memory cache (~1 min under Airtable's rate limit), refreshed in the background every 15 min or via the **Refresh** button. Search and filters run instantly against that cache in the browser.
- Opening a profile fetches that record live from Airtable.
- The two assessment controls (Assessed Tier, Data Confidence) write straight back to Airtable.
- First page-load after a fresh deploy takes up to a minute while the cache warms — after that it's instant.

## Local dev

```bash
cd app && npm install && npm run dev   # demo data
AIRTABLE_TOKEN=pat… npm run dev        # live data
```
