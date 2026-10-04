import { describe, expect, it } from "vitest";
import { voedingsnormenVoor } from "@/data/nutrition/voedingsnormen";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { aandeelVanNorm, normLabel, STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import { bouwTekortsysteem } from "@/lib/nutrition-tekortsysteem";

describe("voedingsnormenVoor", () => {
  it("geeft vrouwen en mannen hun eigen norm voor magnesium en zink", () => {
    expect(voedingsnormenVoor("vrouw").magnesium.waarde).toBe(300);
    expect(voedingsnormenVoor("man").magnesium.waarde).toBe(350);
    expect(voedingsnormenVoor("vrouw").zinc.waarde).toBe(7);
    expect(voedingsnormenVoor("man").zinc.waarde).toBe(9);
  });

  it("rekent zonder geslacht met de hogere waarde, zodat er nooit een vinkje te veel komt", () => {
    expect(voedingsnormenVoor(null).magnesium.waarde).toBe(350);
    expect(voedingsnormenVoor("anders").zinc.waarde).toBe(9);
    expect(STANDAARD_NORMEN).toEqual(voedingsnormenVoor(null));
  });

  it("gebruikt de Nederlandse norm en niet de etiket-RI voor vitamine D en omega-3", () => {
    expect(STANDAARD_NORMEN.vitamin_d.waarde).toBe(10);
    expect(STANDAARD_NORMEN.omega3.waarde).toBe(200);
  });
});

describe("aandeelVanNorm", () => {
  it("geeft null voor eiwit: dat doel komt uit gewicht en belasting", () => {
    expect(aandeelVanNorm(STANDAARD_NORMEN, "protein", 80)).toBeNull();
  });

  it("deelt door de norm van deze persoon", () => {
    expect(aandeelVanNorm(voedingsnormenVoor("vrouw"), "magnesium", 300)).toBe(1);
    expect(aandeelVanNorm(STANDAARD_NORMEN, "vitamin_d", 5)).toBe(0.5);
  });

  it("toont de norm met eenheid", () => {
    expect(normLabel(STANDAARD_NORMEN.vitamin_d)).toBe("10 µg");
  });
});

describe("tekortsysteem met normen per persoon", () => {
  it("geeft dezelfde dag een vinkje bij de vrouwennorm en niet bij de mannennorm", () => {
    const vandaag = "2026-10-04";
    const dagMet = (grams: number): DagboekDag[] => [
      { date: vandaag, soort: "doordeweeks", porties: {}, items: [{ moment: "ontbijt", key: "havermout", grams }] },
    ];
    const per100g = bouwTekortsysteem(dagMet(100), vandaag, STANDAARD_NORMEN)
      .find((r) => r.nutrient === "magnesium")!.vensters[0]!.gemiddeld;
    // Tussen de vrouwennorm (300 mg) en de mannennorm (350 mg) in.
    const dagen = dagMet(Math.round((325 / per100g) * 100));

    const magnesium = (gender: "vrouw" | "man") =>
      bouwTekortsysteem(dagen, vandaag, voedingsnormenVoor(gender))
        .find((r) => r.nutrient === "magnesium")!
        .vensters.find((v) => v.dagen_terug === 1)!;

    expect(magnesium("vrouw").gedekt).toBe(true);
    expect(magnesium("man").gedekt).toBe(false);
  });
});
