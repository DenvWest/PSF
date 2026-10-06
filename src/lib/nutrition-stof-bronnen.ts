import { catalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bedragVanItem, sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { BASE_UNIT, toBase } from "@/lib/nutrition-units";

/**
 * Waar je een kernstof in een periode vandaan haalde: per product de som,
 * grootste eerst. Rekent met `bedragVanItem` + `toBase`, dezelfde functies als
 * de som in het tekortsysteem, zodat de lijst en het getal erboven niet uit
 * elkaar kunnen lopen.
 */

export type StofBron = {
  naam: string;
  /** Som over de periode, in de basiseenheid van de stof. */
  totaal: number;
  unit: string;
  /** Op hoeveel dagen dit product deze stof leverde. */
  dagen: number;
  supplement: boolean;
};

export function bronnenVanStof(
  dagen: readonly DagboekDag[],
  datums: readonly string[],
  nutrient: NutrientId,
): StofBron[] {
  const binnen = new Set(datums);
  const perNaam = new Map<string, { totaal: number; dagen: Set<string>; supplement: boolean }>();

  for (const dag of dagen) {
    if (!binnen.has(dag.date)) continue;
    for (const item of sanitizeItems(dag.items ?? [])) {
      const bedrag = bedragVanItem(item, nutrient);
      if (!bedrag) continue;
      const inBasis = toBase(bedrag.value, bedrag.unit, nutrient);
      if (inBasis === null || inBasis <= 0) continue;
      const supplement = item.bron === "supplement";
      const naam = supplement
        ? supplementCatalogEntry(item.key)?.labelNl
        : catalogEntry(item.key)?.labelNl;
      if (!naam) continue;
      const huidig = perNaam.get(naam) ?? { totaal: 0, dagen: new Set<string>(), supplement };
      huidig.totaal += inBasis;
      huidig.dagen.add(dag.date);
      perNaam.set(naam, huidig);
    }
  }

  return [...perNaam.entries()]
    .map(([naam, { totaal, dagen: opDagen, supplement }]) => ({
      naam,
      totaal: Math.round(totaal * 10) / 10,
      unit: BASE_UNIT[nutrient],
      dagen: opDagen.size,
      supplement,
    }))
    .sort((a, b) => b.totaal - a.totaal);
}
