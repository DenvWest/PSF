import type { NutrientId } from "@/data/nutrition/intake-reference";
import { EVIDENCE_DOSE } from "@/data/supplement-hub/score-model";
import { NUTRIENT_HUB_CATEGORY } from "@/lib/nutrition-result-rows";
import { buildSupplementHubHref } from "@/lib/supplement-hub/hub-link";
import { formatScore, getHubProducts, normalizeZoek, type HubProduct } from "@/lib/supplement-hub/product-catalog";
import { getScoreBand } from "@/lib/supplement-hub/score-presentation";
import type { SupplementCategory } from "@/types/supplement";
import type { ClaimStance } from "@/types/supplement-score";

/**
 * De supplementen van één stof met hun PS-Score, compact genoeg voor Keuze →
 * Vergelijken. De PS-Score is een productscore (0–100, kwaliteit van het
 * product), nooit een score voor iemands voeding
 * (`docs/plan/BESLUIT_KEUZE_VERGELIJKEN_2026-10.md` §3).
 *
 * Geen affiliate-link: de link gaat naar de eigen productpagina en de
 * catalogus op `/supplementen`, waar de koopknop pas staat.
 *
 * **Dezelfde bron als `/supplementen`.** Het dashboard laadt de producten op
 * de server uit de database (`loadHubProductsForPage`) en geeft ze als
 * {@link KeuzeProduct}-lijst mee; zonder die lijst (dev-data, tests) valt dit
 * terug op de statische catalogus. Tot 7 oktober las Keuze alleen de
 * statische lijst, waardoor een product uit de admin wel op `/supplementen`
 * stond en niet in Keuze.
 */

export type KeuzeProduct = {
  slug: string;
  category: SupplementCategory;
  naam: string;
  /** "93,4" */
  score: string;
  scoreTotaal: number;
  bandLabel: string;
  vorm: string;
  href: string;
  /** Wat het etiket per dag levert, in `eenheid`; null als het niet vast te stellen is. */
  dosisPerDag: number | null;
  /** "mg", "µg" of "g" — dezelfde schrijfwijze als het dagboek. */
  eenheid: string | null;
  /** Prijs per etiketdag; raakt de PS-Score niet (affiliate-firewall). */
  centenPerDag: number | null;
  claimStance: ClaimStance;
};

export type PsScoreProduct = KeuzeProduct;

function eenheidZoalsDagboek(eenheid: string): string {
  return eenheid === "ug" ? "µg" : eenheid;
}

export function toKeuzeProduct(product: HubProduct): KeuzeProduct {
  const evidence = EVIDENCE_DOSE[product.category];
  return {
    slug: product.slug,
    category: product.category,
    naam: product.volledigeNaam,
    score: formatScore(product.score.total),
    scoreTotaal: product.score.total,
    bandLabel: getScoreBand(product.score.total).label,
    vorm: product.vormLabel,
    href: product.href,
    dosisPerDag: product.gemetenDosis,
    eenheid: evidence ? eenheidZoalsDagboek(evidence.eenheid) : null,
    centenPerDag: product.cost.etiketCentenPerDag > 0 ? product.cost.etiketCentenPerDag : null,
    claimStance: product.claimStance,
  };
}

const KEUZE_CATEGORIEEN: ReadonlySet<SupplementCategory> = new Set(Object.values(NUTRIENT_HUB_CATEGORY));

/** De producten die Keuze nodig heeft: alleen de categorieën van de vijf kernstoffen. */
export function keuzeProducten(products: readonly HubProduct[]): KeuzeProduct[] {
  return products.filter((product) => KEUZE_CATEGORIEEN.has(product.category)).map(toKeuzeProduct);
}

let statisch: KeuzeProduct[] | null = null;

function bron(products?: readonly KeuzeProduct[]): readonly KeuzeProduct[] {
  if (products && products.length > 0) return products;
  statisch ??= keuzeProducten(getHubProducts());
  return statisch;
}

/** De catalogus op `/supplementen`, gefilterd op deze stof. */
export function psScoreCatalogusHref(nutrient: NutrientId): string {
  return buildSupplementHubHref(NUTRIENT_HUB_CATEGORY[nutrient]);
}

/** Hoeveel producten de catalogus voor deze stof heeft. */
export function psScoreAantalVoorStof(nutrient: NutrientId, products?: readonly KeuzeProduct[]): number {
  const categorie = NUTRIENT_HUB_CATEGORY[nutrient];
  return bron(products).filter((product) => product.category === categorie).length;
}

/**
 * Per vorm (bisglycinaat, citraat, whey isolaat, …) het product met de hoogste
 * PS-Score, hoogste vorm eerst. Zo zie je in één oogopslag welke vormen er
 * zijn, zonder de vergelijking op `/beste/*` of de catalogus te herhalen.
 */
export function psScoreBestePerVorm(
  nutrient: NutrientId,
  products?: readonly KeuzeProduct[],
  limiet = 4,
): KeuzeProduct[] {
  const categorie = NUTRIENT_HUB_CATEGORY[nutrient];
  const besteVanVorm = new Map<string, KeuzeProduct>();
  for (const product of bron(products)) {
    if (product.category !== categorie) continue;
    const huidige = besteVanVorm.get(product.vorm);
    if (!huidige || product.scoreTotaal > huidige.scoreTotaal) besteVanVorm.set(product.vorm, product);
  }
  return [...besteVanVorm.values()].sort((a, b) => b.scoreTotaal - a.scoreTotaal).slice(0, limiet);
}

/** Eén product van deze stof op slug, of het nu de beste van zijn vorm is of niet. */
export function keuzeProductVoorSlug(
  nutrient: NutrientId,
  slug: string,
  products?: readonly KeuzeProduct[],
): KeuzeProduct | null {
  const categorie = NUTRIENT_HUB_CATEGORY[nutrient];
  return bron(products).find((product) => product.slug === slug && product.category === categorie) ?? null;
}

/**
 * Zoeken in de producten van één stof, op naam en vorm — voor het zoekveld in
 * de supplementkolom van Keuze. Hoogste PS-Score eerst.
 */
export function zoekKeuzeProducten(
  nutrient: NutrientId,
  term: string,
  products?: readonly KeuzeProduct[],
): KeuzeProduct[] {
  const categorie = NUTRIENT_HUB_CATEGORY[nutrient];
  const woorden = normalizeZoek(term).split(/\s+/).filter(Boolean);
  if (woorden.length === 0) return [];
  return bron(products)
    .filter((product) => product.category === categorie)
    .filter((product) => {
      const tekst = normalizeZoek(`${product.naam} ${product.vorm}`);
      return woorden.every((woord) => tekst.includes(woord));
    })
    .sort((a, b) => b.scoreTotaal - a.scoreTotaal);
}
