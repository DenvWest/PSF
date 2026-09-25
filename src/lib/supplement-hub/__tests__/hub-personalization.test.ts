import { describe, expect, it } from "vitest";
import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";
import { buildHubPersonalization } from "@/lib/supplement-hub/hub-personalization";

const SESSION = {} as IntakeSessionPayload;

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
      buildHubPersonalization({ session: null, hasIntakeCookie: false, latestNutritionLog: null }),
    ).toEqual({ state: "no_intake" });
  });

  it("negeert een check-log zolang er geen payload van de brede check is (huidig gedrag; S3 van het sessie-besluitdocument draait dit om)", () => {
    expect(
      buildHubPersonalization({
        session: null,
        hasIntakeCookie: true,
        latestNutritionLog: log({ ...topSliders(), oilyFish: 0 }, "vegan"),
      }),
    ).toEqual({ state: "no_intake" });
  });

  it("vraagt de check wanneer er nog geen log is", () => {
    expect(
      buildHubPersonalization({ session: SESSION, hasIntakeCookie: true, latestNutritionLog: null }),
    ).toEqual({ state: "needs_nutrition" });
  });

  it("zegt 'eerst je bord' met de reden als er nog eetbare gaten zijn", () => {
    const result = buildHubPersonalization({
      session: SESSION,
      hasIntakeCookie: true,
      latestNutritionLog: log({ ...topSliders(), vegetables: 0, fruit: 0 }),
    });
    expect(result.state).toBe("basis_eerst");
    if (result.state === "basis_eerst") {
      expect(result.reason).toContain("bord");
    }
  });

  it("markeert omega-3 voor wie geen vis eet, uit de check en niet uit de brede check", () => {
    const result = buildHubPersonalization({
      session: SESSION,
      hasIntakeCookie: true,
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
      session: SESSION,
      hasIntakeCookie: true,
      latestNutritionLog: log(topSliders()),
      isDarkSeason: false,
    });
    expect(result.state).toBe("geen_prioriteit");
  });
});
