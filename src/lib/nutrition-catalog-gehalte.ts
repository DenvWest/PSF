import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import {
  FOOD_CATALOG_NEVO_BENADERINGEN,
  FOOD_CATALOG_NEVO_GEHALTES,
  type NevoGehaltes,
  type NevoKernVeld,
} from "@/data/nutrition/food-catalog-nevo-gehaltes";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { indexedFood } from "@/lib/nutrition-food-index";
import type { NutrientUnit } from "@/lib/nutrition-units";

/**
 * Het gehalte per 100 g van één catalogusregel voor één stof, uit de eerste
 * bron die het kent.
 *
 * ## Volgorde en waarom
 *
 * 1. `FOOD_SOURCES` via `CatalogEntry.bron`: de bestaande, beoordeelde rijen.
 * 2. NEVO via {@link FOOD_CATALOG_NEVO_GEHALTES}: voor alles wat (nog) geen
 *    `bron` heeft, of waar de `bron` deze stof niet draagt.
 *
 * Zo staat een gehalte voor een regel en een stof op precies één plek: NEVO vult
 * alleen aan en overschrijft nooit een beoordeelde rij.
 *
 * ## Omega-3 uit NEVO is afgeleid
 *
 * NEVO kent geen omega-3-som, alleen EPA en DHA. Onze uitlezing is hun som in
 * mg; dat is een bewerking en komt daarom terug met `afgeleid: true`. De losse
 * delen blijven opvraagbaar via {@link nevoOmega3Delen}.
 *
 * ## Rekenen of tonen
 *
 * {@link gehaltePer100g} is het getal waarmee gerekend wordt (dagsom, krans,
 * tekorten). {@link gehalteWeergavePer100g} is wat een scherm toont en weet
 * meer: een gemeten 0 of spoor, en een benadering (vergelijkbaar NEVO-record).
 * Die twee extra's tellen nooit mee in een som
 * (`docs/plan/BESLUIT_NUL_SPOOR_BENADERING_2026-10.md`).
 */
export interface CatalogGehalte {
  value: number;
  unit: NutrientUnit;
  bron: "food-sources" | "nevo";
  afgeleid: boolean;
}

const NEVO_VELD: Partial<Record<NutrientId, { veld: NevoKernVeld; unit: NutrientUnit }>> = {
  protein: { veld: "protein_g", unit: "g" },
  magnesium: { veld: "magnesium_mg", unit: "mg" },
  zinc: { veld: "zinc_mg", unit: "mg" },
  vitamin_d: { veld: "vitamin_d_ug", unit: "µg" },
};

/** EPA en DHA zoals NEVO ze geeft (mg per 100 g), of null als NEVO geen van beide kent. */
export function nevoOmega3Delen(catalogKey: string): { epaMg: number | null; dhaMg: number | null; code: string } | null {
  const nevo = FOOD_CATALOG_NEVO_GEHALTES[catalogKey];
  if (!nevo || (nevo.epa_g === undefined && nevo.dha_g === undefined)) return null;
  return {
    epaMg: nevo.epa_g === undefined ? null : Math.round(nevo.epa_g * 10_000) / 10,
    dhaMg: nevo.dha_g === undefined ? null : Math.round(nevo.dha_g * 10_000) / 10,
    code: nevo.code,
  };
}

/** Wat een scherm voor één stof van één regel toont, per 100 g. */
export type GehalteWeergave =
  | { soort: "waarde"; value: number; unit: NutrientUnit; benadering: string | null }
  | { soort: "nul" | "spoor"; unit: NutrientUnit; benadering: string | null }
  | { soort: "onbekend" };

function nevoWeergave(
  nevo: NevoGehaltes,
  nutrient: NutrientId,
  benadering: string | null,
): GehalteWeergave {
  const status = (veld: NevoKernVeld) =>
    nevo.spoor?.includes(veld) ? "spoor" : nevo.nul?.includes(veld) ? "nul" : null;

  if (nutrient === "omega3") {
    if (nevo.epa_g !== undefined || nevo.dha_g !== undefined) {
      const som = Math.round(((nevo.epa_g ?? 0) + (nevo.dha_g ?? 0)) * 10_000) / 10;
      return { soort: "waarde", value: som, unit: "mg", benadering };
    }
    const epa = status("epa_g");
    const dha = status("dha_g");
    if (!epa || !dha) return { soort: "onbekend" };
    return { soort: epa === "spoor" || dha === "spoor" ? "spoor" : "nul", unit: "mg", benadering };
  }

  const veld = NEVO_VELD[nutrient];
  if (!veld) return { soort: "onbekend" };
  const waarde = nevo[veld.veld];
  if (typeof waarde === "number") return { soort: "waarde", value: waarde, unit: veld.unit, benadering };
  const soort = status(veld.veld);
  return soort ? { soort, unit: veld.unit, benadering } : { soort: "onbekend" };
}

/**
 * Wat een scherm toont: het rekengetal als dat er is, anders een gemeten 0 of
 * spoor, anders de waarde van een vergelijkbaar record (met de NEVO-naam in
 * `benadering`). Nooit gebruiken om op te tellen — daarvoor is
 * {@link gehaltePer100g}.
 */
export function gehalteWeergavePer100g(
  entry: CatalogEntry | null | undefined,
  nutrient: NutrientId,
): GehalteWeergave {
  if (!entry) return { soort: "onbekend" };
  const gehalte = gehaltePer100g(entry, nutrient);
  if (gehalte) return { soort: "waarde", value: gehalte.value, unit: gehalte.unit, benadering: null };

  const nevo = FOOD_CATALOG_NEVO_GEHALTES[entry.key];
  if (nevo) return nevoWeergave(nevo, nutrient, null);

  const benadering = FOOD_CATALOG_NEVO_BENADERINGEN[entry.key];
  if (benadering) return nevoWeergave(benadering, nutrient, benadering.naam);

  return { soort: "onbekend" };
}

export function gehaltePer100g(entry: CatalogEntry | null | undefined, nutrient: NutrientId): CatalogGehalte | null {
  if (!entry) return null;

  const rij = entry.bron ? indexedFood(entry.bron)?.nutrients.find((n) => n.nutrient === nutrient) : undefined;
  const bekend = rij?.source.nutrientValue;
  if (bekend) return { value: bekend.value, unit: bekend.unit, bron: "food-sources", afgeleid: false };

  const nevo = FOOD_CATALOG_NEVO_GEHALTES[entry.key];
  if (!nevo) return null;

  if (nutrient === "omega3") {
    const delen = nevoOmega3Delen(entry.key);
    if (!delen) return null;
    const som = (delen.epaMg ?? 0) + (delen.dhaMg ?? 0);
    return { value: Math.round(som * 10) / 10, unit: "mg", bron: "nevo", afgeleid: true };
  }

  const veld = NEVO_VELD[nutrient];
  const waarde = veld ? nevo[veld.veld] : undefined;
  if (veld === undefined || typeof waarde !== "number") return null;
  return { value: waarde, unit: veld.unit, bron: "nevo", afgeleid: false };
}
