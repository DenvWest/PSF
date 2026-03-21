import type { AffiliateSlug } from "@/data/affiliate-links";

export type Product = {
  slug: string;
  category?: string;
  name: string;
  brand: string;
  affiliateSlug: AffiliateSlug;
  rank: number;
  score: number;
  badge?: string;
  description: string;
  pros: string[];
  cons: string[];
  transparencyNote?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type Omega3Product = Product & {
  epaMg: number;
  dhaMg: number;
  capsulesPerDay: number;
  form: string;
  pricePerDayEur: number;
  pricePerBottleEur: number;
  amountPerBottle: number;
};
