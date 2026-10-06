import { catalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { bedragVanItem, sanitizeItems } from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
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
  /** Wanneer: elke dag en maaltijd waarop het deze stof leverde, oudste eerst. */
  momenten: { datum: string; moment: EetmomentId }[];
  supplement: boolean;
};

/** Wat één maaltijd over de periode van deze stof leverde. */
export type StofPerMoment = {
  moment: EetmomentId;
  label: string;
  /** Som over de periode, in de basiseenheid van de stof. */
  totaal: number;
  /** Op hoeveel dagen dit moment minstens één product droeg (ook zonder deze stof). */
  keer: number;
};

export function bronnenVanStof(
  dagen: readonly DagboekDag[],
  datums: readonly string[],
  nutrient: NutrientId,
): StofBron[] {
  const binnen = new Set(datums);
  const perNaam = new Map<
    string,
    { totaal: number; dagen: Set<string>; momenten: Set<string>; supplement: boolean }
  >();

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
      const huidig = perNaam.get(naam) ?? {
        totaal: 0,
        dagen: new Set<string>(),
        momenten: new Set<string>(),
        supplement,
      };
      huidig.totaal += inBasis;
      huidig.dagen.add(dag.date);
      huidig.momenten.add(`${dag.date}|${item.moment}`);
      perNaam.set(naam, huidig);
    }
  }

  return [...perNaam.entries()]
    .map(([naam, { totaal, dagen: opDagen, momenten, supplement }]) => ({
      naam,
      totaal: Math.round(totaal * 10) / 10,
      unit: BASE_UNIT[nutrient],
      dagen: opDagen.size,
      momenten: [...momenten]
        .map((sleutel) => {
          const [datum, moment] = sleutel.split("|") as [string, EetmomentId];
          return { datum, moment };
        })
        .sort((a, b) => a.datum.localeCompare(b.datum) || volgorde(a.moment) - volgorde(b.moment)),
      supplement,
    }))
    .sort((a, b) => b.totaal - a.totaal);
}

function volgorde(moment: EetmomentId): number {
  return EETMOMENTEN.findIndex((m) => m.id === moment);
}

/**
 * Dezelfde som als {@link bronnenVanStof}, maar per maaltijd: waar in je dag
 * deze stof vandaan kwam. `keer` telt elke dag waarop het moment iets droeg,
 * zodat een maaltijd zonder deze stof (0) te onderscheiden is van een maaltijd
 * die je niet registreerde (keer 0).
 */
export function stofPerMoment(
  dagen: readonly DagboekDag[],
  datums: readonly string[],
  nutrient: NutrientId,
): StofPerMoment[] {
  const binnen = new Set(datums);
  const totaal = new Map<EetmomentId, number>();
  const keer = new Map<EetmomentId, Set<string>>();

  for (const dag of dagen) {
    if (!binnen.has(dag.date)) continue;
    for (const item of sanitizeItems(dag.items ?? [])) {
      const dagenVanMoment = keer.get(item.moment) ?? new Set<string>();
      dagenVanMoment.add(dag.date);
      keer.set(item.moment, dagenVanMoment);

      const bedrag = bedragVanItem(item, nutrient);
      const inBasis = bedrag ? toBase(bedrag.value, bedrag.unit, nutrient) : null;
      if (inBasis === null || inBasis <= 0) continue;
      totaal.set(item.moment, (totaal.get(item.moment) ?? 0) + inBasis);
    }
  }

  return EETMOMENTEN.map(({ id, label }) => ({
    moment: id,
    label,
    totaal: Math.round((totaal.get(id) ?? 0) * 10) / 10,
    keer: keer.get(id)?.size ?? 0,
  }));
}
