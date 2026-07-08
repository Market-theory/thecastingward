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

## Immediate next three actions

1. **Claude:** generate the Airtable CSV seed files + setup guide (workstream A1).
2. **Lechon:** scrape the remaining 17 project-list pages with Instant Data Scraper (B1) and upload the CSVs.
3. **Both:** get answers to open decisions #1 (Airtable plan) and #4 (lead magnet topic) from Natasha.
