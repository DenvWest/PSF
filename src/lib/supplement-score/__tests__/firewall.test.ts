import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DE AFFILIATE-FIREWALL.
 *
 * De PS-Score mag nooit weten wat een product kost, waar het vandaan komt of
 * wat het oplevert. Technisch is die koppeling triviaal — het product-object
 * draagt `affiliateSlug` en de score-invoer draagt een prijs. Deze test is de
 * enige maatregel die over een jaar nog tegenhoudt dat iemand "even snel" een
 * marge in de weging betrekt.
 *
 * Faalt deze test, dan is dat geen testprobleem maar een ontwerpovertreding.
 * Pas de code aan, niet de test.
 */

const GUARDED_DIR = join(process.cwd(), "src/lib/supplement-score");

const FORBIDDEN_PATTERNS: readonly { pattern: RegExp; why: string }[] = [
  { pattern: /\baffiliateSlug\b/, why: "affiliate-sleutel hoort niet in de scorelaag" },
  { pattern: /affiliate-links/, why: "affiliate-linkregistratie hoort niet in de scorelaag" },
  { pattern: /\bProductScoreInputs\b/, why: "dat type draagt de prijs; de score gebruikt TrustScoreInput" },
  { pattern: /\bprijs/i, why: "prijs mag de kwaliteitsscore niet raken" },
  { pattern: /\bprice/i, why: "prijs mag de kwaliteitsscore niet raken" },
  { pattern: /\bcent(en)?\b/i, why: "bedragen horen niet in de scorelaag" },
  { pattern: /\bcommissi/i, why: "commissie mag de kwaliteitsscore niet raken" },
  { pattern: /\bpd_[a-z_]+\b/, why: "PartnerDesk-tabellen horen niet in de scorelaag" },
  { pattern: /\bretailer\b/i, why: "verkoper hoort niet in de scorelaag" },
  { pattern: /from ["']@\/lib\/affiliate/, why: "affiliate-laag mag hier niet in" },
  { pattern: /from ["']@\/lib\/partnerdesk/, why: "PartnerDesk mag hier niet in" },
];

/** Regels waarin een verboden term bewust als uitleg staat. Alleen commentaar. */
function isExplanatoryComment(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")
  );
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
    return full.endsWith(".ts") ? [full] : [];
  });
}

describe("supplement-score firewall", () => {
  const files = collectSourceFiles(GUARDED_DIR);

  it("bewaakt een niet-lege map", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(FORBIDDEN_PATTERNS)(
    "bevat nergens $pattern ($why)",
    ({ pattern }) => {
      const hits: string[] = [];

      for (const file of files) {
        const lines = readFileSync(file, "utf8").split("\n");
        lines.forEach((line, index) => {
          if (isExplanatoryComment(line)) {
            return;
          }
          if (pattern.test(line)) {
            hits.push(`${file}:${index + 1} → ${line.trim()}`);
          }
        });
      }

      expect(hits).toEqual([]);
    },
  );
});
