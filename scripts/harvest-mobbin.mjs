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

// The discover page redirects to marketing when logged out. Fall back to
// Mobbin's public sitemap to find per-app SEO pages, preferring apps that
// match the casting-search reference set.
const PREFERRED = ["airbnb", "etsy", "depop", "pinterest", "hinge", "bumble", "nike", "spotify", "zillow", "linkedin"];
let appUrls = [];
try {
  const resp = await ctx.request.get("https://mobbin.com/sitemap.xml");
  if (resp.ok()) {
    let xml = await resp.text();
    // sitemap index? fetch children that look app-related
    const childMaps = [...xml.matchAll(/<loc>([^<]+sitemap[^<]*)<\/loc>/g)].map((m) => m[1]);
    for (const cm of childMaps.slice(0, 12)) {
      try {
        const r = await ctx.request.get(cm);
        if (r.ok()) xml += await r.text();
      } catch {}
    }
    appUrls = [...new Set([...xml.matchAll(/<loc>(https:\/\/mobbin\.com\/apps\/[^<]+)<\/loc>/g)].map((m) => m[1]))];
    console.log("sitemap app urls:", appUrls.length);
  } else {
    console.log("sitemap status:", resp.status());
  }
} catch (e) {
  console.log("sitemap fail:", e.message);
}
const preferred = appUrls.filter((u) => PREFERRED.some((p) => u.includes(p)));
const targets = [...new Set([...preferred, ...appUrls])].slice(0, 10);
console.log("targets:", targets);
for (const t of targets) {
  const slug = t.split("/").filter(Boolean).pop().replace(/[^A-Za-z0-9-]/g, "").slice(0, 50);
  await harvest(t, slug, 8);
}

// Also try any app links that appeared in hydrated DOMs along the way.
const links = await page.$$eval("a", (els) =>
  [...new Set(els.map((e) => e.getAttribute("href")).filter((h) => h && h.includes("/apps/")))],
);
console.log("dom app links:", links.length);
for (const l of links.slice(0, 5)) {
  const slug = l.split("/").filter(Boolean).slice(-2).join("-").replace(/[^A-Za-z0-9-]/g, "").slice(0, 50);
  await harvest(new URL(l, "https://mobbin.com").href, slug, 8);
}

console.log(`Done. Saved ${saved} files.`);
await browser.close();
