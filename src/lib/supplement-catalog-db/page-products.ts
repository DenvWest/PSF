import { unscoped } from "@/lib/db/scoped";
import { loadCategoryProducts } from "@/lib/supplement-catalog-db/loader";
import type { SupplementProduct } from "@/types/supplement";

/**
 * Producten voor /beste/[supplement] — DB eerst, statische data als terugval.
 *
 * Bewust een aparte, kleine functie i.p.v. getSupplementComparisonData() zelf
 * async maken: die laatste heeft 7 call-sites (sitemap, homepage-proof,
 * snippet-corpus, content-graph, ...) die niets met de productcatalogus te
 * maken hebben en niet in één keer mee hoeven te veranderen. Dit isoleert het
 * risico tot de productpagina zelf.
 *
 * Degradeert in plaats van breekt (zie §L1 van
 * ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md): geen DB-configuratie, een lege
 * categorie, of een queryfout → de statische fallback, nooit een crash op een
 * pagina die verkeer draagt.
 */

/**
 * Categorieën die al handmatig geverifieerd zijn tegen de live database
 * (backfill + rendering vergeleken met de statische versie). Uitbreiden is
 * een bewuste, kleine wijziging per categorie — niet alle 7 in één keer.
 */
const DB_BACKED_CATEGORIES = new Set<string>(["zink", "magnesium"]);

export async function loadProductsForPage(
  categorySlug: string,
  fallback: SupplementProduct[],
): Promise<SupplementProduct[]> {
  if (!DB_BACKED_CATEGORIES.has(categorySlug)) {
    return fallback;
  }

  const db = unscoped();
  if (!db) {
    return fallback;
  }

  try {
    const products = await loadCategoryProducts(db, categorySlug);
    return products.length > 0 ? products : fallback;
  } catch (error) {
    console.error(`[supplement-catalog-db] kon ${categorySlug} niet laden uit DB:`, error);
    return fallback;
  }
}
