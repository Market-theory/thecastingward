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
  try {
    await page.screenshot({ path: `${OUT}/_page-${tag}.png` });
    saved++;
  } catch {}
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(1200);
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

await harvest("https://mobbin.com/discover/apps/ios/latest", "discover", 12);

// Collect app-page links from the hydrated DOM and harvest each.
const links = await page.$$eval("a", (els) =>
  [...new Set(els.map((e) => e.getAttribute("href")).filter((h) => h && h.includes("/apps/")))],
);
console.log("app links found:", links.length, links.slice(0, 12));
for (const l of links.slice(0, 8)) {
  const slug = l.split("/").filter(Boolean).slice(-2).join("-").replace(/[^A-Za-z0-9-]/g, "").slice(0, 50);
  await harvest(new URL(l, "https://mobbin.com").href, slug, 8);
}

console.log(`Done. Saved ${saved} files.`);
await browser.close();
