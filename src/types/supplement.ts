import type { AffiliateSlug } from "@/data/affiliate-links";

export type SupplementCategory =
  | "omega-3"
  | "magnesium"
  | "melatonine"
  | "ashwagandha"
  | "vitamine-d"
  | "creatine"
  | "zink";

export interface ScoreBreakdown {
  criterium: string;
  score: number;
}

export interface SupplementProduct {
  slug: string;
  name: string;
  brand: string;
  affiliateSlug: AffiliateSlug;
  score: number;
  bestFor: string;
  variantTag: string;
  summary: string;
  specs: Array<{ label: string; value: string }>;
  pros: string[];
  cons: string[];
  breakdown: ScoreBreakdown[];
  imageSrc?: string;
  imageAlt?: string;
}

export interface ChoiceRoute {
  badgeLabel: string;
  productName: string;
  teaser: string;
  affiliateSlug: AffiliateSlug;
  slug: string;
}

export interface TableRow {
  slug: string;
  name: string;
  type: string;
  dosering: string;
  transparantie: string;
  gebruiksgemak: string;
  prijs: string;
  badge: string;
}

export interface ComparisonPageData {
  category: SupplementCategory;
  h1: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  lastUpdated: string;
  choiceRoutes: ChoiceRoute[];
  products: SupplementProduct[];
  tableRows: TableRow[];
  comparisonCriteria: string[];
  faq: Array<{ question: string; answer: string }>;
}
