# Airtable AI build prompts — The Casting Ward

## ★ OPTION A — Cobuilder ("Let's build your app together" screen)

This screen builds the whole app from ONE prompt and can import your data at the same time. Do this:

1. Click **Import spreadsheets** → add **`castingward-talent-SELECTED.csv`**. (This becomes the Talent table, with the images.)
2. Paste the prompt below into the **"Tell me what you want to build…"** box.
3. Click **Build it**.

**Paste this:**
```
Build a talent-management app for a Hollywood casting director called The Casting Ward. Use the spreadsheet I imported as the main "Talent" table — one row per actor (it has name, headshot, agency/representation status, engagement status, Actors Access link, and notes).

Also create these related tables and link each to Talent:
- Representation — agencies/managers: Company, Type (Agent/Manager/Agency/Publicist), Contact Name, Email, Phone.
- Sources — where a contact came from: Source Name, Type (Gmail, Breakdown Express, Event, Referral, Funnel Opt-In, Manual), Date, Notes.
- Credits — an actor's notable work: Title, Type (Film/TV/Streaming/Commercial/Theater), Character, Role Level (Lead/Supporting/Co-Star/Guest Star/Recurring/Featured/Background), Year, Network or Studio, Notable (checkbox).
- Roles & Breakdowns — the director's projects and roles: Role, Project, Type (Feature Film/Short/Episodic/Reality TV), Description, Status (Open/Filled/On Hold), plus two links to Talent named "Submitted" and "Shortlist".
- Interactions — a contact log: Date, Type (Email/Call/Meeting/Audition/Booking/Workshop), Summary, linked to Talent.

On the Talent table, add any of these fields that aren't already there: Persona (multiple select: Actor, Producer, Director, Writer, Financier/Investor), Assessed Tier (single select: Emerging, Working, Established, Premium), Data Confidence (single select: Verified, Likely, Unconfirmed), Money Tier (single select: No Budget, Some Budget, Buyer, Investor-Level), Ecosystem Status (single select: Lead, Opted-In, Community Member, Client, Collaborator).

Create these views on Talent: "Premium Actors" (Persona is Actor and Assessed Tier is Premium); "Advanced by Natasha" (Engagement Status is Selected, Scheduled, or Callback); "Needs Review" (Data Confidence is Unconfirmed); "Producers & Investors" (Persona is Producer or Financier/Investor); "Full Casting Search" grouped by Assessed Tier.
```

If that's still too long for the box, delete the "Create these views" paragraph and add the views afterward using Option B step ⑫.

---

## OPTION B — small refine-chat (Omni), one prompt at a time

If you're in the smaller AI chat *inside* a base (not the Cobuilder screen), paste these **one at a time, in order**. Steps 1–5 build the Talent table; 6–10 add the other tables; 11 links them; 12 makes the views.

---

**① Talent — identity**
```
Create a table named Talent. Add fields: Name (single line text, primary field); Stage Name (single line text); Email (email); Secondary Email (email); Phone (phone number); Best Contact (single select: Email, Text, Phone, Through Rep); City (single line text); State/Region (single line text); Country (single line text); Website (URL); Headshot (attachment).
```

**② Talent — categorization**
```
In the Talent table add these fields: Persona (multiple select: Actor, Producer, Director, Writer, Financier/Investor, Crew, Other); Self-Selected Tier (single select: Emerging, Working, Established, Premium); Assessed Tier (single select: Emerging, Working, Established, Premium); Data Confidence (single select: Verified, Likely, Unconfirmed); Money Tier (single select: No Budget, Some Budget, Buyer, Investor-Level); Ecosystem Status (single select: Lead, Opted-In, Community Member, Client, Collaborator).
```

**③ Talent — actor details**
```
In the Talent table add these fields: Union Status (single select: SAG-AFTRA, SAG-Eligible, Non-Union, Unknown); Representation Status (single select: Repped, Seeking, Self-Managed, Unknown); Years Active (number, integer); Income Range (single select: Under $25k, $25k-$100k, $100k-$500k, $500k+, Prefer not to say); Skills (multiple select, no options yet); Age Range (single line text); Gender (single line text); Ethnicity (single line text).
```

**④ Talent — links & socials**
```
In the Talent table add these fields: IMDb URL (URL); Actors Access URL (URL); Reel URL (URL); Instagram (single line text); YouTube (single line text); TikTok (single line text).
```

**⑤ Talent — status & meta**
```
In the Talent table add these fields: Engagement Status (BE) (multiple select: Unviewed, Viewed, Selected, Not Scheduled, Scheduled, Callback); Submission Notes (long text); Notes (long text); BE Resume ID (single line text); BE Submission IDs (single line text); BE Appearances Count (number, integer); First Contact (date); Last Interaction (date); Date Added (created time); Tags (multiple select, no options yet).
```

**⑥ Credits table**
```
Create a table named Credits with fields: Title (single line text, primary field); Type (single select: Film, TV, Streaming, Commercial, Theater, Web, Other); Character / Role (single line text); Role Level (single select: Lead, Supporting, Co-Star, Guest Star, Recurring, Featured, Background); Year (number, integer); Network / Studio / Brand (single line text); Notable (checkbox); Link (URL).
```

**⑦ Representation table**
```
Create a table named Representation with fields: Company (single line text, primary field); Type (single select: Agent, Manager, Agency, Publicist); Contact Name (single line text); Email (email); Phone (phone number); State (single line text).
```

**⑧ Sources table**
```
Create a table named Sources with fields: Source Name (single line text, primary field); Type (single select: Gmail, Breakdown Express, Event, Referral, Funnel Opt-In, Manual); Date (date); Notes (long text).
```

**⑨ Roles & Breakdowns table**
```
Create a table named Roles & Breakdowns with fields: Role (single line text, primary field); Project (single line text); Breakdown Title (single line text); Type (single select: Feature Film, Short, Episodic, Reality TV, Staged Reading, Commercial, Other); Description (long text); Requirements (long text); Status (single select: Open, Filled, On Hold, Archived); Published (date); Deadline (date); BE Breakdown ID (single line text); BE Project ID (single line text).
```

**⑩ Interactions table**
```
Create a table named Interactions with fields: Summary (single line text, primary field); Date (date); Type (single select: Email, Call, Meeting, Audition, Booking, Workshop, Event); Notes (long text).
```

**⑪ Link the tables**
```
Create these Link to another record fields: In Talent add a link to Representation. In Talent add a link to Sources. In Credits add a link to Talent. In Interactions add a link to Talent. In Roles & Breakdowns add a link to Talent named Submitted. In Roles & Breakdowns add a second, separate link to Talent named Shortlist.
```

**⑫ Create the views (on Talent)**
```
On the Talent table create these grid views: "Premium Actors" filtered where Persona has any of Actor and Assessed Tier is Premium; "Advanced by Natasha" filtered where Engagement Status (BE) has any of Selected, Scheduled, Callback; "Needs Review" filtered where Data Confidence is Unconfirmed; "Producers & Investors" filtered where Persona has any of Producer, Financier/Investor; "New This Week" filtered where Date Added is within the past week; "Full Casting Search" with no filter, grouped by Assessed Tier.
```

---

**After it's built:** import `castingward-talent-SELECTED.csv` into the **Talent** table → map the `Headshot` column to the Headshot **Attachment** field so the photos pull in. The `Representation` and `Source` text values auto-create linked records.

If any step fails or Omni still says a prompt is too long, tell me which number and I'll split it further.
