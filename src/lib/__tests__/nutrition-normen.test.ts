import { describe, expect, it } from "vitest";
import {
  gevolgdeNormenVoor,
  NORMEN_GETOETST,
  voedingsnormenVoor,
  vraagtMenstruatie,
} from "@/data/nutrition/voedingsnormen";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { aandeelVanNorm, normLabel, normVoorVeld, STANDAARD_GEVOLGDE_NORMEN, STANDAARD_NORMEN } from "@/lib/nutrition-normen";
import { bouwTekortsysteem } from "@/lib/nutrition-tekortsysteem";

describe("voedingsnormenVoor", () => {
  it("geeft vrouwen en mannen hun eigen norm voor magnesium en zink", () => {
    expect(voedingsnormenVoor("vrouw").magnesium.waarde).toBe(300);
    expect(voedingsnormenVoor("man").magnesium.waarde).toBe(350);
    expect(voedingsnormenVoor("vrouw").zinc.waarde).toBe(10);
    expect(voedingsnormenVoor("man").zinc.waarde).toBe(13);
  });

  it("rekent zonder geslacht met de hogere waarde, zodat er nooit een vinkje te veel komt", () => {
    expect(voedingsnormenVoor(null).magnesium.waarde).toBe(350);
    expect(voedingsnormenVoor("anders").zinc.waarde).toBe(13);
    expect(STANDAARD_NORMEN).toEqual(voedingsnormenVoor(null));
  });

  it("neemt bij verschil tussen GR, EFSA en NNR de hoogste, niet de etiket-RI", () => {
    expect(STANDAARD_NORMEN.vitamin_d).toMatchObject({ waarde: 15, bron: "EFSA 2016" });
    expect(STANDAARD_NORMEN.omega3).toMatchObject({ waarde: 250, bron: "EFSA 2010" });
  });

  it("verhoogt de zinknorm bij plantaardig eten (fytaat)", () => {
    expect(voedingsnormenVoor("vrouw", { voedingswijze: "vegetarisch" }).zinc.waarde).toBe(11);
    expect(voedingsnormenVoor("man", { voedingswijze: "veganistisch" }).zinc.waarde).toBe(16.3);
  });
});

