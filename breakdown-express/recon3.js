/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — BREAKDOWN EXPRESS RECON v3  (finds the talent feed)
 * ═══════════════════════════════════════════════════════════════════
 *  ⚠️ RUN THIS ON A PAGE THAT IS SHOWING ACTOR HEADSHOTS/CARDS.
 *     First: open a project → click into its Submissions so you SEE a
 *     grid of actor photos on screen. THEN run this.
 *
 *  It reads what the page already loaded (read-only, changes nothing)
 *  and downloads castingward-recon3.json → upload it to Claude.
 *
 *  RUN IT:
 *  1. Be on the actor-grid page (headshots visible).
 *  2. F12  (Mac: Cmd+Option+J)  →  "Console".
 *  3. If warned, type   allow pasting   (lowercase) + Enter.
 *  4. Paste this whole file, press Enter. A file downloads in ~2 sec.
 */
(() => {
  const clip = (s, n = 1_200_000) => (s && s.length > n ? s.slice(0, n) + "\n<!--TRUNCATED-->" : s || "");
  const out = {
    tool: "castingward-recon3",
    version: 3,
    ranFrom: location.href,
    title: document.title,
  };

  // 1. Every network address this page used — reveals the talent feed.
  try {
    out.network = performance.getEntriesByType("resource").map((e) => ({
      url: e.name,
      type: e.initiatorType,
      bytes: e.transferSize || 0,
    }));
  } catch (e) {
    out.network = "error: " + e;
  }

  // 2. Interesting subset (likely the data feed) called out for quick review.
  const interesting = (out.network || []).filter((r) =>
    /submission|audition|resume|project_submission|manager|\.json|returnformat|api|list|talent|actor|feed|search/i.test(
      r.url || ""
    )
  );
  out.interesting = interesting;

  // 3. The rendered page as it looks right now (actor cards included).
  out.renderedHTML = clip(document.documentElement.outerHTML);

  // 4. Any global data the app left on the page (bounded scan).
  out.globals = {};
  try {
    for (const k of Object.keys(window)) {
      let v;
      try { v = window[k]; } catch { continue; }
      if (v && (Array.isArray(v) || typeof v === "object")) {
        let s;
        try { s = JSON.stringify(v); } catch { continue; }
        if (s && s.length > 200 && /submission|resume|actor|talent|agent|headshot|firstname|lastname/i.test(s)) {
          out.globals[k] = clip(s, 400_000);
        }
      }
    }
  } catch (e) {
    out.globals._error = String(e);
  }

  const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "castingward-recon3.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  console.log("🎉 Done! 'castingward-recon3.json' downloaded — upload it to Claude.");
  console.log(`   Found ${(out.interesting || []).length} candidate feed URLs, ${Object.keys(out.globals).length} data globals.`);
})();
