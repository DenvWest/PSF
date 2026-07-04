#!/usr/bin/env node
/**
 * Genereert PDF-snapshots van privacyverklaring, verwerkingsregister en DPIA.
 * Gebruik: node scripts/generate-legal-pdfs.mjs
 */
import { execSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const { marked } = require("marked");

const CSS = readFileSync(join(__dirname, "legal-pdf.css"), "utf8");
const CHROME =
  process.env.CHROME_PATH ||
  "/usr/bin/google-chrome";

const OUTPUT_DIRS = [
  join(root, "docs/legal/pdf"),
  "/home/dennisvanwestbroek/Documenten/documenten/perfectsupplement/privacy",
];

const DOCUMENTS = [
  {
    input: join(root, "docs/legal/Privacyverklaring_PerfectSupplement_nl.md"),
    output: "Privacyverklaring_PerfectSupplement_nl.pdf",
    title: "Privacyverklaring",
    subtitle: "PerfectSupplement.nl — versie 2.0 — 4 juli 2026",
    internal: false,
  },
  {
    input: join(root, "docs/core/VERWERKINGSREGISTER.md"),
    output: "Verwerkingsregister_PerfectSupplement_nl.pdf",
    title: "Verwerkingsregister",
    subtitle: "AVG art. 30 — intern document — 4 juli 2026",
    internal: true,
  },
  {
    input: join(root, "docs/core/DPIA.md"),
    output: "DPIA_PerfectSupplement_nl.pdf",
    title: "Data Protection Impact Assessment",
    subtitle: "AVG art. 35 — versie 1.1 — 4 juli 2026",
    internal: true,
  },
];

function stripRepoMeta(md) {
  return md
    .replace(/^> \*\*Layer 1.*\n/gm, "")
    .replace(/^> Verwante docs:.*\n/gm, "")
    .replace(/^> Opgesteld.*\n/gm, "")
    .replace(/^> \*\*Onderhoud:.*\n/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function wrapHtml({ title, subtitle, body, internal }) {
  const banner = internal
    ? `<p class="cover-meta"><strong>INTERN DOCUMENT</strong> — niet publiceren. Bewaren zolang de verwerking plaatsvindt.</p>`
    : `<p class="cover-meta">Publiek document — live versie: perfectsupplement.nl/privacy</p>`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>${title} — PerfectSupplement</title>
  <style>${CSS}</style>
</head>
<body>
  ${banner}
  <div class="cover-meta">${subtitle}<br>Verwerkingsverantwoordelijke: Dennis van Westbroek · KVK 74667653 · info@perfectsupplement.nl</div>
  ${body}
</body>
</html>`;
}

function markdownToHtml(md) {
  return marked.parse(stripRepoMeta(md), { gfm: true, breaks: false });
}

function printPdf(htmlPath, pdfPath) {
  const cmd = [
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=10000",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ].join(" ");

  execSync(cmd, { stdio: "pipe" });
}

function main() {
  try {
    require.resolve("marked");
  } catch {
    console.error("Installeer marked: npm install --no-save marked");
    process.exit(1);
  }

  const tmpDir = join(root, ".tmp/legal-pdf");
  mkdirSync(tmpDir, { recursive: true });

  for (const dir of OUTPUT_DIRS) {
    mkdirSync(dir, { recursive: true });
  }

  for (const doc of DOCUMENTS) {
    const md = readFileSync(doc.input, "utf8");
    const body = markdownToHtml(md);
    const html = wrapHtml({ ...doc, body });
    const htmlPath = join(tmpDir, doc.output.replace(".pdf", ".html"));
    const primaryPdf = join(OUTPUT_DIRS[0], doc.output);

    writeFileSync(htmlPath, html, "utf8");
    printPdf(htmlPath, primaryPdf);

    for (const dir of OUTPUT_DIRS.slice(1)) {
      copyFileSync(primaryPdf, join(dir, doc.output));
    }

    console.log(`✓ ${doc.output}`);
  }

  console.log("\nPDF's geschreven naar:");
  for (const dir of OUTPUT_DIRS) {
    console.log(`  ${dir}`);
  }
}

main();
