import { describe, expect, it } from "vitest";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { zonderCatalogusDubbelen } from "@/lib/zoek-dubbelen";
import type { SupermarktProduct } from "@/types/supermarkt-product";

function product(bron: "off" | "nevo", bronId: string): SupermarktProduct {
  return {
    prodId: `${bron}:${bronId}`, bron, bronId, naam: "x", merk: null, categorie: null, snapshotDatum: "2025-01-01",
    energyKcal: null, fatG: null, saturatedFatG: null, transFatG: null, carbohydrateG: null, sugarsG: null, fiberG: null,
    proteinG: null, saltG: null, sodiumMg: null, calciumMg: null, ironMg: null, vitaminCMg: null, vitaminDµg: null, potassiumMg: null, magnesiumMg: null, zincMg: null, vitaminB12µg: null,
  };
}

describe("zonderCatalogusDubbelen", () => {
  const tonijn = catalogEntry("tonijn-blik");
  const broccoliDiepvries = catalogEntry("broccoli-diepvries");

  it("verbergt de NEVO-treffer die dezelfde code heeft als een getoonde catalogusregel", () => {
    if (!tonijn) throw new Error("tonijn-blik ontbreekt");
    const uit = zonderCatalogusDubbelen([product("nevo", "1590"), product("nevo", "999")], [tonijn]);
    expect(uit.map((p) => p.bronId)).toEqual(["999"]);
  });

  it("laat de treffer staan als de catalogusregel niet getoond wordt", () => {
    expect(zonderCatalogusDubbelen([product("nevo", "1590")], [])).toHaveLength(1);
  });

  it("laat een Open Food Facts-product met dezelfde id staan", () => {
    if (!tonijn) throw new Error("tonijn-blik ontbreekt");
    expect(zonderCatalogusDubbelen([product("off", "1590")], [tonijn])).toHaveLength(1);
  });

  it("negeert een benaderingskoppeling", () => {
    if (!broccoliDiepvries) throw new Error("broccoli-diepvries ontbreekt");
    expect(zonderCatalogusDubbelen([product("nevo", "920")], [broccoliDiepvries])).toHaveLength(1);
  });
});
