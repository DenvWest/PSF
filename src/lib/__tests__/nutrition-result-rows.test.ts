import { describe, expect, it } from "vitest";
import { getUsableClaims } from "@/data/approved-claims";
import { nutrientReferences } from "@/data/nutrition/intake-reference";
import type { NutritionLadderReport } from "@/lib/nutrition-ladder";
import {
  buildNutrientResultRows,
  COVERED_ACTION,
  NUTRIENT_HUB_CATEGORY,
} from "@/lib/nutrition-result-rows";
import { buildNutrientRouteStatuses } from "@/lib/nutrition-route-status";
import type { NutrientDelta } from "@/lib/nutrition-delta";

function report(sliders: Record<string, number> = {}): NutritionLadderReport {
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
  };
}

const statuses = buildNutrientRouteStatuses(report());

function build(overrides: Partial<Parameters<typeof buildNutrientResultRows>[0]> = {}) {
  return buildNutrientResultRows({
    routeStatuses: statuses,
    gateOpen: true,
    focusNutrient: null,
    delta: null,
    loggedAt: "2026-09-24T08:00:00Z",
    previousLoggedAt: null,
    lifestyleTextFor: () => null,
    ...overrides,
  });
}

describe("buildNutrientResultRows", () => {
  it("geeft één rij per stof", () => {
    const rows = build();
    expect(rows.map((r) => r.nutrient).sort()).toEqual(
      statuses.map((s) => s.nutrient).sort(),
    );
  });

  it("zet de focus-stof bovenaan en markeert alleen die", () => {
    const rows = build({ focusNutrient: "magnesium" });
    expect(rows[0].nutrient).toBe("magnesium");
    expect(rows.filter((r) => r.isFocus).map((r) => r.nutrient)).toEqual(["magnesium"]);
  });

  it("linkt het supplement naar de catalogus op de eigen categorie", () => {
    for (const row of build()) {
      expect(row.supplementHref).toBe(
        `/supplementen?categorie=${NUTRIENT_HUB_CATEGORY[row.nutrient]}`,
      );
    }
  });

  it("houdt de supplementdeur dicht zolang de poort dicht is", () => {
    expect(build({ gateOpen: false }).every((r) => !r.doorOpen)).toBe(true);
  });

  it("volgt de routestatus voor de deur als de poort open is", () => {
    const rows = build();
    for (const row of rows) {
      const status = statuses.find((s) => s.nutrient === row.nutrient)!;
      expect(row.doorOpen).toBe(status.supplementDoorOpen);
    }
  });

  it("houdt de deur dicht zonder goedgekeurde EFSA-claim, ook als de routestatus open zegt", () => {
    // Harde guard: een stof zonder bruikbare claim (eiwit: "geen EU-gezond-
    // heidsclaims op eiwit als zodanig", zie approved-claims.ts) mag nooit
    // een productroute openen, wat de routestatus ook zegt. Dit dwingt het
    // af in plaats van het als afspraak te laten staan — een toekomstige
    // nutriënt zonder claims-entry valt hier automatisch onder.
    for (const row of build()) {
      const claimKey = nutrientReferences[row.nutrient].claimKey;
      const hasClaim = getUsableClaims(claimKey).length > 0;
      if (!hasClaim) {
        expect(row.doorOpen).toBe(false);
      }
    }
    expect(build().some((r) => r.nutrient === "protein")).toBe(true);
    expect(
      getUsableClaims(nutrientReferences.protein.claimKey).length,
    ).toBe(0);
  });

  it("gebruikt het advies als actie, anders de route-actie, en bij gedekt een vasthoud-zin", () => {
    const rows = build({
      lifestyleTextFor: (n) => (n === "omega3" ? "Eet vaker zalm." : null),
    });
    for (const row of rows) {
      const status = statuses.find((s) => s.nutrient === row.nutrient)!;
      if (status.status === "covered") {
        expect(row.action).toBe(COVERED_ACTION);
      } else if (row.nutrient === "omega3") {
        expect(row.action).toBe("Eet vaker zalm.");
      } else {
        expect(row.action).toBe(status.route.actionNl);
      }
    }
  });

  it("markeert elke stof als eerste meting zonder delta", () => {
    const rows = build();
    expect(
      rows.every(
        (r) => r.history.kind === "first" && r.history.loggedAt === "2026-09-24T08:00:00Z",
      ),
    ).toBe(true);
  });

  it("draagt alleen de richting en de vorige datum bij een delta", () => {
    const delta: NutrientDelta[] = [
      { nutrient: "omega3", from: "below", to: "around", direction: "improved" },
    ];
    const rows = build({ delta, previousLoggedAt: "2026-09-03T10:00:00Z" });
    const omega = rows.find((r) => r.nutrient === "omega3")!;
    expect(omega.history).toEqual({
      kind: "change",
      direction: "improved",
      since: "2026-09-03T10:00:00Z",
    });
    const zinc = rows.find((r) => r.nutrient === "zinc")!;
    expect(zinc.history.kind).toBe("first");
  });
});