describe("gevolgdeNormenVoor", () => {
  it("rekent tegen de norm, niet tegen de etiket-RI", () => {
    expect(STANDAARD_GEVOLGDE_NORMEN.potassiumMg.waarde).toBe(3500);
    expect(STANDAARD_GEVOLGDE_NORMEN.vitaminB12µg.waarde).toBe(4);
    expect(gevolgdeNormenVoor({ gender: "vrouw" }).vitaminCMg.waarde).toBe(95);
    expect(STANDAARD_GEVOLGDE_NORMEN.vitaminCMg.waarde).toBe(110);
  });

  it("kiest de ijzernorm op menstruatie, niet op leeftijd", () => {
    expect(gevolgdeNormenVoor({ gender: "man" }).ironMg.waarde).toBe(11);
    expect(gevolgdeNormenVoor({ gender: "vrouw" }).ironMg.waarde).toBe(16);
    expect(gevolgdeNormenVoor({ gender: "vrouw", menstruatie: "onregelmatig" }).ironMg.waarde).toBe(16);
    expect(gevolgdeNormenVoor({ gender: "vrouw", menstruatie: "nee" }).ironMg.waarde).toBe(11);
    expect(gevolgdeNormenVoor({ gender: "anders", menstruatie: "nee" }).ironMg.waarde).toBe(11);
    expect(gevolgdeNormenVoor({ gender: null, menstruatie: "nee" }).ironMg.waarde).toBe(16);
  });

  it("vraagt alleen bij vrouw of anders naar menstruatie", () => {
    expect(vraagtMenstruatie("vrouw")).toBe(true);
    expect(vraagtMenstruatie("anders")).toBe(true);
    expect(vraagtMenstruatie("man")).toBe(false);
    expect(vraagtMenstruatie(null)).toBe(false);
  });

  it("geeft calcium per leeftijd, met de hogere waarde als die onbekend is", () => {
    expect(gevolgdeNormenVoor({ gender: "vrouw", ageRange: "40–44" }).calciumMg.waarde).toBe(950);
    expect(gevolgdeNormenVoor({ gender: "vrouw", ageRange: "50–54" }).calciumMg.waarde).toBe(1100);
    expect(gevolgdeNormenVoor({ gender: "man", ageRange: "55+" }).calciumMg.waarde).toBe(950);
    expect(gevolgdeNormenVoor({ gender: null }).calciumMg.waarde).toBe(1100);
    expect(gevolgdeNormenVoor({ gender: "man", zeventigPlus: true }).calciumMg.waarde).toBe(1200);
  });

  it("rekent vezels per MJ energiebehoefte (Henry 2005 × PAL × 3,0 g/MJ)", () => {
    // Man 40 jaar, 80 kg, licht actief: (0,0592 × 80 + 2,48) × 1,6 = 11,55 MJ → 35 g.
    expect(gevolgdeNormenVoor({ gender: "man", leeftijd: 40, gewichtKg: 80 }).fiberG?.waarde).toBe(35);
    // Vrouw 40 jaar, 65 kg, zittend: (0,0407 × 65 + 2,90) × 1,4 = 7,76 MJ → 23 g.
    expect(gevolgdeNormenVoor({ gender: "vrouw", leeftijd: 40, gewichtKg: 65, activiteit: 1 }).fiberG?.waarde).toBe(23);
    expect(gevolgdeNormenVoor({ gender: "man", leeftijd: 40, gewichtKg: 80, activiteit: 4 }).fiberG?.waarde).toBe(43);
    expect(STANDAARD_GEVOLGDE_NORMEN.fiberG).toBeNull();
  });

  it("laat leeftijd in jaren winnen van de band", () => {
    expect(gevolgdeNormenVoor({ gender: "vrouw", leeftijd: 45, ageRange: "55+" }).calciumMg.waarde).toBe(950);
    expect(gevolgdeNormenVoor({ gender: "vrouw", leeftijd: 52 }).calciumMg.waarde).toBe(1100);
    expect(gevolgdeNormenVoor({ gender: "man", leeftijd: 22 }).calciumMg.waarde).toBe(1000);
    expect(voedingsnormenVoor("man", { leeftijd: 71 }).vitamin_d.waarde).toBe(20);
    expect(voedingsnormenVoor("man", { leeftijd: 60, zeventigPlus: true }).vitamin_d.waarde).toBe(15);
  });

  it("geeft geen norm voor stoffen zonder norm", () => {
    expect(normVoorVeld(STANDAARD_GEVOLGDE_NORMEN, "sodiumMg")).toBeNull();
    expect(normVoorVeld(STANDAARD_GEVOLGDE_NORMEN, "fiberG")).toBeNull();
    expect(normVoorVeld(STANDAARD_GEVOLGDE_NORMEN, "saturatedFatG")).toBeNull();
  });
});

describe("toetsing van de normen", () => {
  it("is niet langer dan twaalf maanden geleden naast de bronnen gelegd", () => {
    const [jaar, maand] = NORMEN_GETOETST.split("-").map(Number);
    const nu = new Date();
    const maandenGeleden = (nu.getFullYear() - jaar!) * 12 + (nu.getMonth() + 1 - maand!);
    expect(maandenGeleden).toBeLessThanOrEqual(12);
  });
});

describe("aandeelVanNorm", () => {
  it("geeft null voor eiwit: dat doel komt uit gewicht en belasting", () => {
    expect(aandeelVanNorm(STANDAARD_NORMEN, "protein", 80)).toBeNull();
  });

  it("deelt door de norm van deze persoon", () => {
    expect(aandeelVanNorm(voedingsnormenVoor("vrouw"), "magnesium", 300)).toBe(1);
    expect(aandeelVanNorm(STANDAARD_NORMEN, "vitamin_d", 7.5)).toBe(0.5);
  });

  it("toont de norm met eenheid", () => {
    expect(normLabel(STANDAARD_NORMEN.vitamin_d)).toBe("15 µg");
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
