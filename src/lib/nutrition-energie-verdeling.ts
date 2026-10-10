import type { Voedingswaarde } from "@/lib/nutrition-voedingswaarde";

/**
 * Waar je calorieën vandaan komen, en hoeveel van je vet verzadigd is. Feiten
 * uit je dagboek, zonder oordeel: geen "goede" of "slechte" calorieën
 * (`BESLUIT_PATROON_OP_KEUZE_NIVEAU_2026-10.md`).
 *
 * De kcal-aandelen rekenen met 4 kcal per gram eiwit en koolhydraten en 9 per
 * gram vet, over de dagen waarop je iets registreerde. Alleen wat een product
 * als gehalte meegaf telt mee, dus de verdeling is een ondergrens-beeld.
 */

export type EnergieDeel = {
  sleutel: "proteinG" | "carbohydrateG" | "fatG";
  label: string;
  gram: number;
  kcal: number;
  aandeel: number;
};

export type EnergieVerdeling = { dagen: number; delen: EnergieDeel[]; totaalKcal: number };

export type VetVerdeling = { vetG: number; verzadigdG: number; aandeelVerzadigd: number };

const KCAL_PER_GRAM = { proteinG: 4, carbohydrateG: 4, fatG: 9 } as const;
const LABELS = { proteinG: "Eiwit", carbohydrateG: "Koolhydraten", fatG: "Vet" } as const;

function somOver(perDag: ReadonlyMap<string, Voedingswaarde>, datums: readonly string[], veld: string) {
  let som = 0;
  let heeftWaarde = false;
  let dagen = 0;
  for (const datum of datums) {
    const dag = perDag.get(datum);
    if (!dag || dag.metWaarde + dag.zonderWaarde === 0) continue;
    dagen += 1;
    const waarde = dag.rijen.find((rij) => rij.veld === veld)?.waarde;
    if (waarde === null || waarde === undefined) continue;
    som += waarde;
    heeftWaarde = true;
  }
  return { som, heeftWaarde, dagen };
}

export function bouwEnergieVerdeling(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  datums: readonly string[],
): EnergieVerdeling | null {
  const sleutels = ["proteinG", "carbohydrateG", "fatG"] as const;
  const metingen = sleutels.map((sleutel) => ({ sleutel, ...somOver(perDag, datums, sleutel) }));
  if (metingen.some((m) => !m.heeftWaarde)) return null;
  const kcalPerDeel = metingen.map((m) => ({ ...m, kcal: m.som * KCAL_PER_GRAM[m.sleutel] }));
  const totaalKcal = kcalPerDeel.reduce((som, m) => som + m.kcal, 0);
  if (totaalKcal <= 0) return null;
  return {
    dagen: Math.max(...metingen.map((m) => m.dagen)),
    totaalKcal,
    delen: kcalPerDeel.map((m) => ({
      sleutel: m.sleutel,
      label: LABELS[m.sleutel],
      gram: m.som,
      kcal: m.kcal,
      aandeel: m.kcal / totaalKcal,
    })),
  };
}

export function bouwVetVerdeling(
  perDag: ReadonlyMap<string, Voedingswaarde>,
  datums: readonly string[],
): VetVerdeling | null {
  const vet = somOver(perDag, datums, "fatG");
  const verzadigd = somOver(perDag, datums, "saturatedFatG");
  if (!vet.heeftWaarde || !verzadigd.heeftWaarde || vet.som <= 0) return null;
  return {
    vetG: vet.som,
    verzadigdG: verzadigd.som,
    aandeelVerzadigd: Math.min(1, verzadigd.som / vet.som),
  };
}
