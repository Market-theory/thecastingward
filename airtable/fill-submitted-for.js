/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — SUBMITTED-FOR BACKFILL (Airtable Scripting extension)
 * ═══════════════════════════════════════════════════════════════════
 *  Reads each actor's Submission Notes (e.g. "NATE (bd 78762) | TEDDY
 *  (bd 78762)"), creates one record per unique role in the
 *  Roles & Breakdowns table, and links actors via the "Submitted For"
 *  field. Natasha can then click a role → see everyone submitted.
 *
 *  Fully self-contained — no imports, no external data. Safe to re-run
 *  (skips actors already linked).
 *
 *  ▶ Extensions → Scripting → clear editor → paste → ▶ Run.
 *    ~20k actors: allow a few minutes; progress prints as it goes.
 */
const talent = base.getTable('Talent');
const roles = base.getTable('Roles & Breakdowns');

// 1) Existing role records → label map (Role Name is the unique label)
const roleQ = await roles.selectRecordsAsync({ fields: ['Role Name'] });
const roleIds = {};
for (const r of roleQ.records) roleIds[r.getCellValueAsString('Role Name').trim()] = r.id;

// 2) Read every actor's Submission Notes; collect labels + links
const tq = await talent.selectRecordsAsync({ fields: ['Submission Notes', 'Submitted For'] });
const parse = (notes) => {
  const out = [];
  const re = /([^|]+?)\s*\((bd\s*\d+)\)/g;
  let m;
  while ((m = re.exec(notes)) !== null) out.push(m[1].trim() + ' (' + m[2].trim() + ')');
  return [...new Set(out)];
};

const wanted = new Set();
const actorLabels = [];
for (const rec of tq.records) {
  const existing = rec.getCellValue('Submitted For');
  if (existing && existing.length > 0) continue; // already linked
  const labels = parse(rec.getCellValueAsString('Submission Notes'));
  if (labels.length) {
    actorLabels.push({ id: rec.id, labels });
    labels.forEach((l) => { if (!roleIds[l]) wanted.add(l); });
  }
}

// 3) Create missing role records (batched)
const toCreate = [...wanted];
output.markdown(`Creating **${toCreate.length}** role records…`);
while (toCreate.length > 0) {
  const batch = toCreate.splice(0, 50);
  const created = await roles.createRecordsAsync(batch.map((l) => ({
    fields: { 'Role Name': l, 'Breakdown/Description': 'Imported from Breakdown Express submission history' },
  })));
  batch.forEach((l, i) => { roleIds[l] = created[i]; });
}

// 4) Link actors → roles (batched)
output.markdown(`Linking **${actorLabels.length}** actors to their roles…`);
let done = 0;
const updates = actorLabels.map((a) => ({
  id: a.id,
  fields: { 'Submitted For': a.labels.map((l) => ({ id: roleIds[l] })).filter((x) => x.id) },
}));
while (updates.length > 0) {
  await talent.updateRecordsAsync(updates.splice(0, 50));
  done += 50;
  if (done % 2000 === 0) output.markdown(`…${done} linked`);
}
output.markdown(`✅ **Done.** Click any record in Roles & Breakdowns to see everyone submitted for it.`);
