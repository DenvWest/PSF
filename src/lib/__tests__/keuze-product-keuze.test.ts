import { describe, expect, it } from "vitest";
import {
  parseProductKeuze,
  productKeuzeContext,
  productKeuzeHref,
  productKeuzeId,
  productKeuzeIdsVoorStof,
  productKeuzeVoorStof,
} from "@/lib/keuze-product-keuze";

describe("productkeuze per stof", () => {
  it("leest stof en slug terug, ook bij een stof met een underscore en een slug met streepjes", () => {
    const id = productKeuzeId("vitamin_d", "vital-nutrition-vitamine-d3-75-mcg");
    expect(parseProductKeuze(id)).toEqual({ nutrient: "vitamin_d", slug: "vital-nutrition-vitamine-d3-75-mcg" });
    expect(productKeuzeHref(id)).toBe("/product/vital-nutrition-vitamine-d3-75-mcg");
    expect(productKeuzeContext(id)).toMatch(/voor vitamine D,/);
  });

  it("negeert andere favorieten en vindt per stof alleen de eigen keuze", () => {
    const items = [
      { id: "voeding-route-magnesium-potje" },
      { id: productKeuzeId("magnesium", "a-b") },
      { id: productKeuzeId("zinc", "c") },
    ];
    expect(parseProductKeuze("voeding-route-magnesium-potje")).toBeNull();
    expect(productKeuzeVoorStof("magnesium", items)).toBe("a-b");
    expect(productKeuzeVoorStof("omega3", items)).toBeNull();
    expect(productKeuzeIdsVoorStof("zinc", items)).toEqual(["voeding-product-zinc-c"]);
  });
});
