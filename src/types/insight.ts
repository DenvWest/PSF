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
}
