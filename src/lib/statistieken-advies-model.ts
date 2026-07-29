import { PILLAR, PILLARS, PILLAR_BY_SCORE_KEY } from "@/data/dashboard";
import type { QuestionId } from "@/data/intake-questions";
import {
  EVIDENCE_QUESTIONS_BY_DOMAIN,
  LEEFSTIJLCHECK_EVIDENCE_BY_ID,
  LEEFSTIJLCHECK_STRENGTH_DISCLAIMER,
  type EvidenceReference,
  type EvidenceStrength,
} from "@/data/leefstijlcheck-evidence";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import { isInterventionDomain, type InterventionPillarId } from "@/lib/domain-role";
import type { DomainScores } from "@/lib/intake-engine";
import { buildNutritionAdvice, type NutritionAdviceItem } from "@/lib/nutrition-advice";
import type { IntakeEstimate } from "@/lib/nutrition-intake-estimate";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { buildVerdictCards } from "@/lib/supplement-verdict-copy";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";
import type { RecommendationTriggerReason } from "@/types/recommendation";

export type AdviesBlokState = "nutrition_missing" | "ready" | "all_no";

export type DomainSnapshotRow = {
  pillarId: PillarId;
  label: string;
  score: number;
  isWeak: boolean;
};

export type FreshnessNudge = {
  pillarId: PillarId;
  label: string;
  daysAgo: number;
};

import type { StoredSupplementVerdict } from "@/types/verdict";

export type DomainEvidenceView = {
  pillarId: InterventionPillarId;
  label: string;
  score: number;
  questionId: QuestionId;
  stars: EvidenceStrength;
  strengthLabel: string;
  whyThisQuestion: string;
  answerHint: string | null;
  references: EvidenceReference[];
  disclaimer: string;
};

export type StatistiekenAdviesModel = {
  checkDateLabel: string;
  snapshotHeadline: string;
  snapshotBody: string;
  domainRows: DomainSnapshotRow[];
  freshnessNudges: FreshnessNudge[];
  evidenceDomains: DomainEvidenceView[];
  nutritionLadder: NutritionAdviceItem[];
  nutritionLadderPending: boolean;
  verdictCards: ReturnType<typeof buildVerdictCards>;
  verdictTotal: number;
  buyCount: number;
  adviesState: AdviesBlokState;
};

const INTERVENTION_PILLARS = PILLARS.filter((pillar) =>
  isInterventionDomain(pillar.id),
);

function formatCheckEyebrowDate(dateLabel: string): string {
  return dateLabel.toUpperCase();
}

function joinDomainLabels(labels: string[]): string {
  if (labels.length === 0) {
    return "Je domeinen zijn in balans";
  }
  if (labels.length === 1) {
    return `${labels[0]} vraagt nu je aandacht`;
  }
  if (labels.length === 2) {
    return `${labels[0]} en ${labels[1].toLowerCase()} vragen nu je aandacht`;
  }
  const head = labels.slice(0, -1).join(", ");
  const tail = labels[labels.length - 1]!.toLowerCase();
  return `${head} en ${tail} vragen nu je aandacht`;
}

function toIntakeEstimates(data: DashboardData): IntakeEstimate[] {
  if (!data.nutritionIntake) {
    return [];
  }
  return data.nutritionIntake.items.map((item) => ({
    nutrient: item.nutrient,
    band: item.band,
    referenceLabel:
      nutrientReferences[item.nutrient]?.referenceLabel ?? item.label,
  }));
}

function domainScoreKeyForPillar(pillarId: InterventionPillarId): keyof DomainScores {
  const entry = Object.entries(PILLAR_BY_SCORE_KEY).find(
    ([, pillar]) => pillar === pillarId,
  );
  return (entry?.[0] ?? "sleep_score") as keyof DomainScores;
}

function triggeredDomainsFromVerdicts(
  verdicts: StoredSupplementVerdict[],
): Set<InterventionPillarId> {
  const domains = new Set<InterventionPillarId>();
  for (const verdict of verdicts) {
    const triggers = verdict.basedOn?.triggeredBy ?? [];
    for (const trigger of triggers) {
      if (trigger.type === "domain_below") {
        const pillar = PILLAR_BY_SCORE_KEY[trigger.domain as keyof typeof PILLAR_BY_SCORE_KEY];
        if (pillar && isInterventionDomain(pillar)) {
          domains.add(pillar);
        }
      }
      if (trigger.type === "pillar" && isInterventionDomain(trigger.pillarId)) {
        domains.add(trigger.pillarId);
      }
    }
  }
  return domains;
}

function questionIdsForDomain(
  pillarId: InterventionPillarId,
  triggers: RecommendationTriggerReason[],
): QuestionId[] {
  const domainKey = domainScoreKeyForPillar(pillarId);
  const fromTriggers = triggers
    .filter(
      (trigger): trigger is Extract<RecommendationTriggerReason, { type: "domain_below" }> =>
        trigger.type === "domain_below" && trigger.domain === domainKey,
    )
    .flatMap(() => EVIDENCE_QUESTIONS_BY_DOMAIN[pillarId]);

  if (fromTriggers.length > 0) {
    return [...new Set(fromTriggers)];
  }
  return EVIDENCE_QUESTIONS_BY_DOMAIN[pillarId];
}

