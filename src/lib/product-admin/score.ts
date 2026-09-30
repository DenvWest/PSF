import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import { computeTrustScore } from "@/lib/supplement-score/compute";
import { parseStoredScoreInputs, staticToStored, type StoredScoreInputs } from "@/lib/product-admin/score-inputs";
import { loadCategoryProducts } from "@/lib/supplement-catalog-db/loader";
import type { SupplementCategory } from "@/types/supplement";
import type { TrustScoreResult } from "@/types/supplement-score";

export type ScoreInputSource = "database" | "code";

export type AdminScore =
  | { available: true; result: TrustScoreResult; source: ScoreInputSource }
  | { available: false; reason: string };

/**
 * Score-invoer uit sup_products.score_inputs, per slug. Zolang de migratie niet is gedraaid
 * (kolom bestaat niet) of een rij leeg is, ontbreekt de slug en geldt de statische invoer.
 */
async function loadStoredInputsForCategory(
  db: SupabaseClient,
  categorySlug: string,
): Promise<Map<string, StoredScoreInputs>> {
  const out = new Map<string, StoredScoreInputs>();
  const { data, error } = await db
    .from("sup_products")
    .select("slug, score_inputs, sup_categories!inner(slug)")
    .eq("sup_categories.slug", categorySlug);
  if (error) return out;
  for (const row of (data ?? []) as { slug: string; score_inputs: unknown }[]) {
    const parsed = parseStoredScoreInputs(row.score_inputs);
    if (parsed) out.set(row.slug, parsed);
  }
  return out;
}

export interface ProductScoreInputState {
  columnAvailable: boolean;
  inputs: StoredScoreInputs | null;
}

export async function loadProductScoreInputState(db: SupabaseClient, productId: string): Promise<ProductScoreInputState> {
  const { data, error } = await db.from("sup_products").select("score_inputs").eq("id", productId).maybeSingle();
  if (error) return { columnAvailable: false, inputs: null };
  return { columnAvailable: true, inputs: parseStoredScoreInputs((data as { score_inputs: unknown } | null)?.score_inputs) };
}

/**
 * PS-Score voor alle (niet-gearchiveerde) producten van één categorie, live
 * berekend met dezelfde functie als /supplementen. De score-invoer komt uit
 * sup_products.score_inputs; bestaat die niet (nog geen migratie, of nog niet
 * ingevuld), dan geldt de statische invoer uit score-inputs.ts.
 */
export async function scoresForCategory(
  db: SupabaseClient,
  categorySlug: string,
): Promise<Map<string, AdminScore>> {
  const out = new Map<string, AdminScore>();
  const inputsForCategory = PRODUCT_SCORE_INPUTS[categorySlug as SupplementCategory];
  const [products, stored] = await Promise.all([
    loadCategoryProducts(db, categorySlug, { includeUnpublished: true }),
    loadStoredInputsForCategory(db, categorySlug),
  ]);

  for (const product of products) {
    const fromDb = stored.get(product.slug);
    const fromCode = inputsForCategory?.[product.slug];
    const inputs = fromDb ?? (fromCode ? staticToStored(fromCode) : undefined);
    if (!inputs) {
      out.set(product.slug, {
        available: false,
        reason: "Score-invoer ontbreekt: vul het formulier hieronder in.",
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
    out.set(product.slug, { available: true, result, source: fromDb ? "database" : "code" });
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
