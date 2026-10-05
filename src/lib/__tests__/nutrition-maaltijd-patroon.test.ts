import { describe, expect, it } from "vitest";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";
import { bouwMaaltijdPatroon } from "@/lib/nutrition-maaltijd-patroon";
import type { SupermarktPortie } from "@/lib/nutrition-supermarkt-items";
import type { SupermarktProduct } from "@/types/supermarkt-product";

function product(waarden: Partial<SupermarktProduct>): SupermarktProduct {
  return {
    prodId: "off:1",
    bron: "off",
    bronId: "1",
    naam: "Havermout",
    merk: null,
    categorie: null,
    snapshotDatum: "2026-03-14",
    energyKcal: null,
    fatG: null,
    saturatedFatG: null,
    carbohydrateG: null,
    sugarsG: null,
    fiberG: null,
    proteinG: null,
    saltG: null,
    sodiumMg: null,
    calciumMg: null,
    ironMg: null,
    vitaminCMg: null,
    vitaminDµg: null,
    potassiumMg: null,
    magnesiumMg: null,
    zincMg: null,
    vitaminB12µg: null,
    ...waarden,
  };
}

const HAVER = product({ energyKcal: 400, proteinG: 10, fiberG: 10, ironMg: 4 });

function portie(moment: string, grams: number): SupermarktPortie {
  return { id: `${moment}-${grams}`, moment, prodId: HAVER.prodId, grams, createdAt: "", product: HAVER };
}

const MAGNESIUM: DagboekItem = { moment: "ontbijt", bron: "supplement", key: "magnesiumcitraat-capsule", grams: 1 };

function bouw(
  itemsPerDag: Map<string, DagboekItem[]>,
  etiketPerDag: Record<string, SupermarktPortie[]>,
) {
  return bouwMaaltijdPatroon({
    itemsPerDag,
    etiketPerDag,
    nevoProducten: new Map(),
    van: "2026-09-06",
    tot: "2026-10-05",
  });
}

describe("bouwMaaltijdPatroon", () => {
  it("middelt per maaltijd over de keren dat hij geregistreerd is, niet over kalenderdagen", () => {
    const patroon = bouw(new Map(), {
      "2026-10-01": [portie("ontbijt", 100)],
      "2026-10-03": [portie("ontbijt", 50)],
      "2026-10-04": [portie("lunch", 100)],
    });

    const ontbijt = patroon.find((m) => m.moment === "ontbijt")!;
    expect(ontbijt.keer).toBe(2);
    expect(ontbijt.rijen.find((r) => r.veld === "energyKcal")!.waarde).toBe(300);
    expect(ontbijt.rijen.find((r) => r.veld === "ironMg")).toMatchObject({ waarde: 3, aandeel: 3 / 14 });
    expect(patroon.find((m) => m.moment === "avondeten")!.keer).toBe(0);
  });

  it("geeft de dichtheid per 100 kcal, en geen dichtheid voor energie zelf", () => {
    const [ontbijt] = bouw(new Map(), { "2026-10-01": [portie("ontbijt", 100)] });
    expect(ontbijt!.rijen.find((r) => r.veld === "proteinG")!.per100kcal).toBe(2.5);
    expect(ontbijt!.rijen.find((r) => r.veld === "energyKcal")!.per100kcal).toBeNull();
    expect(ontbijt!.rijen.find((r) => r.veld === "calciumMg")!.per100kcal).toBeNull();
  });

  it("telt supplementen mee in de kernstof, met hun deel apart", () => {
    const patroon = bouw(
      new Map([
        ["2026-10-01", [MAGNESIUM]],
        ["2026-10-02", [{ ...MAGNESIUM, grams: 2 }]],
      ]),
      {},
    );
    const ontbijt = patroon.find((m) => m.moment === "ontbijt")!;
    const magnesium = ontbijt.kernstoffen.find((k) => k.nutrient === "magnesium")!;
    expect(magnesium).toMatchObject({ gemiddeld: 300, uitSupplement: 300, unit: "mg" });
    expect(ontbijt.supplementen).toBe(2);
    expect(ontbijt.kernstoffen.find((k) => k.nutrient === "zinc")!.gemiddeld).toBeNull();
  });

  it("laat dagen buiten de periode weg", () => {
    const [ontbijt] = bouw(new Map(), { "2026-08-01": [portie("ontbijt", 100)] });
    expect(ontbijt!.keer).toBe(0);
    expect(ontbijt!.rijen.every((r) => r.waarde === null)).toBe(true);
  });
});
