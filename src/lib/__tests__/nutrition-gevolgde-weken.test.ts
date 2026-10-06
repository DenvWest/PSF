import { describe, expect, it } from "vitest";
import { bouwGevolgdePeriode, bouwGevolgdeWeken } from "@/lib/nutrition-gevolgde-weken";
import { STANDAARD_GEVOLGDE_NORMEN } from "@/lib/nutrition-normen";
import { VOEDINGSWAARDE_VELDEN, type Voedingswaarde } from "@/lib/nutrition-voedingswaarde";

const NORMEN = {
  ...STANDAARD_GEVOLGDE_NORMEN,
  calciumMg: { ...STANDAARD_GEVOLGDE_NORMEN.calciumMg, waarde: 800 },
};

function dag(waarden: Record<string, number>, zonderWaarde = 0): Voedingswaarde {
  const rijen = VOEDINGSWAARDE_VELDEN.map((veld) => {
    const waarde = waarden[veld.veld] ?? null;
    return { ...veld, waarde, norm: null, aandeel: null, aandeelRi: null };
  });
  const metWaarde = Object.keys(waarden).length > 0 ? 1 : 0;
  return { rijen, metWaarde, zonderWaarde };
}

const MAANDAG = "2026-09-28";
const VORIGE = "2026-09-21";

describe("bouwGevolgdeWeken", () => {
  const perDag = new Map([
    ["2026-09-28", dag({ calciumMg: 400 })],
    ["2026-09-30", dag({ calciumMg: 800 })],
    ["2026-10-01", dag({}, 1)],
  ]);

  it("middelt per week over de geregistreerde dagen, met het deel van de norm", () => {
    const [calcium] = bouwGevolgdeWeken(perDag, ["calciumMg"], [VORIGE, MAANDAG], NORMEN);
    expect(calcium!.punten[0]).toMatchObject({ weekStart: VORIGE, gemiddeld: null, dagen: 0 });
    expect(calcium!.punten[1]).toMatchObject({ gemiddeld: 400, aandeel: 0.5, dagen: 3 });
  });

  it("geeft geen aandeel voor een stof zonder norm", () => {
    const [natrium] = bouwGevolgdeWeken(new Map([[MAANDAG, dag({ sodiumMg: 900 })]]), ["sodiumMg"], [MAANDAG], NORMEN);
    expect(natrium!.punten[0]).toMatchObject({ gemiddeld: 900, aandeel: null });
  });

  it("slaat onbekende stoffen over", () => {
    expect(bouwGevolgdeWeken(perDag, ["bestaatNiet" as never, "calciumMg"], [MAANDAG], NORMEN)).toHaveLength(1);
  });
});

describe("bouwGevolgdePeriode", () => {
  it("middelt over de geregistreerde dagen van een willekeurige periode", () => {
    const [calcium] = bouwGevolgdePeriode(
      new Map([
        ["2026-09-28", dag({ calciumMg: 400 })],
        ["2026-09-30", dag({ calciumMg: 800 })],
        ["2026-10-09", dag({ calciumMg: 9999 })],
      ]),
      ["calciumMg"],
      ["2026-09-28", "2026-09-29", "2026-09-30"],
      NORMEN,
    );
    expect(calcium!.punten).toEqual([{ weekStart: "2026-09-28", gemiddeld: 600, aandeel: 0.75, dagen: 2 }]);
  });
});
