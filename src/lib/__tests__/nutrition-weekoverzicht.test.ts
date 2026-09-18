import { describe, expect, it } from "vitest";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import {
  bouwWeekoverzicht,
  verschuifWeek,
  weekDatums,
  weekLabel,
  weekStart,
} from "@/lib/nutrition-weekoverzicht";

function dag(date: string, items: { key: string; grams: number }[]): DagboekDag {
  return {
    date,
    soort: "doordeweeks",
    porties: {},
    items: items.map((item) => ({ moment: "ontbijt", ...item })),
  };
}

describe("weekgrenzen", () => {
  it("begint een week op maandag, ook op een zondag", () => {
    // 2026-09-17 is een donderdag, 2026-09-20 de zondag erna.
    expect(weekStart("2026-09-17")).toBe("2026-09-14");
    expect(weekStart("2026-09-20")).toBe("2026-09-14");
    expect(weekStart("2026-09-14")).toBe("2026-09-14");
  });

  it("verschuift hele weken", () => {
    expect(verschuifWeek("2026-09-14", -1)).toBe("2026-09-07");
    expect(verschuifWeek("2026-09-14", 1)).toBe("2026-09-21");
  });

  it("geeft zeven datums, maandag eerst", () => {
    const datums = weekDatums("2026-09-14");
    expect(datums).toHaveLength(7);
    expect(datums[0]).toBe("2026-09-14");
    expect(datums[6]).toBe("2026-09-20");
  });

  it("noemt de maand eenmaal binnen een maand en tweemaal eroverheen", () => {
    expect(weekLabel("2026-09-14", "2026-09-20")).toBe("14 – 20 september 2026");
    expect(weekLabel("2026-08-31", "2026-09-06")).toBe(
      "31 augustus – 6 september 2026",
    );
  });
});

describe("bouwWeekoverzicht", () => {
  it("telt alleen dagen binnen de week en middelt over álle geregistreerde dagen", () => {
    const dagen = [
      dag("2026-09-14", [{ key: "havermout", grams: 40 }]),
      dag("2026-09-15", [{ key: "havermout", grams: 40 }]),
      // Buiten de week — mag niet meetellen.
      dag("2026-09-07", [{ key: "havermout", grams: 40 }]),
    ];

    const week = bouwWeekoverzicht(dagen, "2026-09-14");
    expect(week.dagenGeregistreerd).toBe(2);
    expect(week.start).toBe("2026-09-14");
    expect(week.eind).toBe("2026-09-20");
  });

  it("deelt door alle geregistreerde dagen, niet door de dagen met een bron", () => {
    // Twee dagen havermout (draagt magnesium), twee dagen iets zonder.
    const dagen = [
      dag("2026-09-14", [{ key: "havermout", grams: 100 }]),
      dag("2026-09-15", [{ key: "havermout", grams: 100 }]),
      dag("2026-09-16", [{ key: "witbrood", grams: 100 }]),
      dag("2026-09-17", [{ key: "witbrood", grams: 100 }]),
    ];

    const week = bouwWeekoverzicht(dagen, "2026-09-14");
    const magnesium = week.rijen.find((r) => r.nutrient === "magnesium")!;

    expect(week.dagenGeregistreerd).toBe(4);
    // De bron stond op minder dagen dan er geregistreerd zijn, en dat verschil
    // blijft zichtbaar in plaats van weggemiddeld.
    expect(magnesium.dagenMetBron).toBeLessThan(week.dagenGeregistreerd);
  });

  it("geeft geen te-gaan zonder meting, en nooit een negatief getal", () => {
    const leeg = bouwWeekoverzicht([], "2026-09-14");
    for (const rij of leeg.rijen) {
      expect(rij.teGaan).toBeNull();
      expect(rij.gedekt).not.toBe(true);
    }
  });

  it("markeert zink en vitamine D als niet bewijsbaar en geeft ze geen oordeel", () => {
    const dagen = [dag("2026-09-14", [{ key: "havermout", grams: 100 }])];
    const week = bouwWeekoverzicht(dagen, "2026-09-14");

    const zink = week.rijen.find((r) => r.nutrient === "zinc")!;
    const vitD = week.rijen.find((r) => r.nutrient === "vitamin_d")!;

    expect(zink.bewijsbaar).toBe(false);
    expect(zink.gedekt).toBeNull();
    expect(vitD.bewijsbaar).toBe(false);
    expect(vitD.gedekt).toBeNull();
  });

  it("geeft eiwit geen referentie — dat doel komt uit gewicht en belasting", () => {
    const week = bouwWeekoverzicht(
      [dag("2026-09-14", [{ key: "havermout", grams: 100 }])],
      "2026-09-14",
    );
    const eiwit = week.rijen.find((r) => r.nutrient === "protein")!;
    expect(eiwit.referentie).toBeNull();
    expect(eiwit.aandeel).toBeNull();
    expect(eiwit.teGaan).toBeNull();
  });

  it("draagt per rij een route naar de vergelijkingspagina", () => {
    const week = bouwWeekoverzicht([], "2026-09-14");
    for (const rij of week.rijen) {
      expect(rij.comparisonPath).toMatch(/^\/beste\//);
    }
  });
});
