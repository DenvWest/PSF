import type { SupabaseClient } from "@supabase/supabase-js";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";
import { parseEuroAmountSpec } from "@/lib/supplement-catalog-db/price-parse";
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
 * Best-effort parse van de vrije-tekst prijs-specs in de statische
 * productdata naar sup_offers.price_cents (de prijs van de VERPAKKING, niet
 * van een dag) + price_checked_at.
 *
 * Twee bronnen, in volgorde van voorkeur:
 * 1. De "Prijs"-spec (bijv. "€ 17,95") — staat al op verpakkingsniveau, geen
 *    omrekening nodig. Alleen aanwezig bij ashwagandha, creatine, vitamine-d
 *    en zink.
 * 2. "Prijs / dag" (bijv. "€ 0,18") × sup_products.servings_per_container —
 *    nodig voor magnesium en omega-3, die geen "Prijs"-spec hebben. Vereist
 *    dat de verpakkingsbackfill (packaging-backfill.ts, plak A) al gedraaid
 *    heeft; zonder servings_per_container is dit niet te berekenen.
 *
 * Een eerdere versie van dit script schreef "Prijs / dag" rechtstreeks naar
 * price_cents, alsof het al de verpakkingsprijs was — dat gaf voor
 * stuksgoed-producten (120 tabletten × €0,43 is geen €0,43 totaal) een veel
 * te lage prijs-per-dag op de productpagina (hub-loader.ts deelt price_cents
 * immers zelf nog door servings_per_container). Deze versie rekent dat op.
 *
 * sup_offers bestaat al per product (zie offers-backfill.ts), met price_cents
 * bewust leeg gelaten om dezelfde reden als bij verpakking (§K7: geen prijs
 * tonen is veiliger dan een foutgeparste prijs). Niet-destructief: wat niet
 * met zekerheid te berekenen is (eiwitpoeder heeft geen bruikbare prijs-spec)
 * komt terug in `unparsed`.
 *
 * price_checked_at wordt gezet op de `lastUpdated` van de vergelijkingspagina
 * — de datum waarop de redactie de prijzen voor het laatst heeft nagelopen.
 */
export interface BackfillPricesOptions {
  /**
   * Herberekent en overschrijft een bestaande price_cents in plaats van de
   * rij over te slaan. Nodig na een correctie van de parse-/omrekenlogica
   * (zie de modulenotitie hierboven) — zonder deze vlag blijft idempotent
   * gedrag het uitgangspunt: een handmatig in de admin aangepaste prijs mag
   * nooit stilzwijgend overschreven worden.
   */
  force?: boolean;
}

export async function backfillPrices(
  db: SupabaseClient,
  options: BackfillPricesOptions = {},
): Promise<PriceBackfillResult> {
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

      const { data: productRow, error: productError } = await db
        .from("sup_products")
        .select("id, servings_per_container")
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

      const totalPriceSpec = product.specs.find((s) => s.label === "Prijs")?.value;
      const totalPriceCents = totalPriceSpec ? parseEuroAmountSpec(totalPriceSpec) : null;

      let priceCents: number | null = totalPriceCents;
      if (priceCents == null) {
        const perDaySpec = product.specs.find((s) => s.label === "Prijs / dag")?.value;
        const perDayCents = perDaySpec ? parseEuroAmountSpec(perDaySpec) : null;
        const servings = (productRow as { servings_per_container: number | null }).servings_per_container;
        if (perDayCents != null && servings != null && servings > 0) {
          priceCents = perDayCents * servings;
        }
      }

      if (priceCents == null) {
        result.unparsed.push(`${comparison.category}/${slug}`);
        continue;
      }

      const { data: offerRow, error: offerError } = await db
        .from("sup_offers")
        .select("id, price_cents, price_checked_at")
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
      const row = offerRow as { id: string; price_cents: number | null; price_checked_at: string | null };
      // Alleen herschrijven als de rij nog exact de vorige backfill-stempel
      // draagt (lastUpdated van de vergelijkingspagina) — zo blijft een
      // handmatige correctie in de admin ("Prijs gecontroleerd", die
      // price_checked_at op vandaag zet) buiten bereik van --force.
      const isUntouchedBackfillRow =
        row.price_checked_at !== null &&
        row.price_checked_at.slice(0, 10) === comparison.lastUpdated;
      if (row.price_cents !== null && !(options.force && isUntouchedBackfillRow)) {
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
