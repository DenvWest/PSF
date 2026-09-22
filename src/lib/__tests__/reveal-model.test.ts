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
    connection_score: 68,
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
    connection_score: 68,
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
    connection_score: 57,
  };
}

describe("buildRevealModel", () => {
  /**
   * De meting en de bestemming lopen hier bewust uiteen.
   *
   * `primaryTheme` blijft "stress": dat is wat de check heeft vastgesteld, en
   * die uitkomst mag niet veranderen omdat de interface verandert — anders
   * leest een hermeting als vooruitgang die er niet is.
   *
   * `primaryPillarId` volgt de interface wél: stress is verborgen
   * (`zichtbare-domeinen.ts`), dus de kop wijst naar het laagst scorende
   * zichtbare domein in plaats van naar een scherm dat niet bestaat.
   */
  it("meet stress maar wijst naar een zichtbaar domein", () => {
    const model = buildRevealModel(
      scoresWithStressPriority(),
      EMPTY_ANSWERS,
      ["stress"],
    );

    expect(model.primaryTheme).toBe("stress");
    expect(model.recognitionLine).toBe("Je begon met minder rust en meer prikkelbaarheid.");
    expect(model.driverLine).toContain("stress");

    expect(model.primaryPillarId).not.toBe("stress");
    expect(model.priority.id).toBe(model.ladder[0]?.id);
    expect(model.priority.id).not.toBe("stress");

    expect(model.lifestyle).toHaveLength(2);
    expect(model.lifestyle[0].role).toBe("prioriteit");
    expect(model.lifestyle[0].win.title).toBe(model.priority.quickWin.title);
    expect(model.lifestyle[1].role).toBe("kracht");
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
    expect(model.priority.id).toBe("voeding");
    // movement<50 + nutrition<45 → primary-theme refinement kiest nutrition
    expect(model.primaryTheme).toBe("nutrition");
    expect(model.primaryPillarId).toBe("voeding");
    expect(model.primaryPillarHref).toBe("/voeding-na-40");
    expect(model.driverLine).toContain("beweging");
    expect("profileName" in model).toBe(false);
  });

  it("primaryPillarId === priority.id voor élke score-vector (ook energie/herstel laagst)", () => {
    const energieLaagst: DomainScores = {
      sleep_score: 60, energy_score: 20, stress_score: 70,
      nutrition_score: 70, movement_score: 70, recovery_score: 70,
    connection_score: 70,
    };
    const herstelLaagst: DomainScores = {
      sleep_score: 60, energy_score: 70, stress_score: 70,
      nutrition_score: 70, movement_score: 70, recovery_score: 20,
    connection_score: 20,
    };
    for (const scores of [energieLaagst, herstelLaagst]) {
      const model = buildRevealModel(scores, EMPTY_ANSWERS);
      expect(model.priority.id).toBe(model.primaryPillarId);
      expect(["slaap", "stress", "voeding", "beweging", "verbinding"]).toContain(model.priority.id);
    }
  });

  it("gebruikt de geïnjecteerde primaryTheme i.p.v. te herberekenen", () => {
    const model = buildRevealModel(scoresWithStressPriority(), EMPTY_ANSWERS, [], "sleep");
    expect(model.primaryTheme).toBe("sleep");
    expect(model.primaryPillarId).toBe("slaap");
    expect(model.priority.id).toBe("slaap");
  });
});
