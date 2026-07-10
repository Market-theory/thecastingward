# The Casting Ward — Intake Form Spec (v1)

**What this is:** the field-by-field build sheet for the "powerful form" — the front door of Natasha's ecosystem. It writes directly into the live **Talent** table (base `appwOxqLtl8mJYFv3`), so every answer becomes a search filter the moment it's submitted.

**Where it lives:** built as a **native Airtable form** on the Talent table first (zero integration, live in an hour). Graduates later to a branded phone-first page on the funnel site (Fillout embed or custom), same schema.

**Design intent (from the founding conversation):**
- Self-select lane (actor / producer / investor) → routes them in the database, not to different products.
- Self-select tier + verification signals — "lots of people are going to say they're premium; the other questions help you categorize it."
- Capture what Breakdown Express never had: contact info, hair/eyes/ethnicity/measurements, socials, income band.
- Producers & investors get **cataloged, not pitched**.

---

## 0. New fields to add to Talent (before building the form)

These don't exist yet — add via the connector or manually. Types matter: selects make filters; text doesn't.

| Field | Type | Options / notes |
|---|---|---|
| Email | Email | primary contact |
| Phone | Phone number | |
| City / Location | Single line text | consider a `Region` singleSelect later (LA / NY / ATL / Other) |
| Hair Color | Single select | Black, Brown, Blonde, Red/Auburn, Grey/White, Bald, Other |
| Eye Color | Single select | Brown, Blue, Green, Hazel, Grey, Amber, Other |
| Ethnicity | Multiple select | self-described; seed with common Breakdown categories + "Prefer to self-describe" text fallback |
| Measurements | Single line text | free text, optional |
| Self-Selected Tier | Single select | Emerging, Established, Premium |
| Assessed Tier | Single select | Emerging, Established, Premium — **Natasha sets this**, never the form |
| Years Active | Single select | <2, 2–5, 5–10, 10+ |
| Notable Projects / Brands | Long text | |
| Income Band (12mo, acting) | Single select | Prefer not to say, <$10k, $10–50k, $50–150k, $150k+ |
| IMDb URL | URL | |
| Website / Reel URL | URL | |
| Instagram | Single line text | handle, not URL — normalize on entry |
| YouTube / TikTok | Single line text | |
| Ecosystem Status | Single select | New lead, Reviewed, In community, Client, Collaborator |
| Date Joined | Created time | automatic |

Also reuse existing: `Persona` (lane), `Headshot`, `Union Status`, `Height`/`Height (inches)`, `Weight`, `Skills`, `Representation Status`, `Representation Detail`, `Data Confidence`, `Source`.

