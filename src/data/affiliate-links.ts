export const affiliateLinks = {
  "arctic-blue-algenolie":
    "https://www.arctic-blue.com/winkel/algenolie/algenolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-visolie":
    "https://www.arctic-blue.com/winkel/visolie/visolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-gummies":
    "https://www.arctic-blue.com/sp/omega-3-soft-gummies?sld=dennisvanwestbroek",
} as const satisfies Record<string, string>;

export type AffiliateSlug = keyof typeof affiliateLinks;
