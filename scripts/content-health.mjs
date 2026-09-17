/**
 * Content-health check — het interne spinnenweb geverifieerd tegen de code,
 * niet tegen een prompt die een mens moet uitvoeren.
 *
 * Vervangt geen redactioneel oordeel: dit script vindt dode links, weespagina's
 * en gaten in de blog → supplementgids → vergelijking-keten. Het beslist nooit
 * WELKE link erbij moet — dat blijft aan de schrijver, zoals SEO_RULES.md
 * voorschrijft voor inline links.
 *
 * Volgt bewust hetzelfde patroon als scripts/generate-state.mjs: een platte
 * node-ESM-script die de bestandsboom regex-scant, geen TS-import, geen
 * compileerstap. Zodra /admin/site een content-health-paneel krijgt (fase 7
 * in docs/plan/ARCHITECTUUR_CONTENT_ECOSYSTEEM_2026-09.md), verhuist deze
 * logica naar src/lib/graph/content-health.ts en wordt dit bestand een dunne
 * CLI-wrapper eromheen — nu is dat een migratie zonder nut.
 *
 * Severities:
 *   CRITICAL — blokkeert de push (dode link, weespagina)
 *   MEDIUM   — gerapporteerd, blokkeert niet (zwak verbonden, verouderd,
 *              vergelijking zonder gids ertussen)
 *   LOW      — informatief (ontbrekende revisiedatum)
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const STALE_MONTHS = 12;
const NOW = new Date();

// ─────────────────────────────────────────────────────────────────────────
// 1. Route-registry — welke interne paden bestaan echt
// ─────────────────────────────────────────────────────────────────────────

function listTsSlugs(dir, excludeBasenames = new Set()) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => name.replace(/\.ts$/, ""))
    .filter((slug) => !excludeBasenames.has(slug));
}

// Blog: index.ts/categorieen.ts zijn geen artikelen; cornerstone-supplementen.ts
// bevat pointer-entries die al naar bestaande routes wijzen (geen eigen content
// die backlinks nodig heeft — zelfde uitzondering als generate-state.mjs maakt).
const BLOG_EXCLUDE = new Set([
  "index",
  "categorieen",
  "publiek-pijlers",
  "cornerstone-supplementen",
]);
const blogSlugs = listTsSlugs(join(SRC, "data/blog"), BLOG_EXCLUDE);

function extractObjectKeys(filePath, exportMarker) {
  const content = readFileSync(filePath, "utf8");
  const start = content.indexOf(exportMarker);
  if (start === -1) {
    throw new Error(`${exportMarker} niet gevonden in ${filePath}`);
  }
  // Zoek het object-literal na de marker en pak top-level keys (2-space indent).
  const slice = content.slice(start);
  const closeIdx = slice.indexOf("\n};");
  const body = closeIdx === -1 ? slice : slice.slice(0, closeIdx);
  const matches = [...body.matchAll(/^\s{2}["']?([a-zA-Z0-9_-]+)["']?:\s*\S/gm)];
  return matches.map((m) => m[1]);
}

function extractSlugField(filePath, marker) {
  const content = readFileSync(filePath, "utf8");
  const start = content.indexOf(marker);
  if (start === -1) throw new Error(`${marker} niet gevonden in ${filePath}`);
  const slice = content.slice(start);
  const matches = [...slice.matchAll(/^\s+slug:\s*["']([a-z0-9-]+)["']/gm)];
  return matches.map((m) => m[1]);
}

const kennisbankSlugs = extractSlugField(
  join(SRC, "data/kennisbank.ts"),
  "export const kennisbankTerms",
);

const comparisonSlugs = extractObjectKeys(
  join(SRC, "data/supplements/index.ts"),
  "const allSupplementData",
);

// ALL_SUPPLEMENT_SLUGS is een array-literal, geen object — eigen extractie.
const supplementGuideSlugs = (() => {
  const content = readFileSync(join(SRC, "data/supplement-guides/index.ts"), "utf8");
  const m = content.match(/ALL_SUPPLEMENT_SLUGS[^=]*=\s*\[([^\]]*)\]/s);
  if (!m) throw new Error("ALL_SUPPLEMENT_SLUGS niet gevonden");
  return [...m[1].matchAll(/["']([a-z0-9-]+)["']/g)].map((x) => x[1]);
})();

const gidsThemaSlugs = extractObjectKeys(
  join(SRC, "data/gids/index.ts"),
  "export const GUIDE_DATA",
);

const gidsenSlugs = (() => {
  const content = readFileSync(join(SRC, "data/guides.ts"), "utf8");
  const start = content.indexOf("export const GUIDES");
  const slice = content.slice(start);
  return [...slice.matchAll(/^\s+key:\s*["']([a-z0-9-]+)["']/gm)].map((m) => m[1]);
})();

const profielSlugs = extractObjectKeys(
  join(SRC, "data/profiles/index.ts"),
  "export const PROFILE_PAGES",
);

const productSlugs = (() => {
  const content = readFileSync(join(SRC, "data/supplement-hub/score-inputs.ts"), "utf8");
  return [...content.matchAll(/^\s{4}["']([a-z0-9-]+)["']:\s*\{/gm)].map((m) => m[1]);
})();

// Statische app-routes: elke src/app/**/page.tsx, omgezet naar een padvorm
// met '*' voor dynamische segmenten en '(group)'-mappen genegeerd. Dit vangt
// alle overige routes (pillars, /account, /intake, ...) zonder ze hier
// allemaal met de hand op te sommen.
function collectAppRouteShapes() {
  const shapes = [];
  function walk(dir, segments) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "api") continue; // buiten scope voor content-health
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        const isGroup = /^\(.*\)$/.test(entry.name);
        const isDynamic = /^\[.*\]$/.test(entry.name);
        const nextSegments = isGroup
          ? segments
          : [...segments, isDynamic ? "*" : entry.name];
        walk(full, nextSegments);
      } else if (entry.name === "page.tsx") {
        shapes.push("/" + segments.join("/"));
      }
    }
  }
  walk(join(SRC, "app"), []);
  return shapes;
}

