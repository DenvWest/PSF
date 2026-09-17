import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import sitemap, { SITEMAP_EXCLUDED } from "@/app/sitemap";
import robots from "@/app/robots";
import { SUPPLEMENT_SLUGS, getSupplementComparisonData } from "@/data/supplements";
import { ALL_SUPPLEMENT_SLUGS } from "@/data/supplement-guides";
import { VOEDING_STOF_SLUGS } from "@/lib/voeding-public";

const BASE = "https://perfectsupplement.nl";
const APP_DIR = path.join(process.cwd(), "src", "app");

/** Alle publieke routes uit het bestandssysteem — admin en API tellen niet mee. */
function publicRoutes(): string[] {
  const found: string[] = [];

  function walk(dir: string, route: string) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory()) {
        // Route groups — (desk) — dragen geen URL-segment.
        const segment = item.name.startsWith("(") ? "" : `/${item.name}`;
        walk(path.join(dir, item.name), route + segment);
      } else if (item.name === "page.tsx") {
        found.push(route === "" ? "/" : route);
      }
    }
  }

  walk(APP_DIR, "");
  return found
    .filter((r) => !r.startsWith("/admin") && !r.startsWith("/api"))
    .sort();
}

function pathnamesInSitemap(): string[] {
  return sitemap().map((entry) => new URL(entry.url).pathname);
}

function isExcluded(route: string): boolean {
  return SITEMAP_EXCLUDED.some(
    (e) => e.pad === route || route.startsWith(`${e.pad}/`),
  );
}

describe("sitemap vergelijkingspagina's", () => {
  it("gebruikt de eigen lastUpdated-datum per supplement, niet een gedeelde fallback", () => {
    const entries = sitemap();
    const bySlug = new Map(
      SUPPLEMENT_SLUGS.map((slug) => [slug, getSupplementComparisonData(slug)]),
    );

    for (const slug of SUPPLEMENT_SLUGS) {
      const data = bySlug.get(slug);
      if (!data) continue;
      const entry = entries.find((e) => e.url === `${BASE}/beste/${slug}`);
      expect(entry, `geen sitemap-entry voor /beste/${slug}`).toBeDefined();
      expect(entry?.lastModified).toEqual(new Date(data.lastUpdated));
    }
  });

  it("bevat alle supplementgidsen en voedingsstof-pagina's", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((e) => e.url));

    for (const slug of ALL_SUPPLEMENT_SLUGS) {
      expect(urls.has(`https://perfectsupplement.nl/supplementen/${slug}`)).toBe(true);
    }
    for (const slug of VOEDING_STOF_SLUGS) {
      expect(urls.has(`https://perfectsupplement.nl/voeding/${slug}`)).toBe(true);
    }
    expect(urls.has("https://perfectsupplement.nl/voeding")).toBe(true);
    expect(urls.has("https://perfectsupplement.nl/intake/voeding")).toBe(true);
  });

  it("elke vergelijkingspagina heeft een unieke lastModified-datum wanneer de brondata dat ook heeft", () => {
    const uniqueLastUpdated = new Set(
      SUPPLEMENT_SLUGS.map((slug) => getSupplementComparisonData(slug)?.lastUpdated),
    );
    // Sanity check op de testdata zelf: als dit ooit 1 wordt, hebben alle
    // supplementen toevallig dezelfde datum en test dit niets meer zinvols.
    expect(uniqueLastUpdated.size).toBeGreaterThan(1);
  });
});

describe("sitemap supplementgidsen", () => {
  // Deze laag ontbrak volledig. De test bestaat zodat dat niet nog eens kan.
  it("bevat alle acht /supplementen/[slug]-gidsen", () => {
    const pathnames = new Set(pathnamesInSitemap());
    for (const slug of ALL_SUPPLEMENT_SLUGS) {
      expect(
        pathnames.has(`/supplementen/${slug}`),
        `supplementgids ontbreekt in sitemap: /supplementen/${slug}`,
      ).toBe(true);
    }
  });
});

describe("sitemap-integriteit", () => {
  it("bevat geen URL die robots.txt verbiedt", () => {
    const rules = robots().rules;
    const ruleList = Array.isArray(rules) ? rules : [rules];
    const disallowed = ruleList
      .flatMap((rule) => {
        const d = rule.disallow;
        if (!d) return [];
        return Array.isArray(d) ? d : [d];
      })
      .filter((p) => p !== "");

    for (const pathname of pathnamesInSitemap()) {
      for (const prefix of disallowed) {
        expect(
          pathname === prefix || pathname.startsWith(`${prefix}/`),
          `${pathname} staat in de sitemap maar wordt door robots.txt verboden (${prefix})`,
        ).toBe(false);
      }
    }
  });

  it("bevat geen dubbele URL's", () => {
    const pathnames = pathnamesInSitemap();
    const duplicates = pathnames.filter((p, i) => pathnames.indexOf(p) !== i);
    expect(duplicates, `dubbele sitemap-URL's: ${duplicates.join(", ")}`).toEqual([]);
  });

  it("stempelt niet elke entry met dezelfde datum", () => {
    const stamps = sitemap()
      .map((e) => e.lastModified)
      .filter((d): d is Date => d instanceof Date)
      .map((d) => d.toISOString());
    // Eén gedeelde constante over alle content is ruis, geen signaal.
    expect(new Set(stamps).size).toBeGreaterThan(5);
  });
});

describe("route-dekking", () => {
  // Het gat dat de supplementgidsen liet verdwijnen: een route bestond wel,
  // maar niemand merkte dat hij nergens werd aangeboden.
  it("elke publieke route staat in de sitemap of op SITEMAP_EXCLUDED met reden", () => {
    const pathnames = pathnamesInSitemap();
    const exact = new Set(pathnames);
    const ontbreekt: string[] = [];

    for (const route of publicRoutes()) {
      if (isExcluded(route)) continue;

      if (route.includes("[")) {
        // Dynamische route: minstens één concrete URL onder hetzelfde voorvoegsel.
        const prefix = route.slice(0, route.indexOf("["));
        const gedekt = pathnames.some(
          (p) => p.startsWith(prefix) && p !== prefix.replace(/\/$/, ""),
        );
        if (!gedekt) ontbreekt.push(route);
        continue;
      }

      if (!exact.has(route)) ontbreekt.push(route);
    }

    expect(
      ontbreekt,
      `routes zonder sitemap-entry en zonder reden op SITEMAP_EXCLUDED:\n  ${ontbreekt.join("\n  ")}`,
    ).toEqual([]);
  });

  // Zonder deze test kan SITEMAP_EXCLUDED liegen: een pad als "uitgesloten"
  // opvoeren terwijl een andere sectie hem alsnog uitzendt.
  it("geen enkel uitgesloten pad wordt alsnog uitgezonden", () => {
    const pathnames = new Set(pathnamesInSitemap());
    for (const entry of SITEMAP_EXCLUDED) {
      if (entry.pad.includes("[")) continue;
      expect(
        pathnames.has(entry.pad),
        `${entry.pad} staat op SITEMAP_EXCLUDED maar zit wél in de sitemap`,
      ).toBe(false);
    }
  });

  it("elke SITEMAP_EXCLUDED-entry draagt een reden", () => {
    for (const entry of SITEMAP_EXCLUDED) {
      expect(entry.reden.length, `lege reden voor ${entry.pad}`).toBeGreaterThan(10);
    }
  });
});
