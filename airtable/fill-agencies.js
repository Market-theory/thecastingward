/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — AGENCY BACKFILL (single script, file-upload version)
 * ═══════════════════════════════════════════════════════════════════
 *  Links each actor to their agency (Representation table), matching
 *  by BE Resume ID. When you press Run it asks you to upload
 *  IMPORT-agency-merge.csv — the file Claude sent earlier (check your
 *  Downloads). Creates agency records as needed. Safe to re-run.
 *
 *  ▶ Extensions → Scripting → clear editor → paste → ▶ Run → pick file.
 */
const picked = await input.fileAsync('Upload IMPORT-agency-merge.csv', {
  allowedFileTypes: ['.csv'],
  hasHeaderRow: true,
});

// rows come in as objects keyed by the CSV headers
const rows = picked.parsedContents;
const DATA = {};
for (const r of rows) {
  const rid = String(r['BE Resume ID'] || '').trim();
  const agency = String(r['Agency'] || '').trim();
  if (rid && agency) DATA[rid] = agency;
}
output.markdown(`Loaded **${Object.keys(DATA).length}** actor→agency mappings from the file.`);

const talent = base.getTable('Talent');
const reps = base.getTable('Representation');

// 1) Ensure agency records exist; build name → recordId map
const repQ = await reps.selectRecordsAsync({ fields: ['Name'] });
const repIds = {};
for (const r of repQ.records) repIds[r.getCellValueAsString('Name').trim()] = r.id;

const needed = [...new Set(Object.values(DATA))].filter((n) => !repIds[n]);
output.markdown(`Creating **${needed.length}** new agency records…`);
while (needed.length > 0) {
  const batch = needed.splice(0, 50);
  const created = await reps.createRecordsAsync(batch.map((n) => ({ fields: { Name: n } })));
  batch.forEach((n, i) => { repIds[n] = created[i]; });
}

// 2) Link talent → agency by BE Resume ID (skips actors already linked)
const tq = await talent.selectRecordsAsync({ fields: ['BE Resume ID', 'Representation'] });
const updates = [];
for (const rec of tq.records) {
  const rid = rec.getCellValueAsString('BE Resume ID').trim();
  const agency = DATA[rid];
  const existing = rec.getCellValue('Representation');
  if (agency && repIds[agency] && (!existing || existing.length === 0)) {
    updates.push({ id: rec.id, fields: { Representation: [{ id: repIds[agency] }] } });
  }
}
output.markdown(`Linking **${updates.length}** actors to their agency…`);
let done = 0;
while (updates.length > 0) {
  await talent.updateRecordsAsync(updates.splice(0, 50));
  done += 50;
  if (done % 2000 === 0) output.markdown(`…${done} linked`);
}
output.markdown('✅ **Agencies done.** Click any agency in the Representation table to see its actors.');
