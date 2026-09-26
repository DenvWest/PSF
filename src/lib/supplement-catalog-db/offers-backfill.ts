import type { SupabaseClient } from "@supabase/supabase-js";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";

/**
 * Backfill van sup_retailers + sup_offers uit de bestaande affiliate-links.ts.
 * Plak 4 — zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C4.
 *
 * Scope, bewust beperkt (26 sep 2026): dit zet de HUIDIGE Daisycon-links en het
 * Arctic Blue-directe mechanisme correct in sup_retailers/sup_offers. Het bouwt
 * geen nieuwe architectuur voor toekomstige directe partnercontracten — het
 * schema ondersteunt 'direct'|'network' al (§808), dus een nieuwe partner is
 * later gewoon een nieuwe sup_retailers-rij, geen aparte module.
 *
 * Retailer-toewijzing is per Daisycon si-nummer, niet per productmerk: si=5676
 * loopt via Vitaminstore.nl (verkoopt ook Solgar/Bonusan/Möller's/etc. als
 * webshop), si=18988 via VitalNutrition.nl. Arctic Blue-links (arctic-blue.com)
 * zijn het eigen directe mechanisme, geen Daisycon-si.
 */

interface RetailerDefinition {
  slug: string;
  name: string;
  pdPartnerSlug: string;
  relationship: "direct" | "network";
  baseUrl: string;
}

const RETAILERS: RetailerDefinition[] = [
  {
    slug: "vitaminstore",
    name: "Vitaminstore",
    pdPartnerSlug: "vitaminstore",
    relationship: "network",
    baseUrl: "https://www.vitaminstore.nl",
  },
  {
    slug: "vitalnutrition",
    name: "VitalNutrition",
    pdPartnerSlug: "vitalnutrition",
    relationship: "network",
    baseUrl: "https://www.vitalnutrition.nl",
  },
  {
    slug: "arctic-blue",
    name: "Arctic Blue",
    pdPartnerSlug: "arctic-blue",
    relationship: "direct",
    baseUrl: "https://www.arctic-blue.com",
  },
];

/** Welke retailer een affiliate-URL bedient, afgeleid van het trackingdomein. */
function retailerSlugForUrl(url: string): string | null {
  if (url.includes("ds1.nl")) return "vitaminstore";
  if (url.includes("bdt9.net")) return "vitalnutrition";
  if (url.includes("arctic-blue.com")) return "arctic-blue";
  return null;
}

export interface OffersBackfillResult {
  retailersUpserted: number;
  offersUpserted: number;
  errors: string[];
}

async function upsertRetailer(
  db: SupabaseClient,
  def: RetailerDefinition,
): Promise<string | null> {
  const { data: partner, error: partnerError } = await db
    .from("pd_partners")
    .select("id")
    .eq("slug", def.pdPartnerSlug)
    .single();

  if (partnerError || !partner) {
    return null;
  }

  const { data, error } = await db
    .from("sup_retailers")
    .upsert(
      {
        slug: def.slug,
        name: def.name,
        pd_partner_id: partner.id,
        relationship: def.relationship,
        base_url: def.baseUrl,
        disclosure_label: "Affiliate link — bij aankoop ontvangen wij een vergoeding.",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (error || !data) {
    return null;
  }
  return data.id;
}

/**
 * Backfill sup_retailers (3 vaste retailers) + sup_offers (één per affiliate-
 * slug die daadwerkelijk aan een sup_products-rij hangt via raw_legacy_fields.
 * affiliateSlug — zie backfill.ts, legacyFieldsFor()).
 *
 * price_cents blijft bewust null: de bestaande prijzen staan als vrije tekst in
 * specs[] (bijv. "€ 0,18"), en het automatisch parsen daarvan is foutgevoelig
 * genoeg om apart te doen, niet als bijvangst van deze backfill. Geen prijs
 * tonen is veiliger dan een foutgeparste prijs (§K7 van het analysedoc).
 */
export async function backfillOffers(db: SupabaseClient): Promise<OffersBackfillResult> {
  const errors: string[] = [];
  const retailerIds = new Map<string, string>();

  for (const def of RETAILERS) {
    const id = await upsertRetailer(db, def);
    if (!id) {
      errors.push(`Retailer ${def.slug} kon niet worden geschreven (ontbreekt pd_partners-rij?).`);
      continue;
    }
    retailerIds.set(def.slug, id);
  }

  if (retailerIds.size === 0) {
    return { retailersUpserted: 0, offersUpserted: 0, errors };
  }

  // product_id per sup_products-slug ophalen, voor de koppeling affiliateSlug -> product.
  const { data: productRows, error: productsError } = await db
    .from("sup_products")
    .select("id, slug, raw_legacy_fields");

  if (productsError || !productRows) {
    errors.push("Kon sup_products niet lezen voor de offers-backfill.");
    return { retailersUpserted: retailerIds.size, offersUpserted: 0, errors };
  }

  const productIdByAffiliateSlug = new Map<string, string>();
  for (const row of productRows as Array<{
    id: string;
    slug: string;
    raw_legacy_fields: { affiliateSlug?: string } | null;
  }>) {
    const affiliateSlug = row.raw_legacy_fields?.affiliateSlug ?? row.slug;
    productIdByAffiliateSlug.set(affiliateSlug, row.id);
  }

  let offersUpserted = 0;
  for (const [affiliateSlugKey, url] of Object.entries(affiliateLinks)) {
    const affiliateSlug = affiliateSlugKey as AffiliateSlug;
    const productId = productIdByAffiliateSlug.get(affiliateSlug);
    if (!productId) {
      // Verwacht voor affiliate-slugs die (nog) geen sup_products-rij hebben,
      // bijv. varianten die niet in de huidige 25 backfilled producten zitten.
      continue;
    }

    const retailerSlug = retailerSlugForUrl(url);
    if (!retailerSlug) {
      errors.push(`Onbekend retailer-domein voor ${affiliateSlug}: ${url}`);
      continue;
    }

    const retailerId = retailerIds.get(retailerSlug);
    if (!retailerId) {
      errors.push(`Retailer ${retailerSlug} niet beschikbaar voor ${affiliateSlug}.`);
      continue;
    }

    const { error } = await db.from("sup_offers").upsert(
      {
        product_id: productId,
        retailer_id: retailerId,
        affiliate_url: url,
        currency: "EUR",
        source: "manual",
      },
      { onConflict: "product_id,retailer_id" },
    );

    if (error) {
      errors.push(`Offer voor ${affiliateSlug} kon niet worden geschreven: ${error.message}`);
      continue;
    }
    offersUpserted += 1;
  }

  return { retailersUpserted: retailerIds.size, offersUpserted, errors };
}
