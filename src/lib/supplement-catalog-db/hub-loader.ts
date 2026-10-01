import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";
import {
  buildHubProductsFromSource,
  type HubProduct,
} from "@/lib/supplement-hub/product-catalog";
import { loadCategoryProducts } from "@/lib/supplement-catalog-db/loader";
import { parseStoredScoreInputs, staticToStored } from "@/lib/product-admin/score-inputs";
import type { ComparisonPageData, SupplementCategory, SupplementProduct } from "@/types/supplement";
import type { ProductScoreInputs } from "@/types/supplement-score";

/**
 * DB-loader: de tegenhanger van getHubProducts() (supplement-hub/product-
 * catalog.ts), maar met sup_* als bron i.p.v. de statische ComparisonPageData-
 * bestanden. Beide roepen dezelfde buildHubProductsFromSource() aan — dat is
 * wat pariteit tussen statisch en DB bewijsbaar maakt (zie
 * __tests__/hub-loader-parity.test.ts).
 *
 * Niet aangesloten op /supplementen: dit is losstaand, pariteitsbewijs vóór
 * omschakelen (plak B, zie docs/plan/OVERDRACHT_PRODUCTPLATFORM_HUB_DB_2026-10-01.md §3).
 *
 * Score-invoer: database eerst, statische score-inputs.ts als terugval per
 * product (zelfde patroon als product-admin/score.ts).
 *
 * Prijs: prijsPerEtiketdagCent wordt uit sup_offers.price_cents gedeeld door
 * sup_products.servings_per_container berekend (plak A maakte dat veld
 * invulbaar). Ontbreekt één van beide in de DB voor een product, dan valt
 * alleen de prijs terug op de statische score-inputs.ts-waarde — de rest van
 * de score blijft DB-based. Dat weerspiegelt de huidige databasestand (zie
 * price-backfill.ts/packaging-backfill.ts, beide best-effort met unparsed-rest).
 */

const COMPARISONS: ComparisonPageData[] = [
  magnesiumData,
  omega3Data,
  vitamineDData,
  zinkData,
  creatineData,
  ashwagandhaData,
  eiwitpoederData,
];

interface SupProductPriceRow {
  slug: string;
  servings_per_container: number | null;
  sup_offers: { price_cents: number | null; price_checked_at: string | null }[] | null;
}

async function loadPriceInputsForCategory(
  db: SupabaseClient,
  categorySlug: string,
): Promise<Map<string, { prijsPerEtiketdagCent: number; prijsGecontroleerdOp: string }>> {
  const out = new Map<string, { prijsPerEtiketdagCent: number; prijsGecontroleerdOp: string }>();
  const { data, error } = await db
    .from("sup_products")
    .select("slug, servings_per_container, sup_offers(price_cents, price_checked_at), sup_categories!inner(slug)")
    .eq("sup_categories.slug", categorySlug);
  if (error) return out;

  for (const row of (data ?? []) as unknown as SupProductPriceRow[]) {
    const servings = row.servings_per_container;
    const offer = (row.sup_offers ?? []).find((o) => o.price_cents != null);
    if (!servings || servings <= 0 || !offer || offer.price_cents == null) continue;
    out.set(row.slug, {
      prijsPerEtiketdagCent: Math.round(offer.price_cents / servings),
      prijsGecontroleerdOp: offer.price_checked_at ?? new Date().toISOString().slice(0, 10),
    });
  }
  return out;
}

async function loadStoredScoreInputsForCategory(
  db: SupabaseClient,
  categorySlug: string,
): Promise<Map<string, ReturnType<typeof parseStoredScoreInputs>>> {
  const out = new Map<string, ReturnType<typeof parseStoredScoreInputs>>();
  const { data, error } = await db
    .from("sup_products")
    .select("slug, score_inputs, sup_categories!inner(slug)")
    .eq("sup_categories.slug", categorySlug);
  if (error) return out;
  for (const row of (data ?? []) as { slug: string; score_inputs: unknown }[]) {
    out.set(row.slug, parseStoredScoreInputs(row.score_inputs));
  }
  return out;
}

/**
 * Bouwt de volledige ProductScoreInputs per slug voor één categorie: DB-
 * score-invoer (of de statische terugval) gecombineerd met DB-prijsinvoer
 * (of de statische terugval). De twee vallen onafhankelijk van elkaar terug,
 * zodat een product met wél een DB-score maar nog geen DB-prijs niet alsnog
 * volledig op de statische bron leunt.
 */
export async function loadInputsForCategory(
  db: SupabaseClient,
  category: SupplementCategory,
): Promise<Map<string, ProductScoreInputs>> {
  const staticInputs = PRODUCT_SCORE_INPUTS[category] ?? {};
  const [storedScoreInputs, priceInputs] = await Promise.all([
    loadStoredScoreInputsForCategory(db, category),
    loadPriceInputsForCategory(db, category),
  ]);

  const out = new Map<string, ProductScoreInputs>();
  for (const [slug, staticProductInputs] of Object.entries(staticInputs)) {
    const scorePart = storedScoreInputs.get(slug) ?? staticToStored(staticProductInputs);
    const pricePart = priceInputs.get(slug) ?? {
      prijsPerEtiketdagCent: staticProductInputs.prijsPerEtiketdagCent,
      prijsGecontroleerdOp: staticProductInputs.prijsGecontroleerdOp,
    };
    out.set(slug, { ...scorePart, ...pricePart });
  }
  return out;
}

/**
 * HubProduct[] voor één categorie, DB-first met statische terugval per
 * onderdeel (producten zelf, score-invoer, prijs). Degradeert nooit tot een
 * crash: ontbreekt de DB-configuratie of levert een query niets op, dan geldt
 * de statische ComparisonPageData voor die categorie in zijn geheel.
 */
export async function loadHubProductsForCategory(
  db: SupabaseClient,
  comparison: ComparisonPageData,
): Promise<HubProduct[]> {
  let dbProducts: SupplementProduct[];
  try {
    dbProducts = await loadCategoryProducts(db, comparison.category);
  } catch (error) {
    console.error(`[hub-loader] kon ${comparison.category} niet laden uit DB:`, error);
    dbProducts = [];
  }

  const products = dbProducts.length > 0 ? dbProducts : comparison.products;
  const inputsBySlug = await loadInputsForCategory(db, comparison.category);
  return buildHubProductsFromSource(comparison.category, products, inputsBySlug);
}

export async function loadHubProducts(db: SupabaseClient): Promise<HubProduct[]> {
  const perCategory = await Promise.all(
    COMPARISONS.map((comparison) => loadHubProductsForCategory(db, comparison)),
  );
  return perCategory.flat().sort((a, b) => b.score.total - a.score.total);
}
