import { describe, expect, it } from "vitest";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import { NUTRIENT_ROUTES, NUTRIENT_ROUTE_ORDER } from "@/data/nutrition/nutrient-routes";
import { nutritionSliderQuestion } from "@/data/nutrition/lifescore-questions";
import {
  buildNutrientRouteStatus,
  buildNutrientRouteStatuses,
  sortRoutesByAttention,
} from "@/lib/nutrition-route-status";
import type { NutritionLadderReport } from "@/lib/nutrition-ladder";

function report(
  sliders: Record<string, number> = {},
  rest: Partial<NutritionLadderReport> = {},
): NutritionLadderReport {
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
      ...sliders,
    },
    preference: "none",
    allergies: [],
    ...rest,
  };
}

describe("route-data integriteit", () => {
  it("verwijst alleen naar bronnen die echt in de tabel staan", () => {
    // Zonder deze test is een typefout in een key een stille lege lijst: de
    // route rendert dan zonder bronnen en niemand merkt het.
    for (const nutrient of NUTRIENT_ROUTE_ORDER) {
      const route = NUTRIENT_ROUTES[nutrient];
      const keys = FOOD_SOURCES[nutrient].map((source) => source.key);
      for (const entry of route.sources) {
        expect(keys, `${nutrient} → ${entry.foodSourceKey}`).toContain(entry.foodSourceKey);
      }
    }
  });

  it("meet elke route met een vraag die de check echt stelt", () => {
    for (const nutrient of NUTRIENT_ROUTE_ORDER) {
      expect(nutritionSliderQuestion(NUTRIENT_ROUTES[nutrient].sliderId)).toBeDefined();
    }
  });

  it("noemt nergens een milligram-som", () => {
    // De harde leesregel uit `food-sources.ts`: deze waarden tellen niet op
    // tot een dagtotaal. Een route die "210 mg" zegt breekt dat.
    for (const nutrient of NUTRIENT_ROUTE_ORDER) {
      const route = NUTRIENT_ROUTES[nutrient];
      const text = [
        route.thresholdNl,
        route.actionNl,
        route.boardEffortNl,
        route.boardEffortShortNl,
        route.boardCannotCoverNl,
        route.measurementCaveatNl ?? "",
        ...route.sources.map((source) => source.whyNl),
      ].join(" ");
      expect(text, nutrient).not.toMatch(/\d+\s*(mg|µg|mcg|gram\b)/i);
      // Een percentage van een ADH is dezelfde schijnprecisie in een andere
      // jas: "hiermee zit je op 80%" veronderstelt een som die we niet hebben.
      expect(text, nutrient).not.toMatch(/\d+\s*%/);
      expect(text, nutrient).not.toMatch(/\b(ADH|dagbehoefte|dagelijkse behoefte)\b/i);
    }
  });

  it("laat elke route zeggen wat het bord ervoor vraagt", () => {
    // Zonder dit veld staat er wel een grens en wel een deur naar een
    // supplement, maar niets over de moeite die het alternatief kost — en dan
    // is de vergelijking die dit paneel belooft er niet.
    for (const nutrient of NUTRIENT_ROUTE_ORDER) {
      expect(NUTRIENT_ROUTES[nutrient].boardEffortNl, nutrient).toBeTruthy();
      // Kompas draagt de korte variant. Zonder eigen waarde zou de UI de
      // lange moeten afkappen, en dan verdwijnt de nuance midden in een zin.
      const short = NUTRIENT_ROUTES[nutrient].boardEffortShortNl;
      expect(short, nutrient).toBeTruthy();
      expect(short.length, nutrient).toBeLessThan(
        NUTRIENT_ROUTES[nutrient].boardEffortNl.length,
      );
    }
  });

  it("geeft een proxy-route nooit een gepubliceerde bron", () => {
    for (const nutrient of NUTRIENT_ROUTE_ORDER) {
      const route = NUTRIENT_ROUTES[nutrient];
      if (route.thresholdKind === "proxy") {
        expect(route.sourceNl, nutrient).toBeNull();
        // Een zwakke meting moet zichzelf benoemen, anders leest hij als hard.
        expect(route.measurementCaveatNl, nutrient).toBeTruthy();
      }
    }
  });
});

