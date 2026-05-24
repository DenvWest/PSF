const INTAKE_RETURN_PARAM = "from";
const INTAKE_RETURN_VALUE = "intake";

export function withIntakeReturn(href: string): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  ) {
    return href;
  }
  const url = new URL(href, "https://www.perfectsupplement.nl");
  url.searchParams.set(INTAKE_RETURN_PARAM, INTAKE_RETURN_VALUE);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function hasIntakeReturnParam(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const value = searchParams[INTAKE_RETURN_PARAM];
  if (Array.isArray(value)) {
    return value.includes(INTAKE_RETURN_VALUE);
  }
  return value === INTAKE_RETURN_VALUE;
}

export const INTAKE_RESULTS_HREF = "/intake?resultaten=true";
