import { unscoped } from "@/lib/db/scoped";
import { loadHubProducts } from "@/lib/supplement-catalog-db/hub-loader";
import { getHubProducts, type HubProduct } from "@/lib/supplement-hub/product-catalog";

/**
 * Producten voor /supplementen — DB eerst, statische hub als terugval.
 *
 * Zelfde degradatiepatroon als supplement-catalog-db/page-products.ts voor
 * /beste/[supplement]: geen DB-configuratie of een query-fout → de statische
 * getHubProducts(), nooit een crash op de pagina die het meeste verkeer
 * draagt. loadHubProducts() zelf degradeert ook al per categorie (zie
 * hub-loader.ts) — deze laag vangt alleen het geval af dat de hele aanroep
 * faalt (bijv. db === null).
 */
export async function loadHubProductsForPage(): Promise<HubProduct[]> {
  const db = unscoped();
  if (!db) {
    return getHubProducts();
  }

  try {
    const products = await loadHubProducts(db);
    return products.length > 0 ? products : getHubProducts();
  } catch (error) {
    console.error("[supplement-catalog-db] kon de hub niet laden uit DB:", error);
    return getHubProducts();
  }
}
