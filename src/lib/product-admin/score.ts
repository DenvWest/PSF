import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import { computeTrustScore } from "@/lib/supplement-score/compute";
import { loadCategoryProducts } from "@/lib/supplement-catalog-db/loader";
import type { SupplementCategory } from "@/types/supplement";
import type { TrustScoreResult } from "@/types/supplement-score";

export type AdminScore =
  | { available: true; result: TrustScoreResult }
  | { available: false; reason: string };

/**
 * PS-Score voor alle (niet-gearchiveerde) producten van één categorie, live
 * berekend met dezelfde functie en invoer als /supplementen. De score-invoer
 * (vormsleutel, etiketfeiten, kwaliteitsmarkers) staat nog in code
 * (score-inputs.ts), niet in de database: een product zonder daar een regel
 * is dus niet te scoren.
 */
export async function scoresForCategory(
  db: SupabaseClient,
  categorySlug: string,
): Promise<Map<string, AdminScore>> {
  const out = new Map<string, AdminScore>();
  const inputsForCategory = PRODUCT_SCORE_INPUTS[categorySlug as SupplementCategory];
  const products = await loadCategoryProducts(db, categorySlug, { includeUnpublished: true });

  for (const product of products) {
    const inputs = inputsForCategory?.[product.slug];
    if (!inputs) {
      out.set(product.slug, {
        available: false,
        reason: "Score-invoer ontbreekt in src/data/supplement-hub/score-inputs.ts",
      });
      continue;
    }
    const result = computeTrustScore({
      category: categorySlug as SupplementCategory,
      werkzameStof: product.werkzameStof,
      doseringPerDagdosis: product.doseringPerDagdosis,
      efsaClaimIds: product.efsaClaimIds,
      thirdPartyTested: product.thirdPartyTested,
      formKey: inputs.formKey,
      label: inputs.label,
      certificeringen: inputs.certificeringen,
      kwaliteitsmarkers: inputs.kwaliteitsmarkers,
      dosisOnzekerReden: inputs.dosisOnzekerReden,
    });
    out.set(product.slug, { available: true, result });
  }
  return out;
}

export function scoreGateState(score: AdminScore | undefined): { available: boolean; detail: string } {
  if (!score) {
    return { available: false, detail: "Product kon niet worden ingeladen (werkzame stoffen ontbreken?)" };
  }
  if (!score.available) return { available: false, detail: score.reason };
  if (score.result.determinedCount === 0) {
    return { available: false, detail: "Geen enkel scoreonderdeel is te bepalen" };
  }
  return {
    available: true,
    detail: `${score.result.total}/100 (${score.result.determinedCount} van ${score.result.totalCount} onderdelen)`,
  };
}
