import { describe, it, expect } from "vitest";
import {
  importeer,
  macroOvereenstemming,
  naarSupermarktProduct,
  steekproef,
} from "../supermarkt-import.mjs";
import { jumboKcal } from "../supermarkt-extract.mjs";

const etiket = (over = {}) => ({
  prodId: "wi1/test",
  naam: "Test yoghurt",
  categorie: "Zuivel",
  eenheid: "500 g",
  energyKcal: 66,
  fatG: 3.5,
  saturatedFatG: 2.2,
  carbohydrateG: 4.7,
  sugarsG: 4.7,
  fiberG: 0,
  proteinG: 3.9,
  saltG: 0.1,
  sodiumMg: null,
  calciumMg: 140,
  ironMg: null,
  vitaminCMg: null,
  vitaminDµg: null,
  ...over,
});

const usda = (over = {}) => ({
  prodId: "wi1/test",
  zekerheid: "zwak",
  fdcNaam: "Yogurt, plain",
  infoVelden: {
    energy: { amount: 61, unit: "kcal" },
    fat: { amount: 3.3, unit: "g" },
    carbohydrate: { amount: 4.7, unit: "g" },
    sodium: { amount: 46, unit: "mg" },
    calcium: { amount: 121, unit: "mg" },
    iron: { amount: 0.05, unit: "mg" },
    vitamin_c: { amount: 0.5, unit: "mg" },
  },
  ...over,
});

describe("naarSupermarktProduct — filterregels uit §2.4", () => {
  it("slaat een verdachte Laag 0-rij over in plaats van hem te corrigeren", () => {
    expect(naarSupermarktProduct(etiket({ verdacht: ["kJ/kcal verwisseld"] }), "AH", undefined)).toBeNull();
  });

  it("neemt een lege verdacht-array gewoon mee", () => {
    expect(naarSupermarktProduct(etiket({ verdacht: [] }), "AH", undefined)).not.toBeNull();
  });

  it("negeert een ongeverifieerde USDA-match volledig", () => {
    const p = naarSupermarktProduct(etiket(), "AH", usda({ zekerheid: "ongeverifieerd" }));
    expect(p.bron).toBe("supermarkt");
    expect(p.ironMg).toBeNull();
    expect(p).not.toHaveProperty("usdaZekerheid");
  });

  it("vult alleen lege velden aan en overschrijft het etiket nooit", () => {
    const p = naarSupermarktProduct(etiket(), "AH", usda());
    expect(p.calciumMg).toBe(140);
    expect(p.ironMg).toBe(0.1);
    expect(p.vitaminCMg).toBe(0.5);
    expect(p.bron).toBe("supermarkt+usda");
    expect(p.usdaZekerheid).toBe("zwak");
  });

  it("neemt geen USDA-natrium over als het etiket zout noemt", () => {
    expect(naarSupermarktProduct(etiket(), "AH", usda()).sodiumMg).toBeNull();
    expect(naarSupermarktProduct(etiket({ saltG: null }), "AH", usda()).sodiumMg).toBe(46);
  });

  it("negeert een USDA-waarde met een onverwachte eenheid", () => {
    const rij = usda({ infoVelden: { iron: { amount: 50, unit: "µg" } } });
    const p = naarSupermarktProduct(etiket(), "AH", rij);
    expect(p.ironMg).toBeNull();
    expect(p.bron).toBe("supermarkt");
  });

  it("markeert pas supermarkt+usda als er echt iets is aangevuld", () => {
    const vol = etiket({ ironMg: 1, vitaminCMg: 2 });
    const p = naarSupermarktProduct(vol, "AH", usda());
    expect(p.bron).toBe("supermarkt");
    expect(p).not.toHaveProperty("usdaZekerheid");
  });

  it("levert precies de velden van SupermarktProduct (geen eenheid/verdacht)", () => {
    const p = naarSupermarktProduct(etiket(), "Jumbo", undefined);
    expect(Object.keys(p).sort()).toEqual(
      [
        "prodId", "naam", "supermarkt", "categorie", "energyKcal", "fatG", "saturatedFatG",
        "carbohydrateG", "sugarsG", "fiberG", "proteinG", "saltG", "sodiumMg", "calciumMg",
        "ironMg", "vitaminCMg", "vitaminDµg", "bron",
      ].sort(),
    );
    expect(p.supermarkt).toBe("Jumbo");
  });
});

