# The Casting Ward — Build Plan

**Status:** v1.0 · Companion to `system-design.md` (the *what*); this is the *how and when*.

---

## North star

Natasha goes from memory-and-inbox to a system: **one searchable Airtable catalog** fed by three doors — her Gmail history, her Breakdown Express history, and (going forward) a smart intake form on a rebuilt funnel website — with tiered offers monetizing the actor lane first.

## Ground rules this plan is built on

1. **Non-technical, solo operator.** Every step must be runnable by Lechon in a browser, or by Natasha in her own accounts. No local dev environment, no servers. Claude (me) writes all code and copy; you run and paste.
2. **The forward engine outranks the backfill.** The intake form + funnel generate clean data forever; the Gmail/BE backfills are one-time projects. Never let a backfill block a launch.
3. **Test small, then scale.** Every extraction runs on one page / one breakdown / 200 emails before running on everything.
4. **Right model for the job.** Fable 5 / Opus 4.8 for brand copy and architecture; Sonnet 5 for the high-volume extraction; Haiku 4.5 tested for the simplest emails.

---

## The five workstreams

### A. Airtable base — the spine *(Week 1 — do first, everything lands here)*

| Step | Owner | Detail |
|---|---|---|
| A1 | Claude | Generate CSV seed files for all 6 tables (`Talent`, `Credits`, `Representation`, `Source`, `Roles/Breakdowns`, `Interactions`) matching the schema in `system-design.md` §4, plus a click-by-click setup guide |
| A2 | Lechon | Create the base, import CSVs, set field types per the guide |
| A3 | Claude + Lechon | Build the saved Views ("Premium actors · LA · SAG", "Needs review", "Producers & investors", "New this week") |
| A4 | Natasha | 15-minute walkthrough; confirm tier labels and the fields she'd actually filter by |

> ⚠️ **Plan requirement:** Airtable Free caps at **1,000 records per base**. The full BE pool alone is tens of thousands. Budget for **Airtable Team (~$20/user/mo)** which allows 50,000 records/base. This is a hard prerequisite for the "full history" decision.

### B. Breakdown Express backfill — the crawler *(Weeks 1–2)*

Confirmed structure: Projects list (18 pp) → breakdown (`breakdown=`/`project=` IDs) → roles → status buckets (`view=auditions`) → actor cards → Actors Access profiles.

| Step | Owner | Detail |
|---|---|---|
| B1 | Lechon | Instant Data Scraper the **remaining 17 project-list pages** (same as the one already done) → gives us every breakdown ID. Easy, already know how |
| B2 | Claude | Build **crawler v1** (paste-in browser tool / bookmarklet): takes the breakdown-ID list, fetches each `view=auditions` page inside her logged-in session, parses actor cards (name, AA profile link, status bucket, ★ favorite, submission note), downloads one CSV |
| B3 | Lechon | Run v1 on **one breakdown**, send me the output; I fix parsing until clean |
| B4 | Lechon | Run full crawl (batched, rate-limited — the tool paces itself); upload result |
| B5 | Claude | Dedupe by Actors Access ID, map to schema, produce Airtable-ready import files |
| B6 | Later / on-demand | Tier-2 enrichment (full AA profiles: reps, credits, physical, skills) for shortlisted talent only |

**Fallback:** if B3–B4 stalls after two iteration rounds, switch to the freelancer package (I write the script + Upwork job post; ~$100–300, ~2 hrs of their time). Decision point, not a failure.

### C. Gmail backfill — the pipeline *(Weeks 2–3, parallel to B)*

**Architecture: Google Apps Script** — code that runs *inside Natasha's own Google account* (script.google.com). No servers, no OAuth apps to register, nothing installed. It reads her Gmail with her own permissions and writes rows to a Google Sheet; Airtable imports the Sheet.

