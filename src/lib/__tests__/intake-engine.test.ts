import { describe, it, expect } from "vitest";
import {
  calcDomainScores,
  getUrgency,
  getProfileLabel,
  getAdvice,
  getDeficiencySignals,
  getSortedDomains,
  getAdvicePrimaryDomain,
  type DomainScores,
} from "@/lib/intake-engine";
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

// ─── calcDomainScores ─────────────────────────────────────────────

describe("calcDomainScores", () => {
  it("returns all zeros for empty answers", () => {
    const scores = calcDomainScores({});
    expect(scores.sleep_score).toBe(0);
    expect(scores.energy_score).toBe(0);
    expect(scores.stress_score).toBe(0);
    expect(scores.nutrition_score).toBe(0);
    expect(scores.movement_score).toBe(0);
    expect(scores.recovery_score).toBe(0);
  });

  it("calculates sleep_score from SLP_QUAL + SLP_CONS + SLP_ONSET + SLP_WAKE (max 15)", () => {
    const scores = calcDomainScores(
      makeAnswers({ SLP_QUAL: 4, SLP_CONS: 3, SLP_ONSET: 4, SLP_WAKE: 4 }),
    );
    expect(scores.sleep_score).toBe(100);
  });

  it("calculates energy_score from NRG_PATN + NRG_DEP (max 8)", () => {
    const scores = calcDomainScores(makeAnswers({ NRG_PATN: 4, NRG_DEP: 4 }));
    expect(scores.energy_score).toBe(100);
  });

  it("calculates stress_score from STR_FREQ + STR_RCV (max 8)", () => {
    const scores = calcDomainScores(makeAnswers({ STR_FREQ: 4, STR_RCV: 4 }));
    expect(scores.stress_score).toBe(100);
  });

  it("calculates nutrition_score from NUT_O3 + NUT_PROT (max 7)", () => {
    const scores = calcDomainScores(makeAnswers({ NUT_O3: 3, NUT_PROT: 4 }));
    expect(scores.nutrition_score).toBe(100);
  });

  it("calculates movement_score from MOV_STR + MOV_CARD (max 8)", () => {
    const scores = calcDomainScores(
      makeAnswers({ MOV_STR: 4, MOV_CARD: 4 }),
    );
    expect(scores.movement_score).toBe(100);
  });

  it("calculates recovery_score from RCV_PHYS only (max 3)", () => {
    const scores = calcDomainScores(makeAnswers({ RCV_PHYS: 3, STR_RCV: 4 }));
    expect(scores.recovery_score).toBe(100);
  });

  it("does not count STR_RCV in recovery_score (stress only)", () => {
    const withHighStressRecovery = calcDomainScores(
      makeAnswers({ RCV_PHYS: 1, STR_RCV: 4 }),
    );
    const withLowStressRecovery = calcDomainScores(
      makeAnswers({ RCV_PHYS: 1, STR_RCV: 1 }),
    );
    expect(withHighStressRecovery.recovery_score).toBe(
      withLowStressRecovery.recovery_score,
    );
    expect(withHighStressRecovery.recovery_score).toBeLessThan(50);
  });

  it("reads legacy STR_RECV for stress when STR_RCV is absent", () => {
    const scores = calcDomainScores({ STR_FREQ: 4, STR_RECV: 4, RCV_PHYS: 3 });
    expect(scores.stress_score).toBe(100);
    expect(scores.recovery_score).toBe(100);
  });

  it("normalizes partial scores correctly", () => {
    const scores = calcDomainScores(
      makeAnswers({ SLP_QUAL: 2, SLP_CONS: 1, SLP_ONSET: 0, SLP_WAKE: 0 }),
    );
    expect(scores.sleep_score).toBe(Math.round((3 / 15) * 100));
  });

  it("handles missing individual questions as 0", () => {
    const scores = calcDomainScores({ SLP_QUAL: 3 });
    expect(scores.sleep_score).toBe(Math.round((3 / 15) * 100));
    expect(scores.energy_score).toBe(0);
  });

  it("scores are bounded 0-100", () => {
    const scores = calcDomainScores(makeAnswers());
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("produces maximum scores when all answers are max", () => {
    const maxAnswers = makeAnswers({
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
    });
    const scores = calcDomainScores(maxAnswers);
    expect(scores.sleep_score).toBe(100);
    expect(scores.energy_score).toBe(100);
    expect(scores.stress_score).toBe(100);
    expect(scores.nutrition_score).toBe(100);
    expect(scores.movement_score).toBe(100);
    expect(scores.recovery_score).toBe(100);
  });
});

// ─── getUrgency ───────────────────────────────────────────────────

describe("getUrgency", () => {
  it("returns critical when 2+ domains are under 30", () => {
    const result = getUrgency(makeScores({ sleep_score: 20, stress_score: 25 }));
    expect(result.level).toBe("critical");
  });

  it("returns moderate when 1 domain is under 30", () => {
    const result = getUrgency(makeScores({ sleep_score: 20 }));
    expect(result.level).toBe("moderate");
  });

  it("returns moderate when 3+ intervention domains are under 50", () => {
    const result = getUrgency(
      makeScores({ sleep_score: 40, stress_score: 45, nutrition_score: 35 }),
    );
    expect(result.level).toBe("moderate");
  });

  it("returns healthy when all intervention domains above 60 (readout excluded)", () => {
    const result = getUrgency(
      makeScores({ sleep_score: 65, energy_score: 20, recovery_score: 15 }),
    );
    expect(result.level).toBe("healthy");
  });

  it("returns mild when all above 30 and 2+ under 60", () => {
    const result = getUrgency(makeScores({ sleep_score: 45, stress_score: 55 }));
    expect(result.level).toBe("mild");
  });

  it("returns correct label for critical", () => {
    const result = getUrgency(makeScores({ sleep_score: 10, stress_score: 15 }));
    expect(result.label).toBe("Meerdere domeinen vragen aandacht");
  });

  it("returns correct label for healthy", () => {
    const result = getUrgency(makeScores());
    expect(result.label).toBe("Sterke basis");
  });

  it("includes a color string", () => {
    const result = getUrgency(makeScores());
    expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

// ─── getProfileLabel ─────────────────────────────────────────────

describe("getProfileLabel", () => {
  it("returns 'Onrustige Slaper' when sleep < 40", () => {
    const scores = makeScores({ sleep_score: 30 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Onrustige Slaper");
    expect(result.domain).toBe("sleep");
    expect(result.score).toBe(30);
  });

  it("returns 'Stressdrager' when stress < 40 (and sleep >= 40)", () => {
    const scores = makeScores({ sleep_score: 50, stress_score: 30 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Stressdrager");
    expect(result.domain).toBe("stress");
  });

  it("prioritizes sleep over stress when both < 40", () => {
    const scores = makeScores({ sleep_score: 30, stress_score: 30 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Onrustige Slaper");
  });

  it("returns 'Lage Batterij' when energy < 40", () => {
    const scores = makeScores({ energy_score: 30 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Lage Batterij");
    expect(result.domain).toBe("energy");
  });

  it("returns 'Lage Batterij' when movement < 35", () => {
    const scores = makeScores({ movement_score: 30 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Lage Batterij");
    expect(result.domain).toBe("movement");
  });

  it("picks energy domain when both energy and movement are low and energy is lower", () => {
    const scores = makeScores({ energy_score: 25, movement_score: 30 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Lage Batterij");
    expect(result.domain).toBe("energy");
  });

  it("picks movement domain when movement is lower", () => {
    const scores = makeScores({ energy_score: 35, movement_score: 20 });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Lage Batterij");
    expect(result.domain).toBe("movement");
  });

  it("returns 'In Balans' when all scores > 60", () => {
    const scores = makeScores();
    const result = getProfileLabel(scores);
    expect(result.name).toBe("In Balans");
  });

  it("returns 'In Balans' when primary domain is nutrition", () => {
    const scores = makeScores({
      nutrition_score: 40,
      sleep_score: 70,
      stress_score: 70,
      energy_score: 70,
      movement_score: 70,
      recovery_score: 70,
    });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("In Balans");
    expect(result.domain).toBe("nutrition");
  });

  it("falls back from recovery domain to next named domain", () => {
    const scores = makeScores({
      recovery_score: 40,
      sleep_score: 45,
      stress_score: 70,
      energy_score: 70,
      movement_score: 70,
      nutrition_score: 70,
    });
    const result = getProfileLabel(scores);
    expect(result.name).toBe("Onrustige Slaper");
    expect(result.domain).toBe("sleep");
  });
});

// ─── getSortedDomains ─────────────────────────────────────────────

describe("getSortedDomains", () => {
  it("sorts domains from lowest to highest score", () => {
    const scores = makeScores({
      sleep_score: 40,
      energy_score: 80,
      stress_score: 20,
    });
    const sorted = getSortedDomains(scores);
    expect(sorted[0].domain).toBe("stress");
    expect(sorted[0].score).toBe(20);
    expect(sorted[sorted.length - 1].score).toBeGreaterThanOrEqual(sorted[0].score);
  });

  it("returns all 6 domains", () => {
    const sorted = getSortedDomains(makeScores());
    expect(sorted).toHaveLength(6);
  });

  it("maintains stable order for equal scores", () => {
    const scores = makeScores({
      sleep_score: 50,
      energy_score: 50,
      stress_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    });
    const sorted = getSortedDomains(scores);
    expect(sorted).toHaveLength(6);
    expect(sorted.every((d) => d.score === 50)).toBe(true);
  });

  it("maps score keys to correct domain IDs", () => {
    const sorted = getSortedDomains(makeScores());
    const domains = sorted.map((d) => d.domain);
    expect(domains).toContain("sleep");
    expect(domains).toContain("energy");
    expect(domains).toContain("stress");
    expect(domains).toContain("nutrition");
    expect(domains).toContain("movement");
    expect(domains).toContain("recovery");
  });
});

// ─── getAdvicePrimaryDomain ──────────────────────────────────────

describe("getAdvicePrimaryDomain", () => {
  it("returns sleep when sleep_score < 40 regardless of other scores", () => {
    const scores = makeScores({ sleep_score: 30, stress_score: 10 });
    expect(getAdvicePrimaryDomain(scores)).toBe("sleep");
  });

  it("returns the domain with lowest score when sleep >= 40", () => {
    const scores = makeScores({ sleep_score: 50, stress_score: 20 });
    expect(getAdvicePrimaryDomain(scores)).toBe("stress");
  });

  it("returns sleep at boundary (score = 39)", () => {
    const scores = makeScores({ sleep_score: 39 });
    expect(getAdvicePrimaryDomain(scores)).toBe("sleep");
  });

  it("does not force sleep at exactly 40", () => {
    const scores = makeScores({
      sleep_score: 40,
      stress_score: 30,
    });
    expect(getAdvicePrimaryDomain(scores)).toBe("stress");
  });
});

// ─── getDeficiencySignals ────────────────────────────────────────

describe("getDeficiencySignals", () => {
  it("detects omega3 deficiency when NUT_O3 <= 1", () => {
    const signals = getDeficiencySignals(makeAnswers({ NUT_O3: 1 }));
    expect(signals.omega3_deficiency).toBe(true);
  });

  it("does not flag omega3 when NUT_O3 > 1", () => {
    const signals = getDeficiencySignals(makeAnswers({ NUT_O3: 2 }));
    expect(signals.omega3_deficiency).toBe(false);
  });

  it("detects magnesium signal when SLP_QUAL <= 2 and STR_RCV <= 2", () => {
    const signals = getDeficiencySignals(makeAnswers({ SLP_QUAL: 2, STR_RCV: 2 }));
    expect(signals.magnesium_signal).toBe(true);
  });

  it("does not flag magnesium when sleep quality is fine", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ SLP_QUAL: 3, SLP_WAKE: 4, STR_RCV: 2 }),
    );
    expect(signals.magnesium_signal).toBe(false);
  });

  it("detects magnesium signal when SLP_WAKE <= 2", () => {
    const signals = getDeficiencySignals(makeAnswers({ SLP_WAKE: 1 }));
    expect(signals.magnesium_signal).toBe(true);
  });

  it("detects cortisol risk when stress high + inconsistent sleep + low energy", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ STR_FREQ: 1, SLP_CONS: 1, NRG_PATN: 2 }),
    );
    expect(signals.cortisol_risk).toBe(true);
  });

  it("does not flag cortisol when stress frequency is low (high answer)", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ STR_FREQ: 3, SLP_CONS: 1, NRG_PATN: 2 }),
    );
    expect(signals.cortisol_risk).toBe(false);
  });

  it("detects creatine signal when recovery is low and movement is high", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ MOV_CARD: 4, MOV_STR: 3, RCV_PHYS: 1, STR_RCV: 1 }),
    );
    expect(signals.creatine_signal).toBe(true);
  });

  it("does not flag creatine for sedentary low-recovery person", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ MOV_CARD: 1, MOV_STR: 1, RCV_PHYS: 1, STR_RCV: 3 }),
    );
    expect(signals.creatine_signal).toBe(false);
  });

  it("detects melatonine signal when sleep onset slow and stress manageable", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ SLP_ONSET: 1, STR_FREQ: 4 }),
    );
    expect(signals.melatonine_signal).toBe(true);
  });

  it("does not flag melatonine when stress is also high (low STR_FREQ answer)", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ SLP_ONSET: 1, STR_FREQ: 2 }),
    );
    expect(signals.melatonine_signal).toBe(false);
  });

  it("detects protein_gap_signal when NUT_PROT low and training load present", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ NUT_PROT: 1, MOV_STR: 3, MOV_CARD: 2 }),
    );
    expect(signals.protein_gap_signal).toBe(true);
  });

  it("detects protein_gap_signal when NUT_PROT low and slow physical recovery", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ NUT_PROT: 2, MOV_STR: 1, MOV_CARD: 1, RCV_PHYS: 1 }),
    );
    expect(signals.protein_gap_signal).toBe(true);
  });

  it("does not flag protein_gap when NUT_PROT low but sedentary with ok recovery", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ NUT_PROT: 1, MOV_STR: 1, MOV_CARD: 1, RCV_PHYS: 3 }),
    );
    expect(signals.protein_gap_signal).toBe(false);
  });

  it("does not flag protein_gap when protein intake is adequate", () => {
    const signals = getDeficiencySignals(
      makeAnswers({ NUT_PROT: 4, MOV_STR: 4, RCV_PHYS: 1 }),
    );
    expect(signals.protein_gap_signal).toBe(false);
  });
});

