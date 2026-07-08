/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — BREAKDOWN EXPRESS RECON (step 1 of the auto-crawler)
 * ═══════════════════════════════════════════════════════════════════
 *  What it does: while you're logged in, it quietly fetches 3 pages
 *  (the projects list + one breakdown's talent pages) and downloads
 *  ONE file: castingward-recon.json. Upload that file to Claude —
 *  it contains the exact page structure needed to build the full
 *  crawler that pulls ALL breakdowns automatically.
 *
 *  It reads only. It changes nothing in the account.
 *
 *  HOW TO RUN (2 minutes):
 *  1. In Chrome, make sure you're logged in at casting.breakdownexpress.com
 *     and on any page of the site (the Projects list is perfect).
 *  2. Press F12 (Windows) or Cmd+Option+J (Mac) → click "Console" tab.
 *  3. If Chrome shows a warning about pasting, type:  allow pasting
 *     and press Enter first.
 *  4. Paste this ENTIRE file's contents, press Enter.
 *  5. Wait ~15 seconds. A file "castingward-recon.json" downloads.
 *  6. Upload that file to Claude. Done.
 */
(async () => {
  const MAX_HTML = 900_000; // safety cap per page (~900 KB)
  const out = {
    tool: "castingward-recon",
    version: 1,
    ranFrom: location.href,
    userAgentPage: document.title,
    captured: {},
  };

  const clip = (s) =>
    s.length > MAX_HTML ? s.slice(0, MAX_HTML) + "\n<!--TRUNCATED-->" : s;

  async function grab(name, url) {
    try {
      const r = await fetch(url, { credentials: "include", redirect: "follow" });
      out.captured[name] = {
        url,
        finalUrl: r.url,
        status: r.status,
        html: clip(await r.text()),
      };
      console.log(`✅ captured: ${name} (HTTP ${r.status})`);
    } catch (e) {
      out.captured[name] = { url, error: String(e) };
      console.log(`⚠️ failed: ${name} — ${e}`);
    }
    await new Promise((res) => setTimeout(res, 1500)); // be polite
  }

  console.log("🎬 Casting Ward recon starting…");

  // 0. The page you're currently on (free — no request needed)
  out.captured.current_page = {
    url: location.href,
    html: clip(document.documentElement.outerHTML),
  };

  // 1. Projects list, page 1 (reveals pagination + all breakdown links)
  await grab(
    "projects_list",
    "/projects/?view=breakdowns&action=list&projects=current&website=1,2,3&project_order=date.down&project_id=0&schedule=0"
  );

  // 2. One breakdown's talent/auditions page (THE PROFESSIONAL KIDS)
  await grab(
    "auditions_page",
    "/projects/?view=auditions&project_id=849022&breakdown=896565"
  );

  // 3. Same breakdown's detail page (role descriptions)
  await grab(
    "breakdown_details",
    "/projects/?view=breakdowns&action=details&breakdown=896565&project=849022"
  );

  // Download the bundle
  const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "castingward-recon.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  console.log(
    "🎉 Done! 'castingward-recon.json' downloaded — upload it to Claude."
  );
})();
