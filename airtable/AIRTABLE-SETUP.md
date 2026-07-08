# Airtable Setup Guide — The Casting Ward

Follow these steps in order. Total time: ~45 minutes. The 6 CSV files each become one table; the two SAMPLE rows in each show Airtable what kind of data goes where — **keep them until Step 4 is done**, then delete them.

---

## Step 0 — Account & plan

1. Sign in (or create an account) at airtable.com — use whichever account Natasha will own long-term.
2. **Upgrade the workspace to the Team plan (~$20/user/month).** Required: the free plan caps at 1,000 records per base, and the Breakdown Express history alone will be many times that. Team allows 50,000 records per base.

## Step 1 — Create the base

1. From the Airtable home screen: **Create** → **Start from scratch**.
2. Name it **The Casting Ward**.
3. It opens with an empty "Table 1" — you'll replace it in Step 2.

## Step 2 — Import the 6 CSVs (in number order)

For each file `1-talent.csv` → `6-interactions.csv`:

1. Click the **+** next to the table tabs (top left) → **Import data** → **CSV file**.
2. Choose the file → confirm **"First row is headers"** is ON → Import.
3. Rename the new table (double-click its tab):
   - `1-talent.csv` → **Talent**
   - `2-credits.csv` → **Credits**
   - `3-representation.csv` → **Representation**
   - `4-sources.csv` → **Sources**
   - `5-roles-breakdowns.csv` → **Roles & Breakdowns**
   - `6-interactions.csv` → **Interactions**
4. After all 6 are in, right-click the original empty **Table 1** → Delete table.

## Step 3 — Set field types

Airtable imports everything as text. Change field types by clicking a column header → **Edit field** → pick the type. When converting to *Single select* / *Multiple select*, Airtable auto-creates the options from the sample values — accept them, then add the extra options listed below.

### Talent table

| Field | Type | Options to have |
|---|---|---|
| Best Contact | Single select | Email · Text · Phone · Through Rep |
| Persona | **Multiple** select | Actor · Producer · Director · Writer · Financier/Investor · Crew · Other |
| Self-Selected Tier | Single select | Emerging · Working · Established · Premium |
| Assessed Tier | Single select | Emerging · Working · Established · Premium |
| Data Confidence | Single select | Verified · Likely · Unconfirmed |
| Money Tier | Single select | No Budget · Some Budget · Buyer · Investor-Level |
| Ecosystem Status | Single select | Lead · Opted-In · Community Member · Client · Collaborator |
| Union Status | Single select | SAG-AFTRA · SAG-Eligible · Non-Union · Unknown |
| Representation Status | Single select | Repped · Seeking · Self-Managed · Unknown |
| Years Active | Number (integer) | |
| Income Range | Single select | Under $25k · $25k–$100k · $100k–$500k · $500k+ · Prefer not to say |
| Skills | Multiple select | (grows automatically) |
| Favorite (BE) | Checkbox | |
| Engagement Status (BE) | **Multiple** select | Unviewed · Viewed · Selected · Not Scheduled · Scheduled · Callback |
| Submission Notes / Notes | Long text | |
| First Contact / Last Interaction | Date | |
| Tags | Multiple select | |
| IMDb URL … Other Social, Website | URL | |
| Phone | Phone number | |
| Email / Secondary Email | Email | |

Then add two fields that can't come from CSV:
- **+ Add field → Attachment** → name it **Headshot**
- **+ Add field → Created time** → name it **Date Added**

### Credits table
Type → Single select (Film · TV · Streaming · Commercial · Theater · Web · Other) · Role Level → Single select (Lead · Supporting · Co-Star · Guest Star · Recurring · Featured · Background) · Year → Number · Notable → Checkbox · Link → URL.

### Representation table
Type → Single select (Agent · Manager · Agency · Publicist) · Email → Email · Phone → Phone.

### Sources table
Type → Single select (Gmail · Breakdown Express · Event · Referral · Funnel Opt-In · Manual) · Date → Date.

### Roles & Breakdowns table
Type → Single select (Feature Film · Short · Episodic · Reality TV · Staged Reading · Commercial · Other) · Status → Single select (Open · Filled · On Hold · Archived) · Published / Deadline → Date · Description / Requirements → Long text.

### Interactions table
Type → Single select (Email · Call · Meeting · Audition · Booking · Workshop · Event) · Date → Date.

## Step 4 — Connect the tables (linked records)

Airtable's magic trick: converting a text field to **"Link to another record"** automatically matches (or creates) records in the other table by name. Do these conversions:

| Table | Field | Convert to → Link to |
|---|---|---|
| Talent | Representation | Representation table |
| Talent | Source | Sources table |
| Credits | Talent | Talent table |
| Representation | Talent | Talent table (allow linking to multiple) |
| Sources | Talent | Talent table (allow linking to multiple) |
| Roles & Breakdowns | Shortlist | Talent table (allow multiple) |
| Roles & Breakdowns | Submitted | Talent table (allow multiple) |
| Interactions | Talent | Talent table |

Airtable auto-adds the reverse column on the other side (e.g. Talent gets a "Credits" column). ✅ **Now delete every row starting with "SAMPLE —"** in all 6 tables (the linked sample records too).

## Step 5 — Create the saved Views (on the Talent table)

Click **Grid view** dropdown (top left) → **Create new grid view** for each:

| View name | Filter | Extra |
|---|---|---|
| ⭐ Premium Actors | Persona *has any of* Actor **AND** Assessed Tier *is* Premium | Sort by Last Interaction ↓ |
| 📞 Advanced by Natasha (BE) | Engagement Status (BE) *has any of* Selected, Scheduled, Callback | |
| 🧐 Needs Review | Data Confidence *is* Unconfirmed | |
| 💼 Producers & Investors | Persona *has any of* Producer, Financier/Investor | |
| 🆕 New This Week | Date Added *is within* the past week | |
| 🎬 Full Casting Search | (no filter) | Group by Assessed Tier |

These are the "dynamic lists" — every future search is a filter here instead of a memory exercise.

## Done. What happens next

- The **Breakdown Express crawl** and **Gmail extraction** will arrive as CSVs formatted to these exact columns — import them via each table's **⚙ → Import data → CSV**, mapped to existing fields.
- The **intake form** (Airtable native form on the Talent table) writes new people in automatically, pre-sorted.
