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
    const reeksen = bouwTekortsysteem(dagen, VANDAAG);
    const bevinding = bepaalBevinding(reeksen, dagen, VANDAAG);
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
    const leeg = bouwTekortsysteem([], VANDAAG);
    expect(geenBevindingZin(leeg)).toContain("Nog niets geregistreerd");

    const metData = bouwTekortsysteem(
      [dag("2026-09-17", [{ key: "havermout", grams: 40 }])],
      VANDAAG,
    );
    expect(geenBevindingZin(metData)).toContain("structureel");
  });
});
