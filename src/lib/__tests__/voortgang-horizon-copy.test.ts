import { describe, expect, it } from "vitest";
import { buildVoortgangHorizonRegel } from "@/lib/voortgang-horizon-copy";

const CAUSAL_WORDS = /\b(dus|daardoor|dankzij|omdat)\b/i;

function assertNoCausalWords(text: string) {
  expect(text).not.toMatch(CAUSAL_WORDS);
}

describe("buildVoortgangHorizonRegel", () => {
  it("returns wachtend when there is no cycle evidence yet", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: false,
      cycleDay: null,
      daysUntilRemeasure: 22,
      remeasureDueDate: "19 september",
      trendLength: 1,
      focusLabel: "Slaap",
      focusDelta: 0,
    });

    expect(result.state).toBe("wachtend");
    expect(result.h1).toBe("Je eerste beeld staat. Het tweede is waar het leesbaar wordt.");
    expect(result.body).toContain("Je hermeting staat op 19 september");
    assertNoCausalWords(result.body);
  });

  it("returns wachtend without a date when remeasureDueDate is null", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: false,
      cycleDay: null,
      daysUntilRemeasure: null,
      remeasureDueDate: null,
      trendLength: 1,
      focusLabel: "Slaap",
      focusDelta: 0,
    });

    expect(result.state).toBe("wachtend");
    expect(result.body).not.toContain("null");
  });

  it("returns onderweg when cycle evidence exists but there is only one measurement", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: true,
      cycleDay: 12,
      daysUntilRemeasure: 18,
      remeasureDueDate: "19 september",
      trendLength: 1,
      focusLabel: "Beweging",
      focusDelta: 0,
    });

    expect(result.state).toBe("onderweg");
    expect(result.eyebrow).toBe("JE CYCLUS · DAG 12 VAN 30");
    expect(result.h1).toBe("Dag 12 van je cyclus.");
    expect(result.body).toContain("Over 18 dagen doe je je hermeting");
    assertNoCausalWords(result.body);
  });

  it("returns tweede_beeld with hoger when focusDelta is positive", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: true,
      cycleDay: 32,
      daysUntilRemeasure: 3,
      remeasureDueDate: "19 september",
      trendLength: 2,
      focusLabel: "Slaap",
      focusDelta: 5,
    });

    expect(result.state).toBe("tweede_beeld");
    expect(result.body).toContain("slaap is sinds je start 5 punten hoger");
    assertNoCausalWords(result.body);
  });

  it("returns tweede_beeld with lager when focusDelta is negative", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: true,
      cycleDay: 32,
      daysUntilRemeasure: 3,
      remeasureDueDate: "19 september",
      trendLength: 3,
      focusLabel: "Stress",
      focusDelta: -4,
    });

    expect(result.state).toBe("tweede_beeld");
    expect(result.body).toContain("stress is sinds je start 4 punten lager");
  });

  it("returns tweede_beeld with neutral phrasing when focusDelta is zero", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: true,
      cycleDay: 32,
      daysUntilRemeasure: 3,
      remeasureDueDate: "19 september",
      trendLength: 2,
      focusLabel: "Voeding",
      focusDelta: 0,
    });

    expect(result.state).toBe("tweede_beeld");
    expect(result.body).toContain("voeding staat sinds je start op hetzelfde punt");
  });

  it("returns hermeting_klaar when daysUntilRemeasure is zero, regardless of trend length", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: true,
      cycleDay: 30,
      daysUntilRemeasure: 0,
      remeasureDueDate: "19 september",
      trendLength: 1,
      focusLabel: "Slaap",
      focusDelta: 0,
    });

    expect(result.state).toBe("hermeting_klaar");
    expect(result.h1).toBe("Je hermeting staat klaar.");
  });

  it("returns hermeting_klaar when daysUntilRemeasure is negative", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: true,
      cycleDay: 31,
      daysUntilRemeasure: -2,
      remeasureDueDate: "19 september",
      trendLength: 2,
      focusLabel: "Slaap",
      focusDelta: 3,
    });

    expect(result.state).toBe("hermeting_klaar");
  });

  it("hermeting_klaar takes precedence even without cycle evidence", () => {
    const result = buildVoortgangHorizonRegel({
      hasCycleEvidence: false,
      cycleDay: null,
      daysUntilRemeasure: -1,
      remeasureDueDate: "19 september",
      trendLength: 0,
      focusLabel: "Slaap",
      focusDelta: 0,
    });

    expect(result.state).toBe("hermeting_klaar");
  });
});
