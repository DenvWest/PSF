import type { SupabaseClient } from "@supabase/supabase-js";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { todayIso } from "@/lib/partnerdesk/dates";
import {
  evaluatePublishGate,
  productFreshness,
  type GateCriterion,
  type ProductFreshness,
} from "@/lib/product-admin/publish-gate";
import { scoreGateState, scoresForCategory, type AdminScore } from "@/lib/product-admin/score";

export type ProductStatus = "draft" | "published" | "archived";

type One<T> = T | T[] | null;

function first<T>(value: One<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  status: ProductStatus;
  brandName: string;
  categorySlug: string;
  categoryName: string;
  imagePath: string | null;
  offerCount: number;
  freshness: ProductFreshness;
  score: AdminScore | null;
}

export interface FreshnessSummary {
  staleDataProducts: number;
  stalePriceOffers: number;
}

interface ListRow {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  status: ProductStatus;
  data_checked_at: string | null;
  sup_brands: One<{ name: string }>;
  sup_categories: One<{ slug: string; name: string }>;
  sup_product_images: { path: string; position: number }[] | null;
  sup_offers: { active: boolean; price_checked_at: string | null }[] | null;
}

export async function listAdminProducts(): Promise<{
  rows: AdminProductRow[];
  summary: FreshnessSummary;
}> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("sup_products")
    .select(
      "id, slug, name, variant, status, data_checked_at, sup_brands(name), sup_categories(slug, name), sup_product_images(path, position), sup_offers(active, price_checked_at)",
    )
    .neq("status", "archived")
    .order("display_order", { ascending: true });
  if (error) throw new Error(`sup_products: ${error.message}`);

  const listRows = (data ?? []) as unknown as ListRow[];
  const categorySlugs = [
    ...new Set(listRows.map((r) => first(r.sup_categories)?.slug).filter((s): s is string => Boolean(s))),
  ];
  const scoreMaps = new Map(
    await Promise.all(
      categorySlugs.map(async (slug) => [slug, await scoresForCategory(db, slug)] as const),
    ),
  );

  const today = todayIso();
  const summary: FreshnessSummary = { staleDataProducts: 0, stalePriceOffers: 0 };
  const rows = listRows
    .map((r): AdminProductRow => {
      const category = first(r.sup_categories);
      const offers = r.sup_offers ?? [];
      const freshness = productFreshness({ dataCheckedAt: r.data_checked_at, activeOffers: offers, today });
      if (freshness.staleData) summary.staleDataProducts += 1;
      summary.stalePriceOffers += freshness.stalePrices;
      const image = [...(r.sup_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        variant: r.variant,
        status: r.status,
        brandName: first(r.sup_brands)?.name ?? "—",
        categorySlug: category?.slug ?? "",
        categoryName: category?.name ?? "—",
        imagePath: image?.path ?? null,
        offerCount: offers.filter((o) => o.active).length,
        freshness,
        score: scoreMaps.get(category?.slug ?? "")?.get(r.slug) ?? null,
      };
    })
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName, "nl"));
  return { rows, summary };
}

export interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  form: string | null;
  flavour: string | null;
  container_size: number | null;
  container_unit: string | null;
  servings_per_container: number | null;
  serving_size: number | null;
  serving_unit: string | null;
  usage_advice: string | null;
  description: string | null;
  target_audience: string | null;
  country_of_origin: string | null;
  product_url: string | null;
  status: ProductStatus;
  data_checked_at: string | null;
  published_at: string | null;
  display_order: number;
  sup_brands: One<{ name: string; slug: string }>;
  sup_categories: One<{ slug: string; name: string }>;
}

export interface ProductActiveRow {
  id: string;
  nutrient_key: string;
  form_key: string | null;
  amount_per_serving: number | null;
  unit: string | null;
  is_elemental: boolean;
}

export interface ProductIngredientRow {
  id: string;
  position: number;
  name: string;
  is_active: boolean;
  is_additive: boolean;
  is_allergen: boolean;
}

export interface ProductImageRow {
  id: string;
  path: string;
  alt: string | null;
  position: number;
  source: string | null;
  license_note: string | null;
  checked_at: string | null;
}

export interface ProductOfferRow {
  id: string;
  price_cents: number | null;
  currency: string;
  active: boolean;
  price_checked_at: string | null;
  source: string;
  affiliate_url: string | null;
  sup_retailers: One<{ name: string; relationship: string }>;
}

export interface ProductSourceRow {
  id: string;
  kind: string;
  url: string | null;
  title: string | null;
  checked_at: string | null;
}

