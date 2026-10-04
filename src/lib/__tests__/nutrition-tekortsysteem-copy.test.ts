import { STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import { describe, expect, it } from "vitest";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bepaalBevinding,
  bouwTekortsysteem,
} from "@/lib/nutrition-tekortsysteem";
import {
  bevindingZin,
  geenBevindingZin,
  teGaan,
  vensterDagenLabel,
  vensterKolommen,
} from "@/lib/nutrition-tekortsysteem-copy";

const VANDAAG = "2026-09-17";

function dag(date: string, items: { key: string; grams: number }[]): DagboekDag {
  return {
    date,
    soort: "doordeweeks",
    porties: {},
    items: items.map((item) => ({ moment: "ontbijt", ...item })),
  };
}

describe("teGaan", () => {
  it("geeft de afstand tot de referentie bij een niet-gedekt venster", () => {
    const rest = teGaan(
      {
        dagen_terug: 7,
        gemiddeld: 100,
        aandeel: 100 / 375,
        dagen: 4,
        dagenMetBron: 4,
        gedekt: false,
      },
      375,
    );
    expect(rest).toBe(275);
  });

  it("geeft niets terug zodra de referentie gehaald is", () => {
    expect(
      teGaan(
        {
          dagen_terug: 7,
          gemiddeld: 400,
          aandeel: 400 / 375,
          dagen: 4,
          dagenMetBron: 4,
          gedekt: true,
        },
        375,
      ),
    ).toBeNull();
  });

  it("geeft niets terug bij een leeg venster — geen afstand zonder meting", () => {
    expect(
      teGaan(
        {
          dagen_terug: 1,
          gemiddeld: 0,
          aandeel: null,
          dagen: 0,
          dagenMetBron: 0,
          gedekt: null,
        },
        375,
      ),
    ).toBeNull();
  });
});

describe("bevindingZin", () => {
  it("noemt de stof, de telling en nooit een tekortgetal", () => {
    const dagen = [
      dag("2026-09-17", [{ key: "havermout", grams: 40 }]),
      dag("2026-09-16", [{ key: "havermout", grams: 40 }]),
      dag("2026-09-15", [{ key: "havermout", grams: 40 }]),
    ];
    const reeksen = bouwTekortsysteem(dagen, VANDAAG, STANDAARD_NORMEN);
    const bevinding = bepaalBevinding(reeksen, dagen, VANDAAG, STANDAARD_NORMEN);
    const zin = bevindingZin(bevinding);

    expect(zin).not.toBeNull();
    expect(zin!.tekst).toContain("van de 3 dagen");
    expect(zin!.tekst).toContain("hardnekkigste gat");
    // De asymmetrie-regel in de copy: nooit een tekort, nooit een kruis.
    expect(zin!.tekst).not.toMatch(/tekort|te kort|✗|✘/);
  });

  it("geeft niets terug zonder bevinding", () => {
    expect(bevindingZin(null)).toBeNull();
  });
});

describe("geenBevindingZin", () => {
  it("onderscheidt geen data van alles gedekt", () => {
    const leeg = bouwTekortsysteem([], VANDAAG, STANDAARD_NORMEN);
    expect(geenBevindingZin(leeg)).toContain("Nog niets geregistreerd");

    const metData = bouwTekortsysteem(
      [dag("2026-09-17", [{ key: "havermout", grams: 40 }])],
      VANDAAG, STANDAARD_NORMEN
    );
    expect(geenBevindingZin(metData)).toContain("structureel");
  });
});

describe("richting bij een dag zonder bron", () => {
  it("noemt een losse dag zonder bron geen daling", () => {
    // Zalm op één dag, daarna dagen zonder vis. Vandaag staat omega-3 dus op
    // nul terwijl de week de referentie ruim haalt — dat is het ritme van
    // twee keer per week vis, geen verslechtering.
    const dagen = [
      dag("2026-09-14", [{ key: "zalm-gekweekt", grams: 140 }]),
      dag("2026-09-15", [{ key: "havermout", grams: 40 }]),
      dag("2026-09-16", [{ key: "havermout", grams: 40 }]),
      dag("2026-09-17", [{ key: "havermout", grams: 40 }]),
    ];

    const reeksen = bouwTekortsysteem(dagen, "2026-09-17", STANDAARD_NORMEN);
    const omega = reeksen.find((r) => r.nutrient === "omega3")!;

    expect(omega.vensters[0]!.dagenMetBron).toBe(0);
    expect(omega.vensters[3]!.dagenMetBron).toBeGreaterThan(0);
    expect(omega.richting).not.toBe("verslechtert");
  });
});

describe("vensterKolommen", () => {
  it("dimt een venster zonder nieuwe dagen ten opzichte van het vorige", () => {
    // Alleen vandaag en tien dagen terug geregistreerd: 7 dagen = vandaag, 30 dagen = 14 dagen.
    const dagen = [dag(VANDAAG, [{ key: "havermout", grams: 60 }]), dag("2026-09-07", [{ key: "havermout", grams: 60 }])];
    const kolommen = vensterKolommen(bouwTekortsysteem(dagen, VANDAAG, STANDAARD_NORMEN));

    expect(kolommen.map((k) => [k.dagen_terug, k.dagen, k.zelfde])).toEqual([
      [1, 1, false],
      [7, 1, true],
      [14, 2, false],
      [30, 2, true],
    ]);
  });

  it("dimt niets als er geen enkele dag is", () => {
    expect(vensterKolommen(bouwTekortsysteem([], VANDAAG, STANDAARD_NORMEN)).some((k) => k.zelfde)).toBe(false);
  });
});

describe("vensterDagenLabel", () => {
  it("noemt het aantal geregistreerde dagen", () => {
    expect(vensterDagenLabel(0)).toBe("geen dag");
    expect(vensterDagenLabel(1)).toBe("1 dag");
    expect(vensterDagenLabel(6)).toBe("6 dagen");
  });
});
