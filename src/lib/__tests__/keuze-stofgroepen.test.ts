import { describe, expect, it } from "vitest";
import { groepeerPerStofgroep, stofgroepVan } from "@/lib/keuze-stofgroepen";

describe("keuze-stofgroepen", () => {
  it("geeft elke kernstof een groep", () => {
    expect(stofgroepVan("magnesium")).toBe("mineralen");
    expect(stofgroepVan("zinc")).toBe("mineralen");
    expect(stofgroepVan("vitamin_d")).toBe("vitamines");
    expect(stofgroepVan("omega3")).toBe("vetzuren");
    expect(stofgroepVan("protein")).toBe("eiwit");
  });

  it("groepeert in vaste volgorde en laat lege groepen weg", () => {
    const keuzes = [
      { status: { nutrient: "zinc" as const } },
      { status: { nutrient: "protein" as const } },
      { status: { nutrient: "magnesium" as const } },
    ];
    const groepen = groepeerPerStofgroep(keuzes);
    expect(groepen.map((g) => g.groep.id)).toEqual(["eiwit", "mineralen"]);
    expect(groepen[1].keuzes.map((k) => k.status.nutrient)).toEqual(["zinc", "magnesium"]);
  });
});
