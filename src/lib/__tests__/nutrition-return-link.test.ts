import { describe, expect, it } from "vitest";
import {
  hasNutritionReturnParam,
  NUTRITION_RESULTS_HREF,
  withNutritionReturn,
} from "@/lib/nutrition-return-link";

describe("withNutritionReturn", () => {
  it("voegt from=voeding toe aan interne links", () => {
    expect(withNutritionReturn("/onderbouwing/voeding")).toBe(
      "/onderbouwing/voeding?from=voeding",
    );
  });

  it("behoudt bestaande query-params", () => {
    expect(withNutritionReturn("/onderbouwing/voeding?foo=bar")).toBe(
      "/onderbouwing/voeding?foo=bar&from=voeding",
    );
  });

  it("past externe URLs niet aan", () => {
    expect(withNutritionReturn("https://example.com/page")).toBe(
      "https://example.com/page",
    );
  });
});

describe("hasNutritionReturnParam", () => {
  it("herkent from=voeding", () => {
    expect(hasNutritionReturnParam({ from: "voeding" })).toBe(true);
  });

  it("negeert andere from-waarden", () => {
    expect(hasNutritionReturnParam({ from: "intake" })).toBe(false);
  });
});

describe("NUTRITION_RESULTS_HREF", () => {
  it("wijst naar resultaten-modus", () => {
    expect(NUTRITION_RESULTS_HREF).toBe("/intake/voeding?resultaten=true");
  });
});
