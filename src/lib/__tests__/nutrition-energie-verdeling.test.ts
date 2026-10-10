import { describe, expect, it } from "vitest";
import { bouwEnergieVerdeling, bouwVetVerdeling } from "@/lib/nutrition-energie-verdeling";
import type { Voedingswaarde } from "@/lib/nutrition-voedingswaarde";

function dag(waarden: Record<string, number>): Voedingswaarde {
  return {
    metWaarde: 1,
    zonderWaarde: 0,
    benaderd: 0,
    rijen: Object.entries(waarden).map(([veld, waarde]) => ({ veld, waarde })) as unknown as Voedingswaarde["rijen"],
  };
}

describe("bouwEnergieVerdeling", () => {
  it("rekent de kcal-aandelen met 4/4/9 en telt op tot 100%", () => {
    const perDag = new Map([["2026-10-09", dag({ proteinG: 100, carbohydrateG: 200, fatG: 50 })]]);
    const verdeling = bouwEnergieVerdeling(perDag, ["2026-10-09", "2026-10-10"])!;
    expect(verdeling.totaalKcal).toBe(400 + 800 + 450);
    expect(verdeling.delen.find((d) => d.sleutel === "fatG")!.aandeel).toBeCloseTo(450 / 1650);
    expect(verdeling.delen.reduce((som, d) => som + d.aandeel, 0)).toBeCloseTo(1);
    expect(verdeling.dagen).toBe(1);
  });

  it("geeft niets zonder alle drie de macro's", () => {
    const perDag = new Map([["2026-10-09", dag({ proteinG: 100, fatG: 50 })]]);
    expect(bouwEnergieVerdeling(perDag, ["2026-10-09"])).toBeNull();
  });
});

describe("bouwVetVerdeling", () => {
  it("geeft het verzadigde deel van het vet", () => {
    const perDag = new Map([["2026-10-09", dag({ fatG: 60, saturatedFatG: 15 })]]);
    expect(bouwVetVerdeling(perDag, ["2026-10-09"])).toEqual({ vetG: 60, verzadigdG: 15, aandeelVerzadigd: 0.25 });
  });

  it("geeft niets zonder vet of zonder verzadigd vet", () => {
    const perDag = new Map([["2026-10-09", dag({ fatG: 60 })]]);
    expect(bouwVetVerdeling(perDag, ["2026-10-09"])).toBeNull();
  });
});
