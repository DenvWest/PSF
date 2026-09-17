import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allGraphNodes } from "@/lib/content-graph/node";
import {
  graphEdges,
  inboundCounts,
  linkTargets,
  normalizePath,
  orphanNodes,
} from "@/lib/content-graph/edges";
import { GELDIGE_CATEGORIE_IDS } from "@/data/blog/categorieen";
import { GUIDES } from "@/data/guides";
import { getHubProductSlugs } from "@/lib/supplement-hub/product-catalog";

const APP_DIR = path.join(process.cwd(), "src", "app");

/** Statische routes uit het bestandssysteem — dynamische segmenten overgeslagen. */
function staticRoutes(): string[] {
  const found: string[] = [];
  function walk(dir: string, route: string) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory()) {
        if (item.name.startsWith("[")) continue;
        const segment = item.name.startsWith("(") ? "" : `/${item.name}`;
        walk(path.join(dir, item.name), route + segment);
      } else if (item.name === "page.tsx") {
        found.push(route === "" ? "/" : route);
      }
    }
  }
  walk(APP_DIR, "");
  return found.filter((r) => !r.startsWith("/api"));
}

/** `source`-paden uit next.config.ts; een 301 is een geldig linkdoel. */
function redirectSources(): string[] {
  const config = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf-8");
  return [...config.matchAll(/source:\s*"([^"]+)"/g)]
    .map((m) => m[1] ?? "")
    .filter(Boolean);
}

function matchesRedirect(target: string, sources: string[]): boolean {
  return sources.some((source) => {
    if (!source.includes(":")) return source === target;
    // "/thema/:thema" en "/symptomen/slaap/:path*" — vergelijk het vaste voorvoegsel.
    const prefix = source.slice(0, source.indexOf(":"));
    return target.startsWith(prefix);
  });
}

function validRoutes(): Set<string> {
  const routes = new Set<string>(staticRoutes());
  for (const node of allGraphNodes()) routes.add(node.path);
  for (const categorie of GELDIGE_CATEGORIE_IDS) routes.add(`/blog/${categorie}`);
  for (const guide of GUIDES) routes.add(`/gidsen/${guide.key}`);
  for (const slug of getHubProductSlugs()) routes.add(`/product/${slug}`);
  return routes;
}

describe("normalizePath", () => {
  it("haalt fragment en query eraf", () => {
    expect(normalizePath("/beste/magnesium#producten")).toBe("/beste/magnesium");
    expect(normalizePath("/supplementen?categorie=zink")).toBe("/supplementen");
  });

  it("negeert afbeeldingen en externe links", () => {
    expect(normalizePath("/images/blog/x.jpg")).toBeNull();
    expect(normalizePath("https://example.com")).toBeNull();
  });

  it("houdt de root heel en haalt een naslepende slash weg", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/blog/")).toBe("/blog");
  });
});

