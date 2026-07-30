/**
 * Voedingsbronnen per nutriënt — "wat lever ik met één portie".
 * Productkennis, geen persoonsdata.
 *
 * Alle getallen zijn INDICATIEF (orde van grootte per portie) — verifiëren
 * tegen NEVO/Voedingscentrum vóór livegang, net als portion-dictionary.ts.
 *
 * VERIFY: Gezondheidsraad ADH before referenceLabel/threshold updates
 *         (350 mg Mg, 9–11 mg Zn, 10 µg vit D).
 *
 * Harde leesregel voor elke UI die dit toont: deze waarden tellen NIET op tot
 * een dagtotaal. De band per nutriënt komt uit frequentievragen
 * (estimateNutritionIntake), niet uit grammen. De lijst staat er om te kunnen
 * kíezen tussen bronnen — niet om inname te berekenen.
 *
 * Deze tabel staat naast portion-dictionary.ts en vervangt hem niet: daar staat
 * `PortionGroup → gram-equivalent`, hier `voedingsmiddel → (nutriënt,
 * hoeveelheid per portie, portiegroep, seizoen)`.
 */

import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { PortionGroup } from "@/data/nutrition/portion-dictionary";

/**
 * Elke lijst staat aflopend op `amount`, bronnen zonder waarde (`null`) achteraan.
 * Een UI die er drie toont, toont daarmee ook de drie sterkste — en een balkje
 * dat op de sterkste normaliseert kan nooit boven 100% uitkomen.
 */
export interface FoodSource {
  /** Stabiel, kebab-case. Uniek binnen één nutriënt; sleutel in events. */
  key: string;
  labelNl: string;
  /** Portie waar `amount` bij hoort, zoals getoond: "25 g (handvol)". */
  portionNl: string;
  /** Per portie, in de eenheid van het nutriënt; null = niet te geven. */
  amount: number | null;
  portionGroup: PortionGroup;
  /** Nederlands seizoen als [startmaand, eindmaand], 1-based en inclusief. */
  seasonMonths?: readonly [number, number];
  noteNl?: string;
  /** Naad naar partners. Vandaag overal undefined. */
  productKey?: string;
}

const PROTEIN_SOURCES: readonly FoodSource[] = [
  {
    key: "kipfilet",
    labelNl: "Kipfilet",
    portionNl: "100 g",
    amount: 23,
    portionGroup: "leanMeat",
  },
  {
    key: "magere-kwark",
    labelNl: "Magere kwark",
    portionNl: "200 g",
    amount: 20,
    portionGroup: "dairy",
  },
  {
    key: "skyr",
    labelNl: "Skyr",
    portionNl: "150 g",
    amount: 17,
    portionGroup: "dairy",
  },
  {
    key: "eieren",
    labelNl: "Eieren",
    portionNl: "2 stuks",
    amount: 13,
    portionGroup: "egg",
  },
  {
    key: "linzen",
    labelNl: "Linzen",
    portionNl: "150 g gekookt",
    amount: 13,
    portionGroup: "legumes",
  },
  {
    key: "tofu",
    labelNl: "Tofu",
    portionNl: "100 g",
    amount: 12,
    portionGroup: "other",
  },
];

const MAGNESIUM_SOURCES: readonly FoodSource[] = [
  {
    key: "pompoenzaden",
    labelNl: "Pompoenzaden",
    portionNl: "25 g (handvol)",
    amount: 130,
    portionGroup: "nuts",
  },
  {
    key: "spinazie",
    labelNl: "Spinazie, gekookt",
    portionNl: "150 g",
    amount: 130,
    portionGroup: "vegetables",
    seasonMonths: [4, 10],
  },
  {
    key: "snijbiet",
    labelNl: "Snijbiet, gekookt",
    portionNl: "150 g",
    amount: 110,
    portionGroup: "vegetables",
    seasonMonths: [6, 10],
  },
  {
    key: "zwarte-bonen",
    labelNl: "Zwarte bonen",
    portionNl: "150 g gekookt",
    amount: 105,
    portionGroup: "legumes",
  },
  {
    key: "amandelen",
    labelNl: "Amandelen",
    portionNl: "25 g",
    amount: 65,
    portionGroup: "nuts",
  },
  {
    key: "volkorenbrood",
    labelNl: "Volkorenbrood",
    portionNl: "2 sneden",
    amount: 55,
    portionGroup: "wholegrain",
  },
  {
    key: "pure-chocolade",
    labelNl: "Pure chocolade 70%",
    portionNl: "20 g",
    amount: 45,
    portionGroup: "other",
  },
  {
    key: "banaan",
    labelNl: "Banaan",
    portionNl: "1 stuk (120 g)",
    amount: 33,
    portionGroup: "fruit",
  },
  {
    key: "avocado",
    labelNl: "Avocado",
    portionNl: "½ stuk (100 g)",
    amount: 29,
    portionGroup: "fruit",
  },
  {
    key: "gedroogde-vijgen",
    labelNl: "Gedroogde vijgen",
    portionNl: "40 g (4 stuks)",
    amount: 27,
    portionGroup: "fruit",
  },
];

