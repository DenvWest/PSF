import type { MagnesiumForm, SupplementProduct } from '@/types/supplement-comparison';

// Vormen gerangschikt op opneembaarheid en onderbouwing
const FORM_QUALITY_SCORES: Record<MagnesiumForm, number> = {
  bisglycinate: 95,
  threonate: 90,
  taurate: 85,
  malate: 80,
  citrate: 75,
  glycerophosphate: 70,
  oxide: 20,
};

export function calculateOverallScore(product: SupplementProduct): number {
  const formScore = calculateFormScore(product);
  const doseScore = calculateDoseScore(product);
  const valueScore = calculateValueScore(product);
  const cleanScore = calculateCleanScore(product);

  // Gewogen gemiddelde
  return Math.round(
    formScore * 0.35 + // welke vormen
      doseScore * 0.25 + // genoeg elementair Mg?
      valueScore * 0.2 + // prijs-kwaliteit
      cleanScore * 0.2 // geen rommel erin
  );
}

function calculateFormScore(product: SupplementProduct): number {
  if (product.forms.length === 0) return 0;

  // Gewogen gemiddelde van vormkwaliteit, gewogen op percentage
  const weightedScore = product.forms.reduce((sum, form) => {
    const quality = FORM_QUALITY_SCORES[form.form] ?? 50;
    return sum + quality * (form.percentageOfTotal / 100);
  }, 0);

  return Math.round(weightedScore);
}

function calculateDoseScore(product: SupplementProduct): number {
  const mg = product.totalElementaryMgPerDay;
  // Sweet spot: 150-350mg elementair
  if (mg >= 150 && mg <= 350) return 100;
  if (mg >= 100 && mg < 150) return 70;
  if (mg > 350 && mg <= 500) return 60;
  if (mg >= 50 && mg < 100) return 40;
  return 20;
}

function calculateValueScore(product: SupplementProduct): number {
  const ppd = product.pricePerDay;
  // Prijs per dag benchmark voor NL markt
  if (ppd <= 0.15) return 100;
  if (ppd <= 0.25) return 85;
  if (ppd <= 0.4) return 70;
  if (ppd <= 0.6) return 50;
  return 30;
}

function calculateCleanScore(product: SupplementProduct): number {
  let score = 100;
  if (product.hasOxideAsMainForm) score -= 30;
  score -= product.unnecessaryAdditives.length * 10;
  if (product.thirdPartyTested) score += 10;
  if (product.certifications.length > 0) score += 5;
  return Math.max(0, Math.min(100, score));
}
