const VOORTGANG_RETURN_PARAM = "from";
const VOORTGANG_RETURN_VALUE = "voortgang";

export function withVoortgangReturn(href: string): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  ) {
    return href;
  }
  const url = new URL(href, "https://www.perfectsupplement.nl");
  url.searchParams.set(VOORTGANG_RETURN_PARAM, VOORTGANG_RETURN_VALUE);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function hasVoortgangReturnParam(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const value = searchParams[VOORTGANG_RETURN_PARAM];
  if (Array.isArray(value)) {
    return value.includes(VOORTGANG_RETURN_VALUE);
  }
  return value === VOORTGANG_RETURN_VALUE;
}

export const VOORTGANG_FAVORIETEN_HREF =
  "/dashboard?tab=voortgang&screen=favorieten";
