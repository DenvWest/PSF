import { describe, expect, it } from "vitest";
import { keuzeStofStand } from "@/lib/keuze-stof-stand";
import type { Venster, Vensterreeks } from "@/lib/nutrition-tekortsysteem";

function venster(dagen_terug: 1 | 7 | 14 | 30, over: Partial<Venster> = {}): Venster {
  return { dagen_terug, gemiddeld: 0, aandeel: null, dagen: 0, dagenMetBron: 0, gedekt: null, ...over };
}

function reeks(over: Partial<Vensterreeks> & { zeven?: Partial<Venster>; dertig?: Partial<Venster> } = {}): Vensterreeks {
  const { zeven = {}, dertig = {}, ...rest } = over;
  return {
    nutrient: "protein",
    label: "Eiwit",
    unit: "g",
    vensters: [venster(1), venster(7, zeven), venster(14), venster(30, dertig)],
    bewijsbaar: true,
    richting: "vlak",
    ...rest,
  };
}

describe("keuzeStofStand", () => {
  it("op koers als de 7-dagen-ondergrens de norm haalt", () => {
    const stand = keuzeStofStand("protein", reeks({ zeven: { gemiddeld: 90, aandeel: 90 / 85, dagen: 5, gedekt: true } }));
    expect(stand.stand).toBe("op_koers");
    expect(stand.norm).toBeCloseTo(85);
    expect(stand.zin).toMatch(/Je eten haalt je norm: gemiddeld 90 g van 85 g/);
  });

  it("ruimte als het dagboek de norm niet haalt — zonder het woord tekort", () => {
    const stand = keuzeStofStand("protein", reeks({ zeven: { gemiddeld: 62, aandeel: 62 / 85, dagen: 7, gedekt: false } }));
    expect(stand.stand).toBe("ruimte");
    expect(stand.zin).toMatch(/minstens wat je binnenkreeg/);
    expect(stand.zin).not.toMatch(/tekort/i);
  });

  it("valt terug op 30 dagen en daarna op onbekend bij te weinig dagen", () => {
    expect(
      keuzeStofStand("protein", reeks({ zeven: { dagen: 2 }, dertig: { gemiddeld: 70, aandeel: 0.8, dagen: 6, gedekt: false } }))
        .venster?.dagen_terug,
    ).toBe(30);
    expect(keuzeStofStand("protein", reeks({ zeven: { dagen: 2 }, dertig: { dagen: 2 } })).stand).toBe("onbekend");
    expect(keuzeStofStand("protein", undefined).stand).toBe("onbekend");
  });

  it("niet te meten voor zink en vitamine D", () => {
    expect(keuzeStofStand("zinc", reeks({ nutrient: "zinc", bewijsbaar: false })).stand).toBe("niet_meetbaar");
    expect(keuzeStofStand("vitamin_d", undefined).stand).toBe("niet_meetbaar");
  });
});
