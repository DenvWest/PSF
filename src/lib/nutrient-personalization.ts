import type { NutrientId } from "@/data/nutrition/intake-reference";
import { computeProteinTarget, type ProteinTarget } from "@/lib/protein-target";

/**
 * Gepersonaliseerde nutriënt-normen — het patroon dat in dit traject is vastgelegd.
 *
 * DISCIPLINE (compliance-troef): personaliseer een norm ALLEEN waar het
 * wetenschappelijk verdedigbaar is — eiwit (g/kg) en later energie/macro (TDEE).
 * Micronutriënten (magnesium, zink, vitamine D, omega-3) houden hun VASTE,
 * bronbare RI uit nutrientReferences. Niet in deze map = vaste norm (veilig default).
 *
 * Bron-agnostisch: de context levert getallen; of die uit een formulier of later
 * een wearable komen, maakt voor deze laag niet uit.
 */

export interface PersonalizationContext {
  weightKg?: number;
  trainingLoad?: number;
}

export type PersonalizedTarget = ProteinTarget;

export const NUTRIENT_PERSONALIZERS: Partial<
  Record<NutrientId, (ctx: PersonalizationContext) => PersonalizedTarget | null>
> = {
  protein: (ctx) =>
    ctx.weightKg === undefined
      ? null
      : computeProteinTarget({
          weightKg: ctx.weightKg,
          trainingLoad: ctx.trainingLoad,
        }),
};

export function getPersonalizedTarget(
  nutrient: NutrientId,
  ctx: PersonalizationContext,
): PersonalizedTarget | null {
  const personalizer = NUTRIENT_PERSONALIZERS[nutrient];
  return personalizer ? personalizer(ctx) : null;
}
