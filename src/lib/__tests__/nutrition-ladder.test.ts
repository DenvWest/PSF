import { describe, expect, it } from "vitest";
import { buildNutritionHeadline, parseNutritionLadderReport } from "@/lib/nutrition-conclusion";
import {
  buildNutritionFactRows,
  nutritionLayerWhyWait,
  resolveNutritionFocusLayer,
  resolveNutritionGate,
  resolveNutritionLadderCoverage,
  resolveNutritionLayerStates,
  resolveNutritionOptOut,
  resolvePlantPortionsPerDay,
  type NutritionLadderReport,
} from "@/lib/nutrition-ladder";

function report(overrides: Partial<NutritionLadderReport["sliders"]> = {}, rest: Partial<NutritionLadderReport> = {}): NutritionLadderReport {
  return {
    sliders: {
      vegetables: 2,
      fruit: 4,
      berries: 2,
      nutsSeedsLegumes: 2,
      oilyFish: 1,
      proteinMeals: 2,
      meatLegumes: 2,
      dairy: 1,
      daylight: 3,
      wholegrain: 2,
      sugaryDrinks: 2,
      ...overrides,
    },
    preference: "none",
    allergies: [],
    ...rest,
  };
}

/** Alles op of boven zijn richtlijn — de onderhoud-persona uit §I3. */
const ON_ORDER = report({
  vegetables: 4,
  fruit: 6,
  berries: 4,
  oilyFish: 2,
  proteinMeals: 3,
  wholegrain: 4,
  sugaryDrinks: 1,
});

describe("plant-equivalentie", () => {
  it("telt groente, fruit en bessen op tot één dagequivalent", () => {
    // 2 porties groente + 3-4x/week fruit (0,5) + 1x/week bessen (0,14).
    const portions = resolvePlantPortionsPerDay(report());
    expect(portions).toBeGreaterThan(2.6);
    expect(portions).toBeLessThan(2.7);
  });

  it("kapt bessen op één portie zodat variatie geen volume wordt", () => {
    const veel = resolvePlantPortionsPerDay(report({ berries: 7, fruit: 0 }));
    const genoeg = resolvePlantPortionsPerDay(report({ berries: 6, fruit: 0 }));
    expect(veel).toBe(genoeg);
  });

  it("toont één rij met de drie antwoorden achter elkaar, geen drie gaten", () => {
    const rows = buildNutritionFactRows(report({ vegetables: 0, fruit: 0, berries: 0 }));
    const plant = rows.filter((row) => row.key === "plantbasis");
    expect(plant).toHaveLength(1);
    expect(plant[0].status).toBe("below");
    expect(plant[0].answerLabel).toContain("·");
  });
});

describe("opt-out is geen nul", () => {
  it("geeft een veganist geen tekort op de visrij", () => {
    const rows = buildNutritionFactRows(report({ oilyFish: 0 }, { preference: "vegan" }));
    const vis = rows.find((row) => row.key === "visbron");
    expect(vis?.status).toBe("own");
    expect(vis?.exemption).toBe("opt-out");
    expect(vis?.answerLabel).toBe("Je eet geen vis");
  });

  it("geeft een alleseter met dezelfde nul wél een tekort", () => {
    const rows = buildNutritionFactRows(report({ oilyFish: 0 }));
    expect(rows.find((row) => row.key === "visbron")?.status).toBe("below");
  });

  it("herkent een glutenallergie op de vezelrij", () => {
    expect(resolveNutritionOptOut("wholegrain", report({}, { allergies: ["tarwe"] }))).toBe(true);
    expect(resolveNutritionOptOut("wholegrain", report())).toBe(false);
  });
});

describe("geen norm is geen oordeel", () => {
  it("laat eiwitbronnen op 'own' staan, nooit op below", () => {
    const rows = buildNutritionFactRows(report({ meatLegumes: 0, dairy: 0, nutsSeedsLegumes: 0 }));
    const bronnen = rows.find((row) => row.key === "eiwitbronnen");
    expect(bronnen?.status).toBe("own");
    expect(bronnen?.exemption).toBe("geen-norm");
  });

  it("telt 'own'-rijen niet mee in de dekking", () => {
    const rows = buildNutritionFactRows(ON_ORDER);
    const coverage = resolveNutritionLadderCoverage(rows);
    // Laag 1 draagt naast plantbasis ook de norm-loze eiwitbronnen; die mogen
    // de laag niet blokkeren als de gemeten rij wél staat.
    expect(coverage.measured).toContain(1);
    expect(coverage.onOrder).toContain(1);
    expect(coverage.percentage).toBe(100);
  });
});

