const NUTRITION_RETURN_PARAM = "from";
const NUTRITION_RETURN_VALUE = "voeding";

export function withNutritionReturn(href: string): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  ) {
    return href;
  }
  const url = new URL(href, "https://www.perfectsupplement.nl");
  url.searchParams.set(NUTRITION_RETURN_PARAM, NUTRITION_RETURN_VALUE);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function hasNutritionReturnParam(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const value = searchParams[NUTRITION_RETURN_PARAM];
  if (Array.isArray(value)) {
    return value.includes(NUTRITION_RETURN_VALUE);
  }
  return value === NUTRITION_RETURN_VALUE;
}

export const NUTRITION_RESULTS_HREF = "/intake/voeding?resultaten=true";
