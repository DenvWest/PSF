import { describe, expect, it } from "vitest";
import {
  bedragVanSupermarktveld,
  koppelProducten,
  somVanSupermarktveld,
  type SupermarktPortie,
  type SupermarktPortieLog,
} from "@/lib/nutrition-supermarkt-items";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const PRODUCT: SupermarktProduct = {
  prodId: "off:1",
  bron: "off",
  bronId: "1",
  naam: "Testproduct",
  merk: null,
  categorie: null,
  snapshotDatum: "2026-10-01",
  energyKcal: 200,
  fatG: 10,
  saturatedFatG: null,
  carbohydrateG: 20,
  sugarsG: null,
  fiberG: null,
  proteinG: null,
  saltG: null,
  sodiumMg: null,
  calciumMg: null,
  ironMg: null,
  vitaminCMg: null,
  vitaminDµg: null,
};

const LOG: SupermarktPortieLog = {
  id: "a",
  moment: "ontbijt",
  prodId: "off:1",
  grams: 150,
  createdAt: "2026-10-03T08:00:00.000Z",
};

describe("koppelProducten", () => {
  it("koppelt het product bij het uitlezen aan de log", () => {
    const [portie] = koppelProducten([LOG], new Map([["off:1", PRODUCT]]));
    expect(portie?.product).toEqual(PRODUCT);
    expect(portie?.id).toBe("a");
  });

  it("geeft product null bij een onbekend prodId, de regel blijft bestaan", () => {
    const [portie] = koppelProducten([LOG], new Map());
    expect(portie).toMatchObject({ id: "a", prodId: "off:1", product: null });
  });
});

describe("bedragVanSupermarktveld", () => {
  it("rekent per 100 g om naar de portie", () => {
    expect(bedragVanSupermarktveld(PRODUCT, "energyKcal", 150)).toBe(300);
  });

  it("geeft null voor een onbekend veld, nooit 0", () => {
    expect(bedragVanSupermarktveld(PRODUCT, "proteinG", 150)).toBeNull();
  });
});

describe("somVanSupermarktveld", () => {
  const portie = (overrides: Partial<SupermarktPortie> = {}): SupermarktPortie => ({
    ...LOG,
    product: PRODUCT,
    ...overrides,
  });

  it("telt de bijdragen van meerdere logs op", () => {
    expect(somVanSupermarktveld([portie(), portie({ grams: 50 })], "energyKcal")).toBe(400);
  });

  it("slaat een log zonder product over, zonder de rest mee te nemen", () => {
    expect(somVanSupermarktveld([portie({ product: null }), portie()], "energyKcal")).toBe(300);
  });

  it("geeft null als geen enkele log iets bijdraagt", () => {
    expect(somVanSupermarktveld([portie({ product: null })], "energyKcal")).toBeNull();
    expect(somVanSupermarktveld([portie()], "proteinG")).toBeNull();
    expect(somVanSupermarktveld([], "energyKcal")).toBeNull();
  });
});
