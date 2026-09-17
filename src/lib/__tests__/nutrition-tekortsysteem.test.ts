import { describe, expect, it } from "vitest";
import {
  claimNiveauVoor,
  aandeelVanRi,
  REFERENCE_INTAKES,
} from "@/data/nutrition/reference-intake";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bepaalBevinding,
  bouwTekortsysteem,
  NIET_BEWIJSBAAR,
  VENSTERS,
} from "@/lib/nutrition-tekortsysteem";

const VANDAAG = "2026-09-17";

function dag(date: string, items: { key: string; grams: number }[]): DagboekDag {
  return {
    date,
    soort: "doordeweeks",
    porties: {},
    items: items.map((item) => ({ moment: "ontbijt", ...item })),
  };
}

/** Havermout draagt magnesium, eiwit en zink — handig als enige bron. */
const HAVER = (grams: number) => ({ key: "havermout", grams });

describe("de wettelijke referentie-innames", () => {
  it("draagt de waarden uit bijlage XIII", () => {
    expect(REFERENCE_INTAKES.magnesium.value).toBe(375);
    expect(REFERENCE_INTAKES.zinc.value).toBe(10);
    expect(REFERENCE_INTAKES.vitamin_d.value).toBe(5);
  });

  it("markeert eiwit als persoonlijk doel en geeft er geen aandeel voor", () => {
    expect(REFERENCE_INTAKES.protein.personalTarget).toBe(true);
    expect(aandeelVanRi("protein", 40)).toBeNull();
    expect(aandeelVanRi("magnesium", 375)).toBe(1);
  });

  it("kent de 15%- en 30%-drempels toe per 100 g", () => {
    // Magnesium: 15% van 375 = 56,25 en 30% = 112,5.
    expect(claimNiveauVoor("magnesium", 120)).toBe("rijk_aan");
    expect(claimNiveauVoor("magnesium", 60)).toBe("bron_van");
    expect(claimNiveauVoor("magnesium", 40)).toBe("onder_drempel");
  });
});

describe("de vier vensters", () => {
  it("levert per nutriënt precies de vier vensters, in vaste volgorde", () => {
    const reeksen = bouwTekortsysteem([dag(VANDAAG, [HAVER(60)])], VANDAAG);
    const magnesium = reeksen.find((r) => r.nutrient === "magnesium")!;

    expect(magnesium.vensters.map((v) => v.dagen_terug)).toEqual([...VENSTERS]);
  });

  it("middelt over de dagen die er zijn, niet over de lengte van het venster", () => {
    const dagen = [dag(VANDAAG, [HAVER(60)]), dag("2026-09-16", [HAVER(60)])];
    const maand = bouwTekortsysteem(dagen, VANDAAG)
      .find((r) => r.nutrient === "magnesium")!
      .vensters.find((v) => v.dagen_terug === 30)!;

    // Twee gelijke dagen: het gemiddelde is die dag, niet twee dertigsten ervan.
    expect(maand.dagen).toBe(2);
    expect(maand.gemiddeld).toBeCloseTo(
      bouwTekortsysteem([dag(VANDAAG, [HAVER(60)])], VANDAAG)
        .find((r) => r.nutrient === "magnesium")!
        .vensters.find((v) => v.dagen_terug === 1)!.gemiddeld,
      0,
    );
  });

  /**
   * De makkelijkste fout in dit systeem, en hij is echt gemaakt: delen door de
   * dagen waarop de stof voorkwam in plaats van door alle geregistreerde
   * dagen. Dan leest één visdag per week als "je gemiddelde dag haalt 500 %".
   */
  it("deelt door alle geregistreerde dagen, niet alleen door de dagen met die stof", () => {
    const dagen = [
      dag(VANDAAG, [{ key: "zalm-gekweekt", grams: 140 }]),
      dag("2026-09-16", [HAVER(60)]),
      dag("2026-09-15", [HAVER(60)]),
      dag("2026-09-14", [HAVER(60)]),
    ];
    const week = bouwTekortsysteem(dagen, VANDAAG)
      .find((r) => r.nutrient === "omega3")!
      .vensters.find((v) => v.dagen_terug === 7)!;

    // Vier dagen geregistreerd, één met een omega-3-bron.
    expect(week.dagen).toBe(4);
    expect(week.dagenMetBron).toBe(1);
    // Het gemiddelde is dus een kwart van die ene dag, niet die dag zelf.
    const dagZelf = bouwTekortsysteem([dagen[0]!], VANDAAG)
      .find((r) => r.nutrient === "omega3")!
      .vensters.find((v) => v.dagen_terug === 1)!;
    expect(week.gemiddeld).toBeCloseTo(dagZelf.gemiddeld / 4, 0);
  });

  it("herkent één visdag boven een vlakke week als piek, niet als dekking", () => {
    const dagen = [
      dag(VANDAAG, [{ key: "zalm-gekweekt", grams: 140 }]),
      ...["2026-09-16", "2026-09-15", "2026-09-14", "2026-09-10", "2026-09-05"].map((d) =>
        dag(d, [HAVER(60)]),
      ),
    ];

    expect(
      bouwTekortsysteem(dagen, VANDAAG).find((r) => r.nutrient === "omega3")!.richting,
    ).toBe("piekt");
  });

  it("telt een dag buiten het venster niet mee", () => {
    const dagen = [dag(VANDAAG, [HAVER(60)]), dag("2026-08-01", [HAVER(60)])];
    const reeks = bouwTekortsysteem(dagen, VANDAAG).find((r) => r.nutrient === "magnesium")!;

    expect(reeks.vensters.find((v) => v.dagen_terug === 1)!.dagen).toBe(1);
    expect(reeks.vensters.find((v) => v.dagen_terug === 30)!.dagen).toBe(1);
  });

  it("geeft lege vensters zonder dagen, niet zonder nutriënt", () => {
    const reeksen = bouwTekortsysteem([], VANDAAG);

    expect(reeksen.length).toBeGreaterThan(0);
    expect(reeksen.every((r) => r.vensters.every((v) => v.dagen === 0))).toBe(true);
    expect(reeksen.every((r) => r.vensters.every((v) => v.gedekt === null))).toBe(true);
  });
});

