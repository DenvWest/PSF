import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { FOOD_CATALOG_NEVO_GEHALTES, type NevoGehaltes } from "@/data/nutrition/food-catalog-nevo-gehaltes";
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
 */
export interface CatalogGehalte {
  value: number;
  unit: NutrientUnit;
  bron: "food-sources" | "nevo";
  afgeleid: boolean;
}

const NEVO_VELD: Partial<Record<NutrientId, { veld: keyof NevoGehaltes; unit: NutrientUnit }>> = {
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
