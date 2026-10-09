import { describe, expect, it } from "vitest";
import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";
import { buildHubPersonalization } from "@/lib/supplement-hub/hub-personalization";

const SLIDER_IDS = [
  "vegetables",
  "fruit",
  "berries",
  "nutsSeedsLegumes",
  "oilyFish",
  "proteinMeals",
  "meatLegumes",
  "dairy",
  "daylight",
  "wholegrain",
] as const;

function topSliders(): Record<string, number> {
  const sliders: Record<string, number> = { sugaryDrinks: 0, ultraProcessed: 0 };
  for (const id of SLIDER_IDS) {
    const question = nutritionSliderQuestion(id);
    sliders[id] = question ? question.stops.length - 1 : 3;
  }
  return sliders;
}

function log(sliders: Record<string, number>, preference = "none") {
  return { sliders, allergies: [], preference };
}

describe("buildHubPersonalization", () => {
  it("vraagt de check zonder sessie", () => {
    expect(
      buildHubPersonalization({ hasSession: false, latestNutritionLog: null }),
    ).toEqual({ state: "no_intake" });
  });

  it("telt een sessie van de check (session_kind nutrition) ook mee, zonder payload van de brede check (S3 van het sessie-besluitdocument)", () => {
    const result = buildHubPersonalization({
      hasSession: true,
      latestNutritionLog: log({ ...topSliders(), oilyFish: 0 }, "vegan"),
    });
    expect(result.state).toBe("ready");
    if (result.state === "ready") {
      expect(result.matches.map((m) => m.category)).toContain("omega-3");
    }
  });

  it("vraagt de check wanneer er nog geen log is", () => {
    expect(
      buildHubPersonalization({ hasSession: true, latestNutritionLog: null }),
    ).toEqual({ state: "needs_nutrition" });
  });

  it("zegt 'eerst je bord' met de reden als er nog eetbare gaten zijn", () => {
    const result = buildHubPersonalization({
      hasSession: true,
      latestNutritionLog: log({ ...topSliders(), vegetables: 0, fruit: 0 }),
    });
    expect(result.state).toBe("basis_eerst");
    if (result.state === "basis_eerst") {
      expect(result.reason).toContain("bord");
    }
  });

  it("markeert omega-3 voor wie geen vis eet", () => {
    const result = buildHubPersonalization({
      hasSession: true,
      latestNutritionLog: log({ ...topSliders(), oilyFish: 0 }, "vegan"),
    });
    expect(result.state).toBe("ready");
    if (result.state === "ready") {
      expect(result.matches.map((m) => m.category)).toContain("omega-3");
      expect(result.matches.every((m) => m.reason.length > 0)).toBe(true);
    }
  });

  it("markeert niets als het bord alles dekt", () => {
    const result = buildHubPersonalization({
      hasSession: true,
      latestNutritionLog: log(topSliders()),
      isDarkSeason: false,
    });
    expect(result.state).toBe("geen_prioriteit");
  });
});
