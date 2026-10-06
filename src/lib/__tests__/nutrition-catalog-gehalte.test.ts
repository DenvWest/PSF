import { describe, expect, it } from "vitest";
import { catalogEntry, FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import { FOOD_CATALOG_NEVO } from "@/data/nutrition/food-catalog-nevo";
import {
  FOOD_CATALOG_NEVO_BENADERINGEN,
  FOOD_CATALOG_NEVO_GEHALTES,
} from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { gehaltePer100g, gehalteWeergavePer100g, nevoOmega3Delen } from "@/lib/nutrition-catalog-gehalte";
import { bedragVanItem, nutrientenUitItems, weergaveVanItem } from "@/lib/nutrition-dagboek-items";
import benaderingMicros from "../../../scripts/nevo-benadering-micros.json";

describe("NEVO-gehaltes in de catalogus", () => {
  it("kent elke sleutel in de catalogus en dezelfde NEVO-code als de koppeling", () => {
    const keys = new Set(FOOD_CATALOG.map((e) => e.key));
    for (const [key, gehaltes] of Object.entries(FOOD_CATALOG_NEVO_GEHALTES)) {
      expect(keys.has(key), key).toBe(true);
      expect(FOOD_CATALOG_NEVO[key]?.code, key).toBe(gehaltes.code);
    }
  });

  it("bevat geen benaderingen", () => {
    for (const key of Object.keys(FOOD_CATALOG_NEVO_GEHALTES)) {
      expect(FOOD_CATALOG_NEVO[key]?.basis, key).not.toBe("benadering");
    }
  });

  it("schrijft alleen positieve getallen", () => {
    for (const [key, gehaltes] of Object.entries(FOOD_CATALOG_NEVO_GEHALTES)) {
      const { code: _code, nul: _nul, spoor: _spoor, ...waarden } = gehaltes;
      for (const [veld, waarde] of Object.entries(waarden)) {
        expect(waarde, `${key}.${veld}`).toBeGreaterThan(0);
      }
    }
  });

  it("noemt een stof nooit tegelijk als getal en als 0 of spoor", () => {
    for (const [key, gehaltes] of Object.entries(FOOD_CATALOG_NEVO_GEHALTES)) {
      for (const veld of [...(gehaltes.nul ?? []), ...(gehaltes.spoor ?? [])]) {
        expect(gehaltes[veld], `${key}.${veld}`).toBeUndefined();
      }
    }
  });

  it("toont alleen benaderingen die daarvoor zijn vrijgegeven", () => {
    const vrijgegeven = new Set(Object.keys(benaderingMicros.toon));
    for (const [key, gehaltes] of Object.entries(FOOD_CATALOG_NEVO_BENADERINGEN)) {
      expect(vrijgegeven.has(key), key).toBe(true);
      expect(FOOD_CATALOG_NEVO[key]).toEqual({ code: gehaltes.code, basis: "benadering" });
      expect(gehaltes.naam.length).toBeGreaterThan(0);
    }
    for (const key of Object.keys(benaderingMicros.niet)) {
      expect(FOOD_CATALOG_NEVO_BENADERINGEN[key], key).toBeUndefined();
    }
  });
});

describe("gehaltePer100g", () => {
  it("vult zalm gerookt aan uit NEVO, ook voor eiwit en omega-3", () => {
    const zalm = catalogEntry("zalm-gerookt");
    expect(zalm?.bron).toBeNull();
    expect(gehaltePer100g(zalm, "protein")).toEqual({ value: 21.8, unit: "g", bron: "nevo", afgeleid: false });
    expect(gehaltePer100g(zalm, "magnesium")?.value).toBe(32);
    expect(gehaltePer100g(zalm, "zinc")?.value).toBe(0.42);
    expect(gehaltePer100g(zalm, "vitamin_d")).toEqual({ value: 4, unit: "µg", bron: "nevo", afgeleid: false });
    expect(gehaltePer100g(zalm, "omega3")).toEqual({ value: 1260, unit: "mg", bron: "nevo", afgeleid: true });
  });

  it("geeft EPA en DHA los terug", () => {
    expect(nevoOmega3Delen("zalm-gerookt")).toEqual({ epaMg: 470, dhaMg: 790, code: "1096" });
    expect(nevoOmega3Delen("appel")).toBeNull();
  });

  it("laat een beoordeelde FOOD_SOURCES-rij voorgaan op NEVO", () => {
    const gekweekt = catalogEntry("zalm-gekweekt");
    expect(gekweekt?.bron).toBe("zalm-gekweekt");
    expect(gehaltePer100g(gekweekt, "omega3")).toMatchObject({ value: 903, bron: "food-sources", afgeleid: false });
  });

  it("zegt null in plaats van 0 als NEVO een stof niet kent", () => {
    expect(gehaltePer100g(catalogEntry("appel"), "omega3")).toBeNull();
    expect(gehaltePer100g(undefined, "protein")).toBeNull();
  });
});

describe("dagboekitems met NEVO-gehaltes", () => {
  it("rekent de portie door voor zalm gerookt", () => {
    const item = { bron: "voeding", key: "zalm-gerookt", grams: 75, moment: "ontbijt" } as const;
    expect(bedragVanItem(item, "protein")?.value).toBeCloseTo(16.35, 2);
    expect(bedragVanItem(item, "omega3")?.value).toBeCloseTo(945, 1);
  });

  it("telt de nieuwe stoffen mee in de ondergrens van de dag", () => {
    const stoffen = nutrientenUitItems([{ bron: "voeding", key: "zalm-gerookt", grams: 75, moment: "ontbijt" }]);
    expect(stoffen.map((s) => s.nutrient).sort()).toEqual(["magnesium", "omega3", "protein", "vitamin_d", "zinc"]);
  });
});

describe("gehalteWeergavePer100g", () => {
  it("toont een gemeten 0 als nul, niet als onbekend", () => {
    expect(gehalteWeergavePer100g(catalogEntry("spinazie-diepvries"), "vitamin_d")).toEqual({
      soort: "nul",
      unit: "µg",
      benadering: null,
    });
    expect(gehalteWeergavePer100g(catalogEntry("spinazie-diepvries"), "omega3")).toEqual({
      soort: "nul",
      unit: "mg",
      benadering: null,
    });
  });

  it("geeft het rekengetal als dat er is", () => {
    expect(gehalteWeergavePer100g(catalogEntry("spinazie-diepvries"), "magnesium")).toEqual({
      soort: "waarde",
      value: 35,
      unit: "mg",
      benadering: null,
    });
  });

  it("toont een vrijgegeven benadering met de NEVO-naam", () => {
    const broccoli = catalogEntry("broccoli-diepvries");
    expect(gehaltePer100g(broccoli, "magnesium")).toBeNull();
    expect(gehalteWeergavePer100g(broccoli, "magnesium")).toEqual({
      soort: "waarde",
      value: 19,
      unit: "mg",
      benadering: "Broccoli gekookt",
    });
  });

  it("toont niets voor een benadering die niet is vrijgegeven", () => {
    expect(gehalteWeergavePer100g(catalogEntry("margarine"), "vitamin_d")).toEqual({ soort: "onbekend" });
  });
});

describe("0, spoor en benadering tellen nooit mee", () => {
  const spinazie = { bron: "voeding", key: "spinazie-diepvries", grams: 80, moment: "lunch" } as const;
  const broccoli = { bron: "voeding", key: "broccoli-diepvries", grams: 80, moment: "lunch" } as const;
  const zalm = { bron: "voeding", key: "zalm-gerookt", grams: 75, moment: "lunch" } as const;

  it("laat een stof met alleen nullen weg uit de dag", () => {
    const stoffen = nutrientenUitItems([spinazie]);
    expect(stoffen.find((s) => s.nutrient === "vitamin_d")).toBeUndefined();
    expect(weergaveVanItem(spinazie, "vitamin_d").soort).toBe("nul");
  });

  it("telt een gemeten 0 niet als product zonder gehalte", () => {
    const vitD = nutrientenUitItems([spinazie, zalm]).find((s) => s.nutrient === "vitamin_d");
    expect(vitD).toMatchObject({ minstens: 3, bronnen: 1, zonderGehalte: 0 });
  });

  it("telt een benadering niet op, en blijft hem als zwijgend tellen", () => {
    const magnesium = nutrientenUitItems([broccoli, zalm]).find((s) => s.nutrient === "magnesium");
    expect(magnesium).toMatchObject({ minstens: 24, bronnen: 1, zonderGehalte: 1 });
    expect(weergaveVanItem(broccoli, "magnesium")).toMatchObject({ soort: "waarde", benadering: "Broccoli gekookt" });
  });
});
