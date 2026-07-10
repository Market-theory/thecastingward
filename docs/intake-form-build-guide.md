# The Casting Ward — Intake Form Build Guide (click-by-click)

**Companion to `intake-form-spec.md`** — that doc is the *what*; this is the exact build sequence in the Airtable UI. Forms and automations can't be created through the API, so this is a Lechon build (~30–40 min total). Everything the API *could* do is already done.

**Already in place (via connector, 2026-07-10):**
- All 18 §0 fields exist on Talent (Date Joined is a `CREATED_TIME()` formula — same behavior).
- **`Lane`** (clean singleSelect: Actor / Producer-Director / Investor-Financier / Other) — use this as the lane picker, **not `Persona`** (Persona's option list was polluted with 7,000+ junk choices by the failed CSV merge; its *data* is fine and gets copied over by the script below).
- **`Union (intake)`** (singleSelect: SAG-AFTRA / SAG-AFTRA Eligible / Non-Union / Other) — the form's union question. BE records keep their scraped free-text `Union Status`.
- Sources table seeded: **Intake Form**, **Breakdown Express**, **Gmail** (the automation links the first one).

---

## Step 0 — Prep (10 min, once)

1. **Run the backfill script.** Open the base → Extensions → Scripting → clear the editor → paste `airtable/fill-lane-and-source.js` → ▶ Run. It sets `Lane` from `Persona` on all ~20,786 records and links BE records to the *Breakdown Express* source. Safe to re-run.
2. **Delete the old `Persona` field.** Talent grid → right-click the *Persona* column header → *Delete field*. (Do this only **after** the script finishes — it reads Persona.)
3. *(Optional, 60 sec)* Remove the stray header-artifact options: open the field editor for `Data Confidence`, `Representation Status`, `Engagement Status (BE)` and delete the option that's literally named after the field (e.g. a "Data Confidence" choice inside Data Confidence). They're unused — the 4 junk header rows that carried them were already deleted.

## Step 1 — Create the form (5 min)

1. Open the base → **Forms** tab (top bar, next to Data/Automations/Interfaces) → **+ New form** → source table: **Talent**.
2. Form title: **Join Natasha Ward's roster**
3. Description: *Two minutes. Your answers put you in the right lane — and in front of the right opportunities. Natasha reviews every profile.*
4. Submit button label: **Join the roster**
5. Confirmation message: *You're in. Natasha reviews every profile — if there's a fit for something she's casting, you'll hear from the team directly. Watch your inbox for what's next.*

## Step 2 — Add the questions (15 min)

Drag fields on in this order. "Question title" is what the applicant sees (edit it on the question; it doesn't rename the field). Where a row has microcopy, paste it into the question's help text.

### Section 1 — Who you are (everyone)
| # | Field | Question title | Required | Help text |
|---|---|---|---|---|
| 1 | Name | Full name | ✅ | As it appears on your credits. |
| 2 | Email | Email | ✅ | |
| 3 | Phone | Phone | ✅ | Best number for booking-related calls. |
| 4 | City / Location | City you work from | ✅ | Where you can take same-week auditions. |
| 5 | **Lane** | I'm here as a… | ✅ | *(no help text — this drives the conditional sections)* |

### Section 2 — Actors only → on each field: *Show field only if… Lane is Actor*
| # | Field | Question title | Required | Help text |
|---|---|---|---|---|
| 6 | Headshot | Headshot | ✅ | High-res, recent, no heavy filters. |
| 7 | **Union (intake)** | Union status | ✅ | |
| 8 | Height | Height | ✅ | e.g. 5'7" |
| 9 | Hair Color | Hair color | ✅ | |
| 10 | Eye Color | Eye color | ✅ | |
| 11 | Ethnicity | Ethnicity | — | Used only for role matching. Select all that apply. |
| 12 | Measurements | Measurements | — | For wardrobe. Skip if you prefer. |
| 13 | Skills | Skills & special talents | ✅ | Sports, dance, dialects, instruments, stunts — the things that book you. |
| 14 | Representation Status | Do you have representation? | ✅ | On the question, limit visible options to **Repped** and **Self-Managed** only. |
| 15 | Representation Detail | Who represents you? | — | Agency and/or manager, with office if you know it. → *Show field only if… Representation Status is Repped* |

### Section 3 — Your level → *Show only if… Lane is Actor*
Add a section/text block first: *Pick where you honestly are today — then a few receipts so we can match you right.*

| # | Field | Question title | Required | Help text |
|---|---|---|---|---|
| 16 | Self-Selected Tier | Where are you today? | ✅ | Emerging — building credits · Established — steady work, notable projects · Premium — repped, big-budget credits, recognition |
| 17 | Years Active | Years acting professionally | ✅ | |
| 18 | Notable Projects / Brands | Notable projects or brands | — | Titles, networks, studios, brands — the ones you'd lead with. |
| 19 | Income Band (12mo, acting) | Acting income, last 12 months | — | Helps us recommend the right resources. Private, never shared. |

**Never add `Assessed Tier` to the form** — that's Natasha's field.

### Section 4 — Producers & investors → on each: *Show field only if… Lane is Producer/Director* **or** *Lane is Investor/Financier*
| # | Field | Question title | Required | Help text |
|---|---|---|---|---|
| 20 | Representation Detail | Company / fund | — | *(reused field; fine because Section 2's copy only shows for Actors)* |
| 21 | Notable Projects / Brands | What are you working on or funding? | ✅ | Stage, budget range, genre — whatever you can share. |
| 22 | Submission Notes | How do you like to collaborate? | — | |

### Section 5 — Where to find you (everyone)
| # | Field | Question title | Required |
|---|---|---|---|
| 23 | IMDb URL | IMDb | — |
| 24 | Website / Reel URL | Website or reel | — |
| 25 | Instagram | Instagram | — |
| 26 | YouTube / TikTok | YouTube / TikTok | — |

## Step 3 — The automation (5 min)

Automations tab → **+ Create automation** → name it **"Intake form → stamp defaults"**.

- **Trigger:** *When form submitted* → pick the form from Step 1.
- **Action:** *Update record* → Table: Talent → Record ID: the trigger record.
  Fields to update:
  | Field | Value |
  |---|---|
  | Source | **Intake Form** (link the existing Sources record) |
  | Data Confidence | **Unverified** |
  | Ecosystem Status | **New lead** |
  | Union Status | insert dynamic value → trigger record's **Union (intake)** |

  (The last one copies the select into the free-text `Union Status`, so the interface's **By Union** tabs cover intake actors too.)
- Turn the automation **ON**.

## Step 4 — Share + test (5 min)

1. Form → **Share** → enable link → copy. That link is the front door until the funnel site wraps it.
2. Submit one **test actor** (name it `ZZ TEST — DELETE ME`) with Lane = Actor, and one test with Lane = Producer/Director to check the conditional sections flip correctly.
3. Verify in Talent: both records exist with Source = Intake Form, Data Confidence = Unverified, Ecosystem Status = New lead, Union Status copied, Date Joined stamped.
4. Verify in the **Talent Search** interface page: search `ZZ TEST` finds it; the Lane and Data Confidence dropdowns filter it.
5. **Delete both test records.**

## Step 5 — Natasha's review view (5 min)

Talent grid → new view **"Needs review"**: filter `Assessed Tier` *is empty* **and** `Lane` *is Actor* **and** `Source` *contains* Intake Form, sort by Date Joined newest-first. She sets **Assessed Tier** + flips **Data Confidence → Verified** per record; casting searches filter on Assessed Tier only, so inflated self-selects never pollute a search.

---

*Later (funnel-site version): same fields, phone-first, branded per the design artifact; adds lead-magnet delivery, UTM capture, reCAPTCHA — see `intake-form-spec.md` §4.*