const appRouteShapes = collectAppRouteShapes();

function matchesShape(pathSegments, shapeSegments) {
  if (pathSegments.length !== shapeSegments.length) return false;
  return shapeSegments.every((seg, i) => seg === "*" || seg === pathSegments[i]);
}

const DYNAMIC_CONTENT_ROUTES = [
  { prefix: "/blog/", slugs: new Set(blogSlugs) },
  { prefix: "/kennisbank/", slugs: new Set(kennisbankSlugs) },
  { prefix: "/beste/", slugs: new Set(comparisonSlugs) },
  { prefix: "/supplementen/", slugs: new Set(supplementGuideSlugs) },
  { prefix: "/gidsen/", slugs: new Set(gidsenSlugs) },
  { prefix: "/gids/", slugs: new Set(gidsThemaSlugs) },
  { prefix: "/profiel/", slugs: new Set(profielSlugs) },
  { prefix: "/product/", slugs: new Set(productSlugs) },
];

function isKnownRoute(rawHref) {
  const clean = rawHref.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (clean === "/" || clean === "") return true;
  if (/^\/(admin|api)(\/|$)/.test(clean)) return true; // buiten scope

  for (const { prefix, slugs } of DYNAMIC_CONTENT_ROUTES) {
    if (clean.startsWith(prefix)) {
      const rest = clean.slice(prefix.length).split("/")[0];
      return slugs.has(rest);
    }
  }

  const pathSegments = clean.slice(1).split("/");
  return appRouteShapes.some((shape) =>
    matchesShape(pathSegments, shape === "/" ? [] : shape.slice(1).split("/")),
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Uitgaande links verzamelen over de hele codebase
// ─────────────────────────────────────────────────────────────────────────

const LINK_PREFIXES =
  "blog|kennisbank|beste|supplementen|gids|gidsen|profiel|inzichten|intake|dashboard|" +
  "voeding-na-40|beweging-na-40|slaap-verbeteren-na-40|stress-verminderen-na-40|" +
  "energie-na-40|herstel-verbeteren-na-40|testosteron-na-40|overgang|onderbouwing|" +
  "methodologie|ps-score|rapport|product|account";

// Geen '[' / ']' als grensteken: markdown-labels zoals "[/beste](/beste/x)"
// hebben "/beste" ook tussen blokhaken staan als zichtbare tekst, niet als
// href — dat zou een valse dode link opleveren. Array-literals ("/blog/x")
// zijn al quote-omsloten en hebben de blokhaak niet nodig als grens.
const LINK_RE = new RegExp(
  `["'\`(](\\/(?:${LINK_PREFIXES})(?:\\/[a-z0-9\\-.]+)*)["'\`)]`,
  "gi",
);

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__tests__") continue; // testfixtures zijn geen content-links
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.tsx") && !entry.name.endsWith(".test.ts"))
      out.push(full);
  }
  return out;
}

