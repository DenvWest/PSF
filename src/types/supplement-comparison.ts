export type MagnesiumForm =
  | 'bisglycinate'
  | 'citrate'
  | 'taurate'
  | 'malate'
  | 'oxide'
  | 'threonate'
  | 'glycerophosphate';

export type HealthDomain =
  | 'sleep'
  | 'stress'
  | 'energy'
  | 'sport'
  | 'general'
  | 'cardiovascular'
  | 'cognition';

export type PriceCategory = 'budget' | 'mid' | 'premium';

export type RecommendationProfile =
  | 'best-for-sleep'
  | 'best-value'
  | 'best-for-sport'
  | 'best-overall'
  | 'best-premium';

export interface MagnesiumFormDetail {
  form: MagnesiumForm;
  /** Elementair magnesium in mg per dagdosering uit deze vorm */
  elementaryMg: number;
  /** Percentage van totaal elementair Mg in het product */
  percentageOfTotal: number;
}

export interface SupplementProduct {
  id: string;
  brand: string;
  name: string;
  slug: string;

  // Samenstelling
  forms: MagnesiumFormDetail[];
  totalElementaryMgPerDay: number;
  servingSize: string; // bijv. "2 tabletten"
  servingsPerContainer: number;

  // Kwaliteit
  hasOxideAsMainForm: boolean;
  unnecessaryAdditives: string[];
  certifications: string[];
  thirdPartyTested: boolean;

  // Prijs
  pricePerContainer: number;
  pricePerDay: number;
  priceCategory: PriceCategory;
  containerSize: string; // bijv. "120 tabletten"

  // Beoordeling
  bestForDomains: HealthDomain[];
  recommendationProfiles: RecommendationProfile[];
  overallScore: number; // 0-100, berekend

  // Affiliate
  affiliateUrl: string | null;
  affiliateNetwork: string | null; // bijv. "daisycon"
  retailer: string;

  // Meta
  lastVerified: string; // ISO date
  notes: string;
}

export interface ComparisonCategory {
  id: string;
  supplement: 'magnesium'; // later uitbreidbaar
  products: SupplementProduct[];
  lastUpdated: string;
  methodology: string; // link naar /methodologie
}
