import { describe, expect, it } from "vitest";
import { nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";
import { bedragVanItem, type DagboekItem } from "@/lib/nutrition-dagboek-items";
import {
  berekenVoedingswaarde,
  nevoCodeVoorItem,
  nevoCodesVoorItems,
  rondVoedingswaarde,
} from "@/lib/nutrition-voedingswaarde";
import type { SupermarktProduct } from "@/types/supermarkt-product";

function product(prodId: string, waarden: Partial<SupermarktProduct>): SupermarktProduct {
  return {
    prodId,
    bron: prodId.startsWith("nevo:") ? "nevo" : "off",
    bronId: prodId.split(":")[1] ?? "",
    naam: "Test",
    merk: null,
    categorie: null,
    snapshotDatum: "2025/9.0",
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

const ZALM: DagboekItem = { moment: "ontbijt", bron: "voeding", key: "zalm-gerookt", grams: 75 };
const ZALM_CODE = nevoKoppelingVoor("zalm-gerookt")?.code ?? "";
const ZALM_NEVO = product(`nevo:${ZALM_CODE}`, {
  energyKcal: 180,
  fatG: 10,
  proteinG: 99,
  sodiumMg: 1200,
  vitaminB12µg: 4,
});

function rij(voedingswaarde: ReturnType<typeof berekenVoedingswaarde>, veld: string) {
  return voedingswaarde.rijen.find((r) => r.veld === veld);
}

describe("nevoCodeVoorItem", () => {
  it("geeft de NEVO-code van een gekoppelde catalogusregel", () => {
    expect(ZALM_CODE).not.toBe("");
    expect(nevoCodeVoorItem(ZALM)).toBe(ZALM_CODE);
  });

  it("geeft nooit een benadering", () => {
    expect(nevoKoppelingVoor("amandeldrink")?.basis).toBe("benadering");
    expect(nevoCodeVoorItem({ ...ZALM, key: "amandeldrink" })).toBeNull();
  });

  it("geeft niets voor een supplement", () => {
    expect(nevoCodeVoorItem({ ...ZALM, bron: "supplement" })).toBeNull();
  });

  it("dedupliceert codes", () => {
    expect(nevoCodesVoorItems([ZALM, { ...ZALM, moment: "lunch" }])).toEqual([ZALM_CODE]);
  });
});

describe("berekenVoedingswaarde", () => {
  it("rekent het NEVO-record om naar de portie", () => {
    const uitkomst = berekenVoedingswaarde({
      items: [ZALM],
      nevoProducten: new Map([[ZALM_NEVO.prodId, ZALM_NEVO]]),
    });
    expect(rij(uitkomst, "energyKcal")?.waarde).toBeCloseTo(135);
    expect(rij(uitkomst, "sodiumMg")?.waarde).toBeCloseTo(900);
    expect(rij(uitkomst, "vitaminB12µg")?.aandeel).toBeCloseTo(3 / 2.5);
    expect(rij(uitkomst, "calciumMg")?.waarde).toBeNull();
  });

  it("neemt eiwit uit het dagboek, zodat het gelijk is aan de krans", () => {
    const uitkomst = berekenVoedingswaarde({
      items: [ZALM],
      nevoProducten: new Map([[ZALM_NEVO.prodId, ZALM_NEVO]]),
    });
    const dagboek = bedragVanItem(ZALM, "protein");
    expect(dagboek).not.toBeNull();
    expect(rij(uitkomst, "proteinG")?.waarde).toBeCloseTo(dagboek?.value ?? NaN);
  });

  it("geeft energie en macro's geen percentage", () => {
    const uitkomst = berekenVoedingswaarde({
      items: [ZALM],
      nevoProducten: new Map([[ZALM_NEVO.prodId, ZALM_NEVO]]),
    });
    expect(rij(uitkomst, "energyKcal")?.aandeel).toBeNull();
    expect(rij(uitkomst, "fatG")?.aandeel).toBeNull();
  });

  it("telt supermarktporties mee en noemt producten zonder waarde", () => {
    const yoghurt = product("off:1", { energyKcal: 60, proteinG: 4 });
    const uitkomst = berekenVoedingswaarde({
      items: [{ ...ZALM, key: "amandeldrink", grams: 200 }],
      supermarktLogs: [{ product: yoghurt, grams: 200 }, { product: null, grams: 100 }],
      nevoProducten: new Map(),
    });
    expect(rij(uitkomst, "energyKcal")?.waarde).toBeCloseTo(120);
    expect(uitkomst.metWaarde).toBe(1);
    expect(uitkomst.zonderWaarde).toBe(2);
  });

  it("toont n.o. (null) zolang het NEVO-record nog niet geladen is, nooit 0", () => {
    const uitkomst = berekenVoedingswaarde({ items: [ZALM], nevoProducten: new Map() });
    expect(rij(uitkomst, "energyKcal")?.waarde).toBeNull();
  });
});

describe("rondVoedingswaarde", () => {
  it("houdt één decimaal onder 100, zodat eiwit gelijk is aan de regel erboven", () => {
    expect(rondVoedingswaarde(134.6)).toBe("135");
    expect(rondVoedingswaarde(16.43)).toBe("16,4");
    expect(rondVoedingswaarde(2.46)).toBe("2,5");
  });
});
