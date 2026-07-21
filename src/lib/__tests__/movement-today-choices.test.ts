import { describe, expect, it } from "vitest";
import {
  buildMedicalSafetyLine,
  buildRecoveryRecommendationLine,
  inferCompletedChoice,
  resolveTodayChoiceOptions,
  shouldOverrideTodayFromRecovery,
  shouldRecommendRestChoice,
} from "@/lib/movement-today-choices";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";

describe("resolveTodayChoiceOptions", () => {
  it("maps herstel, licht and trainen to distinct step ids", () => {
    const options = resolveTodayChoiceOptions("mov-kracht-onderhoud-week");
    expect(options.map((option) => option.kind)).toEqual(["herstel", "licht", "trainen"]);
    expect(options[0]?.stepId).toBe(REST_DAY_STEP_ID);
    expect(options[1]?.stepId).toBe("mov-trap-of-wandeling");
    expect(options[2]?.stepId).toBe("mov-kracht-onderhoud-week");
  });
});

describe("inferCompletedChoice", () => {
  it("returns the matching choice kind from daily-log keys", () => {
    const options = resolveTodayChoiceOptions("mov-kracht-onderhoud-week");
    expect(inferCompletedChoice([REST_DAY_STEP_ID], options)).toBe("herstel");
    expect(inferCompletedChoice(["mov-trap-of-wandeling"], options)).toBe("licht");
    expect(inferCompletedChoice(["mov-kracht-onderhoud-week"], options)).toBe("trainen");
    expect(inferCompletedChoice([], options)).toBeNull();
  });
});

describe("recovery recommendation helpers", () => {
  it("uses intake wording without claiming today", () => {
    const line = buildRecoveryRecommendationLine({
      level: "rest",
      headline: "Je Leefstijlcheck: herstel verdient aandacht",
      body: "Herstel hoort bij opbouwen.",
      source: "intake",
      promoteRustdagStep: true,
      showMedicalNote: false,
      overrideToday: false,
      recommendRestChoice: true,
    });
    expect(line).toContain("Leefstijlcheck");
    expect(line).toContain("Kies wat vandaag klopt");
  });

  it("shows medical safety line separately", () => {
    const line = buildMedicalSafetyLine({
      level: "medical",
      headline: "medical",
      body: "Bespreek aanhoudende klachten met je huisarts.",
      source: "intake",
      promoteRustdagStep: true,
      showMedicalNote: true,
      overrideToday: false,
      recommendRestChoice: true,
    });
    expect(line).toContain("huisarts");
  });

  it("does not override today on intake-only hints", () => {
    const hint = {
      level: "rest" as const,
      headline: "x",
      body: "y",
      source: "intake" as const,
      promoteRustdagStep: true,
      showMedicalNote: false,
      overrideToday: false,
      recommendRestChoice: true,
    };
    expect(shouldRecommendRestChoice(hint)).toBe(true);
    expect(shouldOverrideTodayFromRecovery(hint)).toBe(false);
  });

  it("allows override flag for check-in sourced hints", () => {
    const hint = {
      level: "rest" as const,
      headline: "x",
      body: "y",
      source: "checkin" as const,
      promoteRustdagStep: true,
      showMedicalNote: false,
      overrideToday: true,
      recommendRestChoice: true,
    };
    expect(shouldOverrideTodayFromRecovery(hint)).toBe(true);
  });
});
