export const SUPPLEMENT_HUB_PATH = "/supplementen";

/** Querysleutel waarmee een andere pagina de catalogus op één categorie zet. */
export const HUB_CATEGORY_PARAM = "categorie";

/**
 * Link naar de supplementengids, eventueel al gezet op één categorie.
 *
 * Zo landt een aanbeveling uit de check op de catalogus zelf — met alle
 * producten van die stof naast elkaar op PS-Score, EU-claim en prijs per dag —
 * in plaats van op één vergelijkingspagina. De categorie is navigatie, geen
 * tweede aanbeveling: de onderbouwing staat op de pagina die de link zet.
 */
export function buildSupplementHubHref(category?: string | null): string {
  if (!category) {
    return SUPPLEMENT_HUB_PATH;
  }
  const params = new URLSearchParams({ [HUB_CATEGORY_PARAM]: category });
  return `${SUPPLEMENT_HUB_PATH}?${params.toString()}`;
}
