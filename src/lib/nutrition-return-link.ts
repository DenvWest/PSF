const NUTRITION_RETURN_MARKER = "terug";
const NUTRITION_RETURN_MARKER_VALUE = "voeding";
const NUTRITION_ORIGIN_PARAM = "from";
const NUTRITION_RESULTS_PATH = "/intake/voeding";

function isExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
}

/**
 * Voeg de terug-marker toe aan een interne link naar de onderbouwing.
 * `origin` (bv. "dashboard") wordt als `from` meegegeven zodat de herkomst de
 * round-trip overleeft — maar overschrijft nooit een reeds aanwezige `from`.
 * De marker (`terug`) staat los van `from`, zodat herkomst en terugkeer niet botsen.
 */
export function withNutritionReturn(href: string, origin?: string): string {
  if (isExternalHref(href)) {
    return href;
  }
  const url = new URL(href, "https://www.perfectsupplement.nl");
  url.searchParams.set(NUTRITION_RETURN_MARKER, NUTRITION_RETURN_MARKER_VALUE);
  if (origin && !url.searchParams.has(NUTRITION_ORIGIN_PARAM)) {
    url.searchParams.set(NUTRITION_ORIGIN_PARAM, origin);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function hasNutritionReturnParam(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const value = searchParams[NUTRITION_RETURN_MARKER];
  if (Array.isArray(value)) {
    return value.includes(NUTRITION_RETURN_MARKER_VALUE);
  }
  return value === NUTRITION_RETURN_MARKER_VALUE;
}

/**
 * Href naar het opgeslagen voedingsresultaat. `origin` (bv. "dashboard") blijft
 * behouden zodat de resultaatweergave de juiste terug-knop toont.
 */
export function nutritionResultsHref(origin?: string): string {
  const params = new URLSearchParams({ resultaten: "true" });
  if (origin) {
    params.set(NUTRITION_ORIGIN_PARAM, origin);
  }
  return `${NUTRITION_RESULTS_PATH}?${params.toString()}`;
}
