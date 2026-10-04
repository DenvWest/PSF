import { describe, expect, it } from "vitest";
import { catalogEntry, FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import { FOOD_CATALOG_NEVO } from "@/data/nutrition/food-catalog-nevo";
import { FOOD_CATALOG_NEVO_GEHALTES } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { gehaltePer100g, nevoOmega3Delen } from "@/lib/nutrition-catalog-gehalte";
import { bedragVanItem, nutrientenUitItems } from "@/lib/nutrition-dagboek-items";

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
      const { code: _code, ...waarden } = gehaltes;
      for (const [veld, waarde] of Object.entries(waarden)) {
        expect(waarde, `${key}.${veld}`).toBeGreaterThan(0);
      }
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
