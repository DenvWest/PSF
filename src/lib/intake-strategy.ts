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

export class FormIntakeStrategy implements IntakeStrategy {
  readonly type = "form" as const;

  computeResults(input: IntakeAnswers): IntakeResults {
    const scores = calcDomainScores(input.answers);
    const urgency = getUrgency(scores);
    const profile = getProfileLabel(scores);
    const advice = getAdvice(scores, input.answers, input.symptoms);
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
    const advice = getAdvice(scores, input.answers, input.symptoms);
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
