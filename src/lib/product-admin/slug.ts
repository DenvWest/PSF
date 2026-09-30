import { slugify } from "@/lib/partnerdesk/db";

/**
 * Productslug: merk + naam, zonder dubbel merk aan het begin van de naam
 * ("Vital Nutrition Ashwagandha" bij merk "Vital Nutrition" wordt niet
 * "vital-nutrition-vital-nutrition-ashwagandha"). Botsingen krijgen -2, -3, …
 */
export function buildProductSlug(brandName: string, productName: string, taken: ReadonlySet<string>): string {
  const brandSlug = slugify(brandName);
  const nameSlug = slugify(productName);
  const combined = nameSlug.startsWith(brandSlug) ? nameSlug : `${brandSlug}-${nameSlug}`;
  const base = combined.replace(/^-+|-+$/g, "") || "product";
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
