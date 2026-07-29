import type { NutrientId } from "@/data/nutrition/intake-reference";
import { PORTION_GRAMS, proteinQuantityPhrase } from "@/data/nutrition/portion-dictionary";
import type { ProteinTargetRange } from "@/lib/protein-target";

export type NutritionPreference = "none" | "pescatarian" | "vegetarian" | "vegan";

export type NutritionAdviceContext = {
  preference: NutritionPreference;
  allergies: string[];
  /** Alleen voor eiwit — zie LifestyleActionContext in portion-dictionary.ts. */
  proteinTarget?: ProteinTargetRange | null;
};

const PLANT_OMEGA3 =
  "Kies plantaardige omega-3: algenolie (DHA) of 1 el lijnzaad/walnoten (ALA — minder efficiënt dan vis).";

function buildPlantProteinText(target?: ProteinTargetRange | null): string {
  const suffix = target
    ? ""
    : " Verdeeld over 3–4 momenten pakt je lichaam eiwit beter op.";
  const article = target ? " een" : "";
  return `${proteinQuantityPhrase(target)}: tofu/tempeh + peulvruchten bij ontbijt, ${PORTION_GRAMS.legumes} g linzen of kikkererwten bij${article} warme maaltijd.${suffix}`;
}

function buildProteinNoEggText(target?: ProteinTargetRange | null): string {
  const suffix = target
    ? ""
    : " Verdeeld over 3–4 momenten pakt je lichaam eiwit beter op.";
  const article = target ? " een" : "";
  return `${proteinQuantityPhrase(target)}: kwark of yoghurt bij ontbijt, 100 g kip of ${PORTION_GRAMS.legumes} g linzen bij${article} warme maaltijd.${suffix}`;
}

const PLANT_ZINC =
  `Eet dagelijks een zinkbron uit peulvruchten, volkoren granen of pompoenpitten (${PORTION_GRAMS.legumes} g bonen ≈ 2–3 mg). Fytaat in plantaardige bronnen kan opname vertragen — spreiding over de dag helpt. Vuistregel mannen: ~9–11 mg/dag.`;

const ZINC_NO_DAIRY =
  `Eet dagelijks een zinkbron: 100 g rundvlees (~4–5 mg), 2 eieren, of ${PORTION_GRAMS.legumes} g peulvruchten. Vuistregel mannen: ~9–11 mg/dag.`;

const MAGNESIUM_NO_TREE_NUTS =
  `Voeg dagelijks een magnesiumbron toe: 100 g gekookte spinazie, ${PORTION_GRAMS.legumes} g zwarte bonen of pompoenpitten. Vuistregel voor mannen: rond de 350 mg/dag.`;

function hasAllergy(allergies: string[], ...values: string[]): boolean {
  return values.some((value) => allergies.includes(value));
}

function isFishFree(ctx: NutritionAdviceContext): boolean {
  if (ctx.preference === "vegetarian" || ctx.preference === "vegan") {
    return true;
  }
  return hasAllergy(ctx.allergies, "vis", "zeevruchten");
}

function isDairyFree(ctx: NutritionAdviceContext): boolean {
  return hasAllergy(ctx.allergies, "melk", "lactose");
}

/**
 * Pas lifestyle-copy aan op voorkeur/allergie — bron-substitutie, geen supplement-claim.
 */
export function personalizeLifestyleText(
  nutrient: NutrientId,
  baseText: string,
  ctx: NutritionAdviceContext,
): string {
  switch (nutrient) {
    case "omega3":
      return isFishFree(ctx) ? PLANT_OMEGA3 : baseText;

    case "protein":
      if (ctx.preference === "vegan") {
        return buildPlantProteinText(ctx.proteinTarget);
      }
      if (hasAllergy(ctx.allergies, "eieren")) {
        return buildProteinNoEggText(ctx.proteinTarget);
      }
      return baseText;

    case "zinc":
      if (ctx.preference === "vegan") {
        return PLANT_ZINC;
      }
      if (isDairyFree(ctx)) {
        return ZINC_NO_DAIRY;
      }
      return baseText;

    case "magnesium":
      if (hasAllergy(ctx.allergies, "noten")) {
        return MAGNESIUM_NO_TREE_NUTS;
      }
      return baseText;

    default:
      return baseText;
  }
}

/** Voorbeeld-target voor de compliance-sweep — geen echte gebruikersdata. */
const SAMPLE_PROTEIN_TARGET: ProteinTargetRange = {
  gramsLow: 95,
  gramsHigh: 110,
};

/** Alle gepersonaliseerde varianten — compliance-tests. */
export function allPersonalizedLifestyleTexts(): string[] {
  const nutrients: NutrientId[] = ["protein", "omega3", "magnesium", "zinc"];
  const proteinTargets: Array<ProteinTargetRange | null> = [null, SAMPLE_PROTEIN_TARGET];
  const contexts: NutritionAdviceContext[] = proteinTargets.flatMap((proteinTarget) => [
    { preference: "vegan", allergies: [], proteinTarget },
    { preference: "vegetarian", allergies: [], proteinTarget },
    { preference: "none", allergies: ["vis"], proteinTarget },
    { preference: "none", allergies: ["noten"], proteinTarget },
    { preference: "none", allergies: ["melk"], proteinTarget },
    { preference: "none", allergies: ["eieren"], proteinTarget },
  ]);
  const texts: string[] = [];
  for (const nutrient of nutrients) {
    for (const ctx of contexts) {
      texts.push(
        personalizeLifestyleText(nutrient, "placeholder base text for testing", ctx),
      );
    }
  }
  return texts;
}
