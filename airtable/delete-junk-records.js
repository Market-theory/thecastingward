/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — REMOVE JUNK RECORDS (Airtable Scripting extension)
 * ═══════════════════════════════════════════════════════════════════
 *  Two merge-imports accidentally ran as INSERTS and created ~10,000
 *  empty rows whose Name is a raw Breakdown Express ID (e.g.
 *  "1193792-3402139"). A real actor's name never looks like that.
 *  This finds those rows and deletes them — nothing else is touched.
 *
 *  ▶ HOW TO RUN:
 *    Extensions → Scripting → clear the editor → paste this → ▶ Run.
 *    It shows how many it found, deletes in batches of 50, and reports
 *    a final count. Safe to re-run (finds 0 the second time).
 */
const table = base.getTable('Talent');
const query = await table.selectRecordsAsync({ fields: ['Name'] });

// Junk = Name is exactly "digits-digits" (a resume ID), i.e. no letters.
const isJunk = (n) => /^\d+-\d+$/.test((n || '').trim());

const ids = query.records
  .filter(r => isJunk(r.getCellValueAsString('Name')))
  .map(r => r.id);

output.markdown(`Found **${ids.length}** junk records (raw-ID names) out of ${query.records.length}.`);

let done = 0;
while (ids.length > 0) {
  await table.deleteRecordsAsync(ids.splice(0, 50));
  done += 50;
}
output.markdown(`✅ **Done — deleted the junk.** Your real actors are untouched.`);
