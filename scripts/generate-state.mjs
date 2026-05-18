import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const PILLAR_ROUTES = [
  "/energie-na-40",
  "/herstel-verbeteren-na-40",
  "/slaap-verbeteren-na-40",
  "/stress-verminderen-man",
  "/testosteron-na-40",
];

const THEMA_HUBS = ["slaap", "stress", "energie", "herstel"];

const STRUCTURE_BASENAMES = new Set(["index"]);

function listTsSlugs(dir, { excludeBasenames = new Set() } = {}) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => {
      if (!name.endsWith(".ts")) return false;
      const slug = name.replace(/\.ts$/, "");
      return !STRUCTURE_BASENAMES.has(slug) && !excludeBasenames.has(slug);
    })
    .map((name) => name.replace(/\.ts$/, ""))
    .sort();
}

function scanSupplements() {
  return listTsSlugs(join(ROOT, "src/data/supplements"));
}

function scanPillars() {
  const appDir = join(ROOT, "src/app");
  const missing = [];

  for (const route of PILLAR_ROUTES) {
    const segment = route.slice(1);
    const pagePath = join(appDir, segment, "page.tsx");
    if (!existsSync(pagePath)) {
      missing.push(route);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `Pillar page.tsx ontbreekt voor: ${missing.join(", ")} (verwacht in src/app/<route>/page.tsx)`,
    );
  }

  return { routes: [...PILLAR_ROUTES], missing };
}

function scanProfiles() {
  return listTsSlugs(join(ROOT, "src/data/profiles"));
}

function scanBlog() {
  return listTsSlugs(join(ROOT, "src/data/blog"), {
    excludeBasenames: new Set(["categorieen", "cornerstone-supplementen"]),
  });
}

function countKennisbankTerms() {
  const filePath = join(ROOT, "src/data/kennisbank.ts");
  const content = readFileSync(filePath, "utf8");
  const marker = "export const kennisbankTerms";
  const start = content.indexOf(marker);
  if (start === -1) {
    throw new Error("export const kennisbankTerms not found in src/data/kennisbank.ts");
  }
  const slice = content.slice(start);
  const matches = slice.match(/^\s+slug:/gm);
  return matches ? matches.length : 0;
}

function markdownList(items) {
  if (items.length === 0) return "_geen_\n";
  return items.map((item) => `- \`${item}\``).join("\n") + "\n";
}

function buildMarkdown({
  supplements,
  pillars,
  pillarMissing,
  profiles,
  blog,
  kennisbankCount,
  themaHubs,
}) {
  const generatedAt = new Date().toISOString();
  const lines = [
    "# PROJECT STATE — AUTO-GEGENEREERD",
    "> NIET HANDMATIG BEWERKEN. Gegenereerd door scripts/generate-state.mjs.",
    `> Laatst gegenereerd: ${generatedAt}`,
    "",
    "## Vergelijkingen (`src/data/supplements/`)",
    "",
    `**Aantal:** ${supplements.length}`,
    "",
    markdownList(supplements).trimEnd(),
    "",
    "## Pillar-routes (`src/app/`)",
    "",
    `**Aantal:** ${pillars.length}`,
    "",
    ...(pillarMissing.length > 0
      ? [
          `> Waarschuwing: geen \`page.tsx\` gevonden voor: ${pillarMissing.map((r) => `\`${r}\``).join(", ")}`,
          "",
        ]
      : []),
    markdownList(pillars).trimEnd(),
    "",
    "## Profielen (`src/data/profiles/`)",
    "",
    `**Aantal:** ${profiles.length}`,
    "",
    markdownList(profiles).trimEnd(),
    "",
    "## Blog (`src/data/blog/`)",
    "",
    `**Aantal:** ${blog.length}`,
    "",
    markdownList(blog).trimEnd(),
    "",
    "## Kennisbank (`src/data/kennisbank.ts`)",
    "",
    `**Aantal termen:** ${kennisbankCount}`,
    "",
    "## Thema-hubs",
    "",
    `**Aantal:** ${themaHubs.length}`,
    "",
    markdownList(themaHubs).trimEnd(),
    "",
  ];

  return lines.join("\n");
}

function main() {
  const supplements = scanSupplements();
  const { routes: pillars, missing: pillarMissing } = scanPillars();
  const profiles = scanProfiles();
  const blog = scanBlog();
  const kennisbankCount = countKennisbankTerms();
  const markdown = buildMarkdown({
    supplements,
    pillars,
    pillarMissing,
    profiles,
    blog,
    kennisbankCount,
    themaHubs: THEMA_HUBS,
  });

  const outPath = join(ROOT, "docs/PROJECT_STATE.md");
  writeFileSync(outPath, markdown, "utf8");
  console.log(`Wrote ${outPath}`);
}

main();
