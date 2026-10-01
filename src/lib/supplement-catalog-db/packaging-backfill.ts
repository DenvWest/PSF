import type { SupabaseClient } from "@supabase/supabase-js";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";
import { parseContainerSpec, parseServingSpec } from "@/lib/supplement-catalog-db/packaging-parse";
import type { ComparisonPageData } from "@/types/supplement";

const COMPARISONS: ComparisonPageData[] = [
  magnesiumData,
  omega3Data,
  vitamineDData,
  zinkData,
  creatineData,
  ashwagandhaData,
  eiwitpoederData,
];

export interface PackagingBackfillResult {
  written: string[];
  skippedExisting: string[];
  unparsed: string[];
  missingProducts: string[];
  errors: string[];
}

/**
 * Best-effort parse van de vrije-tekst "Inhoud"/"Portie"-specs in de
 * statische productdata naar sup_products.container_size/container_unit/
 * servings_per_container/serving_size/serving_unit.
 *
 * Niet-destructief: een rij die al verpakkingsdata heeft (handmatig ingevuld
 * in het dossier) wordt overgeslagen. Wat niet met zekerheid te parsen is
 * (bijv. eiwitpoeder-verpakkingsgrootte, die alleen impliciet in de
 * prijsindicatie staat) komt in `unparsed` te staan — dat is handwerk, geen
 * gok. Zie docs/plan/OVERDRACHT_PRODUCTPLATFORM_HUB_DB_2026-10-01.md §3.
 */
export async function backfillPackaging(db: SupabaseClient): Promise<PackagingBackfillResult> {
  const result: PackagingBackfillResult = {
    written: [],
    skippedExisting: [],
    unparsed: [],
    missingProducts: [],
    errors: [],
  };

  for (const comparison of COMPARISONS) {
    for (const product of comparison.products) {
      const slug = product.slug;
      const inhoudSpec = product.specs.find((s) => s.label === "Inhoud")?.value;
      const portieSpec = product.specs.find((s) => s.label === "Portie")?.value;

      const container = inhoudSpec ? parseContainerSpec(inhoudSpec) : null;
      const serving = portieSpec ? parseServingSpec(portieSpec) : null;

      const hasAnyParsed =
        (container && container.containerSize !== null) || (serving && serving.servingSize !== null);
      if (!hasAnyParsed) {
        result.unparsed.push(`${comparison.category}/${slug}`);
        continue;
      }

      const { data, error } = await db
        .from("sup_products")
        .select("id, container_size, serving_size")
        .eq("slug", slug)
        .maybeSingle();
      if (error) {
        result.errors.push(`${comparison.category}/${slug}: ${error.message}`);
        continue;
      }
      if (!data) {
        result.missingProducts.push(`${comparison.category}/${slug}`);
        continue;
      }
      const row = data as { id: string; container_size: number | null; serving_size: number | null };
      if (row.container_size !== null || row.serving_size !== null) {
        result.skippedExisting.push(`${comparison.category}/${slug}`);
        continue;
      }

      const update: Record<string, number | string> = {};
      if (container?.containerSize != null) {
        update.container_size = container.containerSize;
        if (container.containerUnit) update.container_unit = container.containerUnit;
        if (container.servingsPerContainer != null) update.servings_per_container = container.servingsPerContainer;
      }
      if (serving?.servingSize != null) {
        update.serving_size = serving.servingSize;
        if (serving.servingUnit) update.serving_unit = serving.servingUnit;
      }

      const { error: updateError } = await db.from("sup_products").update(update).eq("id", row.id);
      if (updateError) {
        result.errors.push(`${comparison.category}/${slug}: ${updateError.message}`);
        continue;
      }
      result.written.push(`${comparison.category}/${slug}`);
    }
  }

  return result;
}