// ─── getAdvice ───────────────────────────────────────────────────

describe("getAdvice", () => {
  it("returns quickWins, supplements, and longTerm arrays", () => {
    const scores = makeScores();
    const result = getAdvice(scores, makeAnswers(), []);
    expect(result).toHaveProperty("quickWins");
    expect(result).toHaveProperty("supplements");
    expect(result).toHaveProperty("longTerm");
    expect(Array.isArray(result.quickWins)).toBe(true);
    expect(Array.isArray(result.supplements)).toBe(true);
    expect(Array.isArray(result.longTerm)).toBe(true);
  });

  it("returns max 3 quickWins", () => {
    const scores = makeScores({ sleep_score: 20, stress_score: 20, energy_score: 20 });
    const answers = makeAnswers({
      SLP_QUAL: 1, SLP_CONS: 1, STR_FREQ: 1, STR_RCV: 1,
      NRG_PATN: 1, NRG_DEP: 1, NUT_O3: 1,
    });
    const result = getAdvice(scores, answers, ["slaap", "stress", "energie"]);
    expect(result.quickWins.length).toBeLessThanOrEqual(3);
  });

  it("returns max 3 supplements", () => {
    const scores = makeScores({ sleep_score: 20, stress_score: 20, energy_score: 20 });
    const answers = makeAnswers({
      SLP_QUAL: 1, SLP_CONS: 1, STR_FREQ: 1, STR_RCV: 1,
      NRG_PATN: 1, NRG_DEP: 1, NUT_O3: 1, MOV_CARD: 4, RCV_PHYS: 1,
    });
    const result = getAdvice(scores, answers, []);
    expect(result.supplements.length).toBeLessThanOrEqual(3);
  });

  it("returns max 3 longTerm items", () => {
    const scores = makeScores({ sleep_score: 20, stress_score: 20 });
    const answers = makeAnswers({
      SLP_QUAL: 1, SLP_CONS: 1, STR_FREQ: 1, STR_RCV: 1, NUT_O3: 1,
    });
    const result = getAdvice(scores, answers, ["slaap", "stress"]);
    expect(result.longTerm.length).toBeLessThanOrEqual(3);
  });

  it("provides fallback quickWin when no specific triggers", () => {
    const scores = makeScores();
    const result = getAdvice(scores, makeAnswers(), []);
    expect(result.quickWins.length).toBeGreaterThanOrEqual(1);
  });

  it("provides fallback longTerm when no specific triggers", () => {
    const scores = makeScores();
    const result = getAdvice(scores, makeAnswers(), []);
    expect(result.longTerm.length).toBeGreaterThanOrEqual(1);
  });

  it("recommends magnesium when sleep and stress both low", () => {
    const scores = makeScores({ sleep_score: 30, stress_score: 30 });
    const answers = makeAnswers({ SLP_QUAL: 1, SLP_CONS: 1, STR_FREQ: 1, STR_RCV: 1 });
    const result = getAdvice(scores, answers, []);
    const names = result.supplements.map((s) => s.name);
    expect(names).toContain("Magnesium glycinaat");
  });

  it("recommends omega-3 when NUT_O3 is low", () => {
    const scores = makeScores({ nutrition_score: 40 });
    const answers = makeAnswers({ NUT_O3: 1 });
    const result = getAdvice(scores, answers, []);
    const names = result.supplements.map((s) => s.name);
    expect(names).toContain("Omega-3 (EPA/DHA)");
  });

  it("recommends magnesium when sleep onset is slow but stress is manageable", () => {
    const scores = makeScores({ sleep_score: 30 });
    const answers = makeAnswers({ SLP_ONSET: 1, STR_FREQ: 4 });
    const result = getAdvice(scores, answers, []);
    const names = result.supplements.map((s) => s.name);
    expect(names).toContain("Magnesium glycinaat");
  });

  it("recommends vitamine D when sun exposure is low", () => {
    const scores = makeScores();
    const answers = makeAnswers({ LIF_SUN: 1 });
    const result = getAdvice(scores, answers, []);
    const names = result.supplements.map((s) => s.name);
    expect(names).toContain("Vitamine D");
  });

  it("deduplicates supplement recommendations", () => {
    const scores = makeScores({ sleep_score: 20, stress_score: 20, recovery_score: 20 });
    const answers = makeAnswers({
      SLP_QUAL: 1, SLP_CONS: 1, STR_FREQ: 1, STR_RCV: 1,
      NRG_PATN: 1, MOV_CARD: 4, RCV_PHYS: 1,
    });
    const result = getAdvice(scores, answers, []);
    const names = result.supplements.map((s) => s.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });

  it("supplements have name, reason, and link", () => {
    const scores = makeScores({ sleep_score: 20, stress_score: 20 });
    const answers = makeAnswers({ SLP_QUAL: 1, SLP_CONS: 1, STR_FREQ: 1, STR_RCV: 1 });
    const result = getAdvice(scores, answers, []);
    for (const supp of result.supplements) {
      expect(supp.name).toBeTruthy();
      expect(supp.reason).toBeTruthy();
      expect(supp.link).toBeTruthy();
    }
  });

  it("adds cortisol-related advice when cortisol risk is detected", () => {
    const scores = makeScores({ stress_score: 20, sleep_score: 20, energy_score: 30 });
    const answers = makeAnswers({
      STR_FREQ: 1, SLP_CONS: 1, NRG_PATN: 1, STR_RCV: 1, SLP_QUAL: 1,
    });
    const result = getAdvice(scores, answers, []);
    const names = result.supplements.map((s) => s.name);
    expect(names).toContain("Magnesium glycinaat");
    expect(names).not.toContain("Ashwagandha");
  });

  it("includes symptom-specific advice when symptoms are selected", () => {
    const scores = makeScores();
    const result = getAdvice(scores, makeAnswers(), ["slaap"]);
    const hasSleepTip = result.quickWins.some(
      (w) => w.includes("koel") || w.includes("donker"),
    );
    expect(hasSleepTip).toBe(true);
  });
});

// ─── K1–K3 cross-domain signals ───────────────────────────────────

describe("K1 lowRecoveryNoLoad", () => {
  it("triggers when recovery low and movement load minimal", () => {
    const answers = makeAnswers({
      RCV_PHYS: 1,
      STR_RCV: 1,
      MOV_CARD: 1,
      MOV_STR: 1,
    });
    const scores = calcDomainScores(answers);
    const signals = getDeficiencySignals(answers);
    expect(signals.low_recovery_no_load).toBe(true);
    expect(scores.recovery_score).toBeLessThan(45);

    const advice = getAdvice(scores, answers, []);
    expect(
      advice.quickWins.some((w) => w.includes("Meer trainen is nu niet")),
    ).toBe(true);
  });

  it("does not trigger at recovery boundary 45", () => {
    const answers = makeAnswers({
      MOV_CARD: 1,
      MOV_STR: 1,
      RCV_PHYS: 3,
      STR_RCV: 3,
    });
    const scores = calcDomainScores(answers);
    expect(scores.recovery_score).toBeGreaterThanOrEqual(45);
    const signals = getDeficiencySignals(answers);
    expect(signals.low_recovery_no_load).toBe(false);
  });

  it("does not trigger when movement load is 2 or higher", () => {
    const answers = makeAnswers({ MOV_CARD: 2, MOV_STR: 1, RCV_PHYS: 1 });
    const scores = calcDomainScores(answers);
    expect(getMovementLoadFromAnswers(answers)).toBeGreaterThanOrEqual(2);
    void scores;
    const signals = getDeficiencySignals(answers);
    expect(signals.low_recovery_no_load).toBe(false);
  });
});

function getMovementLoadFromAnswers(answers: Record<string, number>): number {
  return Math.max(answers.MOV_CARD ?? 0, answers.MOV_STR ?? 0);
}

describe("K2 sleepIssueNoStress", () => {
  it("triggers when sleep onset slow and stress manageable", () => {
    const answers = makeAnswers({ SLP_ONSET: 1, STR_FREQ: 4 });
    const signals = getDeficiencySignals(answers);
    expect(signals.sleep_issue_no_stress).toBe(true);
    expect(signals.melatonine_signal).toBe(true);

    const scores = calcDomainScores(answers);
    const advice = getAdvice(scores, answers, []);
    expect(advice.quickWins.some((w) => w.includes("bedtijd"))).toBe(true);
    expect(advice.quickWins.some((w) => w.includes("Schermen weg"))).toBe(true);
  });

  it("does not trigger when stress is also high (low STR_FREQ)", () => {
    const answers = makeAnswers({ SLP_ONSET: 1, STR_FREQ: 2 });
    const signals = getDeficiencySignals(answers);
    expect(signals.sleep_issue_no_stress).toBe(false);
  });
});

describe("K3 energyDipUnexplained", () => {
  it("triggers when energy low but sleep and nutrition adequate", () => {
    const scores = makeScores({
      energy_score: 35,
      sleep_score: 55,
      nutrition_score: 55,
    });
    const answers = makeAnswers({ NRG_PATN: 2, NRG_DEP: 2 });
    const advice = getAdvice(scores, answers, []);
    expect(advice.quickWins.some((w) => w.includes("wandelen"))).toBe(true);
    expect(advice.quickWins.some((w) => w.includes("daglicht"))).toBe(true);
  });

  it("does not trigger when sleep score is below 50", () => {
    const scores = makeScores({
      energy_score: 35,
      sleep_score: 45,
      nutrition_score: 55,
    });
    const answers = makeAnswers({ NRG_PATN: 2, NRG_DEP: 2 });
    const advice = getAdvice(scores, answers, []);
    expect(
      advice.quickWins.some((w) => w.includes("15 minuten wandelen na de lunch")),
    ).toBe(false);
  });

  it("boundary: energy 39 triggers via getAdvice scores", () => {
    const scores = makeScores({
      energy_score: 39,
      sleep_score: 50,
      nutrition_score: 50,
    });
    const answers = makeAnswers();
    const advice = getAdvice(scores, answers, []);
    expect(
      advice.quickWins.some((w) => w.includes("15 minuten wandelen na de lunch")),
    ).toBe(true);
  });
});
