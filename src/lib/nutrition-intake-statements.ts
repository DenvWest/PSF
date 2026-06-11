/**
 * Centrale inname-vs-status-formuleringslaag (F1).
 *
 * Elke output-zin is "geschatte inname t.o.v. een veelgebruikte richtlijn".
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
    `Je ${label}-inname lijkt aan de lage kant t.o.v. een veelgebruikte richtlijn (${referenceLabel}).`,
  around: (label, _referenceLabel) =>
    `Je ${label}-inname zit rond een veelgebruikte richtlijn.`,
  meets: (label, _referenceLabel) =>
    `Je ${label}-inname lijkt op orde t.o.v. een veelgebruikte richtlijn.`,
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