const OMEGA3_SOURCES: readonly FoodSource[] = [
  {
    key: "makreel",
    labelNl: "Makreel",
    portionNl: "125 g",
    amount: 3000,
    portionGroup: "oilyFish",
  },
  {
    key: "zalm",
    labelNl: "Zalm",
    portionNl: "125 g",
    amount: 2000,
    portionGroup: "oilyFish",
  },
  {
    key: "haring",
    labelNl: "Haring",
    portionNl: "100 g",
    amount: 1900,
    portionGroup: "oilyFish",
  },
  {
    key: "sardines",
    labelNl: "Sardines uit blik",
    portionNl: "100 g",
    amount: 1400,
    portionGroup: "oilyFish",
  },
  {
    key: "gerookte-forel",
    labelNl: "Gerookte forel",
    portionNl: "100 g",
    amount: 1000,
    portionGroup: "oilyFish",
  },
  {
    key: "walnoten",
    labelNl: "Walnoten",
    portionNl: "25 g",
    amount: null,
    portionGroup: "nuts",
    noteNl:
      "Plantaardig omega-3 (ALA). Je lichaam zet daar maar een paar procent van om naar EPA/DHA — het vervangt vis niet.",
  },
  {
    key: "lijnzaad",
    labelNl: "Lijnzaad, gemalen",
    portionNl: "15 g",
    amount: null,
    portionGroup: "nuts",
    noteNl: "Ook ALA. Alleen gemalen — heel lijnzaad gaat er onbenut door.",
  },
];

const VITAMIN_D_SOURCES: readonly FoodSource[] = [
  {
    key: "haring",
    labelNl: "Haring",
    portionNl: "100 g",
    amount: 25,
    portionGroup: "oilyFish",
  },
  {
    key: "zalm",
    labelNl: "Zalm",
    portionNl: "125 g",
    amount: 12,
    portionGroup: "oilyFish",
  },
  {
    key: "eieren",
    labelNl: "Eieren",
    portionNl: "2 stuks",
    amount: 2.4,
    portionGroup: "egg",
  },
  {
    key: "halvarine",
    labelNl: "Halvarine of margarine",
    portionNl: "30 g",
    amount: 2.3,
    portionGroup: "other",
    noteNl: "In Nederland wettelijk verrijkt met vitamine D.",
  },
  {
    key: "zonlicht",
    labelNl: "Zonlicht op je huid",
    portionNl: "15–30 min, apr–sep",
    amount: null,
    portionGroup: "other",
    seasonMonths: [4, 9],
    noteNl:
      "De hoofdroute, en de reden dat voeding dit gat niet dicht. Okt–mrt staat de aanmaak in NL vrijwel stil.",
  },
];

const ZINC_SOURCES: readonly FoodSource[] = [
  {
    key: "rundvlees",
    labelNl: "Rundvlees",
    portionNl: "100 g",
    amount: 4.5,
    portionGroup: "leanMeat",
  },
  {
    key: "kikkererwten",
    labelNl: "Kikkererwten",
    portionNl: "150 g gekookt",
    amount: 1.9,
    portionGroup: "legumes",
  },
  {
    key: "pompoenzaden",
    labelNl: "Pompoenzaden",
    portionNl: "25 g",
    amount: 1.8,
    portionGroup: "nuts",
  },
  {
    key: "garnalen",
    labelNl: "Garnalen",
    portionNl: "100 g",
    amount: 1.5,
    portionGroup: "other",
  },
  {
    key: "volkorenbrood",
    labelNl: "Volkorenbrood",
    portionNl: "2 sneden",
    amount: 1.4,
    portionGroup: "wholegrain",
    noteNl:
      "Fytaat in volkoren remt de opname — de mg zijn er, je haalt er minder uit.",
  },
  {
    key: "belegen-kaas",
    labelNl: "Belegen kaas",
    portionNl: "30 g (1 snee)",
    amount: 1.2,
    portionGroup: "dairy",
  },
];

export const FOOD_SOURCES: Record<NutrientId, readonly FoodSource[]> = {
  protein: PROTEIN_SOURCES,
  omega3: OMEGA3_SOURCES,
  magnesium: MAGNESIUM_SOURCES,
  vitamin_d: VITAMIN_D_SOURCES,
  zinc: ZINC_SOURCES,
};