const allFiles = walkFiles(SRC);

/** slug -> Set(bronbestand) — voor blog/kennisbank telt gerelateerdeSluggen/relatedSlugs ook. */
const inbound = new Map();
/** absolute href (bv. "/blog/x") -> Set(bronbestand), voor de dode-linkcheck. */
const hrefSources = new Map();

function addHref(href, sourceFile) {
  if (!hrefSources.has(href)) hrefSources.set(href, new Set());
  hrefSources.get(href).add(sourceFile);
}

function addInboundSlug(kind, slug, sourceFile) {
  const key = `${kind}:${slug}`;
  if (!inbound.has(key)) inbound.set(key, new Set());
  inbound.get(key).add(sourceFile);
}

for (const file of allFiles) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, "utf8");

  let m;
  while ((m = LINK_RE.exec(content))) {
    // pathname.startsWith("/intake/plan") is een prefix-check, geen link —
    // zou anders als "dode link" gemeld worden omdat /intake/plan zelf geen
    // route is (alleen /intake/plan/[domain]).
    const precedingContext = content.slice(Math.max(0, m.index - 15), m.index);
    if (/startsWith\($/.test(precedingContext)) continue;

    const href = m[1].replace(/\/$/, "");
    addHref(href, rel);
    const blogMatch = href.match(/^\/blog\/([a-z0-9-]+)$/);
    if (blogMatch) addInboundSlug("blog", blogMatch[1], rel);
    const kbMatch = href.match(/^\/kennisbank\/([a-z0-9-]+)$/);
    if (kbMatch) addInboundSlug("kennisbank", kbMatch[1], rel);
  }

  // gerelateerdeSluggen: [...] en relatedSlugs: [...] — slug-only, geen /blog/-prefix.
  for (const arrMatch of content.matchAll(
    /(gerelateerdeSluggen|relatedSlugs):\s*\[([^\]]*)\]/gs,
  )) {
    const kind = "blog"; // relatedSlugs komt ook voor in kennisbank.ts; zie hieronder
    const isKennisbank = rel.endsWith("data/kennisbank.ts");
    for (const slugMatch of arrMatch[2].matchAll(/["']([a-z0-9-]+)["']/g)) {
      addInboundSlug(isKennisbank ? "kennisbank" : kind, slugMatch[1], rel);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Bevindingen
// ─────────────────────────────────────────────────────────────────────────

const findings = { CRITICAL: [], MEDIUM: [], LOW: [] };

function report(severity, message) {
  findings[severity].push(message);
}

// --- CRITICAL: dode interne links ---
for (const [href, sources] of hrefSources) {
  if (!isKnownRoute(href)) {
    for (const src of sources) {
      report("CRITICAL", `Dode link "${href}" in ${src}`);
    }
  }
}

// --- CRITICAL + MEDIUM: weespagina's / zwak verbonden (blog) ---
// Eigen bestand telt niet mee als "inkomend".
function ownFile(kind, slug) {
  return kind === "blog" ? `src/data/blog/${slug}.ts` : `src/data/kennisbank.ts`;
}

for (const slug of blogSlugs) {
  const sources = inbound.get(`blog:${slug}`) ?? new Set();
  const external = [...sources].filter((s) => s !== ownFile("blog", slug));
  if (external.length === 0) {
    report("CRITICAL", `Weespagina /blog/${slug} — 0 inkomende interne links`);
  } else if (external.length === 1) {
    report(
      "MEDIUM",
      `Zwak verbonden /blog/${slug} — 1 inkomende link (uit ${external[0]})`,
    );
  }
}

for (const slug of kennisbankSlugs) {
  const sources = inbound.get(`kennisbank:${slug}`) ?? new Set();
  const external = [...sources].filter((s) => s !== "src/data/kennisbank.ts");
  if (external.length === 0) {
    report("CRITICAL", `Weespagina /kennisbank/${slug} — 0 inkomende interne links`);
  } else if (external.length === 1) {
    report(
      "MEDIUM",
      `Zwak verbonden /kennisbank/${slug} — 1 inkomende link (uit ${external[0]})`,
    );
  }
}

// --- MEDIUM: blog linkt naar /beste/* zonder /supplementen/* ertussen ---
// Comparison-slug -> supplementgids-slug. Losse map t.o.v. comparison-availability.ts
// omdat die naar approved-claims-keys mapt, niet naar gidsslugs; hier is het 1-op-1
// op twee uitzonderingen na.
const COMPARISON_TO_GUIDE_SLUG = {
  magnesium: "magnesium",
  "omega-3-supplement": "omega-3",
  ashwagandha: "ashwagandha",
  "vitamine-d": "vitamine-d",
  creatine: "creatine",
  zink: "zink",
  eiwitpoeder: "eiwitpoeder",
};

for (const slug of blogSlugs) {
  const file = join(SRC, `data/blog/${slug}.ts`);
  const content = readFileSync(file, "utf8");
  const comparisonLinks = [
    ...content.matchAll(/\/beste\/([a-z0-9-]+)/g),
  ].map((m) => m[1]);
  for (const compSlug of new Set(comparisonLinks)) {
    const guideSlug = COMPARISON_TO_GUIDE_SLUG[compSlug];
    if (!guideSlug) continue;
    const hasGuideLink = content.includes(`/supplementen/${guideSlug}`);
    if (!hasGuideLink) {
      report(
        "MEDIUM",
        `/blog/${slug} linkt naar /beste/${compSlug} zonder /supplementen/${guideSlug} ertussen`,
      );
    }
  }
}

// --- MEDIUM/LOW: revisiedatum ---
function monthsAgo(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return (NOW - d) / (1000 * 60 * 60 * 24 * 30);
}

for (const slug of blogSlugs) {
  const content = readFileSync(join(SRC, `data/blog/${slug}.ts`), "utf8");
  const m = content.match(/laatstBijgewerktOp:\s*["']([\d-]+)["']/);
  if (!m) {
    report("LOW", `/blog/${slug} — geen laatstBijgewerktOp`);
    continue;
  }
  const age = monthsAgo(m[1]);
  if (age !== null && age > STALE_MONTHS) {
    report(
      "MEDIUM",
      `/blog/${slug} — laatst bijgewerkt ${m[1]} (${Math.round(age)} maanden geleden)`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Rapport
// ─────────────────────────────────────────────────────────────────────────

function printSection(title, items) {
  console.log(`\n${title} (${items.length})`);
  if (items.length === 0) {
    console.log("  geen");
    return;
  }
  for (const item of items) console.log(`  - ${item}`);
}

console.log("=== Content-health ===");
console.log(
  `Geregistreerd: ${blogSlugs.length} blog, ${kennisbankSlugs.length} kennisbank, ` +
    `${comparisonSlugs.length} vergelijkingen, ${supplementGuideSlugs.length} gidsen, ` +
    `${gidsenSlugs.length} gezondheidsgidsen, ${profielSlugs.length} profielen, ` +
    `${productSlugs.length} producten`,
);

printSection("CRITICAL", findings.CRITICAL);
printSection("MEDIUM", findings.MEDIUM);
printSection("LOW", findings.LOW);

console.log(
  `\nTotaal: ${findings.CRITICAL.length} critical, ${findings.MEDIUM.length} medium, ${findings.LOW.length} low`,
);

if (findings.CRITICAL.length > 0) {
  console.error("\n[content-health] CRITICAL bevindingen — los op vóór je pusht.");
  process.exit(1);
}

console.log("\n[content-health] geen CRITICAL bevindingen.");
