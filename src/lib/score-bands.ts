import type { DomainScores } from "@/lib/intake-engine";

export type ScoreBand = "low" | "mid" | "high";

export type DomainScoreKey = keyof DomainScores;

const BAND_THRESHOLDS = {
  low: 40,
  mid: 65,
} as const;

export function getScoreBand(score: number): ScoreBand {
  if (!Number.isFinite(score)) {
    return "mid";
  }
  if (score < BAND_THRESHOLDS.low) {
    return "low";
  }
  if (score < BAND_THRESHOLDS.mid) {
    return "mid";
  }
  return "high";
}

export function getScoreBandShortLabel(score: number): string {
  const band = getScoreBand(score);
  if (band === "low") {
    return "Laag";
  }
  if (band === "mid") {
    return "Gemiddeld";
  }
  return "Sterk";
}

const DOMAIN_BAND_LABELS: Record<
  DomainScoreKey,
  { domain: string; low: string; mid: string; high: string }
> = {
  sleep_score: {
    domain: "Slaap",
    low: "Slaap — laag in jouw antwoorden",
    mid: "Slaap — gemiddeld",
    high: "Slaap — sterk",
  },
  stress_score: {
    domain: "Stress",
    low: "Stress — laag in jouw antwoorden",
    mid: "Stress — gemiddeld",
    high: "Stress — sterk",
  },
  nutrition_score: {
    domain: "Voeding",
    low: "Voeding — laag in jouw antwoorden",
    mid: "Voeding — gemiddeld",
    high: "Voeding — sterk",
  },
  energy_score: {
    domain: "Energie",
    low: "Energie — laag in jouw antwoorden",
    mid: "Energie — gemiddeld",
    high: "Energie — sterk",
  },
  movement_score: {
    domain: "Beweging",
    low: "Beweging — laag in jouw antwoorden",
    mid: "Beweging — gemiddeld",
    high: "Beweging — sterk",
  },
  recovery_score: {
    domain: "Herstel",
    low: "Herstel — laag in jouw antwoorden",
    mid: "Herstel — gemiddeld",
    high: "Herstel — sterk",
  },
};

export function getDomainScoreBandLabel(
  key: DomainScoreKey,
  score: number,
): string {
  const band = getScoreBand(score);
  return DOMAIN_BAND_LABELS[key][band];
}

const DOMAIN_QUESTION_COUNTS: Partial<Record<DomainScoreKey, number>> = {
  sleep_score: 4,
  energy_score: 2,
  stress_score: 2,
  nutrition_score: 2,
  movement_score: 2,
  recovery_score: 1,
};

export function getDomainBandContext(key: DomainScoreKey): string {
  const domain = DOMAIN_BAND_LABELS[key].domain.toLowerCase();
  const count = DOMAIN_QUESTION_COUNTS[key] ?? 2;
  return `Op basis van ${count} antwoord${count === 1 ? "" : "en"} over ${domain}.`;
}

const SLUG_TO_SCORE_KEY: Record<string, DomainScoreKey> = {
  magnesium: "sleep_score",
  ashwagandha: "stress_score",
  "omega-3": "nutrition_score",
  creatine: "energy_score",
  "vitamine-d": "energy_score",
  zink: "recovery_score",
};

export function getRecommendationScoreBandLabel(
  slug: string,
  scores: DomainScores,
): { label: string; context: string } | null {
  const key = SLUG_TO_SCORE_KEY[slug];
  if (!key) {
    return null;
  }
  const score = scores[key];
  return {
    label: getDomainScoreBandLabel(key, score),
    context: getDomainBandContext(key),
  };
}

export function getPrimaryDomainBandSentence(
  domainLabel: string,
): string {
  return `${domainLabel} kwam in jouw antwoorden het laagst naar voren. Dat betekent niet automatisch dat je een probleem hebt — wel dat dit het meest invloed kan hebben op de andere domeinen.`;
}
