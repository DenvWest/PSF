import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();

const PILLAR_EXCLUDED = new Set([
  "intake",
  "blog",
  "profiel",
  "kennisbank",
  "thema",
  "admin",
  "api",
  "beste",
  "supplementen",
  "over-ons",
  "methodologie",
  "faqs",
  "disclaimer",
  "privacy",
  "cookies",
]);

const THEMA_HUBS = ["slaap", "stress", "energie", "herstel"];

function listTsSlugs(dir, { ignoreIndex = false } = {}) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".ts") && (!ignoreIndex || name !== "index.ts"))
    .map((name) => name.replace(/\.ts$/, ""))
    .sort();
}

function scanSupplements() {
  return listTsSlugs(join(ROOT, "src/data/supplements"));
}

function isDynamicDirName(name) {
  return name.includes("[") || name.includes("]");
}

function scanPillars() {
  const appDir = join(ROOT, "src/app");
  const routes = [];

  function walk(currentDir) {
    const dirName = basename(currentDir);
    const pagePath = join(currentDir, "page.tsx");

    if (existsSync(pagePath)) {
      const isAppRoot = currentDir === appDir;
      const excluded = !isAppRoot && (PILLAR_EXCLUDED.has(dirName) || isDynamicDirName(dirName));

      if (isAppRoot || !excluded) {
        const rel = relative(appDir, currentDir).replace(/\\/g, "/");
        routes.push(rel === "" ? "/" : `/${rel}`);
      }
    }

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(currentDir, entry.name));
      }
    }
  }

  walk(appDir);
  return [...new Set(routes)].sort();
}

function scanProfiles() {
  return listTsSlugs(join(ROOT, "src/data/profiles"), { ignoreIndex: true });
}

function scanBlog() {
  return listTsSlugs(join(ROOT, "src/data/blog"));
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
  const pillars = scanPillars();
  const profiles = scanProfiles();
  const blog = scanBlog();
  const kennisbankCount = countKennisbankTerms();
  const markdown = buildMarkdown({
    supplements,
    pillars,
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
