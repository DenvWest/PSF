import { describe, expect, it } from "vitest";
import {
  DASHBOARD_UNLOCK_FAQ,
  DASHBOARD_UNLOCK_HOWTO,
  DASHBOARD_UNLOCK_STEPS,
} from "@/data/dashboard-unlock";
import { HOW_IT_WORKS_QUESTIONS } from "@/data/how-it-works";

describe("how-it-works", () => {
  it("asks the three questions in order: need, food, supplement", () => {
    expect(HOW_IT_WORKS_QUESTIONS.map((item) => item.id)).toEqual([
      "nodig",
      "voeding",
      "supplement",
    ]);
  });

  it("numbers the route steps sequentially and mirrors them in the HowTo schema", () => {
    expect(DASHBOARD_UNLOCK_STEPS.map((step) => step.step)).toEqual(
      DASHBOARD_UNLOCK_STEPS.map((_, index) => index + 1),
    );
    expect(DASHBOARD_UNLOCK_HOWTO.steps).toHaveLength(DASHBOARD_UNLOCK_STEPS.length);
  });

  it("no longer refers to the retired Leefstijlcheck", () => {
    const copy = JSON.stringify([
      HOW_IT_WORKS_QUESTIONS,
      DASHBOARD_UNLOCK_STEPS,
      DASHBOARD_UNLOCK_FAQ,
    ]);
    expect(copy).not.toMatch(/Leefstijlcheck/i);
  });
});
