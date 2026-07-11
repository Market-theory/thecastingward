// Runs on a GitHub Actions runner (open internet) with Playwright.
// Renders Mobbin's public pages in a real browser, screenshots the browse
// grids, and downloads the screen images it finds into docs/design-refs/raw/
// so the (network-fenced) design session can view them.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const OUT = "docs/design-refs/raw";
const MAX_FILES = 60;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 2200 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
// Optional login: MOBBIN_COOKIE secret carries the user's mobbin.com cookie
// header ("name=value; name2=value2"). Without it, only public pages render.
const cookieHeader = process.env.MOBBIN_COOKIE || "";
if (cookieHeader.trim()) {
  const cookies = cookieHeader
    .split(/;\s*/)
    .filter(Boolean)
    .map((c) => {
      const i = c.indexOf("=");
      return i > 0
        ? { name: c.slice(0, i).trim(), value: c.slice(i + 1).trim(), domain: ".mobbin.com", path: "/" }
        : null;
    })
    .filter(Boolean);
  await ctx.addCookies(cookies);
  console.log(`injected ${cookies.length} cookies (logged-in mode)`);
} else {
  console.log("no MOBBIN_COOKIE secret - anonymous mode");
}
const page = await ctx.newPage();
const seen = new Set();
let saved = 0;

function cdnUrlFrom(src) {
  if (!src) return null;
  if (src.includes("cdn.mobbin.com") && !src.includes("/_next/image")) return src;
  if (src.includes("/_next/image")) {
    try {
      const u = new URL(src, "https://mobbin.com");
      const inner = decodeURIComponent(u.searchParams.get("url") ?? "");
      if (inner.includes("cdn.mobbin.com")) return inner;
    } catch {}
  }
  return null;
}

async function harvest(url, tag, maxImgs) {
  if (saved >= MAX_FILES) return;
  console.log("==", url);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  } catch (e) {
    console.log("  nav fail:", e.message);
    return;
  }
  await page.waitForTimeout(4000);
  for (let depth = 0; depth < 3; depth++) {
    try {
      await page.screenshot({ path: `${OUT}/_page-${tag}-${depth}.png` });
      saved++;
    } catch {}
    await page.mouse.wheel(0, 1900);
    await page.waitForTimeout(1500);
  }
  const rawSrcs = await page.$$eval("img", (els) =>
    els.map((e) => e.currentSrc || e.src).filter(Boolean),
  );
  const urls = [...new Set(rawSrcs.map(cdnUrlFrom).filter(Boolean))].filter((s) => !seen.has(s));
  console.log(`  found ${urls.length} new cdn images`);
  for (const s of urls.slice(0, maxImgs)) {
    if (saved >= MAX_FILES) break;
    seen.add(s);
    try {
      const resp = await ctx.request.get(s);
      if (!resp.ok()) continue;
      const buf = await resp.body();
      if (buf.length < 5000) continue; // skip icons/avatars
      const base = decodeURIComponent(new URL(s).pathname.split("/").pop())
        .replace(/[^A-Za-z0-9._-]/g, "")
        .slice(0, 110);
      writeFileSync(`${OUT}/${tag}-${base}`, buf);
      saved++;
      console.log("  +", `${tag}-${base}`, `${Math.round(buf.length / 1024)}KB`);
    } catch (e) {
      console.log("  dl fail:", e.message);
    }
  }
}

await harvest("https://mobbin.com/discover/apps/ios/latest", "discover", 10);

// Inventory every link on the logged-in discover page so future runs can be
// targeted precisely; committed alongside the screenshots.
const anchors = await page.$$eval("a", (els) =>
  els
    .map((e) => ({ href: e.getAttribute("href"), text: (e.textContent || "").trim().slice(0, 80) }))
    .filter((a) => a.href),
);
const uniq = [];
const seenHref = new Set();
for (const a of anchors) {
  if (seenHref.has(a.href)) continue;
  seenHref.add(a.href);
  uniq.push(a);
  if (uniq.length >= 400) break;
}
writeFileSync(`${OUT}/../links.json`, JSON.stringify(uniq, null, 1));
console.log(`link inventory: ${uniq.length} links`);

// Auto-follow the links that matter for the talent-search design pass:
// pattern pages (filter/sort, bottom sheet, search) and photo-forward apps.
const APP_RE = /^(etsy|depop|hulu|airbnb|pinterest|hinge|bumble|nike|zillow|instacart)$/i;
const PATTERN_RE = /(filter & sort|filtering & sorting|bottom sheet|my account & profile|search)/i;
const appTargets = uniq.filter((a) => APP_RE.test(a.text));
const patternTargets = uniq.filter((a) => PATTERN_RE.test(a.text));
const targets = [...patternTargets.slice(0, 4), ...appTargets.slice(0, 5)];
console.log("targets:", targets.map((t) => `${t.text} -> ${t.href}`));
for (const t of targets) {
  const slug = t.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) || "page";
  await harvest(new URL(t.href, "https://mobbin.com").href, slug, 8);
}

console.log(`Done. Saved ${saved} files.`);
await browser.close();
