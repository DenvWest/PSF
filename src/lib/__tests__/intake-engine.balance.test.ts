import { describe, it, expect } from "vitest";
import {
  getAdvice,
  calcDomainScores,
  type DomainScores,
} from "@/lib/intake-engine";
import {
  nurtureOutputHasCrossDomainBalance,
  pickLifestyleTipFromOtherDomain,
  resolveLifestyleTipDomainForDay,
} from "@/data/nurture-content";

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
    LIF_ALC: 3,
    LIF_SUN: 3,
    ...overrides,
  };
}

function makeScores(overrides: Partial<DomainScores> = {}): DomainScores {
  return {
    sleep_score: 70,
    energy_score: 70,
    stress_score: 70,
    nutrition_score: 70,
    movement_score: 70,
    recovery_score: 70,
    ...overrides,
  };
}

function adviceHasCrossDomainBalance(
  quickWins: string[],
  supplements: { name: string }[],
): boolean {
  if (supplements.length === 0) {
    return true;
  }
  return quickWins.length > 0;
}

describe("enforceCrossDomainBalance via getAdvice", () => {
  it("geïsoleerd voedings-gat levert quickWin én supplement", () => {
    const answers = makeAnswers({ NUT_O3: 1, NUT_PROT: 1 });
    const scores = calcDomainScores(answers);
    const advice = getAdvice(scores, answers, []);
    expect(advice.supplements.length).toBeGreaterThan(0);
    expect(advice.quickWins.length).toBeGreaterThan(0);
    expect(adviceHasCrossDomainBalance(advice.quickWins, advice.supplements)).toBe(
      true,
    );
  });

  it("magnesium-only scenario krijgt fallback quickWin", () => {
    const scores = makeScores({ sleep_score: 35, stress_score: 35 });
    const answers = makeAnswers({
      SLP_QUAL: 1,
      SLP_CONS: 1,
      SLP_WAKE: 1,
      STR_FREQ: 1,
      STR_RCV: 1,
    });
    const advice = getAdvice(scores, answers, []);
    expect(advice.supplements.some((s) => s.name.includes("Magnesium"))).toBe(
      true,
    );
    expect(advice.quickWins.length).toBeGreaterThan(0);
  });

  it("geen supplement zonder quickWin in output", () => {
    const scenarios: Array<{ scores: DomainScores; answers: Record<string, number> }> = [
      {
        scores: makeScores({ sleep_score: 30, stress_score: 30 }),
        answers: makeAnswers({ SLP_QUAL: 1, STR_FREQ: 1, SLP_CONS: 1 }),
      },
      {
        scores: calcDomainScores(makeAnswers({ NUT_O3: 1 })),
        answers: makeAnswers({ NUT_O3: 1 }),
      },
      {
        scores: makeScores({ recovery_score: 30 }),
        answers: makeAnswers({ MOV_STR: 4, MOV_CARD: 4, RCV_PHYS: 1 }),
      },
    ];

    for (const scenario of scenarios) {
      const advice = getAdvice(scenario.scores, scenario.answers, []);
      if (advice.supplements.length > 0) {
        expect(advice.quickWins.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("nurtureOutputHasCrossDomainBalance", () => {
  it("returns false when tip and supplement share domain", () => {
    expect(
      nurtureOutputHasCrossDomainBalance("nutrition_score", "nutrition_score"),
    ).toBe(false);
  });

  it("returns true when domains differ", () => {
    expect(
      nurtureOutputHasCrossDomainBalance("sleep_score", "nutrition_score"),
    ).toBe(true);
  });

  it("pickLifestyleTipFromOtherDomain avoids supplement domain", () => {
    const scores = makeScores({
      nutrition_score: 20,
      sleep_score: 80,
      energy_score: 80,
      stress_score: 80,
      movement_score: 80,
      recovery_score: 80,
    });
    const tip = pickLifestyleTipFromOtherDomain(
      scores,
      "nutrition_score",
      "moderate",
    );
    expect(tip.length).toBeGreaterThan(10);
    const meta = resolveLifestyleTipDomainForDay(scores, 14, "moderate");
    if (meta?.domain === "nutrition_score") {
      expect(tip).not.toContain("vette vis");
    }
  });
});
