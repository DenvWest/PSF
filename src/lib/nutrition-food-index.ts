import { FOOD_SOURCES, type FoodSource } from "@/data/nutrition/food-sources";
import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De omkering van `FOOD_SOURCES`: van voedingsmiddel naar zijn nutriënten.
 *
 * ## Waarom dit bestaat
 *
 * `FOOD_SOURCES` is `nutriënt → bronnen`. Dat is de goede vorm voor de vraag
 * "waar haal ik magnesium uit?" en de verkeerde voor de vraag die het dagboek
 * stelt: "ik at havermout — wat zit daarin?". Havermout staat vandaag in drie
 * lijsten (eiwit, magnesium, zink) als drie losse rijen; wie hem kiest moet die
 * drie zelf bij elkaar zoeken.
 *
 * Deze module doet dat zoeken één keer, bij het laden van de module, en levert
 * per voedingsmiddel één regel met al zijn gehaltes.
 *
 * ## Waarom een afgeleide index en geen tweede tabel
 *
 * De verleiding is om de omgekeerde vorm als eigen databestand te schrijven.
 * Dat zou een tweede plek maken waar het gehalte van magnesium-in-amandelen
 * staat, en twee plekken lopen een keer uiteen — dezelfde reden waarom
 * `CatalogEntry.bron` een verwijzing is en geen getal.
 *
 * `FOOD_SOURCES` blijft dus de bron van waarheid. Wat hier gebeurt is
 * hergroeperen, niet overschrijven: elk getal in de index is hetzelfde object
 * dat in `FOOD_SOURCES` staat.
 *
 * ## Wat de omkering aan het licht bracht
 *
 * Een sleutel die in meerdere nutriëntlijsten voorkomt, hoort hetzelfde
 * voedingsmiddel te beschrijven. Bij het bouwen van deze index bleek dat drie
 * keer niet te kloppen:
 *
 * | Sleutel | Probleem |
 * |---|---|
 * | `belegen-kaas` | portie "50 g (2 sneden)" bij eiwit, "30 g (1 snee)" bij zink |
 * | `pompoenzaden` | portie "25 g (handvol)" bij magnesium, "25 g" bij zink |
 * | `tonijn-blik` | label "Tonijn uit blik" vs. "Tonijn uit blik, op water" |
 *
 * Zolang de tabel per nutriënt gelezen werd, viel dat niet op: je zag altijd
 * maar één van de twee. In de omkering staan ze naast elkaar en moet er één
 * winnen. Daarom bewaakt `nutrition-food-index.test.ts` dit voortaan als
 * invariant: dezelfde sleutel, dezelfde portie en hetzelfde label — anders
 * faalt de build.
 *
 * ## Wat deze index niet doet
 *
 * **Niet optellen tot een dagtotaal.** Dat blijft de regel uit
 * `food-sources.ts`. Deze module groepeert alleen; wat een som ermee doet en
 * hoe die genoemd moet worden ("minstens …"), hoort in de laag erboven.
 *
 * **Geen porties omrekenen.** `amount` hoort bij `portionNl` en dat blijft zo.
 * Wie een andere portie wil, gebruikt `nutrientValue.value` (per 100 g) —
 * het enige getal dat ongewijzigd uit de brondataset komt.
 */

/** Wat één voedingsmiddel van één nutriënt levert. */
export type FoodNutrient = {
  nutrient: NutrientId;
  /** De rij zoals hij in `FOOD_SOURCES` staat — niet gekopieerd, niet herrekend. */
  source: FoodSource;
};

/** Eén voedingsmiddel met alles wat de tabel erover weet. */
export type IndexedFood = {
  /** De sleutel zoals hij in `FOOD_SOURCES` staat; ook de sleutel in events. */
  key: string;
  labelNl: string;
  /** Portie waar elke `amount` bij hoort, gelijk over alle nutriënten. */
  portionNl: string;
  /** Op volgorde van `NUTRIENT_ORDER`, zodat een rij altijd hetzelfde leest. */
  nutrients: readonly FoodNutrient[];
};

/**
 * Vaste volgorde waarin nutriënten getoond worden.
 *
 * Niet alfabetisch en niet op gehalte: eiwit en magnesium eerst omdat vrijwel
 * elk voedingsmiddel ze draagt, daarna de drie die maar bij een handvol
 * bronnen voorkomen. Zo staat de gevulde kant van een rij links en verschuift
 * een kolom niet van product tot product.
 */
export const NUTRIENT_ORDER: readonly NutrientId[] = [
  "protein",
  "magnesium",
  "zinc",
  "omega3",
  "vitamin_d",
] as const;

function buildIndex(): ReadonlyMap<string, IndexedFood> {
  const perKey = new Map<string, { food: IndexedFood; nutrients: FoodNutrient[] }>();

  for (const nutrient of NUTRIENT_ORDER) {
    for (const source of FOOD_SOURCES[nutrient] ?? []) {
      const bestaand = perKey.get(source.key);
      if (bestaand) {
        bestaand.nutrients.push({ nutrient, source });
        continue;
      }
      const nutrients: FoodNutrient[] = [{ nutrient, source }];
      perKey.set(source.key, {
        food: {
          key: source.key,
          labelNl: source.labelNl,
          portionNl: source.portionNl,
          nutrients,
        },
        nutrients,
      });
    }
  }

  const index = new Map<string, IndexedFood>();
  for (const [key, { food }] of perKey) {
    index.set(key, food);
  }
  return index;
}

/** Alle voedingsmiddelen uit `FOOD_SOURCES`, ontdubbeld over de vijf lijsten. */
export const FOOD_INDEX: ReadonlyMap<string, IndexedFood> = buildIndex();

/** Eén voedingsmiddel met al zijn gehaltes, of null als de tabel hem niet kent. */
export function indexedFood(key: string): IndexedFood | null {
  return FOOD_INDEX.get(key) ?? null;
}

/**
 * Wat dit voedingsmiddel van dit nutriënt levert, per zijn eigen portie.
 *
 * Null betekent twee verschillende dingen die de aanroeper uit elkaar moet
 * houden: de tabel kent het voedingsmiddel niet, of hij kent het wel maar
 * niet voor dit nutriënt. Beide gevallen zijn "geen getal" — nooit nul.
 */
export function amountOf(key: string, nutrient: NutrientId): number | null {
  const food = FOOD_INDEX.get(key);
  if (!food) {
    return null;
  }
  const rij = food.nutrients.find((n) => n.nutrient === nutrient);
  return rij?.source.amount ?? null;
}

/** Elk voedingsmiddel dat de tabel kent, op label gesorteerd. */
export function allIndexedFoods(): IndexedFood[] {
  return [...FOOD_INDEX.values()].sort((a, b) => a.labelNl.localeCompare(b.labelNl, "nl"));
}

/**
 * Voedingsmiddelen die meer dan één nutriënt dragen, de rijkste eerst.
 *
 * Dit is de lijst die een keuzescherm wil tonen zodra het gat meer dan één
 * stof beslaat: wie magnesium én zink mist, heeft meer aan havermout dan aan
 * twee losse producten.
 */
export function multiNutrientFoods(): IndexedFood[] {
  return [...FOOD_INDEX.values()]
    .filter((f) => f.nutrients.length > 1)
    .sort((a, b) => b.nutrients.length - a.nutrients.length
      || a.labelNl.localeCompare(b.labelNl, "nl"));
}
