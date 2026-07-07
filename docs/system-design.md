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
- `Skills / specialties` (multi-select) · `Training` (long text)
- `Age range` · `Gender` · `Ethnicity` — standard casting attributes, *sensitive; see §7*
- `Physical / size card` — `Height` · `Weight` · `Build` · `Hair` · `Eyes` (Breakdown/Actors Access "Appearance" fields; see §5.3)

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

Breakdown Express (Breakdown Services) is a **paid, authenticated third-party platform** with no known public API. Two hard constraints shape how we get data out:

1. **It runs on Natasha's side, not ours.** Extraction requires being logged into *her* account; this build environment is network-restricted and has no credentials. So any extraction tool runs **on her machine, in her authenticated session** — this system can design it, not execute it.
2. **Respect the platform's terms.** This is *her* data (talent who submitted to her), which makes portability legitimate, but automated hammering of BE's servers can breach their ToS and trip anti-bot. So we prefer **native export**, and if we must capture from the UI, we do it **human-paced and assisted**, not as an aggressive scraper.

**Approach, in order of preference:**
- **A. Native export / report.** Confirm what her account offers (sibling platform Casting Networks has a "Download CSV" report; BE's equivalent needs checking in-account or with BE support). Best case — clean CSV, done.
- **B. Assisted export tool.** If there's no bulk export, a small browser-based tool Natasha runs *while logged in* that walks her saved lists / project submissions at human pace and writes structured rows + headshots to Airtable. She stays in control; it's her data, her session.
- **C. Eco Cast presentations.** Shortlists she's built as Eco Cast presentations can be shared/exported and mapped in.

### 5.3 Breakdown Express / Actors Access → Airtable field mapping

The talent structure on BE/Actors Access is standardized, so it maps 1:1 into the schema — the DB is already shaped to receive it:

| Breakdown / Actors Access field | → Airtable |
|---|---|
| Headshots, photos, SlateShot | `Talent.Headshot` · `Additional photos` |
| Demo reel / media clips | `Talent.Reel/Demo` |
| Appearance: gender, age range, ethnicity | `Talent.Gender` · `Age range` · `Ethnicity` |
| Size card: height, weight, build, hair, eyes | `Talent.Physical / size card` |
| Union status | `Talent.Union status` |
| "Represented by" (agency) | `Talent.Representation` → **Representation** table |
| Resume — credits (Film / TV / Theater / Commercial) | **Credits / Projects** table |
| Resume — training | `Talent.Training` |
| Resume — special skills | `Talent.Skills / specialties` |
| Contact (often via rep) | `Talent.Email` · `Phone` · `Best contact method` |
| Profile / external links | `Talent.IMDb` · socials · `Website` |

Same target schema as Gmail (§5, Source A) — the two sources differ only in the `Source` field.

Both sources write into the **same** Talent schema, distinguished only by the `Source` field.

---

## 6. Phase 2 — funnel website

### 6.1 The model: Suzy Welch's "expert authority funnel" (teardown)

`suzywelch.com` is the reference format. It's not a set of pages — it's a **value ladder** that walks a stranger from free → premium, resting on a few repeatable moves. Decoded from her homepage, top to bottom:

| Suzy's section | The move | Why it works |
|---|---|---|
| **Nav:** About · Books · Podcast · Assessments · Programs & Offerings · **[Newsletter Sign Up]** | One hard CTA lives permanently in the nav | Capture is always one click away |
| **Hero:** "Discover your authentic *life and career*." + credential subhead ("3× NYT bestselling author, NYU Stern professor, founder of Becoming You Labs") + **two CTAs**: *Discover your values →* (soft/free) and *Purchase Becoming You →* (hard/paid) | Problem-promise headline, **credentials as identity**, dual soft+hard CTA | You know in 3 seconds what she does, that she's credible, and get both a free and a paid door |
| **Assessments:** "Career Traits Compass" + "The Values Bridge" — free interactive tools | **Lead magnet that also *segments*** | ⭐ The key move — see §6.2 |
| **Trusted by:** Stanford · LinkedIn · Meta · NYU · Amazon | Borrowed authority, "trusted by" framing | Broader/stronger than "I worked for them" |
| **Book:** "At last, a way to figure out your *authentic* purpose" + retailer buttons + **bestseller badges** (#1 Amazon, USA Today, TODAY) | Entry product doubles as lead gen; layered prestige | Low-ticket top of the ladder |
| **Certification Program** (w/ NYU) | Premium, recurring, creates evangelists | Top of the ladder |
| **Testimonial** (named person + credentials) → **Podcast** → **FAQ** | Social proof · content channel · objection handling | Trust + top-of-funnel + SEO |
| **Footer:** newsletter capture **again** + full nav | Email capture is repeated, not one-and-done | Second chance to convert scrollers |

Prestige appears in **three** places (hero subhead, "Trusted by" bar, bestseller badges). Email capture appears **twice** (mid-page + footer). Nothing is subtle.

### 6.2 The most important lesson: lead magnet = assessment = intake form

Suzy's "lead magnet" isn't a static PDF — it's a **free assessment** ("Career Traits Compass," "The Values Bridge"). That's strictly better than a downloadable, because a quiz **captures the email *and* segments the person at the same time.**

For Natasha this collapses three things we already planned into one asset:

> **The lead magnet, the lane-picker, and the smart intake form should be the same interactive assessment** — e.g. *"How castable are you right now?"* — that gives the visitor a useful result, and writes a fully-segmented record straight into the Airtable `Talent` table (persona, self-selected tier, union, rep, links, etc.).

One asset = value to them + a categorized record for Natasha. This is the front door to the whole ecosystem.

### 6.3 Natasha's homepage — wireframe

Suzy's structure, wrapped in a **lane-picker** (the one adaptation: Suzy has one audience; Natasha has four).

```
┌ NAV  "Natasha Ward"      About · Work · Community · Resources · [ Join the List ]
│
├ HERO  (full-bleed current photo of Natasha)
│   H1:  "Get discovered. Get cast. Get working."     ← problem+promise, not "About"
│   Sub: "Natasha Ward — casting director behind [X, Y, Z] — has spent [N] years
│         putting unknown talent on screen. Here's how you get there."
│   [ Find your lane → ]   [ Free: Unknown → Paid guide → ]   ← soft + hard CTA
│
├ LANE-PICKER  "Where do you fit?"          ← the adaptation Suzy doesn't need
│   [ Actor ] [ Producer ] [ Director ] [ Investor ]   → routes + tags in Airtable
│
├ ASSESSMENT / LEAD MAGNET  "How castable are you right now?"   ⭐
│   ~3-min quiz → useful result → captures a segmented record into Airtable Talent
│   (this IS the intake form + lane-picker + lead magnet, in one)
│
├ TRUSTED BY   BET · Essence · [networks / studios / brands she's cast for]
│
├ THE METHOD  "The Casting Ward Method"     ← branded, productized system
│   value ladder:  free guide → downloadables → live workshop → community → inner circle
│   (actor lane gets the full ladder; producer/investor get "categorize + collaborate")
│
├ SOCIAL PROOF   named testimonial(s) from talent she's placed
├ CONTENT        podcast / panel / stage clips   ← positions her as speaker (transcript)
├ FAQ            objection handling
└ FOOTER         newsletter capture (again) + nav + socials
```

### 6.4 Design goals, mapped to the current site's gaps
- **Hero** = the problem + who it's for + a clear next action (not "About Natasha").
- **Prestige markers above the fold** — layered "Trusted by / featured in" (Essence, BET, studios, networks).
- **Lead magnet as an assessment** (§6.2) — value-for-contact that also segments.
- **Lane-picker** — routes Actor / Producer / Director / Investor to the right ladder, or to "categorize, don't sell yet."
- **Branded method** — productize Natasha's expertise into a named system (Suzy's "Becoming You").
- **Repeated capture** — newsletter opt-in in the nav *and* the footer.
- **Positioning** — content/podcast/panel section supports getting Natasha onto stages (transcript).

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
