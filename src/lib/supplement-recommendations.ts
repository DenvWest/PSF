export interface SupplementRecommendation {
  slug: string;
  name: string;
  icon: string;
  reason: string;
  comparisonSlug: string;
  themaSlug?: string;
}

export interface DomainScores {
  slaap: number;
  energie: number;
  stress: number;
  voeding: number;
  beweging: number;
  herstel: number;
}

export function getPersonalizedRecommendations(
  scores: DomainScores,
  answers?: Record<string, number>,
): SupplementRecommendation[] {
  const recommendations: SupplementRecommendation[] = [];

  if (scores.slaap < 50 || scores.stress < 50) {
    recommendations.push({
      slug: "magnesium",
      name: "Magnesium",
      icon: "⚡",
      reason:
        scores.slaap < 50 && scores.stress < 50
          ? "Ondersteunt zowel je slaapkwaliteit als stressregulatie — twee gebieden waar jij ruimte hebt."
          : scores.slaap < 50
            ? "Magnesium glycinaat kan je slaapkwaliteit ondersteunen — een van je verbeterpunten."
            : "Helpt bij het reguleren van je stressrespons en ontspanning.",
      comparisonSlug: "beste-magnesium",
      themaSlug: "slaap",
    });
  }

  if (scores.stress < 50) {
    recommendations.push({
      slug: "ashwagandha",
      name: "Ashwagandha",
      icon: "🌿",
      reason:
        "Een adaptogeen dat cortisol kan verlagen — relevant bij jouw stressscore.",
      comparisonSlug: "beste-ashwagandha",
      themaSlug: "stress",
    });
  }

  const omega3Answer = answers?.["NUT_O3"] ?? 0;
  if (omega3Answer <= 1 || scores.voeding < 40) {
    recommendations.push({
      slug: "omega-3",
      name: "Omega-3",
      icon: "🐟",
      reason:
        omega3Answer <= 1
          ? "Je eet zelden vette vis — een omega-3 supplement kan dat aanvullen."
          : "Je voedingspatroon heeft ruimte voor verbetering — omega-3 is een goede basis.",
      comparisonSlug: "beste-omega-3-supplement",
    });
  }

  if (scores.energie < 40) {
    recommendations.push({
      slug: "creatine",
      name: "Creatine",
      icon: "💪",
      reason:
        "Ondersteunt energieproductie op celniveau — relevant bij jouw lage energiescore.",
      comparisonSlug: "beste-creatine",
    });
  }

  if (
    scores.herstel < 40 &&
    !recommendations.find((r) => r.slug === "magnesium")
  ) {
    recommendations.push({
      slug: "magnesium",
      name: "Magnesium",
      icon: "⚡",
      reason:
        "Ondersteunt spierherstel en ontspanning — belangrijk bij jouw herstelscore.",
      comparisonSlug: "beste-magnesium",
    });
  }

  if (recommendations.length < 2) {
    recommendations.push({
      slug: "vitamine-d",
      name: "Vitamine D3 + K2",
      icon: "☀️",
      reason:
        "In Nederland krijgen de meeste mannen te weinig vitamine D — een goede basislijn.",
      comparisonSlug: "beste-vitamine-d",
    });
  }

  return recommendations.slice(0, 3);
}
