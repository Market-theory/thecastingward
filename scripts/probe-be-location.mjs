// Feasibility probe (runs on a GitHub Actions runner, open internet).
// Fetches a sample of Actors Access one-page resumes and reports, per resume:
//   - HTTP reachability / whether it hit a login wall
//   - any text that looks like a location (city/state, "Location", "Local Hire")
//   - a text snippet, so a human can judge yield before a full backfill.
// Writes docs/teardown/be-location-probe.json.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const BASE = "https://casting.breakdownexpress.com/talentsearch/onepageresume/";
const IDS = [
  "819163-4087685", "1351130-4116273", "1758950-5018548", "670681-1805325",
  "1988137-5822722", "1497136-6036460", "135898-1232030", "713910-1937233",
  "1965138-5534587", "1798214-5122176", "921521-2571455", "1399074-4443630",
  "644043-3897388", "180440-3476222", "1690181-4847710", "208010-440630",
  "155291-661185", "1399232-4034856", "1421069-4099778", "902987-5031657",
  "568146-1865829", "346158-1402174", "1494677-4309736", "1204175-3432951",
  "1159066-3292942", "997165-2795801", "792810-4408014", "247326-770406",
  "1202121-3523837", "1341971-5166691", "157699-315006", "191175-2788776",
  "1452671-4661230", "235993-514018", "199489-419526", "686708-1853968",
  "1576058-4539989", "1266918-3637881", "949697-2649590", "1300976-3742161",
];

mkdirSync("docs/teardown", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 1600 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();

// Location-ish signals: an explicit label, or a "City, ST" pattern, or a US zip.
const LOCATION_RE =
  /(location|local hire|based in|hometown|residence|\b[A-Z][a-z]+,\s*[A-Z]{2}\b|\b[A-Z]{2}\s\d{5}\b)/;

const results = [];
for (const id of IDS) {
  const url = BASE + id;
  const row = { id, status: 0, loginWall: false, locationHits: [], snippet: "" };
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    row.status = resp ? resp.status() : 0;
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const t = (document.body.innerText || "").replace(/\n{2,}/g, "\n").trim();
      const url = location.href;
      return { text: t, finalUrl: url };
    });
    row.loginWall = /log\s?in|sign\s?in|password/i.test(info.text.slice(0, 400)) ||
      /login|signin/i.test(info.finalUrl);
    row.locationHits = info.text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && LOCATION_RE.test(l))
      .slice(0, 6);
    row.snippet = info.text.slice(0, 700);
  } catch (e) {
    row.error = e.message;
  }
  results.push(row);
  console.log(`${id}: status=${row.status} login=${row.loginWall} hits=${row.locationHits.length}`);
}

const withLocation = results.filter((r) => !r.loginWall && r.locationHits.length > 0).length;
const reachable = results.filter((r) => r.status === 200 && !r.loginWall).length;
const summary = {
  sampled: results.length,
  reachablePublic: reachable,
  loginWalled: results.filter((r) => r.loginWall).length,
  withLocationText: withLocation,
  locationRateOfReachable: reachable ? +(withLocation / reachable).toFixed(2) : 0,
};
writeFileSync("docs/teardown/be-location-probe.json", JSON.stringify({ summary, results }, null, 1));
console.log("SUMMARY", JSON.stringify(summary));
await browser.close();