/**
 * De regel die het hele scherm draagt: een ondergrens kan "gehaald" bewijzen
 * en "niet gehaald" nooit. Deze tests zorgen dat `gedekt` nooit als tekort
 * gelezen kan worden.
 */
describe("de asymmetrie-regel", () => {
  it("zet gedekt op true zodra de ondergrens de RI haalt", () => {
    // 300 g havermout levert ruim de magnesium-RI.
    const reeks = bouwTekortsysteem([dag(VANDAAG, [HAVER(300)])], VANDAAG)
      .find((r) => r.nutrient === "magnesium")!;

    expect(reeks.vensters.find((v) => v.dagen_terug === 1)!.gedekt).toBe(true);
  });

  it("zet gedekt op false — nooit op een tekort-oordeel — als de RI niet gehaald wordt", () => {
    const venster = bouwTekortsysteem([dag(VANDAAG, [HAVER(30)])], VANDAAG)
      .find((r) => r.nutrient === "magnesium")!
      .vensters.find((v) => v.dagen_terug === 1)!;

    expect(venster.gedekt).toBe(false);
    // Het aandeel staat er wél, zodat de UI een afstand kan tonen in plaats
    // van een oordeel.
    expect(venster.aandeel).toBeGreaterThan(0);
    expect(venster.aandeel).toBeLessThan(1);
  });

  it("geeft geen oordeel voor stoffen die een dagboek niet kan aantonen", () => {
    const reeksen = bouwTekortsysteem([dag(VANDAAG, [HAVER(300)])], VANDAAG);

    for (const nutrient of Object.keys(NIET_BEWIJSBAAR)) {
      const reeks = reeksen.find((r) => r.nutrient === nutrient)!;
      expect(reeks.bewijsbaar).toBe(false);
      expect(reeks.vensters.every((v) => v.gedekt === null)).toBe(true);
    }
  });

  it("noemt per onbewijsbare stof waaróm, zodat het scherm het kan uitleggen", () => {
    expect(NIET_BEWIJSBAAR.zinc).toMatch(/per portie/i);
    expect(NIET_BEWIJSBAAR.vitamin_d).toMatch(/zonlicht/i);
  });
});

describe("de richting", () => {
  it("noemt één hoge dag boven een vlakke maand een piek, geen verbetering", () => {
    const dagen = [
      dag(VANDAAG, [HAVER(300)]),
      ...["2026-09-10", "2026-09-05", "2026-08-28"].map((d) => dag(d, [HAVER(30)])),
    ];
    const reeks = bouwTekortsysteem(dagen, VANDAAG).find((r) => r.nutrient === "magnesium")!;

    expect(reeks.richting).toBe("piekt");
  });

  it("noemt een vlakke reeks vlak", () => {
    const dagen = [VANDAAG, "2026-09-10", "2026-09-05", "2026-08-28"].map((d) =>
      dag(d, [HAVER(60)]),
    );

    expect(
      bouwTekortsysteem(dagen, VANDAAG).find((r) => r.nutrient === "magnesium")!.richting,
    ).toBe("vlak");
  });

  it("weet de richting niet met minder dan twee gevulde vensters", () => {
    expect(
      bouwTekortsysteem([], VANDAAG).find((r) => r.nutrient === "magnesium")!.richting,
    ).toBe("onbekend");
  });
});

describe("de bevinding", () => {
  it("kiest de stof met de meeste dagen onder de RI", () => {
    const dagen = ["2026-09-17", "2026-09-15", "2026-09-12"].map((d) => dag(d, [HAVER(40)]));
    const bevinding = bepaalBevinding(bouwTekortsysteem(dagen, VANDAAG), dagen, VANDAAG);

    expect(bevinding).not.toBeNull();
    expect(bevinding!.dagenOnder).toBe(3);
    expect(bevinding!.dagenGemeten).toBe(3);
  });

  it("kiest nooit een stof die een dagboek niet kan aantonen", () => {
    const dagen = ["2026-09-17", "2026-09-15"].map((d) => dag(d, [HAVER(40)]));
    const bevinding = bepaalBevinding(bouwTekortsysteem(dagen, VANDAAG), dagen, VANDAAG);

    expect(bevinding).not.toBeNull();
    expect(Object.keys(NIET_BEWIJSBAAR)).not.toContain(bevinding!.nutrient);
  });

  it("geeft geen bevinding zonder dagen, in plaats van de minst goede stof aan te wijzen", () => {
    expect(bepaalBevinding(bouwTekortsysteem([], VANDAAG), [], VANDAAG)).toBeNull();
  });

  it("geeft geen bevinding wanneer alles gedekt is", () => {
    const dagen = ["2026-09-17", "2026-09-15"].map((d) => dag(d, [HAVER(400)]));
    const bevinding = bepaalBevinding(bouwTekortsysteem(dagen, VANDAAG), dagen, VANDAAG);

    if (bevinding) {
      expect(bevinding.aandeelLang).toBeLessThan(1);
    }
  });
});
