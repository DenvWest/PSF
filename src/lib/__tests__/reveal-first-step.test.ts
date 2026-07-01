import { describe, expect, it } from "vitest";
import { PILLAR } from "@/data/dashboard";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import { REVEAL_FIRST_STEP_UPCOMING } from "@/lib/results-reveal-copy";
import { buildRevealModel } from "@/lib/reveal-model";
import { resolveRevealFirstStep } from "@/lib/reveal-first-step";
import type { DomainScores } from "@/lib/intake-engine";

function makeScores(overrides: Partial<DomainScores> = {}): DomainScores {
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

describe("resolveRevealFirstStep", () => {
  it("avoids alcohol headline when herstel is priority", () => {
    const scores = makeScores({ recovery_score: 25, sleep_score: 55 });
    const answers: Record<string, number> = {};
    const model = buildRevealModel(scores, answers);
    const input = buildRecommendationInput({ scores, answers });

    expect(model.priority.id).toBe("slaap");
    const step = resolveRevealFirstStep(model, input);

    expect(step.lifestyle.title.toLowerCase()).not.toContain("alcohol");
    expect(step.lifestyle.title).not.toBe(PILLAR.herstel.quickWin.title);
  });

  it("uses priority quickWin for voeding priority with supplement qualification", () => {
    const scores = makeScores({ nutrition_score: 20, recovery_score: 55 });
    const answers: Record<string, number> = {};
    const model = buildRevealModel(scores, answers);
    const input = buildRecommendationInput({ scores, answers });

    expect(model.priority.id).toBe("voeding");
    const step = resolveRevealFirstStep(model, input);

    expect(step.lifestyle.title).toBe(PILLAR.voeding.quickWin.title);
    expect(step.qualifiesForSupplement).toBe(true);
    expect(step.supplement?.name).toBe("Omega-3");
    expect(step.supplement?.signal.length).toBeGreaterThan(0);
    expect(step.supplement?.qualityRule).toContain("Leefstijl eerst");
  });

  it("shows selected pillar quickWin when user picks chip 2", () => {
    const scores = makeScores({
      stress_score: 25,
      nutrition_score: 35,
      recovery_score: 50,
      sleep_score: 55,
    });
    const answers: Record<string, number> = {};
    const model = buildRevealModel(scores, answers);
    const input = buildRecommendationInput({ scores, answers });

    expect(model.priority.id).toBe("stress");
    expect(model.topLadder[1]?.id).toBe("voeding");

    const step = resolveRevealFirstStep(model, input, {
      selectedPillar: model.topLadder[1],
    });

    expect(step.lifestyle.title).toBe(PILLAR.voeding.quickWin.title);
    expect(step.qualifiesForSupplement).toBe(true);
    expect(step.supplement?.name).toBe("Omega-3");
  });

  it("includes upcoming dashboard features", () => {
    const scores = makeScores({ recovery_score: 25 });
    const answers: Record<string, number> = {};
    const model = buildRevealModel(scores, answers);
    const input = buildRecommendationInput({ scores, answers });
    const step = resolveRevealFirstStep(model, input);

    expect(step.upcoming).toEqual(REVEAL_FIRST_STEP_UPCOMING);
    expect(step.upcoming.some((item) => item.label.includes("Prijs-kwaliteit"))).toBe(true);
  });
});
