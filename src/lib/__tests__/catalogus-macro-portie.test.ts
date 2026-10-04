import { describe, expect, it } from "vitest";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { macroPortieVoor, metCatalogusNaam } from "@/lib/catalogus-macro-portie";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const product = { prodId: "nevo:2297", bron: "nevo", naam: "Tonijn rauw" } as SupermarktProduct;

describe("macroPortieVoor", () => {
  it("geeft de NEVO-code voor een regel zonder kernstofwaarde", () => {
    const entry = catalogEntry("tonijn-vers");
    if (!entry) throw new Error("tonijn-vers ontbreekt");
    expect(macroPortieVoor(entry)).toEqual({ nevoCode: "2297", benadering: false });
  });

  it("laat een regel met kernstofwaarde op het kernstoffenscherm", () => {
    const entry = catalogEntry("tonijn-blik");
    if (!entry) throw new Error("tonijn-blik ontbreekt");
    expect(macroPortieVoor(entry)).toBeNull();
  });

  it("markeert een benaderingskoppeling", () => {
    const entry = catalogEntry("broccoli-diepvries");
    if (!entry) throw new Error("broccoli-diepvries ontbreekt");
    expect(macroPortieVoor(entry)?.benadering).toBe(true);
  });
});

describe("metCatalogusNaam", () => {
  it("noemt een benadering als benadering", () => {
    const entry = catalogEntry("broccoli-diepvries");
    if (!entry) throw new Error("ontbreekt");
    const naam = metCatalogusNaam(product, entry, { nevoCode: "920", benadering: true }).naam;
    expect(naam).toBe(`${entry.labelNl} (benadering)`);
  });
});

describe("macroPortieVoor ongeachtKernstof", () => {
  it("geeft ook de NEVO-code voor een regel mét kernstofwaarde", () => {
    const entry = catalogEntry("tonijn-blik");
    if (!entry) throw new Error("tonijn-blik ontbreekt");
    expect(macroPortieVoor(entry, { ongeachtKernstof: true })).toEqual({ nevoCode: "1590", benadering: false });
  });
});
