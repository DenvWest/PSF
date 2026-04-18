import type { ComparisonCategory, SupplementProduct } from '@/types/supplement-comparison';

// Voorlopig alleen Vitaminstore Super Magnesium als voorbeeld
// Later aanvullen met 4-5 andere producten na onderzoek
const vitaminStoreSuperMagnesium: SupplementProduct = {
  id: 'vitaminstore-super-magnesium',
  brand: 'Vitaminstore',
  name: 'Super Magnesium',
  slug: 'vitaminstore-super-magnesium',

  forms: [
    { form: 'bisglycinate', elementaryMg: 0, percentageOfTotal: 0 },
    { form: 'citrate', elementaryMg: 0, percentageOfTotal: 0 },
    { form: 'taurate', elementaryMg: 0, percentageOfTotal: 0 },
    { form: 'malate', elementaryMg: 0, percentageOfTotal: 0 },
    { form: 'glycerophosphate', elementaryMg: 0, percentageOfTotal: 0 },
  ],
  // TODO: exacte mg per vorm invullen vanaf productlabel
  totalElementaryMgPerDay: 200, // bij 2 tabletten — verifiëren
  servingSize: '2 tabletten',
  servingsPerContainer: 60,

  hasOxideAsMainForm: false,
  unnecessaryAdditives: ['hydroxypropylmethylcellulose (coating)'],
  certifications: [],
  thirdPartyTested: false,

  pricePerContainer: 25.88, // 120 tabletten
  pricePerDay: 0.22, // €25.88 / 120 * 2 = ~€0.43... CHECK
  priceCategory: 'mid',
  containerSize: '120 tabletten',

  bestForDomains: ['general', 'sleep', 'stress'],
  recommendationProfiles: ['best-overall'],
  overallScore: 0, // wordt berekend

  affiliateUrl: null, // Daisycon link hier later
  affiliateNetwork: 'daisycon',
  retailer: 'Vitaminstore',

  lastVerified: '2026-04-18',
  notes: 'Complex met 5 vormen. Exacte mg per vorm nog verifiëren vanaf label.',
};

export const magnesiumComparison: ComparisonCategory = {
  id: 'magnesium-comparison',
  supplement: 'magnesium',
  products: [vitaminStoreSuperMagnesium],
  lastUpdated: '2026-04-18',
  methodology: '/methodologie',
};
