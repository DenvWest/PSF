import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/partnerdesk/db";
import type { ComparisonPageData, SupplementProduct } from "@/types/supplement";

/**
 * Backfill van de bestaande ComparisonPageData-bestanden (src/data/supplements/*.ts)
 * naar de sup_*-productcatalogus. Zie plak 1 in
 * docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §J.
 *
 * Idempotent: draait op slug-upserts, dus opnieuw draaien na een wijziging in de
 * bron-bestanden overschrijft de rij in plaats van te dupliceren.
 *
 * Schrijft UITSLUITEND productfeiten (sup_products/actives/certifications/claims/
 * images + het merk/de categorie eromheen). Paginacontent (intro, faq, seoTitle,
 * moreAboutLinks, choiceRoutes-teksten) blijft in de ComparisonPageData-bestanden —
 * zie de plak 1-scope-verduidelijking in het analysedoc.
 */

export interface BackfillResult {
  brandsUpserted: number;
  categoriesUpserted: number;
  productsUpserted: number;
  errors: string[];
}

function brandSlug(brand: string): string {
  return slugify(brand);
}

/**
 * werkzameStof komt uit IngredientClaimKey (bijv. "vitamineD", "omega3") en is
 * niet altijd gelijk aan de category-slug (bijv. category "vitamine-d" hoort bij
 * werkzameStof "vitamineD"). ingredient_claim_key bewaart de IngredientClaimKey
 * zodat de brug naar approved-claims.ts/supplement_verdicts intact blijft.
 */
function categorySlugFor(data: ComparisonPageData): string {
  return data.category;
}

async function upsertBrand(
  db: SupabaseClient,
  name: string,
): Promise<{ id: string } | null> {
  const slug = brandSlug(name);
  const { data, error } = await db
    .from("sup_brands")
    .upsert({ slug, name }, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) {
    return null;
  }
  return data;
}

