export const affiliateLinks = {
  "arctic-blue-algenolie":
    "https://www.arctic-blue.com/winkel/algenolie/algenolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-visolie":
    "https://www.arctic-blue.com/winkel/visolie/visolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-gummies":
    "https://www.arctic-blue.com/sp/omega-3-soft-gummies?sld=dennisvanwestbroek",
} as const satisfies Record<string, string>;

export type AffiliateSlug = keyof typeof affiliateLinks;

export function getAffiliateRedirectPath(slug: AffiliateSlug): `/out/${AffiliateSlug}` {
  return `/out/${slug}`;
}

export function getAffiliateDestination(slug: string): string | null {
  const destination = affiliateLinks[slug as AffiliateSlug];

  if (!destination) {
    return null;
  }

  try {
    return new URL(destination).toString();
  } catch {
    return null;
  }
}
