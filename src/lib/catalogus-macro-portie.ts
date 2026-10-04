import type { CatalogEntry } from "@/data/nutrition/food-catalog";
import { nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";
import { indexedFood } from "@/lib/nutrition-food-index";
import type { SupermarktProduct } from "@/types/supermarkt-product";

export interface MacroPortieDoel {
  nevoCode: string;
  benadering: boolean;
}

/**
 * Welke catalogusregels het calorie/macro-portiescherm krijgen in plaats van
 * het kernstoffen-portiescherm.
 *
 * Een regel zonder eigen kernstofwaarde zou daar alleen "geen bekend gehalte"
 * tonen, terwijl NEVO hem wel kent. Heeft de regel wél een kernstofwaarde, dan
 * blijft het bestaande scherm: dat draagt de tekortbijdrage, en toont de NEVO-
 * macro's er met `ongeachtKernstof` naast.
 */
export function macroPortieVoor(
  entry: CatalogEntry,
  opties: { ongeachtKernstof?: boolean } = {},
): MacroPortieDoel | null {
  if (!opties.ongeachtKernstof && entry.bron && indexedFood(entry.bron)) return null;
  const koppeling = nevoKoppelingVoor(entry.key);
  if (!koppeling) return null;
  return { nevoCode: koppeling.code, benadering: koppeling.basis === "benadering" };
}

/** De catalogusnaam wint van de NEVO-naam; een benadering zegt dat hardop. */
export function metCatalogusNaam(
  product: SupermarktProduct,
  entry: CatalogEntry,
  doel: MacroPortieDoel,
): SupermarktProduct {
  return { ...product, naam: doel.benadering ? `${entry.labelNl} (benadering)` : entry.labelNl };
}
