// Multi-tenant intake-scaffold. Gebruikt door /api/partner/intake (form) en chat-intake (chat).
// Supplementadvies uit getAdvice passeert hier de approved-only gate (resolveGatedComparisonPath),
// zodat partner/chat nooit een on_hold/forbidden /beste-link naar buiten sturen.

import type { SymptomId } from "@/data/intake-questions";
import type {
  DomainScores,
  UrgencyResult,
  ProfileLabel,
  AdviceResult,
  DeficiencySignals,
} from "./intake-engine";
import {
  calcDomainScores,
  getUrgency,
  getProfileLabel,
  getAdvice,
  getDeficiencySignals,
} from "./intake-engine";
import { isGatedComparisonPathAllowed } from "@/lib/supplement-gate";

export interface IntakeAnswers {
  answers: Record<string, number>;
  symptoms: SymptomId[];
  ageRange?: string;
  email?: string;
}

export interface IntakeResults {
  scores: DomainScores;
  urgency: UrgencyResult;
  profile: ProfileLabel;
  advice: AdviceResult;
  signals: DeficiencySignals;
}

export interface IntakeStrategy {
  readonly type: "form" | "chat";
  computeResults(input: IntakeAnswers): IntakeResults;
}

export function gateAdviceSupplements(advice: AdviceResult): AdviceResult {
  return {
    ...advice,
    supplements: advice.supplements.filter((supplement) => {
      if (!supplement.link.startsWith("/beste/")) {
        return true;
      }
      return isGatedComparisonPathAllowed(supplement.link);
    }),
  };
}

export class FormIntakeStrategy implements IntakeStrategy {
  readonly type = "form" as const;

  computeResults(input: IntakeAnswers): IntakeResults {
    const scores = calcDomainScores(input.answers);
    const urgency = getUrgency(scores);
    const profile = getProfileLabel(scores);
    const advice = gateAdviceSupplements(
      getAdvice(scores, input.answers, input.symptoms),
    );
    const signals = getDeficiencySignals(input.answers);

    return { scores, urgency, profile, advice, signals };
  }
}

export class ChatIntakeStrategy implements IntakeStrategy {
  readonly type = "chat" as const;

  computeResults(input: IntakeAnswers): IntakeResults {
    const scores = calcDomainScores(input.answers);
    const urgency = getUrgency(scores);
    const profile = getProfileLabel(scores);
    const advice = gateAdviceSupplements(
      getAdvice(scores, input.answers, input.symptoms),
    );
    const signals = getDeficiencySignals(input.answers);

    return { scores, urgency, profile, advice, signals };
  }
}

export function createIntakeStrategy(type: "form" | "chat"): IntakeStrategy {
  switch (type) {
    case "form":
      return new FormIntakeStrategy();
    case "chat":
      return new ChatIntakeStrategy();
  }
}