describe("contentgraaf", () => {
  it("bouwt knopen voor elk contenttype", () => {
    const types = new Set(allGraphNodes().map((n) => n.type));
    expect(types).toEqual(
      new Set([
        "blog",
        "kennisbank",
        "supplementgids",
        "vergelijking",
        "pillar",
        "profiel",
        "gezondheidsgids",
        "voedingsstof",
      ]),
    );
  });

  it("geeft elke knoop een uniek pad", () => {
    const paths = allGraphNodes().map((n) => n.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("vindt links in markdown, in href-velden en in slug-arrays", () => {
    const kinds = new Set(graphEdges().map((e) => e.kind));
    expect(kinds.has("inline")).toBe(true);
    expect(kinds.has("cta")).toBe(true);
    expect(kinds.has("related")).toBe(true);
  });

  it("laat geen enkele knoop naar zichzelf wijzen", () => {
    const self = graphEdges().filter((e) => e.from === e.to);
    expect(self).toEqual([]);
  });
});

describe("dode links", () => {
  // De harde vangrail: een interne link die nergens heen gaat is een 404 voor
  // de bezoeker en een verspilde crawl voor Google.
  it("elke interne link wijst naar een bestaande route of een 301-bron", () => {
    const routes = validRoutes();
    const sources = redirectSources();
    const dood = linkTargets().filter(
      (target) => !routes.has(target) && !matchesRedirect(target, sources),
    );

    expect(
      dood,
      `dode interne links:\n  ${dood
        .map((t) => {
          const bronnen = graphEdges()
            .filter((e) => e.to === t)
            .slice(0, 3)
            .map((e) => `${e.from} (${e.field})`);
          return `${t}\n      ← ${bronnen.join("\n      ← ")}`;
        })
        .join("\n  ")}`,
    ).toEqual([]);
  });
});

describe("weespagina's", () => {
  /**
   * De nulmeting van 16 september 2026, vóór de automatische linklaag (fase 6).
   *
   * Dit is een plafond, geen norm: de lijst mag korter worden zonder dat de
   * test hoeft mee te bewegen, maar er mag niets bij komen. Fase 6 brengt hem
   * naar nul en vervangt deze verwachting door `toEqual([])`.
   */
  const BEKENDE_WEZEN = [
    // De vijf voedingsstofpagina's plus hun hub zijn nieuw (fase 5). Ze worden
    // vandaag alleen vanaf de hub gelinkt, en de hub is geen contentknoop.
    // Fase 6 verbindt ze: elk stuk dat een stof draagt hoort naar zijn
    // stofpagina te wijzen, en andersom.
    "/voedingsstoffen/eiwit",
    "/voedingsstoffen/magnesium",
    "/voedingsstoffen/omega-3",
    "/voedingsstoffen/vitamine-d",
    "/voedingsstoffen/zink",
    "/blog/eiwit-en-whey-in-de-overgang",
    "/blog/magnesium-in-de-overgang",
    "/blog/slaapkwaliteit-testosteron-herstel",
    "/blog/vermoeidheid-bloedwaarden-checken-mannen",
    "/blog/vitamine-d-botgezondheid-overgang",
    "/gids/beweging",
    "/gids/testosteron",
    "/gids/voeding",
    "/kennisbank/sociale-verbinding",
    "/profiel/stressdrager",
    "/supplementen/zink",
    "/wat-is-omega-3",
  ];

  it("er komt geen weespagina bij", () => {
    const nu = orphanNodes().map((n) => n.path).sort();
    const nieuw = nu.filter((p) => !BEKENDE_WEZEN.includes(p));
    expect(
      nieuw,
      `nieuwe weespagina's (0 inhoudelijke inkomende links):\n  ${nieuw.join("\n  ")}`,
    ).toEqual([]);
  });

  it("de bekende wezen zijn er nog — anders mag de lijst korter", () => {
    const nu = new Set(orphanNodes().map((n) => n.path));
    const opgelost = BEKENDE_WEZEN.filter((p) => !nu.has(p));
    expect(
      opgelost,
      `deze wezen zijn opgelost — haal ze uit BEKENDE_WEZEN:\n  ${opgelost.join("\n  ")}`,
    ).toEqual([]);
  });
});

describe("commerciële pagina's hebben informationele dekking", () => {
  // Een vergelijkingspagina zonder artikelen die ernaartoe wijzen is precies
  // het patroon dat als dun affiliate-werk leest.
  it("elke /beste/-vergelijking wordt door minstens drie contentpagina's gelinkt", () => {
    const inbound = inboundCounts();
    const mager = allGraphNodes()
      .filter((n) => n.type === "vergelijking")
      .map((n) => ({ path: n.path, inbound: inbound.get(n.path) ?? 0 }))
      .filter((r) => r.inbound < 3);

    expect(
      mager,
      `vergelijkingen met te weinig informationele steun:\n  ${mager
        .map((r) => `${r.path}: ${r.inbound}`)
        .join("\n  ")}`,
    ).toEqual([]);
  });
});
