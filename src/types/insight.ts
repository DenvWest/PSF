import type { ThemeSlug } from "@/lib/content/themes";
import type { DeficiencySignals, ProfileLabel } from "@/lib/intake-engine";
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
}
