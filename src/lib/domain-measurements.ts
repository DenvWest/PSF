import { STRESS_DEEP_QUESTIONS, STRESS_QUESTIONS } from "@/data/stress-checkin";
import { isMovementFocusKey } from "@/lib/dashboard-url";
import { buildMovementFactRows } from "@/lib/movement-assessment";
import {
  parseStoredMovementCheckin,
  parseStoredMovementCheckinSnapshot,
} from "@/lib/movement-checkin-parse";
import { buildNutritionAnswerRows } from "@/lib/nutrition-answer-labels";
import {
  parseStoredSleepCheckinForFacts,
  parseStoredSleepCheckinSnapshot,
} from "@/lib/sleep-checkin-parse";
import { buildSleepFactRows } from "@/lib/sleep-checkin-readout";
import { parseStoredStressCheckin } from "@/lib/stress-checkin-parse";
import type { StressCheckReport } from "@/lib/stress-ladder";
import type { DomainMeasurementValue, PillarId } from "@/types/dashboard";

/**
 * Wat er per domein onder een meetmoment ligt. De feitenrijen worden
 * herberekend uit dezelfde `raw_inputs` die de check wegschreef — niet
 * bevroren, zodat een copy- of regel-fix ook oude meetmomenten bereikt
 * (zelfde afspraak als de readouts op het domeinscherm).
 */

const STRESS_FIELD_LABEL: Record<keyof StressCheckReport, string> = {
  STR_FREQ: "Spanning",
  STR_RCV: "Tot rust komen",
  STR_AUTO: "Invloed op de opbouw",
  STR_REFL: "Wat je doet onder druk",
  STR_AWARE: "Op tijd doorhebben",
  STR_BLOCK: "Wat je tegenhoudt",
  STR_CHARGE: "Laatst opgeladen",
};

const STRESS_FIELD_ORDER: (keyof StressCheckReport)[] = [
  "STR_FREQ",
  "STR_RCV",
  "STR_AUTO",
  "STR_CHARGE",
  "STR_REFL",
  "STR_AWARE",
  "STR_BLOCK",
];

const STRESS_OPTION_LABELS: Map<string, Map<number, string>> = new Map(
  [...STRESS_QUESTIONS, ...STRESS_DEEP_QUESTIONS].map((question) => [
    question.field,
    new Map(question.options.map((option) => [option.value, option.label])),
  ]),
);

/**
 * Driepunts-indeling van slaap en beweging: onder / bijna / haalt. "na" en
 * "own" betekenen dat er niets is om tegen af te zetten — die krijgen geen
 * positie, en dus ook geen lijn in de grafiek.
 */
const BAND_LEVEL_MAX = 3;

const BAND_LEVEL: Record<string, number> = {
  below: 1,
  near: 2,
  meets: 3,
};

/** De stress-items zijn zelfrapportage op een vierpuntsschaal, 4 = sterkst. */
const STRESS_LEVEL_MAX = 4;

function sleepValues(raw: unknown): DomainMeasurementValue[] {
  const report = parseStoredSleepCheckinForFacts(raw);
  if (!report) {
    return [];
  }
  const focusDimension = parseStoredSleepCheckinSnapshot(raw)?.focusDimension ?? null;
  return buildSleepFactRows(report, focusDimension).map((row) => ({
    key: row.key,
    label: row.label,
    answerLabel: row.answerLabel,
    benchmarkLabel: row.benchmarkLabel,
    level: BAND_LEVEL[row.status] ?? null,
    levelMax: BAND_LEVEL_MAX,
    // Alleen slaapduur draagt een gebronde grens ("Populatierichtlijn: 7+
    // uur"); de rest is een indeling van zijn eigen antwoord. Norm-taal mag
    // dus per rij verschillen, niet per domein.
    scale: row.benchmarkLabel ? "richtlijn" : "zelfrapportage",
  }));
}

