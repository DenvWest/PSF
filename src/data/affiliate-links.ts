export const affiliateLinks = {
  // Omega-3
  "arctic-blue-visolie":
    "https://www.arctic-blue.com/winkel/visolie/visolie-vloeibaar/?sld=dennisvanwestbroek",
  "mollers-omega-3-citroen":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=organische%20omega%203%20olie&dl=product%2Fmollers-mollers-omega-3-citroen-mollers-visolie-vloeibaar-240847",
  "minami-morepa-original":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=duurzame-sterke-visolie&dl=product%2Fminami-nutrition-morepa-smart-fats-softgels-183303",
  "vitals-liquid-epadha":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=Vitalis-Epa%2FDHA&dl=product%2Fvitals-liquid-epadha-vloeibaar-1200mg-doos-1308940",

  // Behoud Arctic Blue Gummies en Algenolie voor eventueel gebruik elders op de site
  "arctic-blue-algenolie":
    "https://www.arctic-blue.com/winkel/algenolie/algenolie-vloeibaar/?sld=dennisvanwestbroek",
  "arctic-blue-gummies":
    "https://www.arctic-blue.com/sp/omega-3-soft-gummies?sld=dennisvanwestbroek",

  // Ashwagandha — Sub ID (ws) altijd: ashwagandha-vergelijking
  "vitaminstore-ashwagandha-ksm66":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=ashwagandha-vergelijking&dl=product%2Fvitaminstore-ashwagandha-ksm-66-ashwaganda-vegicaps-278077",
  "vitalnutrition-ashwagandha-ksm66":
    "https://bdt9.net/c/?si=18988&li=1816067&wi=407296&ws=ashwagandha-vergelijking&dl=products%2Fashwagandha%3F_pos%3D1%26_psq%3Dashwaga%26_ss%3De%26_v%3D1.0",
  "vitaminstore-solgar-ashwagandha":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=ashwagandha-vergelijking&dl=product%2Fsolgar-vitamins-ashwagandha-root-extract-vegicaps-713",

  // Magnesium — NIET AANRAKEN
  "vitaminstore-super-magnesium":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=vitaminstore-super-magnesium&dl=product%2Fvitaminstore-super-magnesium-tabletten-162179",
  "vital-nutrition-citraat":
    "https://bdt9.net/c/?si=18988&li=1816067&wi=407296&ws=budget-optie&dl=collections%2Fmagnesium%2Fproducts%2Fmagnesium-citraat",
  "viridian-bisglycinaat":
    "https://ds1.nl/c/?si=5676&li=1266442&wi=407296&ws=Magnesium-Bisglycinate-Vegetarisch&dl=product%2Fsolgar-vitamins-magnesium-bisglycinate-1308886",
} as const satisfies Record<string, string>;

export type AffiliateSlug = keyof typeof affiliateLinks;
