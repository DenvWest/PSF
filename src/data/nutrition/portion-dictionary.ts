/**
 * Portie-woordenboek — gram-equivalenten voor leefstijladvies (N0).
 * Alle getallen indicatief — verifiëren tegen NEVO/Voedingscentrum vóór livegang.
 *
 * VERIFY: Gezondheidsraad ADH before referenceLabel/threshold updates (350 mg Mg, 9–11 mg Zn, 10 µg vit D).
 */

import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { VitaminDSeason } from "@/lib/nutrition-season";

export type PortionGroup =
  | "vegetables"
  | "fruit"
  | "oilyFish"
  | "leanMeat"
  | "legumes"
  | "nuts"
  | "dairy"
  | "egg";

export interface PortionDefinition {
  gramsPerPortion: number | { min: number; max: number };
  labelNl: string;
  /** Bronvermelding — TODO verify vóór live. */
  sourceNote: string;
}

export const PORTION_DEFINITIONS: Record<PortionGroup, PortionDefinition> = {
  vegetables: {
    gramsPerPortion: 100,
    labelNl: "1 portie groente",
    sourceNote: "Voedingscentrum Schijf van Vijf — indicatief ~100 g",
  },
  fruit: {
    gramsPerPortion: { min: 120, max: 150 },
    labelNl: "1 portie fruit",
    sourceNote: "Voedingscentrum — indicatief 120–150 g",
  },
  oilyFish: {
    gramsPerPortion: { min: 100, max: 150 },
    labelNl: "1 portie vette vis",
    sourceNote: "Voedingscentrum — indicatief 100–150 g",
  },
  leanMeat: {
    gramsPerPortion: { min: 100, max: 120 },
    labelNl: "1 portie mager vlees (gekookt)",
    sourceNote: "Voedingscentrum — indicatief 100–120 g gekookt",
  },
  legumes: {
    gramsPerPortion: 135,
    labelNl: "1 opscheplepel peulvruchten (uit blik, uitgelekt)",
    sourceNote: "Voedingscentrum — indicatief ~135 g uitgelekt",
  },
  nuts: {
    gramsPerPortion: 25,
    labelNl: "1 handvol noten (ongezouten)",
    sourceNote: "Voedingscentrum Schijf van Vijf — ~25 g/dag",
  },
  dairy: {
    gramsPerPortion: 150,
    labelNl: "1 portie zuivel",
    sourceNote: "Voedingscentrum — melk/yoghurt 150 ml, kwark 150 g",
  },
  egg: {
    gramsPerPortion: 6,
    labelNl: "1 ei",
    sourceNote: "NEVO — indicatief ~6–7 g eiwit per ei",
  },
};

export const PORTION_GRAMS = {
  vegetables: 100,
  fruitMin: 120,
  fruitMax: 150,
  oilyFishMin: 100,
  oilyFishMax: 150,
  leanMeatMin: 100,
  leanMeatMax: 120,
  legumes: 135,
  nuts: 30,
  nutsDailyGuideline: 25,
  dairyMl: 150,
  eggProteinMin: 6,
  eggProteinMax: 7,
} as const;

export interface LifestyleActionContext {
  season?: VitaminDSeason;
}

const LIFESTYLE_ACTIONS: Record<
  Exclude<NutrientId, "vitamin_d">,
  string
> = {
  protein:
    "Mik op 20–30 g eiwit per eetmoment: 2 eieren + kwark bij ontbijt, 100 g kip of 135 g linzen bij warme maaltijd. Verdeeld over 3–4 momenten pakt je lichaam eiwit beter op.",
  omega3:
    "Eet 1–2× per week een portie vette vis (100–150 g zalm, makreel of haring). Geen vis? 1 el lijnzaad of walnoten leveren plantaardige omega-3 (minder efficiënt).",
  magnesium:
    "Voeg dagelijks een magnesiumbron toe: 30 g noten (~1 handvol, ~80 mg), 100 g gekookte spinazie of 135 g zwarte bonen. Vuistregel voor mannen: rond de 350 mg/dag.",
  zinc:
    "Eet dagelijks een zinkbron: 100 g rundvlees (~4–5 mg), 2 eieren, of 135 g peulvruchten. Vuistregel mannen: ~9–11 mg/dag.",
};

const VITAMIN_D_ACTIONS: Record<VitaminDSeason, string> = {
  summer:
    "15–30 min buiten met onbedekte huid helpt je aanmaak — ook bij bewolking telt daglicht mee.",
  winter:
    "Je huid maakt nu nauwelijks vitamine D aan — 10 µg via voeding of supplement is een veelgebruikte vuistregel.",
};

export function buildLifestyleAction(
  nutrient: NutrientId,
  ctx: LifestyleActionContext = {},
): string {
  if (nutrient === "vitamin_d") {
    const season = ctx.season ?? "summer";
    return VITAMIN_D_ACTIONS[season];
  }
  return LIFESTYLE_ACTIONS[nutrient];
}

/** Alle lifestyle-teksten — handig voor compliance-tests. */
export function allLifestyleActionTexts(season: VitaminDSeason = "summer"): string[] {
  return [
    ...Object.values(LIFESTYLE_ACTIONS),
    VITAMIN_D_ACTIONS[season],
    VITAMIN_D_ACTIONS[season === "summer" ? "winter" : "summer"],
  ];
}
