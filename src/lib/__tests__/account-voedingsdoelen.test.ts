import { describe, expect, it } from "vitest";
import {
  bepaalEiwitDoel,
  isGeldigEiwitDoel,
  isGeldigGewicht,
  isGeldigeTrainingsbelasting,
  LEGE_VOEDINGSDOELEN,
  type Voedingsdoelen,
} from "@/lib/account-voedingsdoelen";

function doelen(overrides: Partial<Voedingsdoelen> = {}): Voedingsdoelen {
  return { ...LEGE_VOEDINGSDOELEN, ...overrides };
}

describe("validatie", () => {
  it("houdt dezelfde gewichtsgrenzen aan als de formule", () => {
    // Buiten 40-250 geeft computeProteinTarget null terug. Zou deze check
    // ruimer zijn, dan sloegen we een gewicht op dat nooit een doel oplevert.
    expect(isGeldigGewicht(40)).toBe(true);
    expect(isGeldigGewicht(250)).toBe(true);
    expect(isGeldigGewicht(39.9)).toBe(false);
    expect(isGeldigGewicht(250.1)).toBe(false);
    expect(isGeldigGewicht(Number.NaN)).toBe(false);
    expect(isGeldigGewicht("82")).toBe(false);
  });

  it("accepteert alleen hele trainingsbelastingen 1 tot en met 4", () => {
    expect(isGeldigeTrainingsbelasting(1)).toBe(true);
    expect(isGeldigeTrainingsbelasting(4)).toBe(true);
    expect(isGeldigeTrainingsbelasting(0)).toBe(false);
    expect(isGeldigeTrainingsbelasting(5)).toBe(false);
    expect(isGeldigeTrainingsbelasting(2.5)).toBe(false);
  });

  it("begrenst een handmatig eiwitdoel", () => {
    expect(isGeldigEiwitDoel(120)).toBe(true);
    expect(isGeldigEiwitDoel(19)).toBe(false);
    expect(isGeldigEiwitDoel(401)).toBe(false);
  });
});

describe("het eiwitdoel", () => {
  it("rekent met het eigen gewicht en zegt dat het eigen is", () => {
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 80, trainingsbelasting: 4 }),
      checkGewichtKg: 95,
      checkTrainingLoad: 1,
      ageRange: null,
    });

    expect(uitkomst.gewichtBron).toBe("eigen");
    expect(uitkomst.range).toEqual({ gramsLow: 130, gramsHigh: 145 });
  });

  it("valt terug op de check wanneer er niets eigens staat", () => {
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen(),
      checkGewichtKg: 80,
      checkTrainingLoad: 4,
      ageRange: null,
    });

    expect(uitkomst.gewichtBron).toBe("check");
    expect(uitkomst.range).toEqual({ gramsLow: 130, gramsHigh: 145 });
  });

  it("geeft geen range zonder bruikbaar gewicht, in plaats van te raden", () => {
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen(),
      checkGewichtKg: null,
      checkTrainingLoad: 2,
      ageRange: null,
    });

    expect(uitkomst.gewichtBron).toBe("geen");
    expect(uitkomst.range).toBeNull();
  });

  it("negeert een gewicht buiten de grenzen en valt terug op de check", () => {
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 12 }),
      checkGewichtKg: 80,
      checkTrainingLoad: 1,
      ageRange: null,
    });

    expect(uitkomst.gewichtBron).toBe("check");
    expect(uitkomst.range).not.toBeNull();
  });

  it("houdt de afleiding naast een handmatig doel, niet in plaats ervan", () => {
    // Wie een eigen doel zet, hoort te zien waar de richtlijn lag — anders is
    // die overschrijving een blinde keuze.
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 80, trainingsbelasting: 4, eiwitDoelG: 160 }),
      checkGewichtKg: null,
      checkTrainingLoad: undefined,
      ageRange: null,
    });

    expect(uitkomst.handmatigG).toBe(160);
    expect(uitkomst.range).toEqual({ gramsLow: 130, gramsHigh: 145 });
  });

  it("laat de eigen trainingsbelasting die van de check overrulen", () => {
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 80, trainingsbelasting: 1 }),
      checkGewichtKg: null,
      checkTrainingLoad: 4,
      ageRange: null,
    });

    expect(uitkomst.range).toEqual({ gramsLow: 80, gramsHigh: 95 });
  });

  it("geeft de leeftijdsvloer door aan de formule", () => {
    // 55+ tilt alleen de ondergrens op; dat gedrag hoort hier niet verloren
    // te gaan omdat de doelen er tussen zitten.
    const jong = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 80 }),
      checkGewichtKg: null,
      checkTrainingLoad: undefined,
      ageRange: "30–34",
    });
    const ouder = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 80 }),
      checkGewichtKg: null,
      checkTrainingLoad: undefined,
      ageRange: "55+",
    });

    expect(jong.range?.gramsLow).toBe(80);
    expect(ouder.range?.gramsLow).toBe(95);
    expect(ouder.range?.gramsHigh).toBe(jong.range?.gramsHigh);
  });

  it("negeert een handmatig doel buiten de grenzen", () => {
    const uitkomst = bepaalEiwitDoel({
      doelen: doelen({ gewichtKg: 80, eiwitDoelG: 900 }),
      checkGewichtKg: null,
      checkTrainingLoad: undefined,
      ageRange: null,
    });

    expect(uitkomst.handmatigG).toBeNull();
  });
});