**On submission defaults:** `Source = Intake Form`, `Data Confidence = Unverified`, `Ecosystem Status = New lead`. (Airtable forms can't set hidden defaults directly — use one Automation: "When form submitted → update record" to stamp these three.)

---

## 1. The form, field by field

Form title: **Join Natasha Ward's roster**
Description under title: *Two minutes. Your answers put you in the right lane — and in front of the right opportunities. Natasha reviews every profile.*

### Section 1 — Who you are
| # | Prompt (label) | Field | Required | Notes / microcopy |
|---|---|---|---|---|
| 1 | Full name | Name | ✅ | "As it appears on your credits." |
| 2 | Email | Email | ✅ | |
| 3 | Phone | Phone | ✅ | "Best number for booking-related calls." |
| 4 | City you work from | City / Location | ✅ | "Where you can take same-week auditions." |
| 5 | I'm here as a… | Persona | ✅ | options: **Actor · Producer/Director · Investor/Financier · Other** — this is the lane picker; drives conditional sections below |

### Section 2 — Actors only *(conditional: Persona = Actor)*
| # | Prompt | Field | Required | Notes |
|---|---|---|---|---|
| 6 | Headshot | Headshot | ✅ | "High-res, recent, no heavy filters." |
| 7 | Union status | Union Status | ✅ | SAG-AFTRA / SAG-AFTRA Eligible / Non-Union / Other |
| 8 | Height | Height | ✅ | e.g. 5'7" |
| 9 | Hair color | Hair Color | ✅ | |
| 10 | Eye color | Eye Color | ✅ | |
| 11 | Ethnicity | Ethnicity | optional | "Used only for role matching. Select all that apply." |
| 12 | Measurements | Measurements | optional | "For wardrobe. Skip if you prefer." |
| 13 | Skills & special talents | Skills | ✅ | "Sports, dance, dialects, instruments, stunts — the things that book you." |
| 14 | Do you have representation? | Representation Status | ✅ | Repped / Self-Managed |
| 15 | Who represents you? | Representation Detail | conditional (if Repped) | "Agency and/or manager, with office if you know it." |

### Section 3 — Your level *(conditional: Persona = Actor)*
Intro line: *Pick where you honestly are today — then a few receipts so we can match you right.*

| # | Prompt | Field | Required | Notes |
|---|---|---|---|---|
| 16 | Where are you today? | Self-Selected Tier | ✅ | **Emerging** — building credits · **Established** — steady work, notable projects · **Premium** — repped, big-budget credits, recognition |
| 17 | Years acting professionally | Years Active | ✅ | |
| 18 | Notable projects or brands | Notable Projects / Brands | optional | "Titles, networks, studios, brands — the ones you'd lead with." |
| 19 | Acting income, last 12 months | Income Band | optional | "Helps us recommend the right resources. Private, never shared." — first option **Prefer not to say** |

### Section 4 — Producers & investors *(conditional: Persona = Producer/Director or Investor/Financier)*
| # | Prompt | Field | Required | Notes |
|---|---|---|---|---|
| 20 | Company / fund | Representation Detail (reused) or new `Company` field | optional | |
| 21 | What are you working on or funding? | Notable Projects / Brands | ✅ | "Stage, budget range, genre — whatever you can share." |
| 22 | How do you like to collaborate? | Submission Notes (long text) | optional | |

### Section 5 — Where to find you *(all lanes)*
| # | Prompt | Field | Required |
|---|---|---|---|
| 23 | IMDb | IMDb URL | optional |
| 24 | Website or reel | Website / Reel URL | optional |
| 25 | Instagram | Instagram | optional |
| 26 | YouTube / TikTok | YouTube / TikTok | optional |

Submit button: **Join the roster**
Confirmation message: *You're in. Natasha reviews every profile — if there's a fit for something she's casting, you'll hear from the team directly. Watch your inbox for what's next.*

---

## 2. The verification loop (how self-select stays honest)

1. Everything lands `Data Confidence = Unverified`, `Assessed Tier = empty`.
2. Natasha's **"Needs review"** view: filter `Assessed Tier is empty` + `Persona = Actor`, sorted newest first, showing Self-Selected Tier next to the receipts (years, projects, union, rep, income band).
3. She sets **Assessed Tier** in one click per record (the searchable truth; Self-Selected stays as the claim), flips Data Confidence to Verified when it checks out.
4. The search Interface filters on **Assessed Tier**, never self-selected — so inflated claims never pollute a casting search.

## 3. Build steps (native Airtable form)

1. Talent table → **Forms** tab (top bar) → New form.
2. Drag on the fields above in order; set required flags; add the microcopy as field descriptions.
3. Conditional logic: on each Section 2/3 field → "Show field only if… Persona is Actor" (etc. for Section 4).
4. Automation (Automations tab): *When form submitted* → *Update record*: Source→Intake Form, Data Confidence→Unverified, Ecosystem Status→New lead.
5. Share → copy link. That link is the front door until the funnel site wraps it.

## 4. Later (funnel-site version)
Same fields, phone-first, branded per the design artifact (garnet/brass, iOS-style). Adds: lead-magnet delivery on submit (ESP handoff), UTM capture into a `Source Detail` field, and reCAPTCHA. Fillout is the likely embed (native Airtable writes, prettier conditional UX) — decision deferred until the site build.
