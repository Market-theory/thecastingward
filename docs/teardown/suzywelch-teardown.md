# Site teardown: suzywelch.com → blueprint for natashaward.com

**Captured 2026-07-11** via `scripts/teardown-site.mjs` (12 pages, 34 screenshots, full copy + structure in `docs/teardown/suzywelch.com/`). Purpose: reverse-engineer the personal-brand architecture for Natasha Ward / The Casting Ward funnel site.

---

## 1. What this site is

Suzy Welch's site is not a portfolio — it's a **conversion machine wrapped in an editorial magazine**. Every page exists to do one of three jobs: (a) borrow authority, (b) capture an email, or (c) route to a paid offer. The brand system: one person, one framework name ("Becoming You"), one aesthetic, many monetization surfaces.

**Positioning line (H1):** *"Discover your authentic life and career."* — outcome-first, second person, zero jargon.
**Authority stack (subhead):** 3× NYT bestselling author · NYU Stern professor · founder of Becoming You Labs. Credentials carry the trust so the headline can stay emotional.

## 2. Information architecture (captured sitemap)

```
Home
├── About            («Meet Suzy Welch» — bio as brand story)
├── Books            → /books/becoming-you (retailer buttons: Amazon, B&N, Bookshop…)
├── Podcast          (Becoming You Podcast — content engine)
├── Assessments      → 4 productized quizzes (see §4)
│     └── /4-horsemen  («What's standing in the way of your purpose?» — quiz lead magnet)
├── Programs & Offerings
│     ├── /certifications  (Becoming You Coach Certification — high-ticket)
│     └── /speeches        («Inspire your audience with insight» — B2B keynotes)
├── Newsletter       (archive page — the newsletter is a product with its own PDP)
├── Advocacy         («Advocacy is how values become action» — values halo)
├── Media & Press    (proof wall)
└── Contact          (press/speaking/inquiries routing form)
```

## 3. The funnel (reverse-engineered)

1. **Traffic** → podcast, press, book readers, LinkedIn/Facebook ads (FB pixel + LinkedIn insight tag present).
2. **Hook** → free **quiz** ("Four Horsemen", "Discover your values" is the homepage primary CTA) — an assessment as lead magnet, not a PDF.
3. **Capture** → one identical form everywhere: first name, last name, email + Cloudflare Turnstile. CTA is always **"Sign Me Up"** — one phrase, sitewide. The newsletter signup block repeats on *every single page* (footer-level).
4. **Nurture** → weekly newsletter ("A newsletter to help you become you, one week at a time" — cadence promised in the copy).
5. **Monetize** → ascending ladder: book ($30) → paid assessments → certification program (high-ticket) → corporate keynotes (B2B).
6. **Halo** → advocacy + media pages recycle authority back into the loop.

## 4. The killer pattern: productized assessments

The Assessments page is 4 cream cards on dark ground — *The Values Bridge*, *Career Traits Compass*, *PIE360 Feedback*, *The Four Horsemen* — each: icon → serif title → one-sentence benefit ("Discover the values at the core of who you are…") → amber **Explore** pill. Quizzes are simultaneously lead magnets, products, and the on-ramp to coaching/certification. **This is the exact skeleton for Natasha's intake:** the intake form IS her assessment — "Where are you in your acting career?" — and the tier self-select is her Values Bridge.

## 5. Design language

