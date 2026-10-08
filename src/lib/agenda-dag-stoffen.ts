import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  nutrientenUitItems,
  sanitizeItems,
  zonderBenadering,
} from "@/lib/nutrition-dagboek-items";
import { aandeelVanNorm, type KernstofNormen } from "@/lib/nutrition-normen";
import { BASE_UNIT } from "@/lib/nutrition-units";

export const DAG_STOFFEN: readonly NutrientId[] = [
  "protein",
  "omega3",
  "magnesium",
  "vitamin_d",
  "zinc",
];

export type DagStofStand = "gehaald" | "open" | "leeg";

export type DagStof = {
  nutrient: NutrientId;
  label: string;
  unit: string;
  stand: DagStofStand;
  hoeveelheid: number | null;
  aandeel: number | null;
};

/**
 * De dagdekking van één stof uit het dagboek. "gehaald" bewijst dat de norm
 * is gedekt; "open" bewijst niets (een dagboek is een ondergrens) en "leeg"
 * betekent dat er die dag niets is ingevuld. Eiwit heeft hier geen vaste norm
 * (die rekent met gewicht en belasting), dus nooit "gehaald" op dagniveau.
 */
export function dagStof(
  dag: DagboekDag | null | undefined,
  nutrient: NutrientId,
  normen: KernstofNormen,
): DagStof {
  const base = {
    nutrient,
    label: nutrientReferences[nutrient].label,
    unit: BASE_UNIT[nutrient],
  };
  const items = sanitizeItems(dag?.items ?? []);
  if (items.length === 0) {
    return { ...base, stand: "leeg", hoeveelheid: null, aandeel: null };
  }
  const stof = nutrientenUitItems(items).find((entry) => entry.nutrient === nutrient);
  const hoeveelheid = zonderBenadering(stof);
  const aandeel = aandeelVanNorm(normen, nutrient, hoeveelheid);
  return {
    ...base,
    stand: aandeel !== null && aandeel >= 1 ? "gehaald" : "open",
    hoeveelheid,
    aandeel,
  };
}
