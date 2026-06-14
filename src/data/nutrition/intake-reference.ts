/**
 * Referentietabel voor de 5 nutriënten met een interventiepad (/beste/*).
 * Productkennis — geen persoonsdata.
 * De enige plek met referentiecijfers; hardcode deze NIET in de engine.
 *
 * Drempelgetallen zijn INDICATIEF.
 * TODO review met copy-/cijferbron (Gezondheidsraad ADH / EFSA DRV).
 */

import type { IngredientClaimKey } from "@/data/approved-claims";

export type NutrientId =
  | "protein"
  | "omega3"
  | "magnesium"
  | "vitamin_d"
  | "zinc";

export interface NutrientThresholds {
  /**
   * Signaalwaarde < belowMax → band "below".
   * TODO review indicatieve grens met voedingskundige bron.
   */
  belowMax: number;
  /**
   * Signaalwaarde >= meetsMin → band "meets".
   * Waarden daartussen → band "around".
   * TODO review indicatieve grens met voedingskundige bron.
   */
  meetsMin: number;
}

export interface NutrientReference {
  id: NutrientId;
  /** Nederlandse gebruikerslabel. */
  label: string;
  /**
   * Beschrijving van de richtlijn — geen normatieve waarde, wél herkenbaar.
   * Gebruikersgerichte formulering als context in de output-zin.
   */
  referenceLabel: string;
  /** Bestaand /beste/-pad; voor de supplement-gate (F2) en link-generatie. */
  comparisonPath: string;
  /** Frequentie-grenzen voor band-bepaling (indicatief, zie TODO). */
  thresholds: NutrientThresholds;
  /**
   * Leefstijl-eerst voedingsactie (F2). Informatief en concreet — geen statuswoorden.
   * Verschijnt altijd vóór een eventuele supplement-suggestie (priority 1).
   */
  lifestyleAction: string;
  /**
   * Exacte sleutel in approvedClaims (src/data/approved-claims.ts).
   * Gebruikt door getUsableClaims() in de supplement-gate (F2).
   * Neem nooit aan — verifieer tegen de werkelijke approvedClaims-keys.
   */
  claimKey: IngredientClaimKey;
}

export const nutrientReferences: Record<NutrientId, NutrientReference> = {
  protein: {
    id: "protein",
    label: "Eiwit",
    referenceLabel: "eiwit bij elke maaltijd",
    comparisonPath: "/beste/eiwitpoeder",
    thresholds: {
      belowMax: 2, // TODO review: < 2 eiwitrijke maaltijden/dag → "below"
      meetsMin: 3, // TODO review: ≥ 3 eiwitrijke maaltijden/dag → "meets"
    },
    lifestyleAction:
      "Begin elke maaltijd met een eiwitbron: ei, kwark, kipfilet, peulvruchten of vis.",
    claimKey: "eiwitpoeder",
  },
  omega3: {
    id: "omega3",
    label: "Omega-3",
    referenceLabel: "2× vette vis per week",
    comparisonPath: "/beste/omega-3-supplement",
    thresholds: {
      belowMax: 1, // TODO review: < 1× vette vis/week → "below"
      meetsMin: 2, // TODO review: ≥ 2× vette vis/week → "meets"
    },
    lifestyleAction:
      "Eet deze week 2× vette vis — zalm, makreel of haring.",
    claimKey: "omega3",
  },
  magnesium: {
    id: "magnesium",
    label: "Magnesium",
    referenceLabel: "dagelijks bladgroenten, noten of peulvruchten",
    comparisonPath: "/beste/magnesium",
    thresholds: {
      belowMax: 2, // TODO review: < 2 porties groente/fruit per dag → "below"
      meetsMin: 4, // TODO review: ≥ 4 porties groente/fruit per dag → "meets"
    },
    lifestyleAction:
      "Voeg dagelijks bladgroenten, noten of peulvruchten toe aan je maaltijden.",
    claimKey: "magnesium",
  },
  vitamin_d: {
    id: "vitamin_d",
    label: "Vitamine D",
    referenceLabel: "dagelijks buiten (huid aan zonlicht)",
    comparisonPath: "/beste/vitamine-d",
    thresholds: {
      belowMax: 1, // TODO review: < 1× buiten/week → "below"
      meetsMin: 3, // TODO review: ≥ 3× buiten/week → "meets"
    },
    lifestyleAction:
      "Ga elke dag minimaal 15 minuten buiten — huid aan daglicht, ook in de winter.",
    claimKey: "vitamineD",
  },
  zinc: {
    id: "zinc",
    label: "Zink",
    referenceLabel: "dagelijks vlees, vis of peulvruchten",
    comparisonPath: "/beste/zink",
    thresholds: {
      belowMax: 1, // TODO review: < 1 portie vlees/vis/peulvruchten per dag → "below"
      meetsMin: 2, // TODO review: ≥ 2 porties per dag → "meets"
    },
    lifestyleAction:
      "Eet dagelijks een portie vlees, vis, eieren of peulvruchten voor voldoende zink.",
    claimKey: "zink",
  },
};

export const NUTRIENT_IDS: NutrientId[] = [
  "protein",
  "omega3",
  "magnesium",
  "vitamin_d",
  "zinc",
];
