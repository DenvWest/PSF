import { describe, expect, it } from "vitest";
import type { DomainScores } from "@/lib/intake-engine";
import { getRecognitionLine, getVitalityFraming } from "@/lib/results-framing";

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

describe("getRecognitionLine", () => {
  it("spiegelt één symptoom terug", () => {
    expect(getRecognitionLine(["slaap"])).toBe("Je begon met moeite met slapen.");
  });

  it("voegt meerdere symptomen samen met 'en'", () => {
    expect(getRecognitionLine(["slaap", "energie"])).toBe(
      "Je begon met moeite met slapen en een lege batterij.",
    );
  });

  it("geeft null zonder symptomen", () => {
    expect(getRecognitionLine([])).toBeNull();
  });
});

describe("getVitalityFraming", () => {
  it("noemt de twee zwakste gebieden als driver", () => {
    const framing = getVitalityFraming(
      baseScores({ sleep_score: 30, stress_score: 45, nutrition_score: 85 }),
    );
    expect(framing.driverLine).toBe("Vooral slaap en stress vragen nu aandacht.");
  });

  it("gebruikt enkelvoud bij één zwak gebied en noemt het sterkste gebied", () => {
    const framing = getVitalityFraming(
      baseScores({ sleep_score: 30, nutrition_score: 85 }),
    );
    expect(framing.driverLine).toBe("Vooral je slaap vraagt nu aandacht.");
    expect(framing.strengthLine).toBe(
      "Je voeding staat er goed voor — daar bouw je op voort.",
    );
  });

  it("geeft geen driver wanneer alles voldoende is", () => {
    expect(getVitalityFraming(baseScores()).driverLine).toBeNull();
  });

  it("geeft geen valse lof wanneer alles zwak is", () => {
    const framing = getVitalityFraming(
      baseScores({
        sleep_score: 20,
        stress_score: 25,
        nutrition_score: 30,
        movement_score: 35,
        recovery_score: 38,
      }),
    );
    expect(framing.strengthLine).toBeNull();
  });
});