async function upsertCategory(
  db: SupabaseClient,
  pageData: ComparisonPageData,
): Promise<{ id: string } | null> {
  const slug = categorySlugFor(pageData);
  const { data, error } = await db
    .from("sup_categories")
    .upsert(
      {
        slug,
        name: pageData.h1,
        ingredient_claim_key: pageData.products[0]?.werkzameStof ?? null,
        comparison_path: `/beste/${pageData.slug}`,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (error) {
    return null;
  }
  return data;
}

/**
 * specs[]/pros[]/cons[]/breakdown[] — bewaard 1-op-1, zie migratie-comment op
 * raw_legacy_fields. affiliateSlug hoort hier ook bij: dat veld is de sleutel
 * naar affiliate-links.ts en is niet per se gelijk aan sup_products.slug (een
 * productdossier-slug en een affiliate-koppeling zijn conceptueel verschillend,
 * ook al vallen ze bij de huidige 21 producten toevallig vaak samen). De
 * affiliate-laag zelf verhuist niet naar sup_* in deze plak.
 */
function legacyFieldsFor(product: SupplementProduct): Record<string, unknown> {
  return {
    specs: product.specs,
    pros: product.pros,
    cons: product.cons,
    breakdown: product.breakdown,
    bestFor: product.bestFor,
    variantTag: product.variantTag,
    summary: product.summary,
    score: product.score,
    affiliateSlug: product.affiliateSlug,
  };
}

async function upsertProduct(
  db: SupabaseClient,
  product: SupplementProduct,
  brandId: string,
  categoryId: string,
): Promise<string | null> {
  const { data, error } = await db
    .from("sup_products")
    .upsert(
      {
        slug: product.slug,
        brand_id: brandId,
        category_id: categoryId,
        name: product.name,
        variant: product.variantTag,
        form: product.vorm,
        status: "published",
        raw_legacy_fields: legacyFieldsFor(product),
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

async function replaceProductActives(
  db: SupabaseClient,
  productId: string,
  product: SupplementProduct,
): Promise<void> {
  await db.from("sup_product_actives").delete().eq("product_id", productId);

  const dose = product.doseringPerDagdosis;
  const rows: Array<{
    product_id: string;
    nutrient_key: string;
    form_key: string | null;
    amount_per_serving: number;
    unit: string;
    is_elemental: boolean;
  }> = [];

  if (dose.epaMg != null) {
    rows.push({
      product_id: productId,
      nutrient_key: "epa",
      form_key: product.vorm,
      amount_per_serving: dose.epaMg,
      unit: "mg",
      is_elemental: false,
    });
  }
  if (dose.dhaMg != null) {
    rows.push({
      product_id: productId,
      nutrient_key: "dha",
      form_key: product.vorm,
      amount_per_serving: dose.dhaMg,
      unit: "mg",
      is_elemental: false,
    });
  }
  if (dose.epaMg == null && dose.dhaMg == null) {
    rows.push({
      product_id: productId,
      nutrient_key: product.werkzameStof,
      form_key: product.vorm,
      amount_per_serving: dose.hoeveelheid,
      unit: dose.eenheid,
      is_elemental: dose.elementair,
    });
  }

  if (rows.length > 0) {
    await db.from("sup_product_actives").insert(rows);
  }
}

async function replaceProductCertifications(
  db: SupabaseClient,
  productId: string,
  product: SupplementProduct,
): Promise<void> {
  await db.from("sup_product_certifications").delete().eq("product_id", productId);

  if (!product.thirdPartyTested) return;

  await db
    .from("sup_product_certifications")
    .insert({ product_id: productId, certification_key: "third_party_tested" });
}

async function replaceProductClaims(
  db: SupabaseClient,
  productId: string,
  product: SupplementProduct,
): Promise<void> {
  await db.from("sup_product_claims").delete().eq("product_id", productId);

  if (product.efsaClaimIds.length === 0) return;

  const rows = product.efsaClaimIds.map((claimId) => ({
    product_id: productId,
    efsa_claim_id: claimId,
    meets_condition: product.voldoetAanClaimConditie,
  }));

  await db.from("sup_product_claims").insert(rows);
}

async function replaceProductImage(
  db: SupabaseClient,
  productId: string,
  product: SupplementProduct,
): Promise<void> {
  await db.from("sup_product_images").delete().eq("product_id", productId);

  if (!product.imageSrc) return;

  await db.from("sup_product_images").insert({
    product_id: productId,
    path: product.imageSrc,
    alt: product.imageAlt ?? product.name,
    position: 0,
    source: "own",
  });
}

/**
 * Backfill één categoriepagina. Puur voor hergebruik door het volledige-backfill-
 * script en door tests — geen eigen transactiegrens (Supabase JS heeft die niet),
 * dus bij een gedeeltelijke fout blijft wat al geschreven is staan (idempotent op
 * de volgende run).
 */
export async function backfillComparisonPage(
  db: SupabaseClient,
  pageData: ComparisonPageData,
): Promise<BackfillResult> {
  const errors: string[] = [];
  let brandsUpserted = 0;
  let productsUpserted = 0;

  const category = await upsertCategory(db, pageData);
  if (!category) {
    errors.push(`Categorie ${pageData.category} kon niet worden geschreven.`);
    return { brandsUpserted: 0, categoriesUpserted: 0, productsUpserted: 0, errors };
  }

  const brandIds = new Map<string, string>();

  for (const product of pageData.products) {
    let brandId = brandIds.get(product.brand);
    if (!brandId) {
      const brand = await upsertBrand(db, product.brand);
      if (!brand) {
        errors.push(`Merk ${product.brand} (product ${product.slug}) kon niet worden geschreven.`);
        continue;
      }
      brandId = brand.id;
      brandIds.set(product.brand, brandId);
      brandsUpserted += 1;
    }

    const productId = await upsertProduct(db, product, brandId, category.id);
    if (!productId) {
      errors.push(`Product ${product.slug} kon niet worden geschreven.`);
      continue;
    }

    await replaceProductActives(db, productId, product);
    await replaceProductCertifications(db, productId, product);
    await replaceProductClaims(db, productId, product);
    await replaceProductImage(db, productId, product);
    productsUpserted += 1;
  }

  return { brandsUpserted, categoriesUpserted: 1, productsUpserted, errors };
}

export async function backfillAllComparisonPages(
  db: SupabaseClient,
  pages: ComparisonPageData[],
): Promise<BackfillResult> {
  const total: BackfillResult = {
    brandsUpserted: 0,
    categoriesUpserted: 0,
    productsUpserted: 0,
    errors: [],
  };

  for (const page of pages) {
    const result = await backfillComparisonPage(db, page);
    total.brandsUpserted += result.brandsUpserted;
    total.categoriesUpserted += result.categoriesUpserted;
    total.productsUpserted += result.productsUpserted;
    total.errors.push(...result.errors);
  }

  return total;
}
