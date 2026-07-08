# Airtable AI (Omni) build prompt — The Casting Ward

**How to use:** Open Airtable → create a new base → open the AI/Omni assistant (the "Build with AI" / Omni panel) → paste everything in the box below as one message. After it builds the structure, import your CSVs into the matching tables (map `Headshot` → the Attachment field). If Omni builds it in pieces, paste one table section at a time.

---

## ▼▼▼ COPY FROM HERE ▼▼▼

Build a talent-management database called **The Casting Ward** for a Hollywood casting director. It stores actors and industry contacts, the projects/roles they were submitted for, and who represents them. Create the following tables with exactly these fields and field types, then create the links and views described at the end.

**TABLE 1 — "Talent"** (one row per person; this is the core table)
- Name — Single line text (primary field)
- Stage Name — Single line text
- Email — Email
- Secondary Email — Email
- Phone — Phone number
- Best Contact — Single select: Email, Text, Phone, Through Rep
- City — Single line text
- State/Region — Single line text
- Country — Single line text
- Website — URL
- Headshot — Attachment
- Persona — Multiple select: Actor, Producer, Director, Writer, Financier/Investor, Crew, Other
- Self-Selected Tier — Single select: Emerging, Working, Established, Premium
- Assessed Tier — Single select: Emerging, Working, Established, Premium
- Data Confidence — Single select: Verified, Likely, Unconfirmed
- Money Tier — Single select: No Budget, Some Budget, Buyer, Investor-Level
- Ecosystem Status — Single select: Lead, Opted-In, Community Member, Client, Collaborator
- Union Status — Single select: SAG-AFTRA, SAG-Eligible, Non-Union, Unknown
- Representation Status — Single select: Repped, Seeking, Self-Managed, Unknown
- Years Active — Number (integer)
- Income Range — Single select: Under $25k, $25k–$100k, $100k–$500k, $500k+, Prefer not to say
- Skills — Multiple select (start empty)
- Age Range — Single line text
- Gender — Single line text
- Ethnicity — Single line text
- IMDb URL — URL
- Actors Access URL — URL
- Reel URL — URL
- Instagram — Single line text
- YouTube — Single line text
- TikTok — Single line text
- Engagement Status (BE) — Multiple select: Unviewed, Viewed, Selected, Not Scheduled, Scheduled, Callback
- Submission Notes — Long text
- Notes — Long text
- BE Resume ID — Single line text
- BE Submission IDs — Single line text
- BE Appearances Count — Number (integer)
- First Contact — Date
- Last Interaction — Date
- Date Added — Created time
- Tags — Multiple select (start empty)

**TABLE 2 — "Credits"** (notable work; one row per credit)
- Title — Single line text (primary field)
- Type — Single select: Film, TV, Streaming, Commercial, Theater, Web, Other
- Character / Role — Single line text
- Role Level — Single select: Lead, Supporting, Co-Star, Guest Star, Recurring, Featured, Background
- Year — Number (integer)
- Network / Studio / Brand — Single line text
- Notable — Checkbox
- Link — URL

**TABLE 3 — "Representation"** (agents, managers, agencies)
- Company — Single line text (primary field)
- Type — Single select: Agent, Manager, Agency, Publicist
- Contact Name — Single line text
- Email — Email
- Phone — Phone number
- State — Single line text

**TABLE 4 — "Sources"** (where each contact came from)
- Source Name — Single line text (primary field)
- Type — Single select: Gmail, Breakdown Express, Event, Referral, Funnel Opt-In, Manual
- Date — Date
- Notes — Long text

**TABLE 5 — "Roles & Breakdowns"** (the casting director's projects and roles)
- Role — Single line text (primary field)
- Project — Single line text
- Breakdown Title — Single line text
- Type — Single select: Feature Film, Short, Episodic, Reality TV, Staged Reading, Commercial, Other
- Description — Long text
- Requirements — Long text
- Status — Single select: Open, Filled, On Hold, Archived
- Published — Date
- Deadline — Date
- BE Breakdown ID — Single line text
- BE Project ID — Single line text

**TABLE 6 — "Interactions"** (touchpoint log)
- Summary — Single line text (primary field)
- Date — Date
- Type — Single select: Email, Call, Meeting, Audition, Booking, Workshop, Event
- Notes — Long text

**LINKS between tables (create these as "Link to another record" fields):**
- Talent ↔ Representation (a talent has one or more reps; a rep serves many talent)
- Talent ↔ Sources (each talent has a source; a source has many talent)
- Talent ↔ Credits (a talent has many credits)
- Talent ↔ Interactions (a talent has many interactions)
- Roles & Breakdowns → Talent, as a field called "Submitted" (many talent submitted to a role)
- Roles & Breakdowns → Talent, as a field called "Shortlist" (many talent shortlisted for a role)

**VIEWS to create on the Talent table:**
1. "⭐ Premium Actors" — filter: Persona has any of Actor AND Assessed Tier is Premium; sort by Last Interaction descending.
2. "📞 Advanced by Natasha" — filter: Engagement Status (BE) has any of Selected, Scheduled, Callback.
3. "🧐 Needs Review" — filter: Data Confidence is Unconfirmed.
4. "💼 Producers & Investors" — filter: Persona has any of Producer, Financier/Investor.
5. "🆕 New This Week" — filter: Date Added is within the past 7 days.
6. "🎬 Full Casting Search" — no filter; group by Assessed Tier.

## ▲▲▲ COPY TO HERE ▲▲▲

---

**After Omni builds it:** import `castingward-talent-SELECTED.csv` into the **Talent** table (⚙ / "+" → Import CSV → map columns to the fields above; map the `Headshot` column to the Headshot **Attachment** field so Airtable pulls in the images). The `Representation` and `Source` text values will auto-create linked records.