describe("macroOvereenstemming", () => {
  it("telt hoeveel macro's van de USDA-match bij het etiket passen", () => {
    expect(macroOvereenstemming(usda().infoVelden, etiket())).toEqual({ getoetst: 3, klopt: 3 });
    const kaas = { energy: { amount: 174, unit: "kcal" }, fat: { amount: 13, unit: "g" } };
    expect(macroOvereenstemming(kaas, etiket())).toEqual({ getoetst: 2, klopt: 0 });
  });

  it("toetst niets als een kant ontbreekt", () => {
    expect(macroOvereenstemming({}, etiket())).toEqual({ getoetst: 0, klopt: 0 });
  });
});

describe("importeer", () => {
  it("voegt beide rapporten samen en telt overgeslagen rijen", () => {
    const laag0 = {
      supermarkten: {
        AH: { producten: [etiket(), etiket({ prodId: "wi2/kapot", verdacht: ["x"] })] },
        Jumbo: { producten: [etiket({ prodId: "j-1" })] },
      },
    };
    const { catalogus, telling } = importeer(
      laag0,
      { rijen: [usda(), usda({ prodId: "j-1", zekerheid: "sterk" })] },
      { metUsda: true },
    );
    expect(catalogus.map((p) => p.prodId)).toEqual(["wi1/test", "j-1"]);
    expect(telling.verdachtOvergeslagen).toBe(1);
    expect(telling.usdaAangevuld).toEqual({ sterk: 1, zwak: 1 });
  });
});

describe("steekproef", () => {
  it("is deterministisch en verspreid over de lijst", () => {
    const lijst = Array.from({ length: 100 }, (_, i) => i);
    expect(steekproef(lijst, 4)).toEqual([0, 25, 50, 75]);
    expect(steekproef([1, 2], 5)).toEqual([1, 2]);
  });
});

describe("jumboKcal — de Jumbo-energienotaties", () => {
  it.each([
    ["Energie102 kJ / 25 kcalVetten1,2 g", 25],
    ["Energie61.0 kJ15.0 kCalVetten1.1 g", 15],
    ["Energie1434.0 kJ143.0 kJ2.0%349.0 kCal35.0 kCal2.0%Vetten38.0 g", 349],
    ["Energie2222 kJ/539 kcalVetten55 g", 539],
    ["EnergiekJ 272 / kcal 65Vetten3.3 g", 65],
    ["EnergiekJ 1545kJ 309kcal 372kcal 744%Vetten30.0 g", 372],
    ["EnergiekJ 507 kJ 1013 kcal 121 kcal 243 Vetten7,0 g", 121],
    ["Energie kJ/kcal995/240Vetten20", 240],
  ])("%s → %d kcal", (tekst, kcal) => {
    expect(jumboKcal(tekst)).toBe(kcal);
  });

  it("laat aan elkaar geplakte kolommen leeg in plaats van te gokken", () => {
    expect(jumboKcal("Energie2149 kJ645 kJ8514 kcal154 kcal8Vetten29 g")).toBeNull();
  });

  it("haalt een vastgeplakt %RI-cijfer eraf als de kJ-waarde dat bevestigt", () => {
    expect(jumboKcal("EnergiekJ 661 / kcal 1598% Vetten10,4 g")).toBe(159);
    expect(jumboKcal("EnergiekJ 738kcal 1769%Vetten7.6 g")).toBe(176);
    expect(jumboKcal("EnergiekJ 900 / kcal 1598% Vetten10,4 g")).toBeNull();
  });

  it("geeft null zonder energieregel", () => {
    expect(jumboKcal("Vetten1 g")).toBeNull();
  });
});

describe("importeer zonder --met-usda (standaard)", () => {
  it("laat alle USDA-aanvulling weg", () => {
    const laag0 = { supermarkten: { AH: { producten: [etiket()] } } };
    const { catalogus, telling } = importeer(laag0, { rijen: [usda()] });
    expect(catalogus[0].bron).toBe("supermarkt");
    expect(catalogus[0].ironMg).toBeNull();
    expect(telling.usdaRijen).toBe(0);
  });
});
