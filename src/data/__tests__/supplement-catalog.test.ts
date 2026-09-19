import { describe, it, expect } from "vitest";
import {
  SUPPLEMENT_CATALOG,
  searchSupplementCatalog,
  supplementCatalogEntry,
} from "@/data/nutrition/supplement-catalog";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";

describe("de supplementcatalogus is intern consistent", () => {
  it("heeft geen dubbele sleutels", () => {
    const gezien = new Map<string, number>();
    for (const entry of SUPPLEMENT_CATALOG) {
      gezien.set(entry.key, (gezien.get(entry.key) ?? 0) + 1);
    }
    const dubbel = [...gezien.entries()].filter(([, n]) => n > 1).map(([key]) => key);
    expect(dubbel).toEqual([]);
  });

  it("gebruikt alleen nutriënten die bestaan", () => {
    const toegestaan = new Set(NUTRIENT_IDS);
    const onbekend = SUPPLEMENT_CATALOG.filter((entry) => !toegestaan.has(entry.nutrient));
    expect(onbekend.map((e) => e.key)).toEqual([]);
  });

  it("draagt elke regel minstens één portie met een label en een positief bedrag", () => {
    const fout = SUPPLEMENT_CATALOG.filter(
      (entry) =>
        entry.porties.length === 0 ||
        entry.porties.some((p) => !p.labelNl.trim() || !(p.amount > 0)),
    );
    expect(fout.map((e) => e.key)).toEqual([]);
  });

  it("dekt elk van de vier balken-nutriënten met minstens één product", () => {
    const balken = ["magnesium", "protein", "zinc", "omega3"] as const;
    for (const nutrient of balken) {
      const gedekt = SUPPLEMENT_CATALOG.some((entry) => entry.nutrient === nutrient);
      expect(gedekt).toBe(true);
    }
  });
});

describe("zoeken", () => {
  it("vindt een supplement op zijn label", () => {
    const treffers = searchSupplementCatalog("magnesium");
    expect(treffers.length).toBeGreaterThan(0);
    expect(treffers.every((t) => t.labelNl.toLowerCase().includes("magnesium"))).toBe(true);
  });

  it("vindt een supplement op een synoniem", () => {
    expect(searchSupplementCatalog("whey").map((t) => t.key)).toContain(
      "wei-eiwitpoeder-schep",
    );
  });

  it("geeft niets terug op een lege zoekterm", () => {
    expect(searchSupplementCatalog("   ")).toEqual([]);
  });

  it("vindt een regel terug op zijn sleutel", () => {
    expect(supplementCatalogEntry("visolie-capsule-1000mg")?.nutrient).toBe("omega3");
    expect(supplementCatalogEntry("bestaat-niet")).toBeNull();
  });
});
