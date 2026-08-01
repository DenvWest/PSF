/**
 * Headless viewport audit for /dashboard?tab=vandaag&kompas=beweging
 * Uses dev dashboard data (?state=scored) + signed psf_account cookie.
 */
import { createHmac } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const PATH =
  "/dashboard?state=scored&tab=vandaag&kompas=beweging";
const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 900 },
];

function loadSecret() {
  const envPath = join(process.cwd(), ".env.local");
  const raw = readFileSync(envPath, "utf8");
  const match = raw.match(/^ACCOUNT_COOKIE_SECRET=(.+)$/m);
  if (!match?.[1]?.trim()) {
    throw new Error("ACCOUNT_COOKIE_SECRET missing in .env.local");
  }
  return match[1].trim();
}

function signCookie(secret, accountId) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", secret)
    .update(`${accountId}.${issuedAt}`)
    .digest("hex");
  return `${accountId}.${issuedAt}.${sig}`;
}

async function auditViewport(page, viewport) {
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE}${PATH}`, { waitUntil: "networkidle2", timeout: 60000 });

  const url = page.url();
  if (url.includes("/account/login")) {
    return {
      viewport: viewport.name,
      blocked: true,
      reason: "redirected to login",
    };
  }

  await page.waitForSelector('[aria-label="Beweeg-cockpit"], [aria-label="Vandaag — beweging"]', {
    timeout: 15000,
  }).catch(() => null);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    const clientW = doc.clientWidth;
    const hero = document.querySelector('[aria-label="Vandaag — beweging"]');
    const cockpit = document.querySelector('[aria-label="Beweeg-cockpit"]');
    const bottomNav = document.querySelector('[class*="fixed"][class*="bottom-0"]');
    const rail = document.querySelector('[class*="md:flex"][class*="border-r"]');
    const heroRect = hero?.getBoundingClientRect();
    const ctaRow = hero?.querySelector(".sm\\:flex-row, [class*='sm:flex-row']");
    const ctas = hero ? [...hero.querySelectorAll("button, a")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height >= 40 && r.width > 60;
    }) : [];

    return {
      horizontalOverflow: scrollW > clientW + 1,
      scrollWidth: scrollW,
      clientWidth: clientW,
      hasHero: Boolean(hero),
      hasCockpit: Boolean(cockpit),
      heroWidth: heroRect?.width ?? null,
      heroLeft: heroRect?.left ?? null,
      heroRight: heroRect?.right ?? null,
      ctaCount: ctas.length,
      ctaLayout: ctaRow
        ? window.getComputedStyle(ctaRow).flexDirection
        : ctas.length >= 2
          ? (ctas[0].getBoundingClientRect().top === ctas[1].getBoundingClientRect().top
              ? "row"
              : "column")
          : "n/a",
      bottomNavVisible: bottomNav
        ? window.getComputedStyle(bottomNav).display !== "none"
        : false,
      railVisible: rail ? window.getComputedStyle(rail).display !== "none" : false,
      title: document.title,
    };
  });

  const outDir = join(process.cwd(), ".audit-screenshots");
  mkdirSync(outDir, { recursive: true });
  const shotPath = join(outDir, `beweging-${viewport.name}.png`);
  await page.screenshot({ path: shotPath, fullPage: false });

  return {
    viewport: viewport.name,
    blocked: false,
    screenshot: shotPath,
    ...metrics,
  };
}

async function main() {
  const secret = loadSecret();
  const cookieValue = signCookie(secret, "00000000-0000-4000-8000-000000000001");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setCookie({
    name: "psf_account",
    value: cookieValue,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  const results = [];
  for (const vp of VIEWPORTS) {
    results.push(await auditViewport(page, vp));
  }

  await browser.close();

  const report = {
    auditedAt: new Date().toISOString(),
    url: `${BASE}${PATH}`,
    results,
    verdict:
      results.some((r) => r.blocked) ? "blocked"
      : results.some((r) => r.horizontalOverflow) ? "overflow_detected"
      : results.every((r) => r.hasHero || r.hasCockpit) ? "pass"
      : "content_missing",
  };

  const reportPath = join(process.cwd(), ".audit-screenshots/beweging-mobile-audit.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
