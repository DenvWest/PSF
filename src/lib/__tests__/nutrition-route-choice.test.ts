import { describe, expect, it } from "vitest";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";
import {
  NUTRITION_ROUTE_CHOICES,
  ROUTE_STATUS_COLOR,
  ROUTE_STATUS_LABEL,
  nutritionRouteChoiceId,
  parseNutritionRouteChoice,
  resolveNutritionRouteChoice,
  routeChoiceConfirmation,
  routeChoiceFavoriteContext,
  routeChoiceFavoriteTitle,
  routeMatchesQuery,
  routeNeedsChoice,
} from "@/lib/nutrition-route-choice";
import {
  buildNutrientRouteStatus,
  type RouteStatus,
} from "@/lib/nutrition-route-status";
import type { NutritionLadderReport } from "@/lib/nutrition-ladder";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

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

function favorite(id: string): VoortgangFavoriteItem {
  return { id, title: id, kind: "activiteit", domain: "voeding" };
}

describe("id-vorm", () => {
  it("leest elke stof en elke keuze terug uit zijn eigen id", () => {
    // `vitamin_d` bevat zelf een underscore; splitsen op het eerste
    // koppelteken zou hem stukmaken. Deze test dekt precies die val.
    for (const nutrient of NUTRIENT_IDS) {
      for (const choice of NUTRITION_ROUTE_CHOICES) {
        const id = nutritionRouteChoiceId(nutrient, choice);
        expect(parseNutritionRouteChoice(id)).toEqual({ nutrient, choice });
      }
    }
  });

  it("herkent vreemde ids niet als routekeuze", () => {
    expect(parseNutritionRouteChoice("laag-voeding-p1-groente")).toBeNull();
    expect(parseNutritionRouteChoice("voeding-bron-magnesium-spinazie")).toBeNull();
    expect(parseNutritionRouteChoice("voeding-route-magnesium-onzin")).toBeNull();
  });

  it("vindt de bewaarde keuze tussen andere favorieten", () => {
    const items = [
      favorite("laag-voeding-p1-groente"),
      favorite(nutritionRouteChoiceId("protein", "beide")),
    ];
    expect(resolveNutritionRouteChoice("protein", items)).toBe("beide");
    expect(resolveNutritionRouteChoice("zinc", items)).toBeNull();
  });
});

describe("wat er te kiezen valt", () => {
  it("zegt dat een stof nog een keuze open heeft tot hij er een maakte", () => {
    const gap = buildNutrientRouteStatus("protein", report({ proteinMeals: 0 }));
    expect(routeNeedsChoice(gap, [])).toBe(true);
    expect(routeNeedsChoice(gap, [favorite(nutritionRouteChoiceId("protein", "bord"))])).toBe(
      false,
    );
  });
});

describe("copy", () => {
  it("noemt bij elke keuze wat die voor déze stof betekent", () => {
    const status = buildNutrientRouteStatus("vitamin_d", report({ daylight: 0 }));
    // Vitamine D komt van je huid, niet van je bord — een generieke
    // "eet dit"-bevestiging zou daar onzin zijn.
    expect(routeChoiceConfirmation("bord", status)).toContain(status.route.actionNl);
    expect(routeChoiceConfirmation("potje", status)).toContain(
      status.route.boardCannotCoverNl,
    );
  });

  it("noemt nergens een milligram of een percentage", () => {
    // Dezelfde harde grens als in `nutrient-routes.ts`: de check meet
    // frequenties, dus een som zou schijnprecisie zijn — juist op het scherm
    // waar hij zijn keuze bewaart.
    const lines: string[] = [];
    for (const nutrient of NUTRIENT_IDS) {
      const status = buildNutrientRouteStatus(nutrient, report());
      for (const choice of NUTRITION_ROUTE_CHOICES) {
        lines.push(routeChoiceConfirmation(choice, status));
        lines.push(routeChoiceFavoriteTitle(nutrient, choice));
        lines.push(routeChoiceFavoriteContext(nutritionRouteChoiceId(nutrient, choice)) ?? "");
      }
    }
    for (const line of lines) {
      expect(line, line).not.toMatch(/\d+\s?(mg|µg|mcg|gram)\b/i);
      expect(line, line).not.toMatch(/\d+\s?%/);
    }
  });

  it("geeft een bewaarde keuze een herkomst op het schap", () => {
    const context = routeChoiceFavoriteContext(nutritionRouteChoiceId("magnesium", "bord"));
    expect(context).toContain("magnesium");
    expect(routeChoiceFavoriteContext("laag-voeding-p1-groente")).toBeNull();
  });
});

describe("statustabel", () => {
  it("kent elke routestatus een kleur en een label toe", () => {
    // Deze twee tabellen stonden tot 1 september drie keer in de codebase, elk
    // met eigen Tailwind-klassen. Een status die hier ontbreekt rendert als
    // `undefined` — onzichtbaar in de UI, want een stip zonder kleur valt niet
    // op tot iemand hem mist.
    const statuses: RouteStatus[] = [
      "covered",
      "partial",
      "gap",
      "off_route",
      "unmeasured",
    ];
    for (const status of statuses) {
      expect(ROUTE_STATUS_COLOR[status], status).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(ROUTE_STATUS_LABEL[status], status).toBeTruthy();
    }
  });

  it("geeft een route die winst heet niet dezelfde kleur als een route die staat", () => {
    // De inhoudelijke reden dat de tabel centraal staat: "hier ligt winst" en
    // "haal je uit je eten" mogen op geen enkel scherm dezelfde tint krijgen.
    expect(ROUTE_STATUS_COLOR.gap).not.toBe(ROUTE_STATUS_COLOR.covered);
    expect(ROUTE_STATUS_COLOR.partial).not.toBe(ROUTE_STATUS_COLOR.covered);
  });
});

describe("zoeken", () => {
  it("vindt een stof op zijn eigen naam", () => {
    const status = buildNutrientRouteStatus("magnesium", report());
    expect(routeMatchesQuery(status, "magnes")).toBe(true);
    expect(routeMatchesQuery(status, "zink")).toBe(false);
  });

  it("vindt een stof op een voedingsmiddel dat de route draagt", () => {
    // De zoekterm die er echt toe doet: wie "haring" typt weet niet dat dat
    // omega-3 is — en dat is precies de vraag die het logboek beantwoordt.
    const omega3 = buildNutrientRouteStatus("omega3", report());
    expect(routeMatchesQuery(omega3, "haring")).toBe(true);
    const magnesium = buildNutrientRouteStatus("magnesium", report());
    expect(routeMatchesQuery(magnesium, "pompoenzaden")).toBe(true);
    expect(routeMatchesQuery(magnesium, "haring")).toBe(false);
  });

  it("trekt zich niets aan van hoofdletters, accenten en spaties", () => {
    const status = buildNutrientRouteStatus("magnesium", report());
    expect(routeMatchesQuery(status, "  MAGNÉSIUM ")).toBe(true);
  });

  it("laat bij een lege term alles staan", () => {
    const status = buildNutrientRouteStatus("zinc", report());
    expect(routeMatchesQuery(status, "")).toBe(true);
    expect(routeMatchesQuery(status, "   ")).toBe(true);
  });
});
