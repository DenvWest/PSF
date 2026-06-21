import type { PillarId } from "@/types/dashboard";

export type InsightType = "artikel" | "deepdive" | "begrip";

export interface InsightItem {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  pijler: PillarId;
  type: InsightType;
  readingTime?: string;
  source: "blog" | "kennisbank";
}
