import { describe, expect, it } from "vitest";
import { keuzeMeting } from "@/lib/nutrition-keuze-meting";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";

function reeks(aandelen: (number | null)[], bewijsbaar = true): Vensterreeks {
  const lengtes = [1, 7, 14, 30] as const;
  return {
    nutrient: "magnesium",
    label: "Magnesium",
    unit: "mg",
    bewijsbaar,
    richting: "vlak",
    vensters: lengtes.map((dagen_terug, index) => ({
      dagen_terug,
      gemiddeld: 0,
      aandeel: aandelen[index],
      dagen: aandelen[index] === null ? 0 : 3,
      dagenMetBron: 1,
      gedekt: null,
    })),
  };
}

describe("keuzeMeting", () => {
  it("neemt het langste gevulde venster als stand", () => {
    const meting = keuzeMeting(reeks([0.4, 0.5, null, null]));
    expect(meting?.aandeel).toBe(0.5);
    expect(meting?.gedekt).toBe(false);
    expect(meting?.vensters.map((v) => v.label)).toEqual(["vandaag", "7 dagen"]);
  });

  it("geeft null zonder data of voor onbewijsbare stoffen", () => {
    expect(keuzeMeting(reeks([null, null, null, null]))).toBeNull();
    expect(keuzeMeting(reeks([0.1, 0.1, 0.1, 0.1], false))).toBeNull();
    expect(keuzeMeting(undefined)).toBeNull();
  });
});
