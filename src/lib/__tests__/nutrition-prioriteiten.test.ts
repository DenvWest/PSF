import { describe, expect, it } from "vitest";
import { buildNutritionFactRows } from "@/lib/nutrition-ladder";
import {
  buildNutritionPriorities,
  nutritionPriorityLayers,
} from "@/lib/nutrition-prioriteiten";

function report(
  sliders: Record<string, number>,
  preference = "none",
  allergies: string[] = [],
) {
  return { sliders, preference, allergies };
}

/** Eetpatroon waarin niets onder de richtlijn ligt. */
const OP_ORDE = {
  vegetables: 4,
  fruit: 6,
  berries: 4,
  wholegrain: 4,
  meatLegumes: 4,
  dairy: 3,
  nutsSeedsLegumes: 4,
  oilyFish: 2,
  proteinMeals: 4,
  sugaryDrinks: 0,
  ultraProcessed: 0,
};

describe("buildNutritionPriorities", () => {
  it("noemt hoogstens drie richtingen", () => {
    const alles = report({
      vegetables: 0,
      fruit: 0,
      berries: 0,
      wholegrain: 0,
      meatLegumes: 0,
      dairy: 0,
      nutsSeedsLegumes: 0,
      oilyFish: 0,
      proteinMeals: 0,
      sugaryDrinks: 7,
      ultraProcessed: 7,
    });
    const { priorities } = buildNutritionPriorities(buildNutritionFactRows(alles));
    expect(priorities.length).toBeLessThanOrEqual(3);
    expect(priorities.length).toBeGreaterThan(0);
  });

  it("vult niet op tot drie als er minder signalen zijn", () => {
    // Alles op orde behalve één: dan hoort er precies één richting te staan.
    const bijnaGoed = report({ ...OP_ORDE, sugaryDrinks: 6 });
    const { priorities } = buildNutritionPriorities(buildNutritionFactRows(bijnaGoed));
    expect(priorities).toHaveLength(1);
    expect(priorities[0].source).toBe("minderen");
  });

  it("zet gaten vóór bijna-gaten", () => {
    const gemengd = report({ ...OP_ORDE, vegetables: 0, fruit: 0, berries: 0, wholegrain: 2 });
    const rows = buildNutritionFactRows(gemengd);
    const { priorities } = buildNutritionPriorities(rows);
    const statusOf = (key: string) => rows.find((row) => row.key === key)?.status;
    expect(statusOf(priorities[0].source)).toBe("below");
  });

  it("zet binnen dezelfde status de laagste laag eerst", () => {
    // Plantbasis (laag 1) en eiwitritme (laag 3) beide onder hun richtlijn.
    const gemengd = report({ ...OP_ORDE, vegetables: 0, fruit: 0, berries: 0, proteinMeals: 0 });
    const { priorities } = buildNutritionPriorities(buildNutritionFactRows(gemengd));
    const layers = priorities.map((priority) => priority.layer);
    expect(layers).toEqual([...layers].sort((a, b) => a - b));
  });

  it("neemt een opt-out nooit als prioriteit op", () => {
    // Veganist: de visrij krijgt een opt-out en mag geen richting worden.
    const vegan = report({ ...OP_ORDE, oilyFish: 0 }, "vegan");
    const { priorities } = buildNutritionPriorities(buildNutritionFactRows(vegan));
    expect(priorities.some((priority) => priority.source === "visbron")).toBe(false);
  });

  it("neemt een own-rij nooit als prioriteit op", () => {
    const rows = buildNutritionFactRows(report(OP_ORDE));
    const ownKeys = rows.filter((row) => row.status === "own").map((row) => row.key);
    const { priorities } = buildNutritionPriorities(rows);
    for (const key of ownKeys) {
      expect(priorities.some((priority) => priority.source === key)).toBe(false);
    }
  });

  it("geeft geen prioriteiten maar wel een regel als alles op orde is", () => {
    const { priorities, why } = buildNutritionPriorities(buildNutritionFactRows(report(OP_ORDE)));
    expect(priorities).toHaveLength(0);
    expect(why).toMatch(/niets te prioriteren/i);
  });

  it("geeft geen why zonder check", () => {
    const { priorities, why } = buildNutritionPriorities([]);
    expect(priorities).toHaveLength(0);
    expect(why).toBeNull();
  });

  it("markeert de winst-laag als focus", () => {
    const gemengd = report({ ...OP_ORDE, vegetables: 0, fruit: 0, berries: 0 });
    const { priorities, focusLayer } = buildNutritionPriorities(
      buildNutritionFactRows(gemengd),
    );
    expect(focusLayer).toBe(1);
    expect(priorities[0].isFocus).toBe(true);
  });

  it("verantwoordt elke prioriteit met een bestaande feitenrij", () => {
    const gemengd = report({ ...OP_ORDE, vegetables: 0, fruit: 0, berries: 0, proteinMeals: 0 });
    const rows = buildNutritionFactRows(gemengd);
    const { priorities } = buildNutritionPriorities(rows);
    for (const priority of priorities) {
      expect(rows.some((row) => row.key === priority.source)).toBe(true);
      expect(priority.label.length).toBeGreaterThan(0);
    }
  });

  it("levert unieke, oplopende lagen voor het meetpunt", () => {
    const gemengd = report({ ...OP_ORDE, vegetables: 0, fruit: 0, berries: 0, proteinMeals: 0 });
    const { priorities } = buildNutritionPriorities(buildNutritionFactRows(gemengd));
    const layers = nutritionPriorityLayers(priorities);
    expect(new Set(layers).size).toBe(layers.length);
    expect(layers).toEqual([...layers].sort((a, b) => a - b));
  });
});
