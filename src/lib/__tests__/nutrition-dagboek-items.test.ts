import { describe, expect, it } from "vitest";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import {
  itemsVanMoment,
  nutrientenUitItems,
  portiesUitItems,
  sanitizeItems,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";

/** Een dag die één keer havermout en één keer amandelen registreert. */
const DAG: DagboekItem[] = [
  { moment: "ontbijt", key: "havermout", grams: 60 },
  { moment: "ontbijt", key: "amandelen", grams: 25 },
];

describe("sanitizeItems", () => {
  it("houdt geldige items en kapt het gewicht af op hele grammen", () => {
    expect(sanitizeItems([{ moment: "ontbijt", key: "havermout", grams: 60.7 }])).toEqual([
      { moment: "ontbijt", key: "havermout", grams: 60 },
    ]);
  });

  it("gooit weg wat de catalogus niet kent, zonder de rest te verliezen", () => {
    const schoon = sanitizeItems([
      { moment: "ontbijt", key: "bestaat-niet", grams: 50 },
      { moment: "ontbijt", key: "havermout", grams: 60 },
    ]);

    expect(schoon).toHaveLength(1);
    expect(schoon[0].key).toBe("havermout");
  });

  it("weigert een onbekend eetmoment, een leeg gewicht en een niet-lijst", () => {
    expect(sanitizeItems([{ moment: "middernacht", key: "havermout", grams: 60 }])).toEqual([]);
    expect(sanitizeItems([{ moment: "ontbijt", key: "havermout", grams: 0 }])).toEqual([]);
    expect(sanitizeItems([{ moment: "ontbijt", key: "havermout", grams: -5 }])).toEqual([]);
    expect(sanitizeItems({ moment: "ontbijt" })).toEqual([]);
    expect(sanitizeItems(null)).toEqual([]);
  });

  it("begrenst het aantal items, zodat een dag geen boekhouding wordt", () => {
    const veel = Array.from({ length: 200 }, () => ({
      moment: "ontbijt",
      key: "havermout",
      grams: 10,
    }));

    expect(sanitizeItems(veel).length).toBeLessThanOrEqual(60);
  });
});

describe("portiesUitItems", () => {
  it("laat elk item zijn eigen voedselgroep vullen", () => {
    const porties = portiesUitItems(DAG);

    expect(porties[catalogEntry("havermout")!.groep]).toBeGreaterThanOrEqual(1);
    expect(porties[catalogEntry("amandelen")!.groep]).toBeGreaterThanOrEqual(1);
  });

  it("telt één portie per item, ongeacht het gewicht", () => {
    const klein = portiesUitItems([{ moment: "ontbijt", key: "havermout", grams: 20 }]);
    const groot = portiesUitItems([{ moment: "ontbijt", key: "havermout", grams: 200 }]);

    expect(klein).toEqual(groot);
  });
});

describe("nutrientenUitItems — de ondergrens-regel", () => {
  it("telt op uit de gehaltes per 100 g, naar rato van het gewicht", () => {
    const magnesium = nutrientenUitItems(DAG).find((n) => n.nutrient === "magnesium");

    expect(magnesium).toBeDefined();
    expect(magnesium!.minstens).toBeGreaterThan(0);
    expect(magnesium!.unit).toBe("mg");
    expect(magnesium!.bronnen).toBeGreaterThan(0);
  });

  it("schaalt lineair met het gewicht", () => {
    const enkel = nutrientenUitItems([{ moment: "ontbijt", key: "havermout", grams: 50 }]);
    const dubbel = nutrientenUitItems([{ moment: "ontbijt", key: "havermout", grams: 100 }]);

    const a = enkel.find((n) => n.nutrient === "magnesium")!.minstens;
    const b = dubbel.find((n) => n.nutrient === "magnesium")!.minstens;

    expect(b).toBeCloseTo(a * 2, 0);
  });

  /**
   * De kern van de ondergrens-regel: een stof waarvoor geen enkel item een
   * gehalte had, komt niet als nul terug maar helemaal niet. Nul zou beweren
   * dat je er niets van binnenkreeg — en dat weet dit dagboek niet.
   */
  it("geeft geen nul terug voor een stof zonder enkele bron", () => {
    const alleenHavermout = nutrientenUitItems([
      { moment: "ontbijt", key: "havermout", grams: 60 },
    ]);

    expect(alleenHavermout.some((n) => n.nutrient === "omega3")).toBe(false);
    expect(alleenHavermout.every((n) => n.minstens > 0)).toBe(true);
  });

  it("telt de items die zwegen, zodat 'weinig' van 'onbekend' te scheiden is", () => {
    const metOnbekende = nutrientenUitItems([
      { moment: "ontbijt", key: "havermout", grams: 60 },
      { moment: "ontbijt", key: "spinazie-rauw", grams: 30 },
    ]);
    const magnesium = metOnbekende.find((n) => n.nutrient === "magnesium");

    expect(magnesium).toBeDefined();
    expect(magnesium!.bronnen + magnesium!.zonderGehalte).toBe(2);
  });

  it("levert niets bij een lege dag", () => {
    expect(nutrientenUitItems([])).toEqual([]);
  });
});

describe("itemsVanMoment", () => {
  it("filtert op moment en houdt de invoervolgorde", () => {
    const gemengd: DagboekItem[] = [
      ...DAG,
      { moment: "avondeten", key: "havermout", grams: 40 },
    ];

    expect(itemsVanMoment(gemengd, "ontbijt")).toHaveLength(2);
    expect(itemsVanMoment(gemengd, "avondeten")).toHaveLength(1);
  });
});
