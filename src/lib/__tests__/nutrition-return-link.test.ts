import { describe, expect, it } from "vitest";
import {
  hasNutritionReturnParam,
  nutritionResultsHref,
  withNutritionReturn,
} from "@/lib/nutrition-return-link";

describe("withNutritionReturn", () => {
  it("voegt terug=voeding toe aan interne links", () => {
    expect(withNutritionReturn("/onderbouwing/voeding")).toBe(
      "/onderbouwing/voeding?terug=voeding",
    );
  });

  it("behoudt bestaande query-params", () => {
    expect(withNutritionReturn("/onderbouwing/voeding?foo=bar")).toBe(
      "/onderbouwing/voeding?foo=bar&terug=voeding",
    );
  });

  it("geeft origin door als from-herkomst", () => {
    expect(withNutritionReturn("/onderbouwing/voeding", "dashboard")).toBe(
      "/onderbouwing/voeding?terug=voeding&from=dashboard",
    );
  });

  it("overschrijft een bestaande from-herkomst niet", () => {
    expect(withNutritionReturn("/onderbouwing/voeding?from=email", "dashboard")).toBe(
      "/onderbouwing/voeding?from=email&terug=voeding",
    );
  });

  it("behoudt de hash", () => {
    expect(withNutritionReturn("/onderbouwing/voeding#proteinMeals", "dashboard")).toBe(
      "/onderbouwing/voeding?terug=voeding&from=dashboard#proteinMeals",
    );
  });

  it("past externe URLs niet aan", () => {
    expect(withNutritionReturn("https://example.com/page")).toBe(
      "https://example.com/page",
    );
  });
});

describe("hasNutritionReturnParam", () => {
  it("herkent terug=voeding", () => {
    expect(hasNutritionReturnParam({ terug: "voeding" })).toBe(true);
  });

  it("negeert andere terug-waarden", () => {
    expect(hasNutritionReturnParam({ terug: "intake" })).toBe(false);
  });

  it("reageert niet op from alleen", () => {
    expect(hasNutritionReturnParam({ from: "voeding" })).toBe(false);
  });
});

describe("nutritionResultsHref", () => {
  it("wijst naar resultaten-modus zonder herkomst", () => {
    expect(nutritionResultsHref()).toBe("/intake/voeding?resultaten=true");
  });

  it("behoudt de dashboard-herkomst", () => {
    expect(nutritionResultsHref("dashboard")).toBe(
      "/intake/voeding?resultaten=true&from=dashboard",
    );
  });
});
