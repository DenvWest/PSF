import { describe, expect, it } from "vitest";
import { bouwTekortVoorstellen } from "@/lib/agenda-tekort-voorstellen";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";

function reeks(
  nutrient: Vensterreeks["nutrient"],
  aandeel: number | null,
  bewijsbaar = true,
): Vensterreeks {
  return {
    nutrient,
    label: nutrient,
    unit: "mg",
    bewijsbaar,
    richting: "vlak",
    vensters: [
      {
        dagen_terug: 30,
        gemiddeld: 0,
        aandeel,
        dagen: 4,
        dagenMetBron: 1,
        gedekt: aandeel === null ? null : aandeel >= 1,
      },
    ],
  };
}

describe("bouwTekortVoorstellen", () => {
  it("sorteert op laagste aandeel en slaat gedekte stoffen over", () => {
    const uit = bouwTekortVoorstellen([
      reeks("magnesium", 0.6),
      reeks("omega3", 0.2),
      reeks("protein", 1.1),
    ]);
    expect(uit.map((v) => v.nutrient)).toEqual(["omega3", "magnesium"]);
  });

  it("geeft geen voorstel voor onbewijsbare stoffen of stoffen zonder meting", () => {
    const uit = bouwTekortVoorstellen([
      reeks("zinc", 0.1, false),
      reeks("vitamin_d", 0.1, false),
      reeks("omega3", null),
    ]);
    expect(uit).toEqual([]);
  });
});
