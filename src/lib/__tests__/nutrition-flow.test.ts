import { describe, it, expect } from "vitest";
import {
  NUTRITION_BREADTH_SLIDER_IDS,
  NUTRITION_CORE_SLIDER_IDS,
  NUTRITION_CORE_SLIDER_IDS_AFTER_DIET,
  NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET,
  NUTRITION_FLOW,
  NUTRITION_META_QUESTIONS,
  NUTRITION_REQUIRED_STEP_COUNT,
  nutritionSliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";

describe("NUTRITION_FLOW — P1 volgorde", () => {
  it("groente → meta → noten + dieet-sliders → breedte", () => {
    const beforeCount = NUTRITION_CORE_SLIDER_IDS_BEFORE_DIET.length;
    const metaCount = NUTRITION_META_QUESTIONS.length;
    const afterCount = NUTRITION_CORE_SLIDER_IDS_AFTER_DIET.length;

    expect(beforeCount).toBe(1);
    expect(NUTRITION_FLOW[0].id).toBe("vegetables");

    expect(NUTRITION_FLOW[beforeCount].id).toBe("allergies");
    expect(NUTRITION_FLOW[beforeCount + 1].id).toBe("preference");

    expect(NUTRITION_FLOW[beforeCount + metaCount].id).toBe("nutsSeedsLegumes");
    expect(NUTRITION_FLOW[beforeCount + metaCount + 1].id).toBe("oilyFish");

    for (let i = 0; i < afterCount; i++) {
      const item = NUTRITION_FLOW[beforeCount + metaCount + i];
      expect(item.kind).toBe("slider");
      if (item.kind === "slider") {
        expect(NUTRITION_CORE_SLIDER_IDS_AFTER_DIET[i]).toBe(item.id);
      }
    }

    for (let i = 0; i < NUTRITION_BREADTH_SLIDER_IDS.length; i++) {
      const item = NUTRITION_FLOW[beforeCount + metaCount + afterCount + i];
      expect(item.kind).toBe("slider");
      if (item.kind === "slider") {
        expect(NUTRITION_BREADTH_SLIDER_IDS[i]).toBe(item.id);
      }
    }
  });

  it("required step count = kern + meta", () => {
    expect(NUTRITION_REQUIRED_STEP_COUNT).toBe(
      NUTRITION_CORE_SLIDER_IDS.length + NUTRITION_META_QUESTIONS.length,
    );
  });

  it("oilyFish defaultIndex is 0 (Nooit)", () => {
    expect(nutritionSliderQuestion("oilyFish")?.defaultIndex).toBe(0);
  });
});

describe("breadth skip — defaults ongewijzigd", () => {
  it("alleen kern-defaults geeft zelfde report als volledige defaults voor kern-velden", () => {
    const coreOnly: Record<string, number> = {};
    const fullDefaults: Record<string, number> = {};

    for (const id of NUTRITION_CORE_SLIDER_IDS) {
      const q = nutritionSliderQuestion(id);
      if (q) {
        coreOnly[id] = q.defaultIndex;
        fullDefaults[id] = q.defaultIndex;
      }
    }
    for (const id of NUTRITION_BREADTH_SLIDER_IDS) {
      const q = nutritionSliderQuestion(id);
      if (q) {
        fullDefaults[id] = q.defaultIndex;
      }
    }

    const coreReport = nutritionReportFromAnswers(coreOnly);
    const fullReport = nutritionReportFromAnswers(fullDefaults);

    expect(coreReport).toEqual(fullReport);
  });
});
