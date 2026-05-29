import { describe, expect, it } from "vitest";
import type { DomainScores } from "@/lib/intake-engine";
import {
  getPrimaryTheme,
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
});
