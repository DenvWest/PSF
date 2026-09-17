import type { ThemeSlug } from "@/lib/content/themes";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DeficiencySignals, ProfileLabel } from "@/lib/intake-engine";
import type { ContentCheckId } from "@/data/content-graph/checks";
import type { PillarId } from "@/types/dashboard";

export type InsightType = "artikel" | "deepdive" | "begrip";

export type InsightTier = 1 | 2 | 3;

export interface InsightItem {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  pijler: PillarId;
  type: InsightType;
  niveau: "Basis" | "Verdiepend";
  readingTime?: string;
  publishedAt?: string;
  source: "blog" | "kennisbank";
  /** Kennisbank-begrippen: 1 = publiek basis, 2–3 = premium account-blok. */
  insightTier?: InsightTier;
  /** Personalisatie/weaving-naad — EN-thema voor THEME_CONTENT_MAP / plan. */
  theme?: ThemeSlug;
  /** Personalisatie/weaving-naad — leefstijlplan-fase (1-3); consumer: InsightPhaseNote op blog/kennisbank via getContentMetadata. */
  planPhase?: 1 | 2 | 3;
  /** Personalisatie/weaving-naad — gemeten gap; consumer: hub-herordening "Speelt voor jou nu" in inzichten/page.tsx. */
  gapSignal?: keyof DeficiencySignals;
  /** Personalisatie/weaving-naad — profiel waarvoor dit stuk primair relevant is. */
  profile?: ProfileLabel["name"] | "Overtrainer";
  /** Personalisatie/weaving-naad — catalog-id (SUPPLEMENT_CATALOG) voor /beste/ + offer-catalog. */
  relatedSupplementId?: string;
  /**
   * De voedingsstof(fen) waar dit stuk over gaat — de brug naar de
   * voedingsdatabase, de voedingscheck en `nutrition-route-status`.
   *
   * **Redactioneel, niet commercieel.** Dit veld staat los van
   * `relatedSupplementId`: dat zegt welk product we vergelijken, dit zegt welke
   * stof het stuk behandelt. Een stuk over magnesium uit voeding draagt de stof
   * ook als we morgen geen magnesium meer vergelijken.
   *
   * Maximaal twee. Draagt een stuk er meer, dan heeft het geen onderwerp maar
   * een opsomming, en de afgeleide vervolgstap wordt betekenisloos.
   *
   * Niet elke supplementstof is een nutriënt: creatine, melatonine en
   * ashwagandha staan bewust niet in `NutrientId`. Voor die stukken valt
   * `resolveCheck()` terug op het thema — en dat klopt: de vraag na een
   * creatine-artikel is niet "haal ik dit uit mijn eten".
   */
  nutrients?: readonly NutrientId[];
  /**
   * Overschrijft de check die `resolveCheck()` zou kiezen.
   *
   * Alleen invullen als de afleiding aantoonbaar de verkeerde kant op wijst.
   * Honderd handmatige toewijzingen lopen uit de pas; een functie niet.
   */
  checkOverride?: ContentCheckId;
}
