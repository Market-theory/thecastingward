// Runs on a GitHub Actions runner (open internet) with Playwright.
// Full-site teardown capture: crawls a public site's main pages, screenshots
// each at multiple scroll depths, and extracts copy/structure/tech signals
// into committed files the (network-fenced) analysis session can read.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const TARGET = process.env.TEARDOWN_TARGET || "https://suzywelch.com/";
const origin = new URL(TARGET).origin;
const host = new URL(TARGET).hostname.replace(/^www\./, "");
const OUT = `docs/teardown/${host.replace(/[^a-z0-9.-]/gi, "")}`;
const MAX_PAGES = 12;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 2000 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();

const report = [];
const visited = new Set();

function slugOf(url) {
  const p = new URL(url).pathname.replace(/\/$/, "");
  return (p === "" ? "home" : p.split("/").filter(Boolean).join("-")).replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "page";
}

async function capture(url) {
  const norm = url.replace(/[?#].*$/, "").replace(/\/$/, "");
  if (visited.has(norm) || visited.size >= MAX_PAGES) return;
  visited.add(norm);
  const tag = slugOf(url);
  console.log("==", url);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  } catch (e) {
    console.log("  nav fail:", e.message);
    return;
  }
  await page.waitForTimeout(3500);

  // Screenshots at scroll depths (viewport-sized, capped).
  for (let depth = 0; depth < 3; depth++) {
    try {
      await page.screenshot({ path: `${OUT}/${tag}-${depth}.png` });
    } catch {}
    const done = await page.evaluate(() => {
      const before = window.scrollY;
      window.scrollBy(0, 1800);
      return window.scrollY === before; // reached bottom
    });
    await page.waitForTimeout(1200);
    if (done) break;
  }

  // Structure + copy extraction.
  const data = await page.evaluate(() => {
    const txt = (el) => (el?.textContent || "").trim().replace(/\s+/g, " ");
    const pick = (sel, n = 40) => [...document.querySelectorAll(sel)].slice(0, n).map((e) => txt(e)).filter(Boolean);
    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content ?? "",
      ogImage: document.querySelector('meta[property="og:image"]')?.content ?? "",
      generator: document.querySelector('meta[name="generator"]')?.content ?? "",
      h1: pick("h1", 10),
      h2: pick("h2", 30),
      h3: pick("h3", 30),
      buttons: pick('a[class*="btn" i], button, a[class*="button" i]', 40),
      navLinks: [...document.querySelectorAll("header a, nav a")].map((a) => ({
        text: txt(a).slice(0, 60),
        href: a.getAttribute("href"),
      })).filter((a) => a.text && a.href).slice(0, 60),
      forms: [...document.querySelectorAll("form")].map((f) => ({
        action: f.getAttribute("action"),
        inputs: [...f.querySelectorAll("input")].map((i) => i.getAttribute("name") || i.getAttribute("type")).filter(Boolean),
        cta: txt(f.querySelector('button, input[type="submit"]')),
      })).slice(0, 10),
      scriptHosts: [...new Set([...document.querySelectorAll("script[src]")]
        .map((s) => { try { return new URL(s.src).hostname; } catch { return null; } })
        .filter(Boolean))],
      bodyText: txt(document.body).slice(0, 6000),
      internalLinks: [...new Set([...document.querySelectorAll("a[href]")]
        .map((a) => { try { return new URL(a.getAttribute("href"), location.href).href; } catch { return null; } })
        .filter((h) => h && h.startsWith(location.origin) && !h.match(/\.(pdf|jpg|png|zip)$/i)))],
    };
  });
  report.push({ url, tag, ...data, internalLinks: undefined, _links: data.internalLinks });
  return data.internalLinks;
}

const homeLinks = (await capture(TARGET)) ?? [];
// Prefer nav-discovered pages, then other internal links.
for (const l of homeLinks) {
  if (visited.size >= MAX_PAGES) break;
  await capture(l);
}

writeFileSync(
  `${OUT}/extract.json`,
  JSON.stringify(report.map(({ _links, bodyText, ...r }) => ({ ...r, bodyTextFirst2k: bodyText?.slice(0, 2000) })), null, 1),
);
writeFileSync(
  `${OUT}/copy.md`,
  report.map((r) => `# ${r.url}\n\n**Title:** ${r.title}\n**Meta:** ${r.metaDescription}\n\n## Body text\n\n${r.bodyText}\n\n---\n`).join("\n"),
);
console.log(`Done. ${visited.size} pages captured to ${OUT}`);
await browser.close();
