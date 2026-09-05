import { describe, expect, it } from "vitest";
import {
  routeHerkomstRegel,
  routesVoorDomein,
} from "@/lib/domain-nutrition-routes";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { NutrientId } from "@/data/nutrition/intake-reference";

function route(nutrient: NutrientId, label: string): NutrientRouteStatus {
  return {
    nutrient,
    label,
    route: { kind: "direct" } as unknown as NutrientRouteStatus["route"],
    status: "gap",
    answerLabel: "1× per week",
    carriesVerdict: true,
    sources: [],
    supplementDoorOpen: true,
    doorReasonNl: "reden",
    comparisonPath: "/beste/test",
  };
}

const alle = [
  route("magnesium", "Magnesium"),
  route("protein", "Eiwit"),
  route("omega3", "Omega-3"),
  route("vitamin_d", "Vitamine D"),
  route("zinc", "Zink"),
];

describe("domain-nutrition-routes", () => {
  it("geeft slaap alleen magnesium", () => {
    expect(routesVoorDomein("sleep", alle).map((r) => r.nutrient)).toEqual([
      "magnesium",
    ]);
  });

  it("geeft beweging alleen eiwit — creatine heeft geen voedingsroute", () => {
    expect(routesVoorDomein("movement", alle).map((r) => r.nutrient)).toEqual([
      "protein",
    ]);
  });

  it("geeft voeding alle vijf de routes", () => {
    expect(routesVoorDomein("nutrition", alle)).toHaveLength(5);
  });

  /**
   * Stress staat op `lifestyle_first`: die check meet ervaren belasting en
   * herstelgedrag, niet inname. Een supplementkolom zou daar altijd leeg
   * blijven en een claim suggereren die de check niet draagt.
   */
  it("geeft stress geen enkele route", () => {
    expect(routesVoorDomein("stress", alle)).toEqual([]);
  });

  it("noemt de voedingscheck als bron buiten voeding", () => {
    const regel = routeHerkomstRegel("sleep", routesVoorDomein("sleep", alle));
    expect(regel).toContain("voedingscheck");
    expect(regel).toContain("magnesium");
  });

  it("zet geen herkomstregel op voeding zelf", () => {
    expect(routeHerkomstRegel("nutrition", alle)).toBeNull();
  });

  it("zet geen herkomstregel zonder routes", () => {
    expect(routeHerkomstRegel("stress", [])).toBeNull();
  });
});