describe("winst-laag en staten", () => {
  it("kiest de laagste laag met een gat", () => {
    // Plantbasis (laag 1) én volkoren (laag 2) staan onder hun richtlijn.
    const rows = buildNutritionFactRows(report({ vegetables: 0, fruit: 0, berries: 0, wholegrain: 0 }));
    expect(resolveNutritionFocusLayer(rows)).toBe(1);
    expect(resolveNutritionLayerStates(rows)[1]).toBe("winst");
  });

  it("valt terug op de laagste 'near' als er geen gat is", () => {
    const rows = buildNutritionFactRows(ON_ORDER);
    const near = buildNutritionFactRows(report({ ...ON_ORDER.sliders, proteinMeals: 2 }));
    expect(resolveNutritionFocusLayer(rows)).toBeNull();
    expect(resolveNutritionFocusLayer(near)).toBe(3);
  });

  it("geeft laag 4 tot en met 6 nooit een oordeel uit de meting", () => {
    const states = resolveNutritionLayerStates(buildNutritionFactRows(ON_ORDER));
    expect(states[4]).toBe("wacht");
    expect(states[5]).toBe("wacht");
    expect(states[6]).toBe("wacht");
  });

  it("zwijgt over lagen op of onder de winst-laag", () => {
    expect(nutritionLayerWhyWait(1, 1)).toBeNull();
    expect(nutritionLayerWhyWait(2, 1)).toContain("eetbasis staat");
    expect(nutritionLayerWhyWait(6, 1)).toBe("Eerst je tafel, dan het potje.");
  });
});

describe("poort op laag 6", () => {
  it("blijft dicht zolang de eetbasis een gat heeft", () => {
    const rows = buildNutritionFactRows(
      report({ ...ON_ORDER.sliders, vegetables: 0, fruit: 0, berries: 0 }),
    );
    const gate = resolveNutritionGate(rows);
    expect(gate.open).toBe(false);
    expect(gate.reason).toContain("plantbasis");
  });

  it("blijft dicht op een gat dat op laag 2 staat maar met eten te dichten is", () => {
    const rows = buildNutritionFactRows(report({ ...ON_ORDER.sliders, wholegrain: 0 }));
    expect(rows.some((row) => row.layer === 1 && row.status === "below")).toBe(false);
    expect(resolveNutritionGate(rows).open).toBe(false);
  });

  it("telt meerdere gaten in plaats van ze op te sommen", () => {
    const gate = resolveNutritionGate(
      buildNutritionFactRows(report({ ...ON_ORDER.sliders, wholegrain: 0, oilyFish: 0 })),
    );
    expect(gate.reason).toContain("2 van je antwoorden");
  });

  it("blijft dicht als er niets aan te vullen valt", () => {
    const gate = resolveNutritionGate(buildNutritionFactRows(ON_ORDER));
    expect(gate.open).toBe(false);
    expect(gate.reason).toContain("geen enkel signaal");
  });

  it("gaat open bij een opt-out die het bord niet kan dichten", () => {
    const rows = buildNutritionFactRows(
      report({ ...ON_ORDER.sliders, oilyFish: 0 }, { preference: "vegan" }),
    );
    // Vegan sluit ook meatLegumes uit; de eetbasis blijft verder op orde.
    expect(rows.some((row) => row.layer === 1 && row.status === "below")).toBe(false);
    expect(resolveNutritionGate(rows).open).toBe(true);
  });

  it("blijft dicht zonder check", () => {
    expect(resolveNutritionGate([]).open).toBe(false);
  });
});

describe("conclusiezin", () => {
  it("noemt de rij die de winst draagt, zonder cijfer of laagnummer", () => {
    const rows = buildNutritionFactRows(report({ vegetables: 0, fruit: 0, berries: 0 }));
    const headline = buildNutritionHeadline(rows);
    expect(headline).toContain("plantbasis");
    expect(headline).not.toMatch(/\d/);
  });

  it("zegt bij een volle eetbasis dat volhouden het werk is", () => {
    expect(buildNutritionHeadline(buildNutritionFactRows(ON_ORDER))).toContain("volhouden");
  });

  it("spreekt de badge erboven niet tegen wanneer die laag alleen 'rond' staat", () => {
    // Plantbasis blijft op `near` (laag 1 = houd in de gaten), winst op laag 2.
    const rows = buildNutritionFactRows(report({ ...ON_ORDER.sliders, vegetables: 2, fruit: 0, berries: 0, wholegrain: 0 }));
    const headline = buildNutritionHeadline(rows);
    expect(resolveNutritionLayerStates(rows)[1]).toBe("watch");
    expect(headline).not.toContain("Je eetbasis staat.");
    expect(headline).toContain("grotendeels");
  });
});

describe("parse uit raw_inputs", () => {
  it("leest sliders én dieetcontext, zodat opt-out afleidbaar blijft", () => {
    const parsed = parseNutritionLadderReport({
      sliders: { vegetables: 3, oilyFish: 0 },
      preference: "vegan",
      allergies: ["noten"],
    });
    expect(parsed?.preference).toBe("vegan");
    expect(parsed?.allergies).toEqual(["noten"]);
    expect(parsed?.sliders.vegetables).toBe(3);
  });

  it("geeft null zonder sliders", () => {
    expect(parseNutritionLadderReport({ preference: "vegan" })).toBeNull();
  });
});
