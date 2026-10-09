import { describe, expect, it } from "vitest";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { etiketBronVoor, etiketVanProduct } from "@/lib/nutrition-etiket";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const product = {
  prodId: "nevo:920",
  energyKcal: 27,
  proteinG: 3.9,
  potassiumMg: 399,
  vitaminCMg: 38,
} as unknown as SupermarktProduct;

describe("etiketBronVoor", () => {
  it("geeft het hele etiket bij een eigen NEVO-koppeling", () => {
    const bron = etiketBronVoor(catalogEntry("biefstuk"));
    expect(bron).toMatchObject({ code: "1400", benadering: false, naam: null });
    expect(bron?.velden.map((v) => v.veld)).toContain("potassiumMg");
  });

  it("geeft het hele etiket met NEVO-naam bij een vrijgegeven benadering", () => {
    const bron = etiketBronVoor(catalogEntry("broccoli-diepvries"));
    expect(bron).toMatchObject({ code: "920", benadering: true, naam: "Broccoli gekookt" });
    expect(bron?.velden.map((v) => v.veld)).toContain("calciumMg");
  });

  it("beperkt een niet-vrijgegeven benadering tot energie en macro's", () => {
    const bron = etiketBronVoor(catalogEntry("margarine"));
    expect(bron?.benadering).toBe(true);
    expect(bron?.velden.map((v) => v.veld).sort()).toEqual(["carbohydrateG", "energyKcal", "fatG", "proteinG"]);
  });

  it("geeft null zonder koppeling", () => {
    expect(etiketBronVoor(catalogEntry("zuurkool"))).toBeNull();
  });
});

describe("etiketVanProduct", () => {
  it("rekent naar de portie en houdt een onbekend veld op null", () => {
    const bron = etiketBronVoor(catalogEntry("broccoli-diepvries"));
    if (!bron) throw new Error("geen bron");
    const etiket = etiketVanProduct(product, bron, 80);
    expect(etiket.rijen.find((r) => r.veld === "potassiumMg")?.waarde).toBeCloseTo(319.2, 1);
    expect(etiket.rijen.find((r) => r.veld === "ironMg")?.waarde).toBeNull();
    expect(etiket.metWaarde).toBe(1);
  });
});
