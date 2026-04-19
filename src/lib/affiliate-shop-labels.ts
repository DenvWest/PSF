import type { AffiliateSlug } from "@/data/affiliate-links";

/** Weergavenaam van de webshop voor vergelijkings-CTA's ("Bekijk bij …"). */
const AFFILIATE_SHOP_LABELS: Partial<Record<AffiliateSlug, string>> = {
  "arctic-blue-visolie": "Arctic Blue",
  "arctic-blue-algenolie": "Arctic Blue",
  "arctic-blue-gummies": "Arctic Blue",
  "mollers-omega-3-citroen": "Möller's",
  "minami-morepa-original": "Vitaminstore",
  "vitals-liquid-epadha": "Vitaminstore",
  "vitaminstore-ashwagandha-ksm66": "Vitaminstore",
  "vitalnutrition-ashwagandha-ksm66": "Vital Nutrition",
  "vitaminstore-solgar-ashwagandha": "Vitaminstore",
  "vitaminstore-super-magnesium": "Vitaminstore",
  "vital-nutrition-citraat": "Vital Nutrition",
  "viridian-bisglycinaat": "Vitaminstore",
};

export function getAffiliateShopLabel(slug: AffiliateSlug): string {
  return AFFILIATE_SHOP_LABELS[slug] ?? "aanbieder";
}
