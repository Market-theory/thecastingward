/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — RESUME ENRICHMENT CRAWLER (Tier 2)
 * ═══════════════════════════════════════════════════════════════════
 *  Visits each actor's Actors Access resume and pulls the searchable
 *  detail: union, height, weight, skills/talents, vocal range, reps,
 *  (and age/location where present). Read-only; changes nothing.
 *
 *  ▶ THIS IS A TEST BATCH (20 actors). It downloads a CSV + a debug
 *    file so Claude can confirm the resume URL + parsing work before
 *    the full run. Upload BOTH files back to Claude.
 *
 *  HOW TO RUN:
 *  1. Chrome, logged into casting.breakdownexpress.com, on any page.
 *  2. F12 (Mac: Cmd+Option+J) → Console. Type  allow pasting  if warned.
 *  3. Paste this whole file, press Enter. Wait ~30 sec.
 */
(async () => {
  const DELAY_MS = 800;

  // TEST batch — 20 real resume IDs from her Selected talent:
  const RESUME_IDS = ["249603-553707","123330-664409","231724-547714","306990-717823","235207-696846","268079-606027","325525-770754","276897-631325","321600-759186","321345-758436","237709-675560","327861-777621","332390-790329","138278-664166","317114-746271","305766-714647","118044-645698","316326-743969","263136-591506","301527-702613"];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) =>
    (s || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'")
      .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  // Try a couple of URL shapes; return the first that renders a resume.
  async function getResume(rid) {
    const urls = [
      "/talentsearch/onepageresume/" + rid,
      "/talentsearch/onepageresume/" + rid + "?view=breakdowns&action=role",
    ];
    for (const u of urls) {
      try {
        const r = await fetch(u, { credentials: "include", redirect: "follow" });
        const h = await r.text();
        if (/Physical Characteristics|Résumé|Resume|Represented by/i.test(h)) return { url: u, status: r.status, html: h };
      } catch (e) {}
    }
    return { url: urls[0], status: 0, html: "" };
  }

  function parse(h, rid) {
    const title = (h.match(/<title>(.*?)<\/title>/) || [])[1] || "";
    const name = clean(title.split(" - ")[0]);
    const union = clean((h.match(/class="union"[^>]*>([\s\S]*?)<\/span>/) || [])[1]).replace(/^-\s*/, "");
    const height = clean((h.match(/Height\s*:?\s*<[^>]*>?\s*([^<\n]{1,12})/i) || [])[1]);
    const weight = clean((h.match(/Weight\s*:?\s*<[^>]*>?\s*([^<\n]{1,14})/i) || [])[1]);
    // reps: text right after "Represented by" up to the first résumé section
    const repsBlock = (h.match(/Represented by([\s\S]*?)(Commercials|Film|Television|Theatre|Training|Physical)/i) || [])[1] || "";
    const reps = clean(repsBlock).replace(/^:\s*/, "").slice(0, 200);
    // physical/skills block: everything between "Measurements" and the footer
    const physBlock = (h.match(/Physical Characteristics[\s\S]*?Measurements([\s\S]*?)(Powered by|<\/div>\s*<\/div>\s*<\/body>|$)/i) || [])[1] || "";
    let phys = clean(physBlock);
    // strip the height/weight we already captured, keep skills + vocal
    let skills = phys.replace(/Height\s*:?\s*[^ ]+["']?/i, "").replace(/Weight\s*:?\s*\d+\s*lbs/i, "").trim();
    const vocal = clean(((skills.match(/Vocal[^,]*(?:,\s*Vocal[^,]*)?/i) || [])[0]) || "");
    skills = skills.replace(/,?\s*Vocal[\s\S]*$/i, "").replace(/^[,\s]+|[,\s]+$/g, "");
    return { resumeId: rid, name, union, height, weight, skills, vocal, reps };
  }

  console.log("🎬 Enrichment TEST: fetching " + RESUME_IDS.length + " resumes…");
  const out = [];
  const rawSamples = [];
  let i = 0;
  for (const rid of RESUME_IDS) {
    const res = await getResume(rid);
    if (rawSamples.length < 2 && res.html) rawSamples.push({ rid, url: res.url, status: res.status, html: res.html.slice(0, 40000) });
    out.push(res.html ? parse(res.html, rid) : { resumeId: rid, name: "", union: "", height: "", weight: "", skills: "", vocal: "", reps: "", _error: "no resume (status " + res.status + ")" });
    i++;
    if (i % 5 === 0) console.log("   …" + i + "/" + RESUME_IDS.length);
    await sleep(DELAY_MS);
  }

  const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const cols = ["BE Resume ID", "Name", "Union Status", "Height", "Weight", "Skills", "Vocal Range", "Representation Detail"];
  const rows = [cols.map(q).join(",")];
  for (const r of out)
    rows.push([r.resumeId, r.name, r.union, r.height, r.weight, r.skills, r.vocal, r.reps].map(q).join(","));

  const dl = (name, text, type) => {
    const b = new Blob([text], { type }); const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  };
  dl("castingward-enrich-TEST.csv", rows.join("\n"), "text/csv");
  dl("castingward-enrich-debug.json", JSON.stringify({ parsed: out, rawSamples }, null, 2), "application/json");
  console.log("🎉 Done! Downloaded castingward-enrich-TEST.csv + castingward-enrich-debug.json — upload BOTH to Claude.");
})();
