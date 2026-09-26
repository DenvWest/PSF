import type { SupabaseClient } from "@supabase/supabase-js";
import { withClaimFields } from "@/lib/product-claim-fields";
import type {
  DosageUnit,
  DoseringPerDagdosis,
  EfsaClaimId,
  IngredientClaimKey,
  SupplementProduct,
} from "@/types/supplement";

/**
 * DB-loader: leest sup_products + gerelateerde tabellen terug naar
 * SupplementProduct[], de tegenhanger van backfill.ts. Doel: identieke output
 * aan wat de statische ComparisonPageData-bestanden vandaag leveren (zie plak 1
 * in ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §J).
 *
 * NIET aangesloten op /beste/*: dat is een aparte, latere stap zodra de
 * backfill daadwerkelijk gedraaid is tegen een live database. Deze module is
 * losstaand bruikbaar en getest tegen wat backfill.ts zou schrijven.
 */

interface SupProductRow {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  form: string | null;
  raw_legacy_fields: {
    specs?: Array<{ label: string; value: string }>;
    pros?: string[];
    cons?: string[];
    breakdown?: Array<{ criterium: string; score: number }>;
    bestFor?: string;
    variantTag?: string;
    summary?: string;
    score?: number;
    affiliateSlug?: string;
  } | null;
  sup_brands: { name: string } | { name: string }[] | null;
}

function brandNameOf(row: SupProductRow): string {
  const brand = row.sup_brands;
  if (!brand) return "";
  return Array.isArray(brand) ? (brand[0]?.name ?? "") : brand.name;
}

interface SupProductActiveRow {
  product_id: string;
  nutrient_key: string;
  amount_per_serving: number;
  unit: string;
  is_elemental: boolean;
}

interface SupProductCertificationRow {
  product_id: string;
  certification_key: string;
}

interface SupProductClaimRow {
  product_id: string;
  efsa_claim_id: string;
  meets_condition: boolean;
}

interface SupProductImageRow {
  product_id: string;
  path: string;
  alt: string | null;
  position: number;
}

function buildDosering(
  actives: SupProductActiveRow[],
): DoseringPerDagdosis {
  const epa = actives.find((a) => a.nutrient_key === "epa");
  const dha = actives.find((a) => a.nutrient_key === "dha");

  if (epa || dha) {
    return {
      hoeveelheid: (epa?.amount_per_serving ?? 0) + (dha?.amount_per_serving ?? 0),
      eenheid: "mg",
      elementair: false,
      epaMg: epa?.amount_per_serving,
      dhaMg: dha?.amount_per_serving,
    };
  }

  const single = actives[0];
  if (!single) {
    return { hoeveelheid: 0, eenheid: "mg", elementair: false };
  }
  return {
    hoeveelheid: single.amount_per_serving,
    eenheid: single.unit as DosageUnit,
    elementair: single.is_elemental,
  };
}

function werkzameStofFor(actives: SupProductActiveRow[]): IngredientClaimKey {
  const nonEpaDha = actives.find(
    (a) => a.nutrient_key !== "epa" && a.nutrient_key !== "dha",
  );
  if (nonEpaDha) return nonEpaDha.nutrient_key as IngredientClaimKey;
  if (actives.some((a) => a.nutrient_key === "epa" || a.nutrient_key === "dha")) {
    return "omega3";
  }
  throw new Error("Product zonder sup_product_actives kan geen werkzameStof afleiden.");
}

/**
 * Bouwt SupplementProduct[] voor één categorie uit de sup_*-tabellen.
 * Vier queries (products+brand join, actives, certifications, claims, images)
 * i.p.v. N+1 — de admin-productenlijst en deze loader kunnen dezelfde vorm
 * hergebruiken zodra plak 2 er is.
 */
export async function loadCategoryProducts(
  db: SupabaseClient,
  categorySlug: string,
): Promise<SupplementProduct[]> {
  const { data: category, error: categoryError } = await db
    .from("sup_categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (categoryError || !category) {
    return [];
  }

  const { data: productRows, error: productsError } = await db
    .from("sup_products")
    .select("id, slug, name, variant, form, raw_legacy_fields, sup_brands(name)")
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (productsError || !productRows || productRows.length === 0) {
    return [];
  }

  const productIds = productRows.map((row: SupProductRow) => row.id);

  const [activesRes, certsRes, claimsRes, imagesRes] = await Promise.all([
    db
      .from("sup_product_actives")
      .select("product_id, nutrient_key, amount_per_serving, unit, is_elemental")
      .in("product_id", productIds),
    db
      .from("sup_product_certifications")
      .select("product_id, certification_key")
      .in("product_id", productIds),
    db
      .from("sup_product_claims")
      .select("product_id, efsa_claim_id, meets_condition")
      .in("product_id", productIds),
    db
      .from("sup_product_images")
      .select("product_id, path, alt, position")
      .in("product_id", productIds)
      .order("position", { ascending: true }),
  ]);

  const activesByProduct = new Map<string, SupProductActiveRow[]>();
  for (const row of (activesRes.data ?? []) as SupProductActiveRow[]) {
    const list = activesByProduct.get(row.product_id) ?? [];
    list.push(row);
    activesByProduct.set(row.product_id, list);
  }

  const certsByProduct = new Map<string, SupProductCertificationRow[]>();
  for (const row of (certsRes.data ?? []) as SupProductCertificationRow[]) {
    const list = certsByProduct.get(row.product_id) ?? [];
    list.push(row);
    certsByProduct.set(row.product_id, list);
  }

  const claimsByProduct = new Map<string, SupProductClaimRow[]>();
  for (const row of (claimsRes.data ?? []) as SupProductClaimRow[]) {
    const list = claimsByProduct.get(row.product_id) ?? [];
    list.push(row);
    claimsByProduct.set(row.product_id, list);
  }

  const imageByProduct = new Map<string, SupProductImageRow>();
  for (const row of (imagesRes.data ?? []) as SupProductImageRow[]) {
    if (!imageByProduct.has(row.product_id)) {
      imageByProduct.set(row.product_id, row);
    }
  }

  return (productRows as SupProductRow[]).map((row) => {
    const actives = activesByProduct.get(row.id) ?? [];
    const certs = certsByProduct.get(row.id) ?? [];
    const claims = claimsByProduct.get(row.id) ?? [];
    const image = imageByProduct.get(row.id);
    const legacy = row.raw_legacy_fields ?? {};

    return withClaimFields({
      slug: row.slug,
      name: row.name,
      brand: brandNameOf(row),
      affiliateSlug: (legacy.affiliateSlug ?? row.slug) as SupplementProduct["affiliateSlug"],
      score: legacy.score ?? 0,
      bestFor: legacy.bestFor ?? "",
      variantTag: legacy.variantTag ?? row.variant ?? "",
      summary: legacy.summary ?? "",
      specs: legacy.specs ?? [],
      pros: legacy.pros ?? [],
      cons: legacy.cons ?? [],
      breakdown: legacy.breakdown ?? [],
      imageSrc: image?.path,
      imageAlt: image?.alt ?? undefined,
      werkzameStof: werkzameStofFor(actives),
      vorm: row.form ?? "",
      doseringPerDagdosis: buildDosering(actives),
      efsaClaimIds: claims.map((c) => c.efsa_claim_id as EfsaClaimId),
      thirdPartyTested: certs.some((c) => c.certification_key === "third_party_tested"),
    });
  });
}
