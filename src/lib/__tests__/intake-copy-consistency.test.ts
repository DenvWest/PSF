import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { QUESTIONS } from "@/data/intake-questions";
import { INTERVENTION_DOMAIN_SCORE_KEYS } from "@/lib/intake-engine";
import {
  INTAKE_DOMAIN_COUNT,
  INTAKE_QUESTION_COUNT,
} from "@/lib/intake-facts";

/**
 * De getallen over de Leefstijlcheck stonden in ~40 losse teksten en liepen
 * weg van de bron: "15 vragen" bij zestien, "6 domeinen" bij vijf. Deze test
 * is de enige reden dat dat niet opnieuw gebeurt — hij faalt zodra copy een
 * ander aantal noemt dan de engine kent, of zodra de engine verandert zonder
 * dat de copy meegaat.
 */

const SRC_ROOT = join(process.cwd(), "src");

/** Teksten die een ander soort "domeinen" tellen dan de check. */
const DOMAIN_ALLOWLIST: readonly { file: string; phrase: string }[] = [
  // De stressgids telt vier bronnen van stress, geen check-domeinen.
  { file: "src/data/gids/stress.ts", phrase: "4 domeinen" },
];

/** Uitgeschreven getallen tellen net zo hard als cijfers. */
const NUMBER_WORDS: Record<string, number> = {
  vier: 4,
  vijf: 5,
  zes: 6,
  zeven: 7,
  acht: 8,
  veertien: 14,
  vijftien: 15,
  zestien: 16,
  zeventien: 17,
  achttien: 18,
};

/** Leest "5" en "vijf" allebei als 5. */
function readCount(raw: string): number {
  const asNumber = Number(raw);
  return Number.isNaN(asNumber) ? (NUMBER_WORDS[raw.toLowerCase()] ?? -1) : asNumber;
}

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      collectSourceFiles(full, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** Regels zonder commentaar — een changelog mag een oud aantal noemen. */
function codeLines(source: string): { line: string; index: number }[] {
  return source.split("\n").flatMap((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
      return [];
    }
    return [{ line, index: index + 1 }];
  });
}

/** Bestanden die over een andere taxonomie gaan dan de Leefstijlcheck. */
const FILE_ALLOWLIST = [
  join("lib", "intake-facts.ts"),
  // /inzichten telt content-pijlers (incl. energie en herstel), geen stuurdomeinen.
  join("app", "inzichten", "page.tsx"),
];

const SOURCE_FILES = collectSourceFiles(SRC_ROOT).filter(
  (file) => !FILE_ALLOWLIST.some((allowed) => file.endsWith(allowed)),
);

describe("intake-copy-consistency", () => {
  it("houdt de constanten gelijk aan de bron", () => {
    expect(INTAKE_QUESTION_COUNT).toBe(QUESTIONS.length);
    expect(INTAKE_DOMAIN_COUNT).toBe(INTERVENTION_DOMAIN_SCORE_KEYS.length);
  });

  it("noemt overal het juiste aantal vragen", () => {
    const wrong: string[] = [];

    for (const file of SOURCE_FILES) {
      for (const { line, index } of codeLines(readFileSync(file, "utf8"))) {
        const matches = [
          ...line.matchAll(/\b(\d{1,3}) vragen\b/g),
          ...line.matchAll(/\bvraag \d{1,3} van (\d{1,3})\b/gi),
          ...line.matchAll(/\b(veertien|vijftien|zestien|zeventien|achttien) vragen\b/gi),
        ];
        for (const match of matches) {
          if (readCount(match[1]) !== INTAKE_QUESTION_COUNT) {
            wrong.push(`${file.replace(`${process.cwd()}/`, "")}:${index} — "${match[0]}"`);
          }
        }
      }
    }

    expect(
      wrong,
      `Copy noemt een ander aantal vragen dan de check heeft (${INTAKE_QUESTION_COUNT}).`,
    ).toEqual([]);
  });

  it("noemt overal het juiste aantal leefstijldomeinen", () => {
    const wrong: string[] = [];

    for (const file of SOURCE_FILES) {
      const relative = file.replace(`${process.cwd()}/`, "");
      for (const { line, index } of codeLines(readFileSync(file, "utf8"))) {
        const matches = [
          ...line.matchAll(/\b(\d{1,3}) (?:leefstijl-?)?domeinen\b/g),
          ...line.matchAll(
            /\b(vier|vijf|zes|zeven|acht) (?:leefstijl-?)?domeinen\b/gi,
          ),
        ];
        for (const match of matches) {
          const allowed = DOMAIN_ALLOWLIST.some(
            (entry) => entry.file === relative && entry.phrase === match[0],
          );
          if (!allowed && readCount(match[1]) !== INTAKE_DOMAIN_COUNT) {
            wrong.push(`${relative}:${index} — "${match[0]}"`);
          }
        }
      }
    }

    expect(
      wrong,
      `Copy noemt een ander aantal domeinen dan de check stuurt (${INTAKE_DOMAIN_COUNT}).`,
    ).toEqual([]);
  });
});