export interface ProductDossier {
  product: ProductRecord;
  actives: ProductActiveRow[];
  ingredients: ProductIngredientRow[];
  certifications: string[];
  claims: { efsa_claim_id: string; meets_condition: boolean }[];
  images: ProductImageRow[];
  offers: ProductOfferRow[];
  sources: ProductSourceRow[];
  score: AdminScore | null;
  gate: GateCriterion[];
}

async function loadProductParts(db: SupabaseClient, product: ProductRecord): Promise<ProductDossier> {
  const [actives, ingredients, certs, claims, images, offers, sources] = await Promise.all([
    db.from("sup_product_actives").select("id, nutrient_key, form_key, amount_per_serving, unit, is_elemental").eq("product_id", product.id),
    db.from("sup_product_ingredients").select("id, position, name, is_active, is_additive, is_allergen").eq("product_id", product.id).order("position", { ascending: true }),
    db.from("sup_product_certifications").select("certification_key").eq("product_id", product.id),
    db.from("sup_product_claims").select("efsa_claim_id, meets_condition").eq("product_id", product.id),
    db.from("sup_product_images").select("id, path, alt, position, source, license_note, checked_at").eq("product_id", product.id).order("position", { ascending: true }),
    db.from("sup_offers").select("id, price_cents, currency, active, price_checked_at, source, affiliate_url, sup_retailers(name, relationship)").eq("product_id", product.id),
    db.from("sup_sources").select("id, kind, url, title, checked_at").eq("product_id", product.id),
  ]);

  const categorySlug = first(product.sup_categories)?.slug ?? "";
  const score = categorySlug ? ((await scoresForCategory(db, categorySlug)).get(product.slug) ?? null) : null;

  const dossier: ProductDossier = {
    product,
    actives: (actives.data ?? []) as ProductActiveRow[],
    ingredients: (ingredients.data ?? []) as ProductIngredientRow[],
    certifications: ((certs.data ?? []) as { certification_key: string }[]).map((c) => c.certification_key),
    claims: (claims.data ?? []) as ProductDossier["claims"],
    images: (images.data ?? []) as ProductImageRow[],
    offers: (offers.data ?? []) as unknown as ProductOfferRow[],
    sources: (sources.data ?? []) as ProductSourceRow[],
    score,
    gate: [],
  };
  dossier.gate = evaluatePublishGate({
    images: dossier.images,
    actives: dossier.actives,
    claims: dossier.claims,
    offers: dossier.offers,
    sourceCount: dossier.sources.length,
    score: scoreGateState(score ?? undefined),
    today: todayIso(),
  });
  return dossier;
}

const PRODUCT_COLUMNS =
  "id, slug, name, variant, form, flavour, container_size, container_unit, servings_per_container, serving_size, serving_unit, usage_advice, description, target_audience, country_of_origin, product_url, status, data_checked_at, published_at, display_order, sup_brands(name, slug), sup_categories(slug, name)";

export async function getProductDossierBySlug(slug: string): Promise<ProductDossier | null> {
  const db = getPartnerDeskDb();
  const { data, error } = await db.from("sup_products").select(PRODUCT_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`sup_products: ${error.message}`);
  if (!data) return null;
  return loadProductParts(db, data as unknown as ProductRecord);
}

export async function getProductDossierById(db: SupabaseClient, id: string): Promise<ProductDossier | null> {
  const { data } = await db.from("sup_products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  if (!data) return null;
  return loadProductParts(db, data as unknown as ProductRecord);
}

export interface BrandRow {
  id: string;
  slug: string;
  name: string;
  manufacturer: string | null;
  country: string | null;
  website: string | null;
  transparency_note: string | null;
  productCount: number;
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ingredient_claim_key: string | null;
  comparison_path: string | null;
  productCount: number;
}

type WithCount<T> = T & { sup_products: { count: number }[] | null };

function countOf(row: { sup_products: { count: number }[] | null }): number {
  return row.sup_products?.[0]?.count ?? 0;
}

export async function listBrands(): Promise<BrandRow[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("sup_brands")
    .select("id, slug, name, manufacturer, country, website, transparency_note, sup_products(count)")
    .order("name", { ascending: true });
  if (error) throw new Error(`sup_brands: ${error.message}`);
  return ((data ?? []) as unknown as WithCount<Omit<BrandRow, "productCount">>[]).map(
    ({ sup_products, ...row }) => ({ ...row, productCount: countOf({ sup_products }) }),
  );
}

export async function listCategories(): Promise<CategoryRow[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("sup_categories")
    .select("id, slug, name, description, ingredient_claim_key, comparison_path, sup_products(count)")
    .order("name", { ascending: true });
  if (error) throw new Error(`sup_categories: ${error.message}`);
  return ((data ?? []) as unknown as WithCount<Omit<CategoryRow, "productCount">>[]).map(
    ({ sup_products, ...row }) => ({ ...row, productCount: countOf({ sup_products }) }),
  );
}
