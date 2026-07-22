import { describe, expect, it } from "vitest";
import {
  buildAnchorWhySuffix,
  EMPTY_MOVEMENT_PREFS,
  parseMovementPrefs,
  resolvePatternTrainingStepId,
  startPatternLabel,
} from "@/lib/movement-prefs";
import type { DomainScores } from "@/lib/intake-engine";

const SCORES: DomainScores = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 60,
  recovery_score: 60,
  connection_score: 60,
};

describe("parseMovementPrefs", () => {
  it("leest geldige enums uit een answers-jsonb", () => {
    expect(
      parseMovementPrefs({
        MOV_STR: 2,
        preferredStartPattern: "kracht",
        movementAnchor: "zelfstandigheid",
      }),
    ).toEqual({ startPattern: "kracht", anchor: "zelfstandigheid" });
  });

  it("negeert ongeldige of ontbrekende waarden", () => {
    expect(parseMovementPrefs(null)).toEqual(EMPTY_MOVEMENT_PREFS);
    expect(parseMovementPrefs([])).toEqual(EMPTY_MOVEMENT_PREFS);
    expect(
      parseMovementPrefs({ preferredStartPattern: "squat", movementAnchor: 3 }),
    ).toEqual(EMPTY_MOVEMENT_PREFS);
  });
});

describe("buildAnchorWhySuffix", () => {
  it("levert de §5a-suffix per anker en null zonder anker", () => {
    expect(buildAnchorWhySuffix("meedoen")).toContain("mee te doen");
    expect(buildAnchorWhySuffix(null)).toBeNull();
  });
});

describe("startPatternLabel", () => {
  it("mapt patroon naar zichtbaar label", () => {
    expect(startPatternLabel("dagelijks_ritme")).toBe("Dagelijks ritme");
  });
});

describe("resolvePatternTrainingStepId", () => {
  it("kiest een kracht-stap voor het kracht-patroon (starter, MOV_STR laag)", () => {
    const stepId = resolvePatternTrainingStepId(
      SCORES,
      { MOV_STR: 1, MOV_CARD: 1 },
      "kracht",
      "fallback-step",
    );
    expect(stepId).toBe("mov-thuis-basisoefening");
  });

  it("kiest een conditie-stap voor het conditie-patroon", () => {
    const stepId = resolvePatternTrainingStepId(
      SCORES,
      { MOV_STR: 1, MOV_CARD: 1 },
      "conditie",
      "fallback-step",
    );
    expect(stepId).toBe("mov-trap-of-wandeling");
  });

  it("valt terug op de day-model-stap bij dagelijks_ritme of zonder patroon", () => {
    expect(
      resolvePatternTrainingStepId(
        SCORES,
        { MOV_STR: 1 },
        "dagelijks_ritme",
        "fallback-step",
      ),
    ).toBe("fallback-step");
    expect(
      resolvePatternTrainingStepId(SCORES, { MOV_STR: 1 }, null, "fallback-step"),
    ).toBe("fallback-step");
  });

  it("kiest nooit de rustdag-stap als trainen-slot", () => {
    const stepId = resolvePatternTrainingStepId(
      SCORES,
      { MOV_STR: 3, MOV_CARD: 3 },
      "kracht",
      "fallback-step",
    );
    expect(stepId).not.toBe("mov-rustdag-na-inspanning");
  });
});
