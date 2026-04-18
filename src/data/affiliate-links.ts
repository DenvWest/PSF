export const affiliateLinks = {
  // Omega-3 — NIET AANRAKEN
  "arctic-blue-algenolie":
    "https://www.arctic-blue.com/winkel/algenolie/algenolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-visolie":
    "https://www.arctic-blue.com/winkel/visolie/visolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-gummies":
    "https://www.arctic-blue.com/sp/omega-3-soft-gummies?sld=dennisvanwestbroek",

  // Magnesium
  "vitaminstore-super-magnesium":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=vitaminstore-super-magnesium&dl=product%2Fvitaminstore-super-magnesium-tabletten-162179",
  "vital-nutrition-citraat":
    "https://bdt9.net/c/?si=18988&li=1816067&wi=407296&ws=budget-optie&dl=collections%2Fmagnesium%2Fproducts%2Fmagnesium-citraat",
  "viridian-bisglycinaat":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=Magnesium-Bisglycinate-Vegetarisch&dl=product%2Fsolgar-vitamins-magnesium-bisglycinate-1308886",
} as const satisfies Record<string, string>;

export type AffiliateSlug = keyof typeof affiliateLinks;
