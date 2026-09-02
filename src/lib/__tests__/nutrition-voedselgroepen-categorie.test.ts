import { describe, expect, it } from "vitest";
import { buildNutritionFactRows } from "@/lib/nutrition-ladder";
import { categorieKaarten } from "@/lib/nutrition-voedselgroepen";

function report(sliders: Record<string, number>) {
  return { sliders, preference: "none" as const, allergies: [] as string[] };
}

describe("categorieKaarten", () => {
  it("splitst groente en fruit op plantbasis", () => {
    const sliders = {
      vegetables: 2,
      fruit: 3,
      berries: 1,
      wholegrain: 2,
      meatLegumes: 2,
      dairy: 2,
      nutsSeedsLegumes: 2,
      oilyFish: 0,
      proteinMeals: 2,
      sugaryDrinks: 1,
      ultraProcessed: 1,
    };
    const factRows = buildNutritionFactRows(report(sliders));
    const kaarten = categorieKaarten(factRows, report(sliders));
    const groente = kaarten.find((kaart) => kaart.id === "groente");
    const fruit = kaarten.find((kaart) => kaart.id === "fruit");
    expect(groente?.jij).toMatch(/dag/i);
    expect(fruit?.jij).toMatch(/week|maand/i);
    expect(groente?.aanbevolen).toMatch(/400 g/i);
    expect(fruit?.aanbevolen).toMatch(/400 g/i);
  });

  it("toont granen via vezelbasis ook al meet die op P2", () => {
    const factRows = buildNutritionFactRows(report({ wholegrain: 1 }));
    const kaarten = categorieKaarten(factRows, report({ wholegrain: 1 }));
    expect(kaarten.some((kaart) => kaart.id === "granen")).toBe(true);
  });
});
