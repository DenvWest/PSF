import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * Stofgroepen voor Mijn keuzes. Zodra er meer stoffen bijkomen dan in één
 * scherm passen, staan ze per groep onder een kop. `Record<NutrientId, …>`
 * dwingt af dat een nieuwe stof hier een groep krijgt.
 */
export type StofgroepId = "eiwit" | "vetzuren" | "mineralen" | "vitamines";

export const STOFGROEPEN: readonly { id: StofgroepId; label: string }[] = [
  { id: "eiwit", label: "Eiwit" },
  { id: "vetzuren", label: "Vetzuren" },
  { id: "mineralen", label: "Mineralen" },
  { id: "vitamines", label: "Vitamines" },
];

const GROEP_VAN_STOF: Record<NutrientId, StofgroepId> = {
  protein: "eiwit",
  omega3: "vetzuren",
  magnesium: "mineralen",
  zinc: "mineralen",
  vitamin_d: "vitamines",
};

/** Vanaf zoveel stoffen in totaal tonen we groepskoppen; eronder blijft het één lijst. */
export const GROEPEN_VANAF_STOFFEN = 7;

export function stofgroepVan(nutrient: NutrientId): StofgroepId {
  return GROEP_VAN_STOF[nutrient];
}

/** Per groep, in vaste volgorde; lege groepen vallen weg. */
export function groepeerPerStofgroep<T extends { status: { nutrient: NutrientId } }>(
  keuzes: readonly T[],
): { groep: { id: StofgroepId; label: string }; keuzes: T[] }[] {
  return STOFGROEPEN.map((groep) => ({
    groep,
    keuzes: keuzes.filter((k) => stofgroepVan(k.status.nutrient) === groep.id),
  })).filter((rij) => rij.keuzes.length > 0);
}
