import { describe, expect, it } from "vitest";
import { FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import { FOOD_CATALOG_NEVO, isNevoBenadering, nevoKoppelingVoor } from "@/data/nutrition/food-catalog-nevo";

describe("FOOD_CATALOG_NEVO", () => {
  const keys = new Set(FOOD_CATALOG.map((e) => e.key));

  it("koppelt alleen bestaande catalogusregels", () => {
    for (const key of Object.keys(FOOD_CATALOG_NEVO)) {
      expect(keys.has(key), `${key} staat niet in FOOD_CATALOG`).toBe(true);
    }
  });

  it("draagt per koppeling een numerieke NEVO-code en een bekende basis", () => {
    for (const [key, koppeling] of Object.entries(FOOD_CATALOG_NEVO)) {
      expect(koppeling.code, key).toMatch(/^\d+$/);
      expect(["bron", "naam", "handmatig", "benadering"], key).toContain(koppeling.basis);
    }
  });

  it("bevat geen waarden: een koppeling is alleen een code", () => {
    for (const koppeling of Object.values(FOOD_CATALOG_NEVO)) {
      expect(Object.keys(koppeling).sort()).toEqual(["basis", "code"]);
    }
  });

  it("koppelt een gekozen regel en geeft null voor een ongekoppelde", () => {
    expect(nevoKoppelingVoor("spinazie-rauw")).toEqual({ code: "51", basis: "bron" });
    expect(nevoKoppelingVoor("bestaat-niet")).toBeNull();
  });

  it("markeert een regel zonder eigen NEVO-record als benadering", () => {
    const kip = nevoKoppelingVoor("kipdij");
    expect(kip?.basis).toBe("benadering");
    expect(kip && isNevoBenadering(kip)).toBe(true);
    const spinazie = nevoKoppelingVoor("spinazie-rauw");
    expect(spinazie && isNevoBenadering(spinazie)).toBe(false);
  });
});
