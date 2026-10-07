import { nutrientReferences, type NutrientId } from "@/data/nutrition/intake-reference";

/**
 * Het supplement dat je in Keuze → Vergelijken voor één stof koos — één
 * product per stof, bewaard als favoriet in `account_favorites` (domein
 * voeding), naast de routekeuze `voeding-route-<stof>-<bord|potje|beide>`.
 *
 * Het id draagt de productslug, zodat Keuze → Favorieten zonder extra opslag
 * de link naar de productpagina kan tonen. Daar staat de koopknop; in het
 * dashboard zelf staat geen affiliate-link (cockpit-besluit, juli 2026).
 */

const PREFIX = "voeding-product-";

const STOFFEN = Object.keys(nutrientReferences) as NutrientId[];

export function productKeuzeId(nutrient: NutrientId, slug: string): string {
  return `${PREFIX}${nutrient}-${slug}`;
}

export function parseProductKeuze(id: string): { nutrient: NutrientId; slug: string } | null {
  if (!id.startsWith(PREFIX)) return null;
  const rest = id.slice(PREFIX.length);
  const nutrient = STOFFEN.find((stof) => rest.startsWith(`${stof}-`));
  if (!nutrient) return null;
  const slug = rest.slice(nutrient.length + 1);
  return slug ? { nutrient, slug } : null;
}

/** De slug van het gekozen product voor deze stof, of null. */
export function productKeuzeVoorStof(nutrient: NutrientId, items: readonly { id: string }[]): string | null {
  for (const item of items) {
    const keuze = parseProductKeuze(item.id);
    if (keuze?.nutrient === nutrient) return keuze.slug;
  }
  return null;
}

/** Alle bewaarde productkeuzes van deze stof — om er bij een wissel precies één over te laten. */
export function productKeuzeIdsVoorStof(nutrient: NutrientId, items: readonly { id: string }[]): string[] {
  return items.filter((item) => parseProductKeuze(item.id)?.nutrient === nutrient).map((item) => item.id);
}

export function productKeuzeTitel(nutrient: NutrientId, naam: string): string {
  return `${nutrientReferences[nutrient].label}: ${naam}`;
}

/** De regel onder een bewaarde productkeuze op Keuze → Favorieten. */
export function productKeuzeContext(id: string): string | null {
  const keuze = parseProductKeuze(id);
  if (!keuze) return null;
  const label = nutrientReferences[keuze.nutrient].label;
  return `Jouw supplement voor ${label.charAt(0).toLowerCase()}${label.slice(1)}, gekozen in Vergelijken.`;
}

export function productKeuzeHref(id: string): string | null {
  const keuze = parseProductKeuze(id);
  return keuze ? `/product/${keuze.slug}` : null;
}
