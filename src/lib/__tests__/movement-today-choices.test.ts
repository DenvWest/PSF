import { describe, expect, it } from "vitest";
import {
  buildMedicalSafetyLine,
  buildMovementCheckinCta,
  buildRecoveryRecommendationLine,
  inferCompletedChoice,
  isRcvFeelWithinDays,
  resolveChoiceDoneDisplay,
  resolveRcvFeelForRecoveryHint,
  resolveTodayChoiceOptions,
  shouldOverrideTodayFromRecovery,
  shouldRecommendRestChoice,
} from "@/lib/movement-today-choices";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";
import {
  parseFullMovementReport,
  parseMovementCheckinMode,
  parsePulseMovementReport,
} from "@/lib/movement-checkin-parse";

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

describe("resolveChoiceDoneDisplay", () => {
  it("shows unchecked on fresh select even when step id is in log", () => {
    expect(
      resolveChoiceDoneDisplay([REST_DAY_STEP_ID], REST_DAY_STEP_ID, "fresh_select", false),
    ).toBe(false);
  });

  it("shows done on hydrate when key is in log", () => {
    expect(
      resolveChoiceDoneDisplay([REST_DAY_STEP_ID], REST_DAY_STEP_ID, "hydrate", false),
    ).toBe(true);
  });

  it("follows toggle state after explicit mark done", () => {
    expect(
      resolveChoiceDoneDisplay([], REST_DAY_STEP_ID, "toggled", true),
    ).toBe(true);
  });
});

describe("rcvFeel freshness helpers", () => {
  const recentAt = new Date(Date.now() - 2 * 86_400_000).toISOString();
  const staleAt = new Date(Date.now() - 10 * 86_400_000).toISOString();

  it("uses fresh rcvFeel for recovery hint only within 7 days", () => {
    expect(resolveRcvFeelForRecoveryHint(2, recentAt)).toBe(2);
    expect(resolveRcvFeelForRecoveryHint(2, staleAt)).toBeUndefined();
  });

  it("builds check-in CTA copy from freshness and recommendation", () => {
    expect(buildMovementCheckinCta({ rcvFeelAt: recentAt, restRecommended: true })).toBeNull();
    expect(buildMovementCheckinCta({ rcvFeelAt: null, restRecommended: false })?.label).toBe(
      "Check in voor vandaag",
    );
    expect(
      buildMovementCheckinCta({ rcvFeelAt: staleAt, restRecommended: true })?.label,
    ).toBe("Update je herstel");
  });

  it("detects rcvFeel within days window", () => {
    expect(isRcvFeelWithinDays(recentAt, 7)).toBe(true);
    expect(isRcvFeelWithinDays(staleAt, 7)).toBe(false);
  });
});

describe("movement checkin parse", () => {
  it("parses pulse mode flag", () => {
    expect(parseMovementCheckinMode("pulse")).toBe("pulse");
    expect(parseMovementCheckinMode("full")).toBe("full");
  });

  it("accepts pulse report with RCV_FEEL only", () => {
    expect(parsePulseMovementReport({ RCV_FEEL: 3 })).toEqual({ RCV_FEEL: 3 });
    expect(parsePulseMovementReport({ RCV_FEEL: 0 })).toBeNull();
  });

  it("requires all fields for full report", () => {
    const full = {
      MOV2_STR: 3,
      MOV2_CARD: 3,
      MOV2_VIG: 3,
      MOV2_SIT: 3,
      MOV2_COND: 3,
      RCV_FEEL: 3,
      MOV2_PAIN: 3,
      MOV2_MOB: 3,
      MOV2_FUNC: 3,
      MOV2_CONSIST: 3,
      MOV2_MOTIV: 3,
    };
    expect(parseFullMovementReport(full)).toEqual(full);
    expect(parseFullMovementReport({ RCV_FEEL: 3 })).toBeNull();
  });
});
