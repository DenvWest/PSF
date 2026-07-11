/**
 * Leefstijl-only adviezen buiten de 5 nutriënt-bands.
 * Geen supplement-gate, geen measurement.gap_detected.
 *
 * TODO: B12-trigger uitbreiden met health_flags (PPI/metformine) zodra intake-vraag bestaat.
 */

import { PORTION_GRAMS } from "@/data/nutrition/portion-dictionary";

export type LifestyleExtraId =
  | "fiber_low_wholegrain"
  | "b12_vegan"
  | "sugar_high_signal";

export interface LifestyleExtraDefinition {
  id: LifestyleExtraId;
  text: string;
}

/** wholegrain slider index ≤ 1 → 0% or 25% volkoren. */
export const WHOLEGRAIN_LOW_MAX_INDEX = 1;

/** sugaryDrinks slider index ≤ 1 → frequent suiker (FREQ_BAD-schaal). */
export const SUGARY_DRINKS_HIGH_MAX_INDEX = 1;

export const LIFESTYLE_EXTRA_COPY: Record<LifestyleExtraId, string> = {
  fiber_low_wholegrain:
    `Mik op 30–40 g vezels per dag (Gezondheidsraad-vuistregel): volkoren brood/granen, ` +
    `${PORTION_GRAMS.legumes} g peulvruchten, ${PORTION_GRAMS.vegetables} g groente en ${PORTION_GRAMS.nuts} g noten verspreid over de dag.`,
  b12_vegan:
    "Als veganist komt B12 vooral uit verrijkte producten — denk aan plantaardige drinks met toegevoegde B12 of nutritional yeast. " +
    "Twijfel je over je inname? Bespreek bloedonderzoek met je huisarts.",
  sugar_high_signal:
    "Veel suiker of snelle koolhydraten kunnen je energie-ondersteuning ondermijnen — stabiel eten met eiwit en vezels helpt je energie-as rustiger schakelen. " +
    "Doe de volledige Leefstijlcheck voor inzicht in je energie-patroon.",
};

export function lifestyleExtraDefinition(id: LifestyleExtraId): LifestyleExtraDefinition {
  return { id, text: LIFESTYLE_EXTRA_COPY[id] };
}
