/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — HEADSHOT FILLER (Airtable Scripting extension)
 * ═══════════════════════════════════════════════════════════════════
 *  Turns the "Headshot URL" text column into real attached images in
 *  the "Headshot" field, for every Talent record. Runs INSIDE Airtable
 *  (on Airtable's servers), so there are no network limits and it does
 *  all 20,785 records on its own, 50 at a time.
 *
 *  ▶ HOW TO RUN:
 *    1. Open the base → Extensions (top-right) → + Add extension →
 *       "Scripting" → Add.
 *    2. Click into the Scripting panel, delete any sample code, paste
 *       this whole file, press ▶ Run.
 *    3. Watch the log. It reports progress every batch and a final count.
 *       Safe to re-run — it skips records that already have a headshot.
 */
const TABLE = 'Talent';
const URL_FIELD = 'Headshot URL';
const ATTACH_FIELD = 'Headshot';

const table = base.getTable(TABLE);
const query = await table.selectRecordsAsync({ fields: [URL_FIELD, ATTACH_FIELD] });

// Build the list of records that have a URL but no image yet.
const updates = [];
for (const rec of query.records) {
  const url = rec.getCellValueAsString(URL_FIELD).trim();
  const existing = rec.getCellValue(ATTACH_FIELD);
  if (url && (!existing || existing.length === 0)) {
    updates.push({ id: rec.id, fields: { [ATTACH_FIELD]: [{ url }] } });
  }
}

output.markdown(`**${updates.length}** records need a headshot (of ${query.records.length} total).`);

// Airtable caps updates at 50 records per call — loop in batches.
let done = 0;
while (updates.length > 0) {
  const batch = updates.splice(0, 50);
  await table.updateRecordsAsync(batch);
  done += batch.length;
  if (done % 500 === 0 || updates.length === 0) {
    output.markdown(`…attached ${done} headshots`);
  }
}
output.markdown(`✅ **Done — ${done} headshots attached.** Airtable will finish downloading the images in the background over the next few minutes.`);
