import { afterEach, describe, expect, it, vi } from "vitest";
import type { DomainScores } from "@/lib/intake-engine";
import {
  getPrimaryTheme,
  getSecondaryTheme,
  type MeasuredPillarId,
} from "@/lib/primary-theme";

function baseScores(overrides: Partial<DomainScores> = {}): DomainScores {
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

const MEASURED_PILLARS: MeasuredPillarId[] = [
  "sleep",
  "stress",
  "nutrition",
  "movement",
];

describe("getPrimaryTheme", () => {
  it("picks sleep when sleep_score is lowest", () => {
    const scores = baseScores({ sleep_score: 25 });
    expect(getPrimaryTheme(scores, {})).toBe("sleep");
  });

  it("picks stress when stress_score is lowest", () => {
    const scores = baseScores({ stress_score: 25 });
    expect(getPrimaryTheme(scores, {})).toBe("stress");
  });

  it("picks nutrition when nutrition_score is lowest", () => {
    const scores = baseScores({ nutrition_score: 25 });
    expect(getPrimaryTheme(scores, {})).toBe("nutrition");
  });

  it("picks movement when movement_score is lowest", () => {
    const scores = baseScores({ movement_score: 25 });
    expect(getPrimaryTheme(scores, {})).toBe("movement");
  });

  it("overrides to movement for overtrainer pattern", () => {
    const scores = baseScores({ sleep_score: 10, movement_score: 80 });
    const answers = { MOV_STR: 4, RCV_PHYS: 1 };
    expect(getPrimaryTheme(scores, answers)).toBe("movement");
  });

  it("uses tiebreak sleep > stress > nutrition > movement when scores tie", () => {
    const scores = baseScores({
      sleep_score: 50,
      stress_score: 50,
      nutrition_score: 50,
      movement_score: 50,
    });
    expect(getPrimaryTheme(scores, {})).toBe("sleep");
  });

  it("never returns connection", () => {
    const scores = baseScores({ sleep_score: 10 });
    const theme = getPrimaryTheme(scores, {});
    expect(MEASURED_PILLARS).toContain(theme);
    expect(theme).not.toBe("connection");
  });

  it("still picks lowest measured pillar when all scores >= 80", () => {
    const scores = baseScores({
      sleep_score: 95,
      stress_score: 88,
      nutrition_score: 82,
      movement_score: 90,
    });
    expect(getPrimaryTheme(scores, {})).toBe("nutrition");
  });

  it("falls back to sleep and logs when no finite scores", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const scores = baseScores({
      sleep_score: Number.NaN,
      stress_score: Number.NaN,
      nutrition_score: Number.NaN,
      movement_score: Number.NaN,
    });
    expect(getPrimaryTheme(scores, {})).toBe("sleep");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("overrides movement to stress when movement is lowest and stress is below 40", () => {
    const scores = baseScores({ movement_score: 30, stress_score: 35 });
    expect(getPrimaryTheme(scores, {})).toBe("stress");
  });

  it("overrides movement to nutrition when movement is lowest and nutrition is below 45", () => {
    const scores = baseScores({ movement_score: 30, nutrition_score: 40 });
    expect(getPrimaryTheme(scores, {})).toBe("nutrition");
  });

  it("prefers nutrition over stress when both thresholds are met", () => {
    const scores = baseScores({
      movement_score: 30,
      nutrition_score: 40,
      stress_score: 35,
    });
    expect(getPrimaryTheme(scores, {})).toBe("nutrition");
  });

  it("keeps movement when lowest but no nutrition or stress threshold is met", () => {
    const scores = baseScores({
      movement_score: 30,
      stress_score: 55,
      nutrition_score: 60,
    });
    expect(getPrimaryTheme(scores, {})).toBe("movement");
  });

  it("keeps sleep when sleep is lowest even with low movement", () => {
    const scores = baseScores({ sleep_score: 30, movement_score: 35 });
    expect(getPrimaryTheme(scores, {})).toBe("sleep");
  });

  it("keeps overtrainer override to movement despite low nutrition and stress", () => {
    const scores = baseScores({
      movement_score: 30,
      nutrition_score: 40,
      stress_score: 35,
    });
    const answers = { MOV_STR: 4, RCV_PHYS: 1 };
    expect(getPrimaryTheme(scores, answers)).toBe("movement");
  });
});

describe("getSecondaryTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when fewer than two pillars are below 40", () => {
    const scores = baseScores({ sleep_score: 20, stress_score: 70 });
    expect(getSecondaryTheme(scores, {}, "sleep")).toBeNull();
  });

  it("returns the second lowest pillar when two are below 40", () => {
    const scores = baseScores({ sleep_score: 15, stress_score: 30 });
    expect(getSecondaryTheme(scores, {}, "sleep")).toBe("stress");
  });

  it("excludes the primary theme from the result", () => {
    const scores = baseScores({
      sleep_score: 10,
      stress_score: 20,
      nutrition_score: 35,
    });
    expect(getSecondaryTheme(scores, {}, "sleep")).toBe("stress");
  });

  it("returns null when the only other low pillar is the primary", () => {
    const scores = baseScores({ movement_score: 25, sleep_score: 30 });
    expect(getSecondaryTheme(scores, {}, "movement")).toBe("sleep");
  });
});
