import { describe, expect, it } from "vitest";
import { bouwTekortVoorstellen, dekkingPerDag } from "@/lib/agenda-tekort-voorstellen";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
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

describe("dekkingPerDag", () => {
  it("geeft 'leeg' voor een dag zonder registratie en 'open' voor een dag zonder bewijs", () => {
    const uit = dekkingPerDag(
      [{ date: "2026-10-01", soort: "doordeweeks", items: [] } as unknown as DagboekDag],
      "magnesium",
      ["2026-10-01", "2026-10-02"],
    );
    expect(uit).toEqual({ "2026-10-01": "open", "2026-10-02": "leeg" });
  });
});
