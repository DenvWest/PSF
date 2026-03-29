export const affiliateLinks = {
  "arctic-blue-algenolie":
    "https://www.arctic-blue.com/winkel/algenolie/algenolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-visolie":
    "https://www.arctic-blue.com/winkel/visolie/visolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-gummies":
    "https://www.arctic-blue.com/sp/omega-3-soft-gummies?sld=dennisvanwestbroek",
  /** Placeholder: vervang door product-URL wanneer definitieve magnesiumpartners bekend zijn. */
  "magnesium-bisglycinaat":
    "https://www.arctic-blue.com/winkel/?sld=dennisvanwestbroek",
  "magnesium-tauraat":
    "https://www.arctic-blue.com/winkel/?sld=dennisvanwestbroek",
  "magnesium-citraat":
    "https://www.arctic-blue.com/winkel/?sld=dennisvanwestbroek",
} as const satisfies Record<string, string>;

export type AffiliateSlug = keyof typeof affiliateLinks;