function movementValues(raw: unknown): DomainMeasurementValue[] {
  const stored = parseStoredMovementCheckin(raw);
  if (!stored) {
    return [];
  }
  const snapshotFocus = parseStoredMovementCheckinSnapshot(raw)?.focusDimension ?? null;
  const focusDimension = isMovementFocusKey(snapshotFocus) ? snapshotFocus : null;
  return buildMovementFactRows(stored.report, focusDimension).map((row) => ({
    key: row.key,
    label: row.label,
    answerLabel: row.answerLabel,
    benchmarkLabel: row.benchmarkLabel,
    level: BAND_LEVEL[row.status] ?? null,
    levelMax: BAND_LEVEL_MAX,
    // Beweging is het enige domein met een expliciete bronvermelding per rij.
    scale: row.benchmarkSource ? "richtlijn" : "zelfrapportage",
  }));
}

function stressValues(raw: unknown): DomainMeasurementValue[] {
  const report = parseStoredStressCheckin(raw);
  if (!report) {
    return [];
  }
  const rows: DomainMeasurementValue[] = [];
  for (const field of STRESS_FIELD_ORDER) {
    const value = report[field];
    if (typeof value !== "number") {
      continue;
    }
    const answerLabel = STRESS_OPTION_LABELS.get(field)?.get(value);
    if (!answerLabel) {
      continue;
    }
    rows.push({
      key: field,
      label: STRESS_FIELD_LABEL[field],
      answerLabel,
      // Stress kent geen externe richtlijn — je eigen antwoord is de meetlat.
      benchmarkLabel: null,
      // De antwoorden zijn wél geordend (1 = zwaarst, 4 = sterkst), dus een
      // lijn erdoor vergelijkt je met jezelf, niet met een norm.
      level: value,
      levelMax: STRESS_LEVEL_MAX,
      scale: "zelfrapportage",
    });
  }
  return rows;
}

/** De opgegeven waarden onder één domeincheck-rij. Leeg = de rij droeg ze niet. */
export function buildCheckinMeasurementValues(
  pillar: PillarId,
  raw: unknown,
): DomainMeasurementValue[] {
  switch (pillar) {
    case "slaap":
      return sleepValues(raw);
    case "beweging":
      return movementValues(raw);
    case "stress":
      return stressValues(raw);
    default:
      return [];
  }
}

/**
 * Voeding meet niet via `intake_domain_checkin` maar via de innamelog — en het
 * meet antwoorden, geen nutriëntstanden. De rijnaam is daarom de vraag die hij
 * beantwoordde en de cel zijn antwoord; een positie op een schaal staat er
 * niet onder.
 *
 * De nutriëntbanden uit `estimate` blijven hier bewust buiten. Die rusten op
 * drempels die in `intake-reference.ts` per stuk als "VOORSTEL (niet
 * bevestigd)" staan — magnesium en vitamine D met vertrouwen LAAG — en zo'n
 * drempel mag geen balk vullen en geen lijn trekken. Bovendien draagt elke
 * band de naam van een stof terwijl de meting een eetfrequentie is: magnesium
 * leunt op de plantporties-vraag, vitamine D op de daglicht-vraag.
 *
 * Ook de clusterrijen van `buildNutritionFactRows` horen hier niet, al hebben
 * die sinds september wél een gebronde grens. Reden: dit is de reeks van wat
 * hij *antwoordde*, en een clusterrij vat drie antwoorden samen — hij zou hier
 * dus twee keer langskomen, één keer als vraag en één keer als cluster. De
 * richtlijnpositie leest hij op de ladder, waar de clusterrij thuishoort
 * (`evidenceByLayer` in `domain-ladder-readout.ts`).
 */
export function buildNutritionMeasurementValues(
  rawInputs: unknown,
): DomainMeasurementValue[] {
  return buildNutritionAnswerRows(rawInputs).map((row) => ({
    key: row.key,
    label: row.label,
    answerLabel: row.answerLabel,
    benchmarkLabel: null,
    // Geen positie: dit is wat hij koos, niet waar dat staat.
    level: null,
    levelMax: 1,
    scale: "zelfrapportage",
  }));
}
