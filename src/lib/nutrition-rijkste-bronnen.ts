import { FOOD_CATALOG, type CatalogEntry } from "@/data/nutrition/food-catalog";
import { FOOD_CATALOG_NEVO_GEHALTES } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { gehaltePer100g } from "@/lib/nutrition-catalog-gehalte";

/**
 * De rijkste voedingsbronnen van één stof, uit de eigen catalogus.
 *
 * Drie manieren om "rijk" te lezen, en ze geven echt een andere lijst:
 *
 * - **per portie** — wat je per keer binnenkrijgt. Standaard, omdat 15 g
 *   pompoenpitten iets anders is dan 100 g.
 * - **per 100 g** — gehalte naar gewicht: veel stof in weinig volume.
 * - **per 100 kcal** — dichtheid naar energie: veel stof voor weinig
 *   calorieën. Een afgeleid getal (gehalte ÷ NEVO-energie), en zo gelabeld.
 *
 * Alleen voeding: een supplement wint per definitie en maakt de lijst
 * zinloos. Alleen gemeten gehaltes: wat niet gemeten is staat er niet in,
 * en komt dus nooit als 0 onderaan.
 *
 * Bereidingsvarianten (broccoli rauw/gekookt/diepvries) delen een
 * `imageOwner`; per groep blijft alleen de rijkste variant over, zodat de
 * top 10 niet uit drie keer spinazie bestaat.
 *
 * Vezels en energie per portie gaan mee als context, zonder oordeel
 * (`BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §0.1): ze sturen de
 * volgorde niet.
 */

export type RijksteStand = "portie" | "100g" | "100kcal";

/**
 * Onder deze energie per 100 g wordt "per 100 kcal" een deling door bijna
 * nul: kruidenthee en bouillon zouden dan bovenaan staan terwijl niemand er
 * zijn magnesium uit haalt.
 */
export const MIN_KCAL_PER_100G = 15;

export interface RijksteBron {
  entry: CatalogEntry;
  /** De waarde waarop gerangschikt is, in de stand die gevraagd werd. */
  waarde: number;
  unit: string;
  portieLabel: string;
  portieGram: number;
  perPortie: number;
  kcalPerPortie: number | null;
  vezelsPerPortie: number | null;
}

function waardeIn(stand: RijksteStand, per100g: number, portieGram: number, kcal: number | undefined): number | null {
  if (stand === "portie") return (per100g * portieGram) / 100;
  if (stand === "100g") return per100g;
  if (kcal === undefined || kcal < MIN_KCAL_PER_100G) return null;
  return (per100g / kcal) * 100;
}

export function rijksteBronnen(nutrient: NutrientId, stand: RijksteStand, limiet = 10): RijksteBron[] {
  const besteperGroep = new Map<string, RijksteBron>();

  for (const entry of FOOD_CATALOG) {
    const gehalte = gehaltePer100g(entry, nutrient);
    const portie = entry.porties[0];
    if (!gehalte || gehalte.value <= 0 || !portie) continue;

    const nevo = FOOD_CATALOG_NEVO_GEHALTES[entry.key];
    const waarde = waardeIn(stand, gehalte.value, portie.grams, nevo?.energy_kcal);
    if (waarde === null) continue;

    const bron: RijksteBron = {
      entry,
      waarde,
      unit: gehalte.unit,
      portieLabel: portie.labelNl,
      portieGram: portie.grams,
      perPortie: (gehalte.value * portie.grams) / 100,
      kcalPerPortie: nevo?.energy_kcal !== undefined ? (nevo.energy_kcal * portie.grams) / 100 : null,
      vezelsPerPortie: nevo?.fiber_g !== undefined ? (nevo.fiber_g * portie.grams) / 100 : null,
    };

    const groep = entry.imageOwner ?? entry.key;
    const huidige = besteperGroep.get(groep);
    if (!huidige || bron.waarde > huidige.waarde) besteperGroep.set(groep, bron);
  }

  return [...besteperGroep.values()].sort((a, b) => b.waarde - a.waarde).slice(0, limiet);
}
