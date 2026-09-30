import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import { staticToStored } from "@/lib/product-admin/score-inputs";

export interface ScoreInputsBackfillResult {
  written: number;
  skippedExisting: number;
  missingProducts: string[];
  errors: string[];
}

/**
 * Zet de statische score-invoer (score-inputs.ts) in sup_products.score_inputs.
 * Idempotent en niet-destructief: een rij die al een waarde heeft (handmatig
 * bewerkt in de admin) wordt overgeslagen. Vereist migratie
 * 20260930143532_sup_products_score_inputs.sql en de product-backfill.
 */
export async function backfillScoreInputs(db: SupabaseClient): Promise<ScoreInputsBackfillResult> {
  const result: ScoreInputsBackfillResult = { written: 0, skippedExisting: 0, missingProducts: [], errors: [] };

  for (const [category, products] of Object.entries(PRODUCT_SCORE_INPUTS)) {
    for (const [slug, inputs] of Object.entries(products)) {
      const { data, error } = await db.from("sup_products").select("id, score_inputs").eq("slug", slug).maybeSingle();
      if (error) {
        result.errors.push(`${category}/${slug}: ${error.message}`);
        continue;
      }
      if (!data) {
        result.missingProducts.push(`${category}/${slug}`);
        continue;
      }
      const row = data as { id: string; score_inputs: unknown };
      if (row.score_inputs !== null && row.score_inputs !== undefined) {
        result.skippedExisting += 1;
        continue;
      }
      const { error: updateError } = await db
        .from("sup_products")
        .update({ score_inputs: staticToStored(inputs) })
        .eq("id", row.id);
      if (updateError) {
        result.errors.push(`${category}/${slug}: ${updateError.message}`);
        continue;
      }
      result.written += 1;
    }
  }
  return result;
}
