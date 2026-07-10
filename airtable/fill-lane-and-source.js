/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — FILL LANE + SOURCE (Airtable Scripting extension)
 * ═══════════════════════════════════════════════════════════════════
 *  Two backfills in one pass over the Talent table:
 *
 *  1. LANE — the old "Persona" select got its choice list polluted by
 *     the failed CSV merge (7,000+ junk options), so a clean "Lane"
 *     field replaces it. This copies each record's Persona value into
 *     Lane ("Actor" for everyone except the ones marked "Other").
 *
 *  2. SOURCE — links every Breakdown Express record (anything with a
 *     BE Resume ID) to the "Breakdown Express" record in the Sources
 *     table, so provenance filtering works once Gmail + intake-form
 *     records start arriving.
 *
 *  Only records missing a value get written — it never overwrites.
 *
 *  ▶ HOW TO RUN:
 *    Extensions → Scripting → clear the editor → paste this → ▶ Run.
 *    Updates in batches of 50 (~20,800 records ≈ a few minutes).
 *    Safe to re-run (finds 0 to change the second time).
 *
 *  ▶ AFTER IT FINISHES: the old "Persona" field is no longer needed.
 *    Right-click its column header in the Talent grid → Delete field.
 */
const table = base.getTable('Talent');
const sources = base.getTable('Sources');

// Find the "Breakdown Express" source record to link to.
const srcQuery = await sources.selectRecordsAsync({ fields: ['Source'] });
const beSource = srcQuery.records.find(
  r => r.getCellValueAsString('Source') === 'Breakdown Express'
);
if (!beSource) {
  throw new Error('No "Breakdown Express" record found in the Sources table — create it first.');
}

const query = await table.selectRecordsAsync({
  fields: ['Persona', 'Lane', 'Source', 'BE Resume ID'],
});

const updates = [];
for (const r of query.records) {
  const fields = {};

  // 1. Lane ← Persona (default "Actor"), only where Lane is empty.
  if (!r.getCellValue('Lane')) {
    const persona = r.getCellValueAsString('Persona');
    fields['Lane'] = { name: persona === 'Other' ? 'Other' : 'Actor' };
  }

  // 2. Source ← Breakdown Express for BE records with no source yet.
  const isBE = r.getCellValueAsString('BE Resume ID').trim() !== '';
  const src = r.getCellValue('Source');
  if (isBE && (!src || src.length === 0)) {
    fields['Source'] = [{ id: beSource.id }];
  }

  if (Object.keys(fields).length > 0) updates.push({ id: r.id, fields });
}

output.markdown(`Found **${updates.length}** records to update (of ${query.records.length}).`);

let done = 0;
while (updates.length > 0) {
  await table.updateRecordsAsync(updates.splice(0, 50));
  done += 50;
  if (done % 2000 === 0) output.text(`…${done} done`);
}
output.markdown(`✅ **Done.** Lane + Source are backfilled. You can now delete the old "Persona" field.`);
