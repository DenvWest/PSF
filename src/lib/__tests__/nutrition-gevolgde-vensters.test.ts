import { describe, expect, it } from "vitest";
import { bouwGevolgdeVensters } from "@/lib/nutrition-gevolgde-vensters";
import { VOEDINGSWAARDE_VELDEN, type Voedingswaarde } from "@/lib/nutrition-voedingswaarde";

function dag(waarden: Record<string, number>, zonderWaarde = 0): Voedingswaarde {
  const rijen = VOEDINGSWAARDE_VELDEN.map((veld) => {
    const waarde = waarden[veld.veld] ?? null;
    return { ...veld, waarde, aandeel: waarde !== null && veld.ri !== null ? waarde / veld.ri : null };
  });
  const metWaarde = Object.keys(waarden).length > 0 ? 1 : 0;
  return { rijen, metWaarde, zonderWaarde };
}

const VANDAAG = "2026-10-04";

describe("bouwGevolgdeVensters", () => {
  it("middelt per venster over de geregistreerde dagen en geeft het deel van de RI", () => {
    const perDag = new Map([
      ["2026-10-04", dag({ calciumMg: 400 })],
      ["2026-09-25", dag({ calciumMg: 800 })],
    ]);
    const [calcium] = bouwGevolgdeVensters(perDag, ["calciumMg"], VANDAAG);

    const venster = (lengte: number) => calcium!.vensters.find((v) => v.dagen_terug === lengte)!;
    expect(venster(1)).toMatchObject({ gemiddeld: 400, aandeel: 0.5, dagen: 1 });
    expect(venster(7)).toMatchObject({ gemiddeld: 400, dagen: 1 });
    expect(venster(14)).toMatchObject({ gemiddeld: 600, aandeel: 0.75, dagen: 2 });
  });

  it("telt een geregistreerde dag zonder deze stof als nul, een lege dag niet", () => {
    const perDag = new Map([
      ["2026-10-04", dag({ fiberG: 30 })],
      ["2026-10-03", dag({ calciumMg: 100 })],
      ["2026-10-02", dag({})],
    ]);
    const [vezels] = bouwGevolgdeVensters(perDag, ["fiberG"], VANDAAG);
    expect(vezels!.vensters.find((v) => v.dagen_terug === 7)).toMatchObject({ gemiddeld: 15, dagen: 2, aandeel: null });
  });

  it("geeft null als geen enkel product een waarde had, en slaat onbekende velden over", () => {
    const perDag = new Map([["2026-10-04", dag({}, 2)]]);
    const reeksen = bouwGevolgdeVensters(perDag, ["ironMg", "bestaatNiet" as "ironMg"], VANDAAG);
    expect(reeksen).toHaveLength(1);
    expect(reeksen[0]!.vensters[0]).toMatchObject({ gemiddeld: null, dagen: 1 });
  });
});
