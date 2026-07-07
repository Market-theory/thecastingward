# The Casting Ward — System Design

**Status:** Draft v0.1 · Working document
**Owner:** Natasha Ward (Casting Director / Producer)
**Purpose:** Turn a manual, memory-based casting practice into a scalable ecosystem that sources, categorizes, and monetizes talent.

---

## 1. The problem we're solving

Today, everything runs on manual labor and memory:

- Talent lives as **thousands of uncategorized Gmail threads** and Breakdown Express submissions. There's no way to find "premium LA-based SAG actors who've done network TV" except to remember them.
- No lead capture, no funnel, no automation — inbound people email in, and Natasha hand-replies.
- The website (~12 years old, built by a fan, untouched since ~2014) is about *her* rather than the *problems she solves*, has no prestige markers, and no lead magnet — so traffic leaks.
- No way to sort people by who they are (actor vs. producer vs. investor), how good they are, or whether they can afford anything.

**The fix:** one structured system of record (Airtable) that everything flows into — first by backfilling the existing mess, then by adding a funnel that captures new people pre-sorted.

---

## 2. The core design principle

> **Design the schema once. Everything writes into the same fields.**

The Gmail/Breakdown Express backfill (Phase 1) and the funnel intake form (Phase 2) must land in the *exact same* Airtable structure. The intake form's questions and the Talent table's columns are the same list. This is what keeps the catalog coherent instead of becoming three disconnected databases.

Two distinctions are the intellectual core of the whole thing:

1. **Talent tier ≠ Money tier.** How good/notable someone is (casting value) is a *different axis* from whether they can afford Natasha's products (buyer value). A broke but brilliant actor and a wealthy hobbyist are opposite on these two axes. We track both.
2. **Self-selected ≠ Assessed.** People over-claim ("I'm premium talent"). So we capture what they *say* about themselves separately from what Natasha/the system *judges*. The form's verification questions (years, notable projects, brands, SAG, income) exist to triangulate the truth.

---

## 3. The three phases

| Phase | What it is | Depends on |
|---|---|---|
| **Phase 1 — Sourcing engine** | Consolidate Gmail + Breakdown Express into a structured, queryable Airtable base ("dynamic lists" on demand). | The schema (below) |
| **Phase 2 — Funnel website** | New site that positions Natasha (prestige markers, "trusted by"), routes visitors by lane, and captures them via the smart intake form → writes into the *same* Airtable base. | Phase 1 schema |
| **Phase 3 — Monetization** | Paid community, virtual trainings, group coaching, recordings, downloadables, tier-matched offers. The actor track is "in the bag" and can launch early on existing demand. | Segmented database + funnel |

Phase 3's actor track can start in parallel — she already has demand and a recorded workshop (the Teachable precedent). Producer/investor tracks are **categorize now, offer later**.

---

## 4. Airtable schema (the spine)

Six tables. `→` denotes a link to another table.

### 4.1 `Talent` — one row per person (the core catalog)

**Identity & contact**
- `Name` (primary field)
- `Stage / Preferred name`
- `Email` · `Secondary email`
- `Phone` · `Best contact method` (single select: Email / Text / Phone / Through rep)
- `City` · `State/Region` · `Country`
- `Local hire / willing to travel` (for casting logistics)
- `Website`
- `Headshot` (attachment) · `Additional photos` (attachment)

**Categorization — the whole point**
- `Persona` (multi-select: Actor · Producer · Director · Writer · Financier/Investor · Crew · Other) — a person can be several
- `Self-selected tier` (single select: Emerging · Working · Established · Premium) — *what they claim*
- `Assessed tier` (single select: same scale) — *Natasha's / the system's judgment*
- `Data confidence` (single select: Verified · Likely · Unconfirmed) — how sure we are of this record
- `Money tier` (single select: No budget · Some budget · Buyer · Investor-level) — ability/willingness to pay, **separate axis from talent tier**
- `Ecosystem status` (single select: Lead · Opted-in · Community member · Client · Collaborator)

**Actor specifics**
- `Union status` (SAG-AFTRA · Eligible · Non-union)
- `Representation status` (Repped · Seeking · Self-managed) · `Representation` (→ Representation)
- `Years active` (number or bucket)
- `Income range` (single select: the $/yr buckets) — *sensitive, optional; see §7*
- `Skills / specialties` (multi-select)
- `Age range` · `Gender` · `Ethnicity` — standard casting attributes, *sensitive; see §7*

**Links**
- `IMDb` · `Actors Access / Casting Networks` · `Reel/Demo`
- `Instagram` · `YouTube` · `TikTok` · `Other social`

**Meta**
- `Source` (→ Source) — where this record came from
- `Date added` · `First contact` · `Last interaction`
- `Lists / tags` (multi-select) — ad-hoc grouping
- `Notes`

### 4.2 `Credits / Projects` — notable work (→ Talent, many-to-many)
`Title` · `Type` (Film/TV/Commercial/Theater/Streaming/Other) · `Character / Role` · `Role level` (Lead/Supporting/Co-star/Background) · `Year` · `Network / Studio / Brand` · `Notable?` (checkbox) · `Link`

