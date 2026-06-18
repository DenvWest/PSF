import { describe, it, expect } from "vitest";
import { buildRevealModel } from "@/lib/reveal-model";
import type { DomainScores } from "@/lib/intake-engine";

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

describe("buildRevealModel", () => {
  it("geeft stress als prioriteit met twee leefstijlstappen", () => {
    const model = buildRevealModel(scoresWithStressPriority(), false);
    expect(model.priority.id).toBe("stress");
    expect(model.lifestyle).toHaveLength(2);
    expect(model.lifestyle[0].win.title).toBe("Box-breathing, 4 minuten");
    expect(model.lifestyle[0].role).toBe("prioriteit");
    expect(model.lifestyle[1].role).toBe("kracht");
    expect("supplement" in model).toBe(false);
  });

  it("toont top 3 pijlers in preview-ladder", () => {
    const model = buildRevealModel(scoresWithNutritionPriority(), false);
    expect(model.priority.id).toBe("voeding");
    expect(model.topLadder).toHaveLength(3);
    expect(model.topLadder[0].id).toBe("voeding");
    expect(model.lifestyle[0].win.title).toBe("Eiwitrijk ontbijt");
  });

  it("toont Overtrainer als profielnaam wanneer patroon actief is", () => {
    const model = buildRevealModel(scoresWithStressPriority(), true);
    expect(model.profileName).toBe("Overtrainer");
  });
});
