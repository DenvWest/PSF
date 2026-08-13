import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DE FIREWALL — zie BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §7.
 *
 * Het Connection Profile mag nooit gezondheidsdata lezen, afleiden of
 * hergebruiken. `account_id` is gedeeld (dezelfde ingelogde persoon), dus een
 * join is technisch mógelijk — deze test is de enige maatregel die dat over een
 * jaar nog tegenhoudt wanneer iemand "even snel" iets koppelt.
 *
 * Faalt deze test, dan is dat geen testprobleem maar een ontwerpovertreding.
 * Pas de code aan, niet de test.
 */

const GUARDED_DIRS = [
  join(process.cwd(), "src/lib/connection-profile"),
  join(process.cwd(), "src/data/connection"),
];

/** Namen die gezondheidsdata of de scoring-engine aanduiden. */
const FORBIDDEN_PATTERNS: readonly { pattern: RegExp; why: string }[] = [
  { pattern: /\bCON_[A-Z]+\b/, why: "CON_*-antwoorden zijn gezondheidsgegevens (art. 9)" },
  { pattern: /\bconnection_score\b/, why: "domeinscore hoort niet in de profiel-laag" },
  { pattern: /\bdomain_scores\b/, why: "domeinscores horen niet in de profiel-laag" },
  { pattern: /\bintake_sessions\b/, why: "geen koppeling naar de leefstijlcheck-tabel" },
  { pattern: /\bintake_domain_checkin\b/, why: "geen koppeling naar check-in-data" },
  { pattern: /\burgency_level\b/, why: "urgentieniveau is een gezondheidsafleiding" },
  { pattern: /\bprofile_label\b/, why: "profiellabel is een gezondheidsafleiding" },
  { pattern: /\bvitaliteit\b/i, why: "vitaliteit is samengesteld uit gezondheidsdomeinen" },
  { pattern: /from ["']@\/lib\/intake-engine["']/, why: "scoring-engine mag hier niet in" },
  { pattern: /from ["']@\/lib\/account-dashboard["']/, why: "dashboardmodel draagt domeinscores" },
];

/**
 * Regels waarin een verboden term bewust als uitleg staat. Alleen commentaar:
 * een uitzondering mag nooit uitvoerbare code dekken.
 */
function isExplanatoryComment(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*");
}

function collectSourceFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "__tests__" ? [] : collectSourceFiles(full);
    }
    return full.endsWith(".ts") || full.endsWith(".tsx") ? [full] : [];
  });
}

describe("connection-profile firewall", () => {
  const files = GUARDED_DIRS.flatMap(collectSourceFiles);

  it("bewaakt daadwerkelijk bestanden", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(FORBIDDEN_PATTERNS)(
    "verwijst nergens naar $pattern ($why)",
    ({ pattern }) => {
      const hits: string[] = [];

      for (const file of files) {
        const lines = readFileSync(file, "utf8").split("\n");
        lines.forEach((line, index) => {
          if (isExplanatoryComment(line)) return;
          if (pattern.test(line)) {
            hits.push(`${file.replace(process.cwd() + "/", "")}:${index + 1} → ${line.trim()}`);
          }
        });
      }

      expect(hits).toEqual([]);
    },
  );

  it("gebruikt uitsluitend cprofile_-tabellen", () => {
    const tableRefs = new Set<string>();

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\.from\(\s*["']([a-z_]+)["']/g)) {
        tableRefs.add(match[1]);
      }
    }

    const foreign = [...tableRefs].filter((table) => !table.startsWith("cprofile_"));
    expect(foreign).toEqual([]);
  });
});
