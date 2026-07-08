/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — BREAKDOWN EXPRESS RECON v2
 * ═══════════════════════════════════════════════════════════════════
 *  Auto-fetches (read-only, changes nothing):
 *   1. ALL pages of the breakdown/project catalog (stops when empty)
 *   2. Her Favorites Lists (the curated talent)
 *   3. A probe of the talent data-feed
 *  Downloads ONE file: castingward-recon2.json  →  upload it to Claude.
 *
 *  RUN IT (same as last time):
 *  1. Chrome, logged into casting.breakdownexpress.com, on any page.
 *  2. F12  (Mac: Cmd+Option+J)  →  click "Console".
 *  3. If warned, type   allow pasting   (lowercase) + Enter.
 *  4. Paste this whole file, press Enter.
 *  5. Wait ~40 sec for "🎉 Done!" and the download. Upload the json.
 */
(async () => {
  const out = { tool: "castingward-recon2", version: 2, ranFrom: location.href, captured: {} };
  const clip = (s) => (s.length > 800_000 ? s.slice(0, 800_000) + "\n<!--TRUNCATED-->" : s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function grab(name, url) {
    try {
      const r = await fetch(url, { credentials: "include", redirect: "follow" });
      const text = await r.text();
      out.captured[name] = { url, finalUrl: r.url, status: r.status, html: clip(text) };
      console.log(`✅ ${name} (HTTP ${r.status}, ${text.length} chars)`);
      return text;
    } catch (e) {
      out.captured[name] = { url, error: String(e) };
      console.log(`⚠️ ${name} — ${e}`);
      return "";
    }
  }

  console.log("🎬 Recon v2 starting — this takes ~40 seconds…");

  // 1. Walk the breakdown catalog, page by page, until a page has no breakdowns.
  const base =
    "/projects/?view=breakdowns&action=list&projects=current&website=1,2,3&project_order=date.down&project_id=0&schedule=0";
  for (let page = 1; page <= 25; page++) {
    const html = await grab(`projects_page_${page}`, `${base}&page=${page}`);
    const count = (html.match(/breakdown=\d+/g) || []).length;
    await sleep(1200);
    if (count === 0) {
      console.log(`   (page ${page} empty — catalog ends here)`);
      break;
    }
  }

  // 2. Favorites lists: the index of all lists, then each known list detail.
  await grab("lists_index", "/lists/index.cfm?action=listview");
  await sleep(1200);
  for (const id of [52605, 52656, 52659, 52660, 52674]) {
    await grab(`favlist_${id}`, `/lists/index.cfm?action=detailview&search_favorites_list_id_list=${id}`);
    await sleep(1200);
  }

  // 3. Probe the talent data-feed (best effort — may be blocked cross-domain).
  await grab("submissions_app", "https://breakdownexpress.com/project_submissions/");
  await sleep(1200);

  const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "castingward-recon2.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  console.log("🎉 Done! 'castingward-recon2.json' downloaded — upload it to Claude.");
})();
