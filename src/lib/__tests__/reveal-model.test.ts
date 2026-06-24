import { describe, it, expect } from "vitest";
import { buildRevealModel } from "@/lib/reveal-model";
import type { DomainScores } from "@/lib/intake-engine";

const EMPTY_ANSWERS: Record<string, number> = {};

function scoresWithStressPriority(): DomainScores {
  return {
    sleep_score: 52,
    energy_score: 45,
    stress_score: 38,
    nutrition_score: 43,
    movement_score: 62,
    recovery_score: 68,
  };
}

function scoresWithNutritionPriority(): DomainScores {
  return {
    sleep_score: 52,
    energy_score: 45,
    stress_score: 58,
    nutrition_score: 38,
    movement_score: 62,
    recovery_score: 68,
  };
}

function scoresScreenshotMismatch(): DomainScores {
  return {
    sleep_score: 40,
    energy_score: 38,
    stress_score: 38,
    nutrition_score: 29,
    movement_score: 25,
    recovery_score: 57,
  };
}

describe("buildRevealModel", () => {
  it("geeft stress als prioriteit met twee leefstijlstappen", () => {
    const model = buildRevealModel(
      scoresWithStressPriority(),
      EMPTY_ANSWERS,
      ["stress"],
    );
    expect(model.priority.id).toBe("stress");
    expect(model.lifestyle).toHaveLength(2);
    expect(model.lifestyle[0].win.title).toBe("Box-breathing, 4 minuten");
    expect(model.lifestyle[0].role).toBe("prioriteit");
    expect(model.lifestyle[1].role).toBe("kracht");
    expect(model.recognitionLine).toBe("Je begon met minder rust en meer prikkelbaarheid.");
    expect(model.driverLine).toContain("stress");
    expect(model.primaryTheme).toBe("stress");
    expect(model.primaryPillarId).toBe("stress");
    expect("profileName" in model).toBe(false);
    expect("supplement" in model).toBe(false);
  });

  it("toont top 3 pijlers in preview-ladder", () => {
    const model = buildRevealModel(
      scoresWithNutritionPriority(),
      EMPTY_ANSWERS,
      ["slaap"],
    );
    expect(model.priority.id).toBe("voeding");
    expect(model.topLadder).toHaveLength(3);
    expect(model.topLadder[0].id).toBe("voeding");
    expect(model.lifestyle[0].win.title).toBe("Eiwitrijk ontbijt");
    expect(model.recognitionLine).toBe("Je begon met moeite met slapen.");
    expect(model.primaryTheme).toBe("nutrition");
    expect(model.primaryPillarHref).toBe("/voeding-na-40");
  });

  it("primaryTheme en driverLine volgen scores, niet getProfileLabel-archetype", () => {
    const model = buildRevealModel(scoresScreenshotMismatch(), EMPTY_ANSWERS);
    expect(model.priority.id).toBe("beweging");
    // movement<50 + nutrition<45 → primary-theme refinement kiest nutrition
    expect(model.primaryTheme).toBe("nutrition");
    expect(model.primaryPillarId).toBe("voeding");
    expect(model.primaryPillarHref).toBe("/voeding-na-40");
    expect(model.driverLine).toContain("beweging");
    expect("profileName" in model).toBe(false);
  });
});
