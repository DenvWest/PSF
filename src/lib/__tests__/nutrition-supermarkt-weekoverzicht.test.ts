import { describe, expect, it } from "vitest";
import { bouwSupermarktWeekoverzicht } from "@/lib/nutrition-supermarkt-weekoverzicht";
import { LEGE_MACRO_DOELEN, type MacroDoelen } from "@/lib/account-macro-doelen";
import type { SupermarktPortieLog } from "@/lib/nutrition-supermarkt-items";

const DATUMS = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20"];

function log(overrides: Partial<SupermarktPortieLog> = {}): SupermarktPortieLog {
  return {
    id: "1",
    moment: "ontbijt",
    prodId: "test/product",
    grams: 100,
    createdAt: "2026-09-14T08:00:00.000Z",
    ...overrides,
  };
}

describe("bouwSupermarktWeekoverzicht", () => {
  it("levert nooit NaN als doel, ook zonder calorierichtlijn ingesteld", () => {
    // Regressietest: een percentagedoel (koolhydraten/vet/eiwit) zonder
    // calorierichtlijn moet `null` opleveren, niet NaN uit `undefined / 100`.
    const overzicht = bouwSupermarktWeekoverzicht(new Map(), DATUMS, LEGE_MACRO_DOELEN);

    for (const rij of overzicht.rijen) {
      expect(rij.doel === null || Number.isFinite(rij.doel)).toBe(true);
    }
  });

  it("rekent een percentagedoel om naar gram zodra er een calorierichtlijn is", () => {
    const doelen: MacroDoelen = {
      calorieenKcal: 2000,
      koolhydratenPct: 50,
      vetPct: 30,
      eiwitPct: 20,
    };
    const overzicht = bouwSupermarktWeekoverzicht(new Map(), DATUMS, doelen);

    const koolhydraten = overzicht.rijen.find((r) => r.veld === "carbohydrateG");
    const vet = overzicht.rijen.find((r) => r.veld === "fatG");
    const eiwit = overzicht.rijen.find((r) => r.veld === "proteinG");

    // 50% van 2000 kcal = 1000 kcal / 4 kcal per g = 250 g
    expect(koolhydraten?.doel).toBe(250);
    // 30% van 2000 kcal = 600 kcal / 9 kcal per g = 67 g
    expect(vet?.doel).toBe(67);
    // 20% van 2000 kcal = 400 kcal / 4 kcal per g = 100 g
    expect(eiwit?.doel).toBe(100);
  });

  it("telt alleen dagen met een log mee voor het gemiddelde, niet de hele week", () => {
    const logsPerDag = new Map<string, SupermarktPortieLog[]>([
      ["2026-09-14", [log({ id: "a" })]],
    ]);

    const overzicht = bouwSupermarktWeekoverzicht(logsPerDag, DATUMS, {
      ...LEGE_MACRO_DOELEN,
      calorieenKcal: 2000,
    });

    expect(overzicht.dagenGeregistreerd).toBe(1);
  });

  it("toont geen doel op een lege week, ook als er wel een calorierichtlijn is", () => {
    const overzicht = bouwSupermarktWeekoverzicht(new Map(), DATUMS, {
      ...LEGE_MACRO_DOELEN,
      calorieenKcal: 2000,
    });

    expect(overzicht.dagenGeregistreerd).toBe(0);
    const calorieen = overzicht.rijen.find((r) => r.veld === "energyKcal");
    expect(calorieen?.gemiddeld).toBe(0);
  });
});
