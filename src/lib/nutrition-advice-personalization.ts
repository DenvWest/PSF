import type { NutrientId } from "@/data/nutrition/intake-reference";
import { PORTION_GRAMS } from "@/data/nutrition/portion-dictionary";

export type NutritionPreference = "none" | "pescatarian" | "vegetarian" | "vegan";

export type NutritionAdviceContext = {
  preference: NutritionPreference;
  allergies: string[];
};

const PLANT_OMEGA3 =
  "Kies plantaardige omega-3: algenolie (DHA) of 1 el lijnzaad/walnoten (ALA — minder efficiënt dan vis).";

const PLANT_PROTEIN =
  `Mik op 20–30 g eiwit per eetmoment: tofu/tempeh + peulvruchten bij ontbijt, ${PORTION_GRAMS.legumes} g linzen of kikkererwten bij warme maaltijd. Verdeeld over 3–4 momenten pakt je lichaam eiwit beter op.`;

const PROTEIN_NO_EGG =
  `Mik op 20–30 g eiwit per eetmoment: kwark of yoghurt bij ontbijt, 100 g kip of ${PORTION_GRAMS.legumes} g linzen bij warme maaltijd. Verdeeld over 3–4 momenten pakt je lichaam eiwit beter op.`;

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
        return PLANT_PROTEIN;
      }
      if (hasAllergy(ctx.allergies, "eieren")) {
        return PROTEIN_NO_EGG;
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

/** Alle gepersonaliseerde varianten — compliance-tests. */
export function allPersonalizedLifestyleTexts(): string[] {
  const nutrients: NutrientId[] = ["protein", "omega3", "magnesium", "zinc"];
  const contexts: NutritionAdviceContext[] = [
    { preference: "vegan", allergies: [] },
    { preference: "vegetarian", allergies: [] },
    { preference: "none", allergies: ["vis"] },
    { preference: "none", allergies: ["noten"] },
    { preference: "none", allergies: ["melk"] },
    { preference: "none", allergies: ["eieren"] },
  ];
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
