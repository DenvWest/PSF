#!/usr/bin/env node
//
// check-migraties-openstaand.mjs — bewaakt dat supabase/migrations/OPENSTAAND.md
// klopt met de migratiebestanden in de repo.
//
// Faalt als een migratie na de baseline nergens in het document staat, of als het
// document een migratie noemt die niet (meer) bestaat.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = join(rootDir, "supabase", "migrations");
const docPath = join(migrationsDir, "OPENSTAAND.md");
const docLabel = "supabase/migrations/OPENSTAAND.md";

const doc = readFileSync(docPath, "utf8");

// Voorbeelden in code-fences zijn documentatie, geen registratie.
let inFence = false;
const lines = doc.split("\n").filter((line) => {
  if (line.trimStart().startsWith("```")) {
    inFence = !inFence;
    return false;
  }
  return !inFence;
});

const baselineMatch = doc.match(/\*\*Baseline toegepast t\/m:\*\*\s*`([^`]+)`/);
if (!baselineMatch) {
  console.error(`[migraties] Geen baseline gevonden in ${docLabel}.`);
  process.exit(1);
}
const baseline = baselineMatch[1];

const fileNamePattern = /(\d{14}_[A-Za-z0-9_-]+\.sql)/;

const openMigrations = lines
  .map((line) => line.match(/^###\s+\[[ xX]\]\s+(\d{14}_[A-Za-z0-9_-]+\.sql)/))
  .filter((match) => match !== null)
  .map((match) => match[1]);

const appliedMigrations = lines
  .filter((line) => line.startsWith("|"))
  .map((line) => line.match(fileNamePattern))
  .filter((match) => match !== null)
  .map((match) => match[1]);

const registered = new Set([...openMigrations, ...appliedMigrations]);

const migrationFiles = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const afterBaseline = migrationFiles.filter((name) => name > baseline);
const missing = afterBaseline.filter((name) => !registered.has(name));
const unknown = [...registered].filter((name) => !migrationFiles.includes(name));

const problems = [];

if (missing.length > 0) {
  problems.push(
    `Deze migraties staan niet in ${docLabel} (baseline: ${baseline}):\n` +
      missing.map((name) => `  - ${name}`).join("\n") +
      `\nVoeg per migratie een blok toe onder "Nog uit te voeren" — zie het formaat in het document.`,
  );
}

if (unknown.length > 0) {
  problems.push(
    `${docLabel} noemt migraties die niet bestaan:\n` +
      unknown.map((name) => `  - ${name}`).join("\n"),
  );
}

if (problems.length > 0) {
  console.error(`[migraties] ${problems.join("\n\n[migraties] ")}`);
  process.exit(1);
}

const openCount = openMigrations.filter((name) => name > baseline).length;
console.log(
  openCount === 0
    ? `[migraties] Niets openstaand — productie is bij t/m ${baseline}.`
    : `[migraties] ${openCount} openstaande migratie(s), draaien via Supabase SQL Editor:\n` +
        openMigrations
          .filter((name) => name > baseline)
          .map((name) => `  - supabase/migrations/${name}`)
          .join("\n"),
);
