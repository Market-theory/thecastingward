/*
 * ═══════════════════════════════════════════════════════════════════
 *  CASTING WARD — BREAKDOWN EXPRESS TALENT CRAWLER
 * ═══════════════════════════════════════════════════════════════════
 *  Pulls the talent from Natasha's account into ONE CSV for Airtable.
 *  Reads only — changes nothing. Runs inside her logged-in tab.
 *
 *  ▶ FIRST RUN = TEST (only 3 breakdowns). Upload BOTH downloaded files
 *    to Claude to confirm the data looks right before the full pull.
 *  ▶ To pull EVERYTHING: change   TEST_LIMIT = 3   to   TEST_LIMIT = 0
 *    (line below), then run it again.
 *
 *  HOW TO RUN:
 *  1. Chrome, logged into casting.breakdownexpress.com, on any page.
 *  2. F12 (Mac: Cmd+Option+J) → Console. Type  allow pasting  if warned.
 *  3. Paste this whole file, press Enter.
 *  4. Watch the progress log. Files auto-download when it finishes.
 */
(async () => {
  // ================= CONFIG =================
  const TEST_LIMIT = 3;   // 3 = quick test.   0 = crawl ALL 439 breakdowns.
  const SHOW = "all";     // status filter: "all" grabs everyone submitted.
  const DELAY_MS = 700;   // pause between requests (be polite to the server).
  // ==========================================

  // [breakdown_id, project_id] for all 439 of her breakdowns:
  const BREAKDOWNS = [[78762,72458],[82141,75739],[83458,77022],[85809,79302],[85873,79365],[86406,79886],[86808,80280],[87350,80809],[87432,80890],[93978,87262],[101092,94179],[114157,106930],[117928,110651],[123195,115859],[125773,118405],[125926,118557],[128141,120756],[130528,123116],[132854,125398],[132856,125400],[133162,125704],[137239,129719],[151508,143825],[156418,148687],[157608,149865],[183034,175034],[205455,197264],[231508,223052],[238567,230036],[238619,230088],[239800,231258],[240427,231882],[240696,232146],[240832,232279],[241636,233078],[242288,233718],[243710,235129],[245525,236923],[272226,263300],[272252,263325],[272302,263375],[279599,270602],[279682,270684],[279868,270869],[280372,271365],[280399,271392],[280696,271681],[280879,271863],[281077,272058],[281112,272093],[281456,272429],[282787,273744],[287001,277919],[291363,282246],[292009,282890],[292463,283342],[322861,313487],[323547,314150],[323913,314511],[324892,315483],[324893,315484],[325759,316338],[326547,317104],[326706,317260],[327565,318112],[329750,320272],[342042,332368],[344938,335206],[345060,335326],[346642,336882],[348041,338253],[348126,338336],[351371,341522],[351550,341695],[352981,343109],[353103,343230],[353684,343802],[354443,344549],[365069,354936],[367617,357440],[368434,358244],[368577,358382],[370795,360575],[371486,361258],[371501,361273],[371664,361436],[371727,361499],[373442,363189],[381271,370926],[381688,371334],[382524,372160],[382738,372372],[383254,372882],[383567,373188],[384711,374319],[385033,374637],[385055,374659],[385057,374661],[385580,375178],[387189,376762],[388279,377840],[389012,378567],[389555,379106],[389717,379266],[389898,379444],[389961,379507],[390444,379984],[390447,379987],[390497,380033],[393199,382713],[393204,382718],[394128,383630],[394145,383646],[394150,383651],[394333,383832],[408375,397706],[410154,399466],[410768,400071],[432566,421639],[437466,426459],[438520,427500],[439609,428571],[446630,435480],[464890,453533],[475233,463751],[484196,472611],[484354,472767],[484826,473232],[493432,481724],[504924,493068],[505001,493145],[505110,493253],[508049,496156],[508373,496477],[509931,498008],[511226,499298],[511717,499783],[511951,500013],[514032,502064],[514042,502073],[514418,502443],[516689,504687],[516694,504692],[520042,508008],[521980,509930],[522822,510766],[523563,511502],[524062,511999],[525097,513026],[525323,513251],[531600,517502],[532466,518365],[539809,525669],[541252,527109],[541536,527391],[544182,530026],[545105,530947],[547690,533525],[548509,534340],[548511,534342],[551701,537517],[552276,538089],[554343,540143],[554565,540365],[556295,542089],[556391,542185],[556396,542190],[556628,542422],[557487,543280],[558264,544056],[558268,544060],[560478,546262],[560489,546273],[561898,547680],[562120,547901],[562250,548030],[562327,548106],[562680,548455],[563353,549125],[563644,549416],[563649,549421],[563846,549616],[566397,552161],[570147,555902],[570439,556194],[570836,556591],[572641,558385],[572683,558427],[579411,565142],[579412,565143],[581221,566936],[581397,567103],[581419,567125],[581547,567254],[583110,568798],[583350,569034],[584198,569874],[584230,569903],[584732,570393],[584801,570461],[585007,570665],[586398,572004],[587275,572868],[588178,573736],[588741,574289],[589331,574857],[590602,576116],[590637,576152],[591609,577118],[591899,577398],[592526,578009],[592545,578031],[592749,578230],[592803,578284],[593126,578597],[593343,578809],[593352,578818],[593815,579273],[594668,580106],[597085,582437],[597561,582893],[598654,583950],[598813,584107],[599973,585231],[600056,585312],[600059,585315],[600243,585492],[600244,585493],[601100,586303],[601486,586662],[601640,586802],[603883,588945],[606196,591175],[608097,593003],[608521,593405],[608744,593619],[608883,593747],[609686,594517],[610402,595216],[610782,595581],[612620,597354],[612623,597357],[613312,600216],[614052,600216],[614128,600216],[614149,598838],[614326,599019],[614498,599187],[615219,600216],[618025,600216],[622143,607418],[623601,609028],[625811,610988],[687335,664176],[688908,665463],[689445,665886],[689734,666110],[690097,666389],[690384,666610],[693822,669377],[694159,669672],[694161,669674],[694163,669676],[694164,669678],[694165,669679],[697248,672208],[697389,672333],[697599,672507],[713385,686007],[714312,686007],[715763,688008],[719460,691082],[724439,695246],[734532,713779],[734690,713779],[735664,713779],[737367,713779],[738934,713779],[738985,707778],[739752,739196],[740142,708739],[740166,713779],[740722,709251],[741256,739196],[742209,710516],[742539,739196],[742551,710516],[742922,713780],[742925,711122],[743629,711708],[744806,712700],[746542,714245],[748232,715697],[748382,715819],[749070,716391],[751410,718495],[754168,720817],[754242,720888],[755970,722388],[755990,722405],[756204,722586],[757083,723320],[757564,723715],[758817,724800],[761810,727432],[762003,727577],[763042,728555],[763105,728605],[763106,728606],[763567,728990],[763800,729186],[764104,729444],[764221,729556],[766292,731602],[767103,732379],[767495,732784],[767540,732818],[767818,733192],[767989,733372],[770016,735574],[771166,736987],[771168,736989],[771712,737693],[772286,738594],[772294,738617],[772674,739534],[772798,739669],[773221,740094],[774075,741305],[774379,741691],[776005,744081],[777288,747687],[777427,747687],[777538,747687],[777540,747687],[777726,747687],[778579,747687],[778580,747687],[779164,747598],[779231,747687],[779569,748091],[779599,747687],[779610,748125],[781234,751358],[781594,754573],[782017,750644],[782145,750768],[782300,750913],[782765,751358],[783401,752065],[785616,754573],[787396,756750],[787689,756750],[787691,756750],[787703,754573],[788366,759018],[789118,759018],[789554,756750],[789609,756750],[789638,759017],[790958,760343],[791052,760476],[792434,762251],[792735,759018],[792803,759018],[792901,759018],[792929,759018],[793071,762926],[795989,766219],[796566,766813],[796600,766853],[798139,751358],[798768,762926],[798783,762926],[798931,762926],[799882,770134],[801796,754573],[801907,754573],[808644,751358],[808646,778668],[809371,779261],[811370,751358],[812561,779261],[813985,779261],[814096,784267],[814270,783294],[815595,784486],[815664,784547],[816307,759018],[820485,788774],[820883,788774],[821303,759018],[821672,759018],[823620,759018],[824865,759018],[824870,759018],[824873,759018],[826581,793241],[829512,793241],[830983,793241],[832604,797931],[832634,797931],[835093,799997],[835159,799997],[835759,799997],[835762,799997],[836210,799997],[836452,797931],[836707,797931],[838453,799997],[838568,799997],[840641,804602],[840646,804602],[841809,808133],[844252,807890],[844538,808133],[844606,808133],[850537,813172],[850571,813172],[858154,819159],[858864,819159],[860875,821108],[865343,827023],[865973,827023],[866770,825647],[866780,825647],[868370,825647],[868660,827023],[869123,825647],[874167,831017],[875478,831017],[881200,836691],[883002,836691],[888358,842448],[889147,843044],[890101,843795],[892161,845648],[892349,845648],[896565,849022]];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) =>
    (s || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#39;|&rsquo;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  async function getText(url) {
    try {
      const r = await fetch(url, { credentials: "include", redirect: "follow" });
      return await r.text();
    } catch (e) {
      console.warn("fetch failed:", url, String(e));
      return "";
    }
  }

  // Role (breakdown_item) IDs for a breakdown, from its details page.
  async function getRoles(bd, proj) {
    const url = "/projects/index.cfm?view=breakdowns&action=details&breakdown=" + bd + "&project=" + proj;
    const h = await getText(url);
    const ids = new Set();
    let m;
    const re = /breakdown_item=(\d+)/g;
    while ((m = re.exec(h))) ids.add(m[1]);
    return [...ids];
  }

  // Parse the server-rendered role grid into actor records.
  function parseCards(html, ctx) {
    const roleName = clean((html.match(/<h3[^>]*>([^<]{1,60})<\/h3>/) || [])[1]) || "";
    const parts = html.split("submissions-results-card");
    const out = [];
    for (let i = 1; i < parts.length; i++) {
      const c = parts[i];
      const rm = c.match(/onePageResume\('([\d-]+)',\s*'([^']+)'\)/);
      const rid = (rm && rm[1]) || "";
      let sub = (c.match(/data-submission="(\d+)"/) || [])[1] || "";
      if (!sub && rm && rm[2]) {
        try { sub = atob(rm[2]).split(",").pop() || ""; } catch (e) {}
      }
      if (!rid && !sub) continue;
      const name = clean((c.match(/text-underline[^>]*>\s*([^<]{2,60})/) || [])[1]);
      const agency = clean((c.match(/span-agency"[^>]*>([\s\S]*?)<\/span>/) || [])[1]);
      const status = ((c.match(/submission-rating ([a-z-]+)-rating/) || [])[1] || "").replace(/-/g, " ");
      const photo = (c.match(/src="(https:\/\/breakdownservices[^"]+)"/) || [])[1] || "";
      out.push({
        aaProfileId: (rid.split("-")[0] || ""),
        resumeId: rid, submissionId: sub, name, agency, status, photo,
        breakdown: ctx.bd, project: ctx.proj, roleItem: ctx.item, roleName,
      });
    }
    return out;
  }

  async function getCards(bd, proj, item) {
    const url =
      "/projects/index.cfm?view=breakdowns&action=role&breakdown=" + bd +
      "&breakdown_item=" + item + "&project=" + proj + "&show=" + SHOW +
      "&page=1&max_per_page=0&cid=0&sefi=1,2,3,4,5,6&sortdir=Profile%20Completeness" +
      "&filter_display=1&agencyFilter=1&sortvideo=0&sorthistory=0" +
      "&txtactorsearch=&search_name=&miles=&zip=&state_province=";
    const h = await getText(url);
    return parseCards(h, { bd, proj, item });
  }

  // ===================== CRAWL =====================
  const list = TEST_LIMIT > 0 ? BREAKDOWNS.slice(0, TEST_LIMIT) : BREAKDOWNS;
  console.log("🎬 Crawling " + list.length + " breakdowns (TEST_LIMIT=" + TEST_LIMIT + "). Read-only. Grab a coffee if this is the full run.");
  const talent = new Map(); // aaProfileId -> merged record
  const rawSampleCards = [];
  let done = 0, actorHits = 0;

  for (const [bd, proj] of list) {
    let roles = [];
    try { roles = await getRoles(bd, proj); } catch (e) { console.warn("roles error", bd, e); }
    await sleep(DELAY_MS);
    for (const item of roles) {
      let recs = [];
      try { recs = await getCards(bd, proj, item); } catch (e) { console.warn("grid error", bd, item, e); }
      await sleep(DELAY_MS);
      if (rawSampleCards.length < 5 && recs.length) rawSampleCards.push(recs[0]);
      for (const r of recs) {
        actorHits++;
        const key = r.aaProfileId || r.resumeId || (r.name + "|" + r.submissionId);
        if (!talent.has(key)) {
          talent.set(key, {
            name: r.name, photo: r.photo, aaProfileId: r.aaProfileId, resumeId: r.resumeId,
            agency: r.agency, statuses: new Set(), appearances: [], submissionIds: new Set(),
          });
        }
        const t = talent.get(key);
        if (r.status) t.statuses.add(r.status);
        if (r.submissionId) t.submissionIds.add(r.submissionId);
        if (!t.name && r.name) t.name = r.name;
        if (!t.photo && r.photo) t.photo = r.photo;
        if (!t.agency && r.agency) t.agency = r.agency;
        t.appearances.push((r.roleName || ("role " + r.roleItem)) + " (bd " + r.breakdown + ")");
      }
    }
    done++;
    if (done % 5 === 0 || done === list.length)
      console.log("   …" + done + "/" + list.length + " breakdowns · " + talent.size + " unique actors so far");
  }

  // ================ BUILD CSV (Airtable Talent columns) ================
  const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const cols = ["Name","Persona","Representation Status","Representation","Engagement Status (BE)","Actors Access URL","Headshot","Source","Submission Notes","BE Resume ID","BE Submission IDs","BE Appearances Count"];
  const rows = [cols.map(q).join(",")];
  for (const t of talent.values()) {
    const repped = t.agency && !/actors\s*access/i.test(t.agency);
    rows.push([
      t.name,
      "Actor",
      repped ? "Repped" : "Self-Managed",
      repped ? t.agency : "",
      [...t.statuses].join(", "),
      t.resumeId ? ("https://casting.breakdownexpress.com/talentsearch/onepageresume/" + t.resumeId) : "",
      t.photo,
      "Breakdown Express import",
      t.appearances.slice(0, 6).join(" | "),
      t.resumeId,
      [...t.submissionIds].join(", "),
      String(t.appearances.length),
    ].map(q).join(","));
  }
  const csv = rows.join("\n");

  const dl = (name, text, type) => {
    const b = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const tag = TEST_LIMIT > 0 ? "TEST" : "FULL";
  dl("castingward-talent-" + tag + ".csv", csv, "text/csv");
  dl("castingward-crawl-debug.json", JSON.stringify(
    { tag, breakdownsCrawled: list.length, uniqueActors: talent.size, actorHits, rawSampleCards }, null, 2
  ), "application/json");

  console.log("🎉 Done! " + talent.size + " unique actors from " + list.length + " breakdowns.");
  console.log("   Downloaded: castingward-talent-" + tag + ".csv  +  castingward-crawl-debug.json");
  if (TEST_LIMIT > 0)
    console.log("   ⬆️ This was a TEST. Upload BOTH files to Claude. If it looks right, set TEST_LIMIT = 0 and run again for the full pull.");
})();
