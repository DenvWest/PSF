/**
 * Centrale inname-vs-status-formuleringslaag (F1).
 *
 * Elke output-zin is een grove frequentie-inschatting naast een algemene vuistregel —
 * nooit een richtlijn-/normclaim, nooit een statusclaim.
 * NOOIT: "tekort", "deficiëntie", "je waarden", "diagnose", "te weinig in je bloed".
 * Compliance is een systeem-eigenschap (statementHasForbiddenPhrase), geen reviewtaak per zin.
 */

import { FORBIDDEN_PHRASES_GLOBAL } from "@/data/approved-claims";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import type { IntakeBand, IntakeEstimate } from "@/lib/nutrition-intake-estimate";

/**
 * Status- en diagnosetaal die nooit in inname-output mag voorkomen.
 * Gecombineerd met FORBIDDEN_PHRASES_GLOBAL in statementHasForbiddenPhrase().
 */
export const FORBIDDEN_STATUS_PHRASES: string[] = [
  "tekort",
  "deficiëntie",
  "deficientie",
  "je waarden",
  "bloedwaarde",
  "bloedsuiker",
  "diagnose",
  "te weinig in je bloed",
  "gemeten",
  "afwijking",
  "status",
  "serum",
  "plasma",
  "laboratorium",
  "lab-waarde",
  "klinisch",
  "medisch",
  "symptoom",
  "ziekte",
  "aandoening",
];

type BandTemplate = (label: string, referenceLabel: string) => string;

const BAND_TEMPLATES: Record<IntakeBand, BandTemplate> = {
  below: (label, referenceLabel) =>
    `Je ${label}-inname lijkt aan de lage kant — op basis van hoe vaak je het eet, naast een algemene vuistregel (${referenceLabel}).`,
  // around en meets claimen bewust géén "op orde": een frequentie-screener kan een
  // mogelijk aandachtspunt signaleren, maar zegt niets over portie, kwaliteit of opname.
  around: (label, _referenceLabel) =>
    `Je ${label}-inname geeft op basis van je frequentie geen aandachtspunt.`,
  meets: (label, _referenceLabel) =>
    `Je ${label}-inname geeft op basis van je frequentie geen aandachtspunt.`,
};

/**
 * Geeft één inname-geformuleerde zin voor een IntakeEstimate.
 * Strikt template-gebaseerd — geen dynamische samenstelling buiten dit patroon.
 */
export function intakeStatementFor(estimate: IntakeEstimate): string {
  const label = nutrientReferences[estimate.nutrient].label;
  const template = BAND_TEMPLATES[estimate.band];
  return template(label, estimate.referenceLabel);
}

/**
 * Controleert case-insensitief of een tekst een verboden status- of diagnose-frase bevat.
 * Combineert FORBIDDEN_STATUS_PHRASES (inname-specifiek) met FORBIDDEN_PHRASES_GLOBAL
 * (uit approved-claims — medische-claims-laag).
 *
 * Gebruik dit als compliance-property-test over elke gegenereerde output-zin.
 */
export function statementHasForbiddenPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  const combined = [...FORBIDDEN_STATUS_PHRASES, ...FORBIDDEN_PHRASES_GLOBAL];
  return combined.some((phrase) => lower.includes(phrase.toLowerCase()));
}
