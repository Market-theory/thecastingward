# The Casting Ward — Assessment Suite (concept spec, v0)

Born from the suzywelch.com teardown (`docs/teardown/suzywelch-teardown.md` §4):
her productized assessments are the funnel's front door, product, and ladder
on-ramp all at once. Natasha's version serves everyone trying to break into or
level up in film — routed by lane, written straight into the Talent base.

**The unfair advantage:** Suzy's quizzes end at a results page. Ours end inside
a living database — every completion becomes a searchable, verifiable record in
Natasha's casting ecosystem. The assessment *is* the intake.

---

## The suite

| # | Assessment | Audience | What it measures | Writes to (existing fields) | Result delivered |
|---|---|---|---|---|---|
| 1 | **The Lane Finder** | everyone | Which door you belong at: Actor · Producer · Director · Investor · Multi-hyphenate | `Lane` | Your lane + what The Casting Ward offers it |
| 2 | **The Readiness Index** | actors | Where you honestly are: Emerging / Established / Premium — claim + receipts (union, years, credits, rep, income band) | `Self-Selected Tier`, `Years Active`, `Union (intake)`, `Representation Status`, `Income Band`, `Notable Projects` | Your tier + the exact gaps between you and the next one |
| 3 | **The Four Gatekeepers** | actors (lead magnet — the Four Horsemen analog) | What's actually blocking your break: **Training · Tape · Ties · Temperament** (craft, materials, network, consistency) | new: `Gatekeeper Profile` (multi-select) | Your #1 blocker + first fix — shareable result |
| 4 | **The Producer's Compass** | producers & directors | Project stage, budget band, genre, crewing needs, collaboration style | `Notable Projects / Brands`, `Submission Notes` | Cataloged, not pitched — routed to Natasha when there's fit |
| 5 | **The Backer's Brief** | investors | Check size comfort, risk appetite, genre thesis, involvement level | `Notable Projects / Brands`, `Submission Notes`, `Income Band` (opt.) | Cataloged; curated dealflow when it matches |

Names/copy are working titles — final naming pass belongs with the funnel-site
design (garnet/brass voice: warm authority, second-person outcomes).

## How it stays honest (same loop as the intake)

Self-reported results land `Data Confidence = Unverified`; Natasha's review sets
`Assessed Tier` — the searchable truth. The Readiness Index makes the
verification loop *feel* like a service ("Natasha reviews every profile")
instead of moderation.

## Ladder placement

- **Free:** Lane Finder + Four Gatekeepers (email-gated results → lane-tagged newsletter).
- **Core:** Readiness Index = the intake form itself (§1–3 of `intake-form-spec.md`, reframed as an assessment with a results page).
- **Paid:** "Reel Review" — the PIE360 analog: human feedback on your tape/materials from Natasha's team. Productized service, high margin, natural upsell from a Gatekeepers result of "Tape."
- **B2B:** Compass + Brief feed the producer/investor catalog that powers casting services.

## Build phasing

1. **Now (costs nothing):** the Airtable intake form (already spec'd) ships with assessment framing — title/confirmation copy speak "find your lane / know your readiness," not "submit a form."
2. **Funnel site v1:** Lane Finder + Four Gatekeepers as interactive quiz pages with results + email gate (each result = a segment tag for lane-specific nurture). One new Airtable field: `Gatekeeper Profile`.
3. **Funnel site v2:** Readiness Index results page (tier + gap map), Reel Review checkout, Compass/Brief for the B2B side.
