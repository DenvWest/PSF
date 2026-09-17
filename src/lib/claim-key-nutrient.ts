import type { IngredientClaimKey } from "@/data/approved-claims";
import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * Van een supplementstof naar de voedingsstof die de check meet.
 *
 * ## Waarom niet elke stof er een heeft
 *
 * `approvedClaims` kent negen sleutels; `NutrientId` er vijf. Creatine,
 * melatonine, ashwagandha en vitamine K vallen buiten de voedingscheck — niet
 * omdat ze er niet toe doen, maar omdat de check hun inname niet meet. Voor die
 * stoffen bestaat er dus ook geen eerlijk "dit haal je uit je eten"-blok, en
 * `null` is hier het goede antwoord in plaats van een bij elkaar gezochte bron.
 *
 * Dit is dezelfde grens die `node-metadata.ts` aan de contentkant trekt: een
 * supplement is niet vanzelf een nutriënt.
 */
export const CLAIM_KEY_NUTRIENT: Partial<Record<IngredientClaimKey, NutrientId>> = {
  magnesium: "magnesium",
  omega3: "omega3",
  vitamineD: "vitamin_d",
  zink: "zinc",
  eiwitpoeder: "protein",
};

export function nutrientForClaimKey(
  key: IngredientClaimKey | null | undefined,
): NutrientId | null {
  return key ? (CLAIM_KEY_NUTRIENT[key] ?? null) : null;
}
