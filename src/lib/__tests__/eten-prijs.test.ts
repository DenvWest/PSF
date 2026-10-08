import { describe, expect, it } from "vitest";
import { FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import { ETEN_PRIJZEN, type EtenPrijs } from "@/data/nutrition/eten-prijzen";
import { etenPrijsPerPortie } from "@/lib/eten-prijs";

const regel: EtenPrijs = {
  key: "kipfilet",
  product: "Kipfilet",
  winkel: "Albert Heijn",
  verpakkingGram: 400,
  verpakkingCenten: 650,
  bron: "kassabon AH, 8 okt 2026",
  gecontroleerd: "2026-10-08",
};

describe("etenPrijsPerPortie", () => {
  it("rekent de verpakkingsprijs om naar de portie", () => {
    expect(etenPrijsPerPortie("kipfilet", 100, [regel])?.centen).toBe(163);
  });
  it("geeft null zonder prijs of bij een onmogelijke portie", () => {
    expect(etenPrijsPerPortie("tofu", 100, [regel])).toBeNull();
    expect(etenPrijsPerPortie("kipfilet", 0, [regel])).toBeNull();
  });
});

describe("ETEN_PRIJZEN", () => {
  it("heeft per regel een catalogussleutel, bronomschrijving en datum", () => {
    const sleutels = new Set(FOOD_CATALOG.map((e) => e.key));
    for (const p of ETEN_PRIJZEN) {
      expect(sleutels.has(p.key)).toBe(true);
      expect(p.bron.length).toBeGreaterThan(0);
      if (p.bronUrl) expect(p.bronUrl.startsWith("https://")).toBe(true);
      expect(p.gecontroleerd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.verpakkingCenten).toBeGreaterThan(0);
    }
  });
  it("kent geen sleutel dubbel", () => {
    const keys = ETEN_PRIJZEN.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
