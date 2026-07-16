import { describe, it, expect } from "vitest";
import { calcDomainScores, getAdvice } from "@/lib/intake-engine";
import { statementHasForbiddenPhrase } from "@/lib/nutrition-intake-statements";

function makeAnswers(overrides: Record<string, number> = {}): Record<string, number> {
  return {
    SLP_QUAL: 3,
    SLP_CONS: 3,
    SLP_ONSET: 3,
    SLP_WAKE: 3,
    NRG_PATN: 3,
    NRG_DEP: 3,
    STR_FREQ: 3,
    STR_RCV: 3,
    NUT_O3: 3,
    NUT_PROT: 3,
    MOV_STR: 3,
    MOV_CARD: 3,
    RCV_PHYS: 3,
    CON_SOC: 3,
    LIF_ALC: 3,
    LIF_SUN: 3,
    ...overrides,
  };
}

const SYMPTOMS = ["slaap", "stress", "energie"] as const;

const SCENARIOS: Array<{ label: string; answers: Record<string, number> }> = [
  { label: "baseline mid-range", answers: makeAnswers() },
  {
    label: "all max",
    answers: makeAnswers({
      SLP_QUAL: 4,
      SLP_CONS: 3,
      SLP_ONSET: 4,
      SLP_WAKE: 4,
      NRG_PATN: 4,
      NRG_DEP: 4,
      STR_FREQ: 4,
      STR_RCV: 4,
      NUT_O3: 3,
      NUT_PROT: 4,
      MOV_STR: 4,
      MOV_CARD: 4,
      RCV_PHYS: 3,
      LIF_ALC: 4,
      LIF_SUN: 4,
    }),
  },
  {
    label: "all min",
    answers: makeAnswers({
      SLP_QUAL: 0,
      SLP_CONS: 0,
      SLP_ONSET: 0,
      SLP_WAKE: 0,
      NRG_PATN: 0,
      NRG_DEP: 0,
      STR_FREQ: 0,
      STR_RCV: 0,
      NUT_O3: 0,
      NUT_PROT: 0,
      MOV_STR: 0,
      MOV_CARD: 0,
      RCV_PHYS: 0,
      LIF_ALC: 0,
      LIF_SUN: 0,
    }),
  },
  {
    label: "low sleep",
    answers: makeAnswers({
      SLP_QUAL: 0,
      SLP_CONS: 0,
      SLP_ONSET: 0,
      SLP_WAKE: 0,
    }),
  },
  {
    label: "low nutrition (triggers huisarts-copy)",
    answers: makeAnswers({ NUT_O3: 0, NUT_PROT: 0 }),
  },
  {
    label: "low stress + low sleep",
    answers: makeAnswers({
      SLP_QUAL: 0,
      SLP_CONS: 0,
      SLP_ONSET: 0,
      SLP_WAKE: 0,
      STR_FREQ: 0,
      STR_RCV: 0,
    }),
  },
  {
    label: "low movement + low recovery",
    answers: makeAnswers({ MOV_STR: 0, MOV_CARD: 0, RCV_PHYS: 0 }),
  },
  {
    label: "low sun + low omega-3",
    answers: makeAnswers({ LIF_SUN: 0, NUT_O3: 0 }),
  },
  {
    label: "high alcohol",
    answers: makeAnswers({ LIF_ALC: 0 }),
  },
  {
    label: "low energy only",
    answers: makeAnswers({ NRG_PATN: 0, NRG_DEP: 0 }),
  },
  {
    label: "mixed extremes A",
    answers: makeAnswers({
      SLP_QUAL: 4,
      SLP_CONS: 0,
      NRG_PATN: 0,
      STR_FREQ: 4,
      NUT_O3: 0,
      MOV_STR: 4,
      RCV_PHYS: 2,
      LIF_SUN: 0,
    }),
  },
  {
    label: "mixed extremes B",
    answers: makeAnswers({
      SLP_WAKE: 4,
      NRG_DEP: 4,
      STR_RCV: 0,
      NUT_PROT: 0,
      MOV_CARD: 0,
      LIF_ALC: 0,
      LIF_SUN: 4,
    }),
  },
];

function assertNoForbiddenPhrases(text: string, context: string): void {
  expect(
    statementHasForbiddenPhrase(text),
    `Forbidden phrase in ${context}: "${text}"`,
  ).toBe(false);
}

describe("COMPLIANCE: getAdvice output bevat geen verboden status-/diagnosetaal", () => {
  for (const { label, answers } of SCENARIOS) {
    it(`scenario "${label}" — quickWins, longTerm en supplement reasons zijn compliant`, () => {
      const scores = calcDomainScores(answers);
      const advice = getAdvice(scores, answers, [...SYMPTOMS]);

      for (const text of advice.quickWins) {
        assertNoForbiddenPhrases(text, `quickWin [${label}]`);
      }
      for (const text of advice.longTerm) {
        assertNoForbiddenPhrases(text, `longTerm [${label}]`);
      }
      for (const supp of advice.supplements) {
        assertNoForbiddenPhrases(supp.reason, `supplement reason (${supp.name}) [${label}]`);
      }
    });
  }
});