- **Palette:** deep chocolate/espresso grounds, cream type, amber/gold CTAs — warm, editorial, monochrome-plus-one-accent. (Casting Ward's garnet/brass/cream is the same *structure*, different hue — validating our system.)
- **Type:** high-contrast serif display with *italic emphasis* on the emotional words ("your authentic *life* and *career*"); clean sans for body/UI.
- **Imagery:** one full-bleed warm portrait per page hero. The founder IS the visual identity — no stock, no illustration.
- **Buttons:** two-tier system — filled cream/amber primary ("Discover your values →"), outlined secondary ("Purchase Becoming You →"). Arrows on CTAs.
- **Layout:** dark hero → cream content cards → dark newsletter band. High-contrast banding paces the scroll.

## 6. Copy patterns worth stealing

- H1s are **second-person outcomes**, never descriptions: "Discover your authentic life and career." / "Inspire your audience with insight." / "What's standing in the way of your purpose?"
- Section H2s ask questions or promise cadence ("…one week at a time").
- Voice: warm authority — "a little tough love to steady your life, with the emphasis on love."
- Every credential appears exactly where trust is needed, not in a trophy case.

## 7. Tech stack (from script hosts)

| Signal | Tool |
|---|---|
| Site platform | Custom/headless (Next-style assets, self-hosted) — not Squarespace/Wix |
| Bot protection | Cloudflare Turnstile on all forms |
| Analytics | GA (gtag) + **PostHog** (product analytics — they measure funnels) |
| Ads/retargeting | Facebook pixel + LinkedIn Insight |
| Consent/a11y | Clym widget |
| Book sales | Outbound to retailers (no owned checkout for the book) |

## 8. Scorecard (12-dim rubric, adapted for personal-brand sites)

| Dimension | Score | Evidence |
|---|---|---|
| Offer architecture | 5 | Free quiz → book → paid assessments → certification → keynotes; every rung present |
| Email capture | 5 | Identical 3-field form + one CTA phrase on all 12 pages |
| Positioning clarity | 5 | One outcome sentence; framework has a name ("Becoming You") |
| Authority/trust | 5 | NYT×3, NYU, "Trusted by" logo row, media wall |
| Design cohesion | 5 | One palette, one serif system, founder-as-imagery throughout |
| Copy voice | 4 | Distinct and consistent; some pages lean text-heavy |
| Lead magnet | 5 | Quiz > PDF: interactive, self-referential, feeds the paid ladder |
| Content engine | 4 | Podcast + weekly newsletter; archive public |
| Conversion friction | 4 | 3 fields + Turnstile; no CC walls; quiz entry is 1 click |
| Tech sophistication | 4 | PostHog funnel analytics; custom build; no commerce debt |
| Community | 2 | No visible community space (opportunity for Natasha) |
| Accessibility | 3 | A11y widget present; contrast strong; some long pages |

**Total: 51/60.** This is a best-in-class personal-brand funnel.

## 9. Translate to Natasha Ward — what we borrow vs. do differently

**Borrow directly (structure, not copy):**
1. **Quiz-as-front-door.** Our intake form ≈ her assessment. Frame it as "Find your lane" / readiness check, not paperwork. Homepage primary CTA = the intake, phrased as a benefit ("Get on Natasha's radar" energy, not "submit a form").
2. **One capture, everywhere.** One 3-field newsletter form with one CTA phrase, on every page, bot-protected.
3. **Authority stack in the subhead:** [N] years casting, credits/networks, 20,000+ actor community — the numbers we already have.
4. **Two-tier CTA buttons** and the dark-hero/cream-card banding — maps 1:1 onto garnet/brass/cream.
5. **The ladder:** free intake → community/newsletter → paid tier (workshops/materials) → premium (1:1 coaching / industry services) → B2B (casting services for producers — her "speeches" equivalent).

**Do differently:**
1. **Community is her gap (2/12).** Natasha's 20k roster is a moat Suzy doesn't have — lead with belonging ("join the roster"), not just self-discovery.
2. **Two audiences, one door.** Suzy serves one persona; our intake self-routes actor/producer/investor via the Lane picker — keep the door singular, route inside (already spec'd).
3. **The roster is the product.** Suzy sells frameworks; Natasha's asset is a searchable, verified talent pool — the B2B page should sell *access to curated talent*, backed by the database we built.
4. Skip the ads pixels at launch; keep PostHog-style funnel analytics from day one.

## 10. Action plan

| Horizon | Item |
|---|---|
| Quick (with form launch) | Adopt "Sign Me Up"-style single CTA phrase; write the outcome H1; put the intake quiz as homepage primary CTA |
| Medium (funnel site build) | Suzy-pattern IA: Home/About/Roster (intake)/For Producers/Newsletter/Press/Contact; dark-hero + cream-card system in garnet/brass; founder portrait hero of Natasha |
| Strategic | Name the framework (her "Becoming You" = our "The Casting Ward" method); build the ascending offer ladder; stand up the community layer she lacks |

*Raw evidence: `docs/teardown/suzywelch.com/` — 34 screenshots, `copy.md` (full page text), `extract.json` (nav/forms/tech).*
