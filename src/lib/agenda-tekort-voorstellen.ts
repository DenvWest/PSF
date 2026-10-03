import { TEKORT_VOORSTELLEN } from "@/data/agenda/tekort-voorstellen";
import type { TekortVoorstelDef } from "@/data/agenda/tekort-voorstellen";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { aandeelVanRi } from "@/data/nutrition/reference-intake";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { nutrientenUitItems, sanitizeItems } from "@/lib/nutrition-dagboek-items";
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
    const aandeel = aandeelVanRi(nutrient, stof?.minstens ?? 0);
    resultaat[datum] = aandeel !== null && aandeel >= 1 ? "gedekt" : "open";
  }
  return resultaat;
}