| Step | Owner | Detail |
|---|---|---|
| C1 | Claude | Write the Apps Script: Gmail search filters (has attachment / mentions headshot, resume, reel, IMDb, Actors Access / relevant labels) → for each thread, call Claude API (**Sonnet 5**) to extract schema fields + confidence → append to Sheet. Chunked with time-based triggers (Apps Script's 6-min run limit) |
| C2 | Natasha or Lechon | Paste script into script.google.com under her account; add the Anthropic API key; click Run; approve permissions |
| C3 | — | **Pilot on ~200 emails.** Review output together; tune filters/prompt |
| C4 | — | Full run (fires itself in chunks over hours/days); Sheet → Airtable import |
| C5 | Natasha | Work the "Needs review" view — confirm low-confidence records |

**Cost estimate:** ~5,000 relevant emails on Sonnet 5 intro pricing ≈ **$20–50 total, one-time.** Needs an Anthropic API key (console.anthropic.com).

### D. Intake form + funnel website *(Weeks 3–5)*

| Step | Owner | Detail |
|---|---|---|
| D1 | Claude | Final intake-form field spec (mirrors Talent table 1:1): identity/contact, lane picker (actor/producer/director/investor), self-select tier + verification questions (years, notable projects, SAG, rep status, income range — optional), links, headshot upload |
| D2 | Lechon | Build the form — **native Airtable form** to start (writes straight into the base, zero integration work); upgrade to Fillout later if we need conditional lane-branching |
| D3 | Claude (Fable) | Write the **lead magnet** (working title: *"Unknown → Paid in Hollywood"* actor guide) + homepage copy: prestige markers, "Trusted by" row, lane picker, per-lane paths — the Suzy Welch model adapted per the teardown |
| D4 | Lechon + Natasha | New site on a template platform (Framer or Squarespace — decision below): hero → trusted-by → lane picker → form. Natasha supplies the real credits/brands for the trusted-by row + updated photos |
| D5 | Claude + Lechon | Email automation: connect form → ESP (Kit/MailerLite) → deliver lead magnet automatically → tag by lane in both ESP and Airtable |

### E. Monetization — actor track first *(Weeks 5–6, "in the bag")*

| Step | Owner | Detail |
|---|---|---|
| E1 | Natasha | Inventory existing assets: recorded workshop, Teachable setup, training material |
| E2 | Claude | Offer ladder copy (Suzy Welch model): free lead magnet → low-ticket downloadables → virtual workshop/recordings → group coaching → premium community/mentorship |
| E3 | Lechon | Wire payments (Teachable already handles this) + announce to the existing list, exactly like the prior Teachable launch |
| E4 | Later | Producer/investor lanes: **catalog only, no offer** (per the original conversation) — revisit once actor lane is producing |

---

## Timeline at a glance

| Week | Milestone |
|---|---|
| 1 | Airtable base live with views · remaining BE project pages scraped · crawler v1 built |
| 2 | Full BE Tier-1 crawl loaded into Airtable — **first "dynamic list" moment: search replaces memory** |
| 3 | Gmail pilot (200 emails) reviewed · full Gmail run started · intake form spec locked |
| 4 | Gmail backfill complete · intake form live · lead magnet + homepage copy drafted |
| 5 | New site up · form → Airtable → email automation wired end-to-end |
| 6 | Actor offer launched to the list · producer/investor lanes cataloging silently |

## Running costs

| Item | Cost | When |
|---|---|---|
| Airtable Team | ~$20/mo | Week 1 (required for record volume) |
| Anthropic API (Gmail extraction) | ~$20–50 one-time | Week 2–3 |
| ESP (Kit / MailerLite) | $0–29/mo | Week 4 |
| Website platform | ~$15–30/mo | Week 4 |
| Optional freelancer (BE fallback) | ~$100–300 one-time | Only if B stalls |

## Open decisions (need answers, in order of urgency)

1. **Airtable paid plan** — approve ~$20/mo? (Gates the full-history decision.)
2. **Website platform** — Framer (recommended: modern, fast, template-driven) vs Squarespace vs keep-and-rebuild elsewhere.
3. **ESP** — Kit (recommended for creator funnels) vs MailerLite.
4. **Lead magnet topic** — confirm the actor guide angle with Natasha; needs her voice/stories to be real.
5. **Trusted-by list** — Natasha to supply the actual networks/studios/brands/press we can legitimately claim.

## Risks & mitigations

- **BE crawler needs iteration through a paste-back loop** (I can't see her session). Mitigated by: test-on-one-breakdown protocol, and the freelancer fallback after two failed rounds.
- **BE terms of service** — the crawl automates access to her own account's data. Run batched and rate-limited, for internal record-keeping of her own casting history. Don't redistribute AA profile data.
- **Sensitive data** (income, age/gender/ethnicity, contact info at scale): fields optional on the form, access-limited in Airtable, provenance tracked per `system-design.md` §7. Be deliberate before cold-emailing backfilled contacts.
- **Momentum risk** — the backfills are grindy. That's why D and E run in parallel: the funnel can launch even if the backfill is at 60%.

## Addendum — 2026-07-08 (Breakdown Express pull complete + decisions)

**BE crawl result:** the talent crawler ran across all 439 breakdowns and pulled **64,875 unique actors** (deduped), 100% with names / headshots / Actors Access links; 53% carry an agency; **20,785 were "Selected"** by Natasha (her engaged talent), ~44k are unviewed raw submissions. Data is clean and import-ready.

**Storage decision (agreed):**
- **Working database → Airtable (Team ~$20/mo):** load the **20,785 Selected** (`castingward-talent-SELECTED.csv`). High-signal, fits the 50k Team cap, images render, and the funnel/form/automations all hang off Airtable.
- **Master archive → the full 64,875** (`castingward-talent-MASTER.csv`) kept as a CSV for now (free). If the entire pool ever needs to be live+filterable in one interface, migrate the archive to **Baserow/NocoDB** (open-source, handles the volume far more cheaply than Airtable Business) rather than pay for Airtable Business.
- **Rejected: Notion** — degrades badly past a few thousand image-rich rows; wrong tool at this scale.

**Email backfill (multiple Gmail accounts) — approach:**
- Land in the **same Talent table**, tagged `Source = Gmail`, `Data Confidence = Unconfirmed`. Sparse records are expected and valid.
- **Pass 1 (now, no code):** export Google Contacts per account (contacts.google.com → Export → Google CSV; or Takeout → Contacts for auto-saved "Other contacts"). Claude merges/dedupes/cleans → Airtable import. Captures name+email for ~everyone she's corresponded with.
- **Pass 2 (later, optional):** Apps Script inbox scan + Claude extraction for body detail (phone, links, intent, attachments) and cold inbounds not in Contacts.

## Addendum — resume enrichment complete

Ran a second crawl over each Selected actor's Actors Access resume (server-rendered `onepageresume`, reachable by resume ID alone). Result: **all 20,785 Selected actors enriched** — Union (92%), Height (96%, + numeric inches), Weight (93%, + numeric lbs), Skills (98%), Vocal Range (45%), Representation detail (24%); 0.4% resumes didn't load. Merged + cleaned into `castingward-talent-ENRICHED` (4 parts <5MB). **These supersede the SELECTED files** as the talent import.

*Now searchable by:* union, height/weight ranges (numeric fields), skills (text-contains), vocal range, engagement status — combinable and saveable as casting-search views. *Still not in the data (capture via intake form later):* hair, eyes, measurements, ethnicity.

Enrichment crawlers in repo: `breakdown-express/enrich.js` (test), `enrich-full.js` (segmented), `enrich-all.js` (marathon). Talent CSVs are personal data — not committed.

## Addendum — 2026-07-09 (direct Airtable repair via connector)

Given access to the base (`appwOxqLtl8mJYFv3`, Talent table `tbl7rjwjvTv9StY82`) through the Airtable MCP connector, diagnosed and fixed the "not structured right" problems:

**Diagnosed:** (1) Talent held **41,576 records** = the 20,785 Selected imported *twice* (07-08 + 07-09); (2) it was the *pre-enrichment* version — no height/weight/skills/union, no headshots; (3) all 6 related tables (Representation, Credits, Sources, Roles, Interactions) were empty scaffolding with **zero real links**, so the Talent rows could be freely replaced; (4) leftover default "Table 1".

**Fixed directly via connector:** added the missing searchable fields to Talent — `Union Status`, `Height` + `Height (inches)` (number), `Weight` + `Weight (lbs)` (number), `Skills`, `Vocal Range`, `Representation Detail`, and a `Headshot URL` url backup. Deleted junk "Table 1". Proved the pipeline end-to-end by writing test records with attachment URLs: **headshots fetch fine** — the S3 image URLs (`breakdownservices.s3.amazonaws.com`) are public; the old import just used the wrong field type.

**Constraint found:** the environment's network policy blocks `api.airtable.com`; only the MCP connector reaches Airtable, capped at 50 records/request. So the 20,785-row reload can't be streamed in from here — it moves as a **browser CSV import** the user runs.

**Reload package (personal data — not committed):** `IMPORT-talent-full.csv` + 4 parts (<5MB), 20,785 rows, columns named to match fields, 99.9% with headshot URLs. Headshots handled by `airtable/fill-headshots.js` (Scripting-extension script: converts `Headshot URL` → `Headshot` attachments in batches of 50, runs inside Airtable). User steps: wipe 41,576 dupes (⌘A → delete) → CSV-import the 4 parts → run the script.

**Next after reload:** build saved casting-search views; then Gmail contacts import (`Source = Gmail`, `Data Confidence = Unverified`); intake form for the fields Actors Access lacks (hair, eyes, measurements, ethnicity).

## Addendum — 2026-07-10 (data layer COMPLETE)

All Airtable data work finished via paste-and-run Scripting-extension scripts (CSV merge-imports abandoned after twice inserting instead of merging — created 10,053 junk raw-ID rows, since deleted):

1. `fill-headshots.js` — attached headshot images for ~20,736 actors (Headshot URL → Headshot attachments) ✅
2. `delete-junk-records.js` — removed the 10,053 junk rows from the failed merges ✅
3. `fill-agencies.js` — file-upload version (Scripting caps code at ~50KB, so embedded-data scripts failed); reads IMPORT-agency-merge.csv via input.fileAsync; created 1,697 agency records, linked 12,276 actors ✅
4. `fill-submitted-for.js` — parsed Submission Notes in place; created ~1,400 role records in Roles & Breakdowns, linked ~20k actors ✅

**Final state:** ~20,736 real actors — headshots, union, height/weight (text + numeric), skills, vocal range, clickable agency links, clickable submission-history links. Airtable Team plan active.

**Lesson recorded:** for bulk Airtable data ops, in-base Scripting scripts (50-record batches inside Airtable) are the reliable path; the CSV-import extension's merge mode is error-prone, and the MCP connector is too intermittent for bulk writes.

**Next:** Interface (gallery + filters + record detail) → intake form → funnel site. Design direction approved (iOS-style mockup artifact).

## Addendum — 2026-07-10 (search Interface live + intake fields added)

Built via the Airtable connector, all published:

**Interface: "Talent Search (Internal)"** (`pbdiQ1gXk4ddHppK8`) — 3 gallery pages on Talent, cover = Headshot, title = Name, name search built into every page, click-through record detail showing the full operational profile (union, height/weight, skills, vocal range, rep + rep detail, submitted/shortlist links, engagement, submission notes, BE appearances, Actors Access URL, **BE Resume ID**, **Data Confidence**, persona, assessed tier):

1. **Talent Search** (`pagR6c6KIRsKoVaxb`) — main page; filter dropdowns for **Representation**, **Submitted For**, **Data Confidence**, **Assessed Tier**.
2. **By Union** (`pagMxRIEbkAsACVil`) — tabs: SAG-AFTRA / SAG-AFTRA Eligible / Non-Union / AEA / No union data.
3. **By Height** (`pagHd3TPuqNmGRVd1`) — tabs in inch bands (<5'0" through 6'4"+), sorted by Height (inches).

**API constraint found:** interface dropdown filters only accept select/linked-record/date fields — never plain text or number. Union Status (text), Height-inches (number), and Skills (text) therefore can't be dropdowns; union + height shipped as filter tabs instead, skills via page search. *Optional 1-minute upgrade:* convert `Union Status` to singleSelect in the field editor (Airtable auto-converts all values), after which it can be a proper dropdown.

**18 intake-form fields added to Talent** (spec §0): Email, Phone, City / Location, Hair Color, Eye Color, Ethnicity, Measurements, Self-Selected Tier, Assessed Tier, Years Active, Notable Projects / Brands, Income Band (12mo, acting), IMDb URL, Website / Reel URL, Instagram, YouTube / TikTok, Ecosystem Status, Date Joined (as `CREATED_TIME()` formula — the API can't create a native created-time field; functionally identical). All selects seeded with the spec's options.

**Verification (via `totalRecordCount`):**
- Talent: **20,790** records found → deleted 4 junk CSV-header rows (every field = its own column name, one per ENRICHED import part) → **20,786 real actors**, 100% with BE Resume IDs.
- Representation links: **12,276** actors linked (exactly matches fill-agencies.js).
- Submitted For links: **20,785** actors linked — all but one record.
- Headshots attached: **20,753**; Union populated: **19,257** (92.6%, matches enrichment stats).

**Data-quality notes for cleanup later:** the `Data Confidence` select still carries a stray option literally named "Data Confidence" (header artifact — now unused; the connector can't delete select options, remove in the field editor). Some Union Status values carry minor-age suffixes ("NON-UNION Age: 14") — the contains-based tabs bucket them correctly.

**Next:** build the native Airtable intake form per `intake-form-spec.md` §1 + the "form submitted → stamp Source/Data Confidence/Ecosystem Status" automation (both are UI-only — the API can't create forms or automations); then the funnel site.

## Addendum — 2026-07-10 (intake form prepped; Persona pollution found)

Forms + automations can't be created via the API, so the launch package splits: connector work done now, UI build documented click-by-click in **`docs/intake-form-build-guide.md`** (~30-40 min for Lechon).

**Found: `Persona` select is polluted** — the failed CSV merge auto-created **7,723 options** on it (Submitted For strings + header artifacts). Its *data* is clean (20,785 Actor / 1 Other), but options can't be deleted via API and 7,700+ can't be deleted by hand. Fix shipped: new clean **`Lane`** field (Actor / Producer-Director / Investor-Financier / Other) supersedes it; `airtable/fill-lane-and-source.js` (paste-and-run) copies Persona→Lane on all records **and** links BE records to the Breakdown Express source; then Persona gets deleted in the UI (one right-click).

**Also done via connector:**
- **`Union (intake)`** singleSelect added (SAG-AFTRA / Eligible / Non-Union / Other) — the form's union question. Converting the free-text `Union Status` would have exploded into thousands of combo-string options; instead the form automation copies `Union (intake)` → `Union Status` text so the By Union tabs cover intake actors too.
- **Sources table seeded:** Intake Form, Breakdown Express, Gmail — the automation links "Intake Form"; the script links BE records.
- **Talent Search interface page rebuilt** with Lane replacing Persona on cards + a fifth **Lane** filter dropdown. Republished.

**Junk-options footnote:** `Data Confidence`, `Representation Status`, `Engagement Status (BE)` each carry one unused header-artifact option (removable in the field editor, 60 sec — in the guide's Step 0).

## Addendum — 2026-07-10 (dashboard app v1 built)

Spec approved (`docs/app-build-spec.md`, live-Airtable-API data layer) → built the same day in **`app/`**: Next.js 15 + Tailwind 4, garnet/brass iOS-style. Working and verified end-to-end (green build; login gate, roster, filters, profile, write-back all exercised headlessly with screenshots — in demo-data mode, since Airtable is reachable only via the MCP connector from the build environment).

**What's in v1:** shared-password gate (`APP_PASSWORD`); server-side roster cache (Talent + Representation + Roles, ~1 min warm-up, 15-min background refresh + manual Refresh); instant client-side search/filters (name, union buckets, height range, skill, agency, assessed tier, confidence, lane); headshot card grid; profile view with live record fetch; **write-back of exactly Assessed Tier + Data Confidence** to Airtable. No token → labeled demo data; headshots render from the public S3 URLs (no attachment-URL expiry).

**To deploy (Lechon, ~10 min, `app/README.md`):** Vercel project with Root Directory `app`; env vars `AIRTABLE_TOKEN` (PAT scoped to this base, records read+write) + `APP_PASSWORD`.

**Still pending:** design-polish pass against the approved `casting-ward-design` mockup (artifact unreadable from the build environment — 403; paste it into a session) and Natasha's walkthrough on the deployed preview.

## Immediate next three actions

1. **Claude:** generate the Airtable CSV seed files + setup guide (workstream A1).
2. **Lechon:** scrape the remaining 17 project-list pages with Instant Data Scraper (B1) and upload the CSVs.
3. **Both:** get answers to open decisions #1 (Airtable plan) and #4 (lead magnet topic) from Natasha.
