import { describe, expect, it } from "vitest";
import {
  bouwWerkbankPrioriteiten,
  kiesStartPrioriteit,
  kolomBronregel,
  sorteerPrioriteiten,
  type WerkbankPrioriteit,
} from "@/lib/domein-werkbank";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";

function rij(
  id: number,
  staat: LeefstijlLayerState | null,
  feiten = 0,
): WerkbankPrioriteit {
  return { id, naam: `P${id}`, samenvatting: "", staat, feiten, isWinst: false };
}

describe("bouwWerkbankPrioriteiten", () => {
  it("geeft de zes prioriteiten van een domein met hun staat en feitenaantal", () => {
    const rijen = bouwWerkbankPrioriteiten({
      domain: "voeding",
      layerStates: { 1: "winst", 2: "ok" },
      evidenceByLayer: {
        1: [
          { key: "a", label: "A", answerLabel: "1", whyLine: "" },
          { key: "b", label: "B", answerLabel: "2", whyLine: "" },
        ],
      },
      focusLayer: 1,
    });

    expect(rijen).toHaveLength(6);
    expect(rijen[0]).toMatchObject({ id: 1, staat: "winst", feiten: 2, isWinst: true });
    expect(rijen[1]).toMatchObject({ id: 2, staat: "ok", feiten: 0, isWinst: false });
    // Een laag zonder staat is niet "goed" maar "niet beoordeeld".
    expect(rijen[5].staat).toBeNull();
  });

  it("geeft een lege lijst voor een domein zonder ladder", () => {
    // Energie en herstel zijn readouts, geen plandomeinen.
    expect(bouwWerkbankPrioriteiten({ domain: "energie" })).toEqual([]);
  });
});

describe("sorteerPrioriteiten", () => {
  const rijen = [rij(1, "ok", 1), rij(2, "wacht", 5), rij(3, "winst", 2), rij(4, null, 9)];

  it("houdt bij 'prioriteit' de ladder-volgorde aan", () => {
    expect(sorteerPrioriteiten(rijen, "prioriteit").map((r) => r.id)).toEqual([1, 2, 3, 4]);
  });

  it("zet bij 'ruimte' de winst-laag voorop en 'wacht' achteraan", () => {
    // 'wacht' is niet "geen ruimte" maar "nog niet aan de beurt" — die twee
    // mogen niet door elkaar lopen, en een laag zonder staat gaat helemaal
    // achteraan omdat we er niets over kunnen zeggen.
    expect(sorteerPrioriteiten(rijen, "ruimte").map((r) => r.id)).toEqual([3, 1, 2, 4]);
  });

  it("sorteert bij 'gemeten' op het aantal feiten", () => {
    expect(sorteerPrioriteiten(rijen, "gemeten").map((r) => r.id)).toEqual([4, 2, 3, 1]);
  });

  it("is stabiel op de ladder-volgorde bij gelijke rang", () => {
    const gelijk = [rij(3, "ok", 2), rij(1, "ok", 2), rij(2, "ok", 2)];
    expect(sorteerPrioriteiten(gelijk, "ruimte").map((r) => r.id)).toEqual([1, 2, 3]);
    expect(sorteerPrioriteiten(gelijk, "gemeten").map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it("laat de invoer ongemoeid", () => {
    const origineel = [...rijen];
    sorteerPrioriteiten(rijen, "ruimte");
    expect(rijen).toEqual(origineel);
  });
});

describe("kiesStartPrioriteit", () => {
  const rijen = [rij(1, "ok"), rij(2, "winst"), rij(3, null)];

  it("volgt de deeplink boven de winst-laag", () => {
    expect(kiesStartPrioriteit({ urlLayer: 3, focusLayer: 2, prioriteiten: rijen })).toBe(3);
  });

  it("valt terug op de winst-laag zonder deeplink", () => {
    expect(kiesStartPrioriteit({ focusLayer: 2, prioriteiten: rijen })).toBe(2);
  });

  it("valt terug op de eerste prioriteit zonder check", () => {
    expect(kiesStartPrioriteit({ prioriteiten: rijen })).toBe(1);
  });

  it("negeert een deeplink naar een prioriteit die dit domein niet heeft", () => {
    expect(kiesStartPrioriteit({ urlLayer: 9, focusLayer: 2, prioriteiten: rijen })).toBe(2);
  });

  it("geeft null als het domein geen prioriteiten heeft", () => {
    expect(kiesStartPrioriteit({ prioriteiten: [] })).toBeNull();
  });
});

describe("kolomBronregel", () => {
  it("meldt hoeveel prioriteiten de check beoordeelde", () => {
    expect(kolomBronregel([rij(1, "ok"), rij(2, null), rij(3, null)])).toContain("1 beoordeeld");
  });

  it("zegt het apart als de check er nog geen beoordeelt", () => {
    // Vier grijze rijen zonder uitleg lezen als een kapotte pagina.
    expect(kolomBronregel([rij(1, null), rij(2, null)])).toContain("nog geen");
  });

  it("zegt het apart als de check ze allemaal beoordeelt", () => {
    expect(kolomBronregel([rij(1, "ok"), rij(2, "winst")])).toContain("allemaal");
  });
});