function pickRepresentativeQuestion(questionIds: QuestionId[]): QuestionId | null {
  let best: QuestionId | null = null;
  let bestStars = -1;
  for (const questionId of questionIds) {
    const evidence = LEEFSTIJLCHECK_EVIDENCE_BY_ID[questionId];
    if (!evidence) {
      continue;
    }
    if (evidence.strength.stars > bestStars) {
      best = questionId;
      bestStars = evidence.strength.stars;
    }
  }
  return best;
}

function answerHintForQuestion(
  questionId: QuestionId,
  answers: Record<string, number> | null,
): string | null {
  if (!answers) {
    return null;
  }
  const evidence = LEEFSTIJLCHECK_EVIDENCE_BY_ID[questionId];
  const answer = answers[questionId];
  if (!evidence || typeof answer !== "number") {
    return null;
  }
  return answer >= 3
    ? evidence.answerMeaning.higherAlignment
    : evidence.answerMeaning.lowerAlignment;
}

function buildEvidenceDomains(
  model: DashboardModel,
  data: DashboardData,
): DomainEvidenceView[] {
  const triggered = triggeredDomainsFromVerdicts(data.supplementVerdicts ?? []);
  const allTriggers = (data.supplementVerdicts ?? []).flatMap(
    (verdict) => verdict.basedOn?.triggeredBy ?? [],
  );

  const relevant = INTERVENTION_PILLARS.filter((pillar) => {
    const score = model.scores[pillar.id] ?? 0;
    return score < 50 || triggered.has(pillar.id as InterventionPillarId);
  });

  return relevant
    .map((pillar) => {
      const pillarId = pillar.id as InterventionPillarId;
      const questionIds = questionIdsForDomain(pillarId, allTriggers);
      const questionId = pickRepresentativeQuestion(questionIds);
      if (!questionId) {
        return null;
      }
      const evidence = LEEFSTIJLCHECK_EVIDENCE_BY_ID[questionId];
      return {
        pillarId,
        label: pillar.label,
        score: model.scores[pillarId] ?? 0,
        questionId,
        stars: evidence.strength.stars,
        strengthLabel: evidence.strength.label,
        whyThisQuestion: evidence.whyThisQuestion,
        answerHint: answerHintForQuestion(questionId, model.answers),
        references: evidence.references,
        disclaimer: LEEFSTIJLCHECK_STRENGTH_DISCLAIMER,
      } satisfies DomainEvidenceView;
    })
    .filter((item): item is DomainEvidenceView => item !== null)
    .sort((left, right) => left.score - right.score);
}

function resolveAdviesState(
  verdicts: StoredSupplementVerdict[],
  nutritionLogCompleted: boolean,
): AdviesBlokState {
  if (!nutritionLogCompleted) {
    return "nutrition_missing";
  }
  const buyCount = verdicts.filter((row) => row.verdict === "kopen").length;
  if (verdicts.length > 0 && buyCount === 0) {
    return "all_no";
  }
  return "ready";
}

export function buildStatistiekenAdviesModel(
  model: DashboardModel,
  data: DashboardData,
): StatistiekenAdviesModel {
  const eligibility = buildRecommendationsEligibility(data.nutritionIntake);
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;
  const verdicts = data.supplementVerdicts ?? [];
  const allCards = buildVerdictCards(verdicts);
  const buyCount = verdicts.filter((row) => row.verdict === "kopen").length;

  const domainRows: DomainSnapshotRow[] = INTERVENTION_PILLARS.map((pillar) => {
    const score = model.scores[pillar.id] ?? 0;
    return {
      pillarId: pillar.id,
      label: pillar.label,
      score,
      isWeak: score < 50,
    };
  });

  const weakLabels = domainRows.filter((row) => row.isWeak).map((row) => row.label);
  const freshnessNudges: FreshnessNudge[] = Object.entries(
    data.domainCheckDaysAgo ?? {},
  )
    .filter(([, days]) => typeof days === "number" && days >= 14)
    .map(([pillarId, daysAgo]) => ({
      pillarId: pillarId as PillarId,
      label: PILLAR[pillarId as PillarId]?.label ?? pillarId,
      daysAgo: daysAgo as number,
    }))
    .sort((left, right) => right.daysAgo - left.daysAgo);

  const nutritionLadder = nutritionLogCompleted
    ? buildNutritionAdvice(toIntakeEstimates(data), { proteinTarget: data.proteinTarget })
    : [];

  return {
    checkDateLabel: formatCheckEyebrowDate(model.date),
    snapshotHeadline: joinDomainLabels(weakLabels),
    snapshotBody: "Dit is je beeld van de laatste check. Niet van vandaag.",
    domainRows,
    freshnessNudges,
    evidenceDomains: buildEvidenceDomains(model, data),
    nutritionLadder,
    nutritionLadderPending: !nutritionLogCompleted,
    verdictCards: allCards.slice(0, 3),
    verdictTotal: allCards.length,
    buyCount,
    adviesState: resolveAdviesState(verdicts, nutritionLogCompleted),
  };
}

export function buildAdviesBlokHeadline(model: StatistiekenAdviesModel): string {
  if (model.adviesState === "nutrition_missing") {
    return "Zonder je voeding kunnen we niets zinnigs zeggen";
  }
  if (model.adviesState === "all_no") {
    return "Geen enkele voegt nu iets toe voor jou";
  }
  if (model.buyCount === 0) {
    return `Van ${model.verdictTotal} supplementen voegen er nu geen toe voor jou`;
  }
  return `Van ${model.verdictTotal} supplementen voegen er ${model.buyCount} iets toe voor jou`;
}