### 4.3 `Representation` — agents/managers/agencies (→ Talent, one-to-many)
`Company` · `Type` (Agent/Manager/Agency/Publicist) · `Contact name` · `Email` · `Phone`

### 4.4 `Source / Provenance` — why someone is in the base (→ Talent)
`Source name` (e.g. "Gmail import 2026-07", "Breakdown Express export", "Workshop June 2025", "Referral") · `Type` (Gmail / Breakdown Express / Event / Referral / Funnel opt-in) · `Date` · `Notes`

### 4.5 `Roles / Breakdowns` — her active castings (the payoff)
`Project` · `Role name` · `Breakdown / description` · `Requirements` (union, age range, gender, ethnicity, skills) · `Status` (Open/Filled/On hold) · `Deadline` · `Shortlist` (→ Talent) · `Submitted` (→ Talent)

This is where the catalog pays off: match a live role against the whole database instead of from memory.

### 4.6 `Interactions` *(optional, later)* — touchpoint log (→ Talent)
`Date` · `Type` (Email/Call/Meeting/Booking/Workshop) · `Summary`

### Dynamic lists = saved Views on `Talent`
Examples she can pull instantly:
- *Premium Actors · LA · SAG · network credit*
- *Producers & Investors* (categorized, no offer yet)
- *Community members* / *Clients*
- *Needs review* (Data confidence = Unconfirmed)
- *New this week*
- *Matches for [Role X]* — filtered to a live breakdown's requirements

---

## 5. Phase 1 — the sourcing pipeline

Goal: get the two messy sources into the schema above, de-duped and tagged.

### Source A — Gmail (primary, bulk)
1. **Pull** — read-only Gmail access (`gmail.readonly`), pre-filtered to *likely-talent* emails only: has attachments, or mentions Actors Access / IMDb / headshot / resume / reel, or sits in relevant labels. This slashes volume and cost before any heavy processing.
2. **Extract** — an LLM reads each relevant email/thread and returns structured fields + a `confidence` score.
3. **Dedup & enrich** — merge the many emails from one person into a single Talent record; attach the headshot.
4. **Load** — write to Airtable via API, tagged, de-duped, with `Source` provenance.
5. **Review** — the *Needs review* view surfaces low-confidence records for Natasha to confirm. Nothing wrong enters silently.

### Source B — Breakdown Express (secondary, structured)
Breakdown Express has no known open/public API, so extraction is different from Gmail:
- **Preferred:** whatever **CSV/data export** her account allows on submissions and saved lists → mapped into the schema.
- **Fallback:** if it's view-only, a structured manual/assisted capture of her key saved lists.
- Submissions here are already semi-structured (talent name, rep, headshot, resume, links), so once exported they map cleanly. *Open question: confirm what her account permits — see §8.*

Both sources write into the **same** Talent schema, distinguished only by the `Source` field.

---

## 6. Phase 2 — funnel website (outline)

Replaces the dated site. Design goals, mapped to the current site's gaps:

- **Hero** = the problem + who it's for + a clear next action (not "About Natasha").
- **Prestige markers above the fold** — "Trusted by / featured in" (Essence, BET, studios, networks — real credits).
- **Visible lead magnet** — one obvious value-for-contact offer (e.g. an actor "unknown → paid in Hollywood" guide).
- **Branching funnel** — visitor picks their lane (Actor / Producer / Director / Investor) → routed to the right offer, or to a "just catalog them" flow for people we categorize but don't sell to yet.
- **The smart intake form** — same fields as the Talent table; writes straight into Airtable, pre-sorted. Self-select tier + verification questions.
- **Positioning** — supports getting Natasha onto stages, panels, podcasts (thought-leadership as a top-of-funnel channel).

---

## 7. Handling sensitive data (do this right)

This system holds real personal data on thousands of people. Guardrails:
- **Gmail access is read-only** and scoped; used only to build talent records, not stored wholesale.
- **Income, age, gender, ethnicity** are sensitive. Age/gender/ethnicity are legitimate, industry-standard casting attributes (they appear on breakdowns), but they and income should be: optional on the form, access-limited in Airtable, and never used for anything outside casting/segmentation.
- **Consent & provenance** — the `Source` field records how each person entered. Funnel opt-ins carry explicit consent; be thoughtful about outreach to people backfilled from old emails.

---

## 8. Open decisions / questions

1. **Breakdown Express export** — what does her account actually allow? CSV export on submissions/lists, or view-only? (Determines Source B's approach.)
2. **Build approach** — recommend **hybrid**: custom-build the Gmail→Airtable extraction pipeline (the differentiated part), assemble everything else (community, email, payments, courses) from off-the-shelf tools.
3. **Headshot storage** — Airtable attachments vs. Google Drive links (cost/scale tradeoff).
4. **Tier scales** — confirm the exact labels/buckets for talent tier, money tier, and income ranges.
5. **Off-the-shelf stack for Phase 3** — community/course platform (Teachable is already in use), email/CRM, payments, automation (Zapier/Make).

---

## 9. Immediate next step

Lock this schema (react to §4), then build a small **Gmail extraction proof-of-concept** on a sample set of emails to prove the pipeline before running it at scale.