describe("waar iemand staat op zijn route", () => {
  it("legt zijn eigen antwoord naast de drempel", () => {
    const status = buildNutrientRouteStatus("omega3", report({ oilyFish: 0 }));
    expect(status.answerLabel).toBe("Nooit");
    expect(status.route.thresholdNl).toContain("1× per week");
    expect(status.status).toBe("gap");
  });

  it("noemt twee keer vis gedekt en één keer onderweg", () => {
    expect(buildNutrientRouteStatus("omega3", report({ oilyFish: 2 })).status).toBe("covered");
    expect(buildNutrientRouteStatus("omega3", report({ oilyFish: 1 })).status).toBe("partial");
  });

  it("draagt geen oordeel op een proxy-route", () => {
    const magnesium = buildNutrientRouteStatus("magnesium", report({ vegetables: 0 }));
    expect(magnesium.status).toBe("gap");
    // Het gat mag getoond worden, maar niet als gemist getal.
    expect(magnesium.carriesVerdict).toBe(false);
    expect(buildNutrientRouteStatus("omega3", report()).carriesVerdict).toBe(true);
  });

  it("zegt 'niet gemeten' in plaats van een tekort te verzinnen", () => {
    const status = buildNutrientRouteStatus("omega3", { ...report(), sliders: {} });
    expect(status.status).toBe("unmeasured");
    expect(status.supplementDoorOpen).toBe(false);
  });
});

describe("de supplement-deur per stof", () => {
  it("blijft dicht op een gat dat je kunt eten", () => {
    const status = buildNutrientRouteStatus("omega3", report({ oilyFish: 0 }));
    expect(status.supplementDoorOpen).toBe(false);
    expect(status.doorReasonNl).toContain("bord");
  });

  it("gaat open wanneer het bord de stof niet kan leveren", () => {
    const vegan = buildNutrientRouteStatus("omega3", report({ oilyFish: 0 }, { preference: "vegan" }));
    expect(vegan.status).toBe("off_route");
    expect(vegan.supplementDoorOpen).toBe(true);
    expect(vegan.comparisonPath).toBe("/beste/omega-3-supplement");
  });

  it("opent vitamine D in het donkere halfjaar, niet in de zomer", () => {
    const winter = buildNutrientRouteStatus("vitamin_d", report({ daylight: 1 }), {
      isDarkSeason: true,
    });
    const zomer = buildNutrientRouteStatus("vitamin_d", report({ daylight: 1 }), {
      isDarkSeason: false,
    });
    expect(winter.supplementDoorOpen).toBe(true);
    expect(zomer.supplementDoorOpen).toBe(false);
  });

  it("schrijft vitamine D nooit aan je bord toe", () => {
    // De hele boodschap van deze route is dat hij van je huid komt. Een
    // deur-regel die zegt dát je hem uit je eten haalt spreekt dat tegen —
    // "van je huid, niet van je bord" mag juist wél, dus de test kijkt naar
    // de bevestigende vorm en niet naar het woord "bord" op zichzelf.
    for (const daylight of [0, 1, 3, 5]) {
      for (const dark of [true, false]) {
        const status = buildNutrientRouteStatus("vitamin_d", report({ daylight }), {
          isDarkSeason: dark,
        });
        expect(status.doorReasonNl, `daylight=${daylight} dark=${dark}`).not.toMatch(
          /haalt dit uit je eten|met je bord dichten/i,
        );
      }
    }
  });

  it("blijft dicht wanneer de route staat, ook in de winter", () => {
    const status = buildNutrientRouteStatus("vitamin_d", report({ daylight: 5 }), {
      isDarkSeason: true,
    });
    expect(status.status).toBe("covered");
    expect(status.supplementDoorOpen).toBe(false);
    expect(status.doorReasonNl).toContain("niets om aan te vullen");
  });
});

describe("volgorde en volledigheid", () => {
  it("levert alle vijf routes met hun bronnen", () => {
    const statuses = buildNutrientRouteStatuses(report());
    expect(statuses).toHaveLength(5);
    for (const status of statuses) {
      expect(status.sources.length).toBeGreaterThan(0);
      expect(status.label).toBeTruthy();
    }
  });

  it("zet een open deur bovenaan, daarna de gaten die je kunt eten", () => {
    const statuses = sortRoutesByAttention(
      buildNutrientRouteStatuses(report({ oilyFish: 0, vegetables: 0 }, { preference: "vegan" })),
    );
    expect(statuses[0].supplementDoorOpen).toBe(true);
    expect(statuses[statuses.length - 1].status).not.toBe("gap");
  });
});
