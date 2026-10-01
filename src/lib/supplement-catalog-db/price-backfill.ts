import type { SupabaseClient } from "@supabase/supabase-js";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";
import { parsePricePerDaySpec } from "@/lib/supplement-catalog-db/price-parse";
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

export interface PriceBackfillResult {
  written: string[];
  skippedExisting: string[];
  unparsed: string[];
  missingOffer: string[];
  errors: string[];
}

/**
 * Best-effort parse van de vrije-tekst "Prijs / dag"-spec in de statische
 * productdata naar sup_offers.price_cents + price_checked_at.
 *
 * sup_offers bestaat al per product (zie offers-backfill.ts), met price_cents
 * bewust leeg gelaten om dezelfde reden als bij verpakking (§K7: geen prijs
 * tonen is veiliger dan een foutgeparste prijs). Dit script vult die leegte
 * met dezelfde voorzichtigheid als packaging-backfill.ts: niet-destructief,
 * en wat niet met zekerheid te parsen is (eiwitpoeder heeft geen "Prijs /
 * dag"-spec, alleen een maandindicatie) komt terug in `unparsed`.
 *
 * price_checked_at wordt gezet op de `lastUpdated` van de vergelijkingspagina
 * — de datum waarop de redactie de prijzen voor het laatst heeft nagelopen.
 */
export async function backfillPrices(db: SupabaseClient): Promise<PriceBackfillResult> {
  const result: PriceBackfillResult = {
    written: [],
    skippedExisting: [],
    unparsed: [],
    missingOffer: [],
    errors: [],
  };

  for (const comparison of COMPARISONS) {
    for (const product of comparison.products) {
      const slug = product.slug;
      const priceSpec = product.specs.find((s) => s.label === "Prijs / dag")?.value;
      const priceCents = priceSpec ? parsePricePerDaySpec(priceSpec) : null;

      if (priceCents == null) {
        result.unparsed.push(`${comparison.category}/${slug}`);
        continue;
      }

      const { data: productRow, error: productError } = await db
        .from("sup_products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (productError) {
        result.errors.push(`${comparison.category}/${slug}: ${productError.message}`);
        continue;
      }
      if (!productRow) {
        result.missingOffer.push(`${comparison.category}/${slug}`);
        continue;
      }

      const { data: offerRow, error: offerError } = await db
        .from("sup_offers")
        .select("id, price_cents")
        .eq("product_id", productRow.id)
        .maybeSingle();
      if (offerError) {
        result.errors.push(`${comparison.category}/${slug}: ${offerError.message}`);
        continue;
      }
      if (!offerRow) {
        result.missingOffer.push(`${comparison.category}/${slug}`);
        continue;
      }
      if (offerRow.price_cents !== null) {
        result.skippedExisting.push(`${comparison.category}/${slug}`);
        continue;
      }

      const { error: updateError } = await db
        .from("sup_offers")
        .update({ price_cents: priceCents, price_checked_at: comparison.lastUpdated })
        .eq("id", offerRow.id);
      if (updateError) {
        result.errors.push(`${comparison.category}/${slug}: ${updateError.message}`);
        continue;
      }
      result.written.push(`${comparison.category}/${slug}`);
    }
  }

  return result;
}
