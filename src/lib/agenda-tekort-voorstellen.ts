import { TEKORT_VOORSTELLEN } from "@/data/agenda/tekort-voorstellen";
import type { TekortVoorstelDef } from "@/data/agenda/tekort-voorstellen";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { nutrientenUitItems, sanitizeItems, zonderBenadering } from "@/lib/nutrition-dagboek-items";
import { aandeelVanNorm, type KernstofNormen } from "@/lib/nutrition-normen";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";

export type TekortVoorstel = TekortVoorstelDef & {
  nutrient: NutrientId;
  label: string;
  aandeel: number;
};

export type DagDekking = "gedekt" | "open" | "leeg";

const MAX_VOORSTELLEN = 3;

export function bouwTekortVoorstellen(
  reeksen: readonly Vensterreeks[],
): TekortVoorstel[] {
  const voorstellen: TekortVoorstel[] = [];
  for (const reeks of reeksen) {
    const def = TEKORT_VOORSTELLEN[reeks.nutrient];
    if (!def || !reeks.bewijsbaar) continue;
    const langste = [...reeks.vensters].reverse().find((venster) => venster.dagen > 0);
    if (!langste || langste.aandeel === null || langste.aandeel >= 1) continue;
    voorstellen.push({
      ...def,
      nutrient: reeks.nutrient,
      label: reeks.label,
      aandeel: langste.aandeel,
    });
  }
  return voorstellen
    .sort((links, rechts) => links.aandeel - rechts.aandeel)
    .slice(0, MAX_VOORSTELLEN);
}

/**
 * "gedekt" bewijst dekking; "open" bewijst niets (asymmetrie-regel), dus de UI
 * toont het neutraal en nooit als tekort.
 */
export function dekkingPerDag(
  dagen: readonly DagboekDag[],
  nutrient: NutrientId,
  datums: readonly string[],
  normen: KernstofNormen,
): Record<string, DagDekking> {
  const perDatum = new Map(dagen.map((dag) => [dag.date, dag]));
  const resultaat: Record<string, DagDekking> = {};
  for (const datum of datums) {
    const dag = perDatum.get(datum);
    if (!dag) {
      resultaat[datum] = "leeg";
      continue;
    }
    const stof = nutrientenUitItems(sanitizeItems(dag.items ?? [])).find(
      (entry) => entry.nutrient === nutrient,
    );
    const aandeel = aandeelVanNorm(normen, nutrient, zonderBenadering(stof));
    resultaat[datum] = aandeel !== null && aandeel >= 1 ? "gedekt" : "open";
  }
  return resultaat;
}
