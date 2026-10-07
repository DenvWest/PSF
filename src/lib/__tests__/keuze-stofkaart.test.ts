import { describe, expect, it } from "vitest";
import { FOOD_CATALOG } from "@/data/nutrition/food-catalog";
import type { KeuzeStofStand } from "@/lib/keuze-stof-stand";
import { brengtOokMee, checkOordeelVoorStof, euroPerDag, hoofdStof, isBronVan, supplementErbij } from "@/lib/keuze-stofkaart";
import type { StoredSupplementVerdict } from "@/types/verdict";

function stand(overrides: Partial<KeuzeStofStand>): KeuzeStofStand {
  return {
    nutrient: "magnesium",
    stand: "ruimte",
    venster: { dagen_terug: 7, dagen: 7, dagenMetBron: 5 },
    gemiddeld: 200,
    norm: 350,
    aandeel: 200 / 350,
    unit: "mg",
    zin: "",
    benaderd: false,
    ...overrides,
  };
}

function verdict(ingredientKey: string, supersededAt: string | null = null): StoredSupplementVerdict {
  return {
    id: ingredientKey,
    ingredientKey,
    verdict: "kopen",
    reasonKey: "trigger_matched",
    rulesVersion: "test",
    nextReviewAt: null,
    createdAt: "2026-09-05T10:00:00Z",
    supersededAt,
    basedOn: null,
  };
}

describe("supplementErbij", () => {
  it("telt etiket bij het dagboek op en legt magnesium alleen met het etiket tegen de supplementgrens", () => {
    const erbij = supplementErbij("magnesium", stand({}), { dosisPerDag: 120, eenheid: "mg" });
    expect(erbij.samen).toBe(320);
    expect(erbij.aandeelNorm).toBeCloseTo(320 / 350);
    expect(erbij.bovengrens).toMatchObject({ waarde: 250, basis: "etiket", boven: false });
  });

  it("meldt het als het etiket alleen al boven de grens uit supplementen zit", () => {
    const erbij = supplementErbij("magnesium", stand({}), { dosisPerDag: 300, eenheid: "mg" });
    expect(erbij.bovengrens?.boven).toBe(true);
  });

  it("legt zink zonder meetbaar dagboek alleen met het etiket tegen de totaalgrens, en zegt dat", () => {
    const erbij = supplementErbij(
      "zinc",
      stand({ nutrient: "zinc", stand: "niet_meetbaar", gemiddeld: null, norm: null, aandeel: null }),
      { dosisPerDag: 15, eenheid: "mg" },
    );
    expect(erbij.samen).toBeNull();
    expect(erbij.bovengrens).toMatchObject({ waarde: 25, basis: "etiket_zonder_eten", boven: false });
  });

  it("telt nooit op bij verschillende eenheden", () => {
    const erbij = supplementErbij("magnesium", stand({}), { dosisPerDag: 1, eenheid: "g" });
    expect(erbij.samen).toBeNull();
  });

  it("geeft bij eiwit geen bovengrens", () => {
    const erbij = supplementErbij("protein", stand({ nutrient: "protein", unit: "g", gemiddeld: 70, norm: 90 }), {
      dosisPerDag: 25,
      eenheid: "g",
    });
    expect(erbij.samen).toBe(95);
    expect(erbij.bovengrens).toBeNull();
  });
});

describe("brengtOokMee", () => {
  it("noemt bij haring naast omega-3 de andere stoffen die een portie flink levert, niet omega-3 zelf", () => {
    const haring = FOOD_CATALOG.find((entry) => entry.key === "haring");
    expect(haring).toBeTruthy();
    const ook = brengtOokMee(haring!, "omega3");
    expect(ook.length).toBeGreaterThan(0);
    expect(ook).not.toContain("omega-3");
    expect(ook.length).toBeLessThanOrEqual(3);
  });

  it("schrijft de IJ als één letter", () => {
    const quinoa = FOOD_CATALOG.find((entry) => entry.labelNl === "Quinoa, droog");
    expect(quinoa).toBeTruthy();
    const ook = brengtOokMee(quinoa!, "magnesium");
    expect(ook).toContain("ijzer");
    expect(ook.some((label) => label.startsWith("iJ"))).toBe(false);
  });
});

describe("checkOordeelVoorStof", () => {
  it("koppelt de stof aan het ingrediënt van het oordeel en slaat vervangen oordelen over", () => {
    const rijen = [verdict("eiwitpoeder", "2026-09-01T00:00:00Z"), verdict("magnesium")];
    expect(checkOordeelVoorStof("magnesium", rijen)?.ingredientKey).toBe("magnesium");
    expect(checkOordeelVoorStof("protein", rijen)).toBeNull();
  });
});

describe("euroPerDag", () => {
  it("schrijft centen als euro met komma", () => {
    expect(euroPerDag(14)).toBe("€ 0,14");
  });
});

describe("isBronVan", () => {
  it("haring is een bron van omega-3, niet van magnesium", () => {
    const haring = FOOD_CATALOG.find((entry) => entry.key === "haring")!;
    expect(isBronVan(haring, "omega3")).toBe(true);
    expect(isBronVan(haring, "magnesium")).toBe(false);
  });
});

describe("hoofdStof", () => {
  it("forel hoort bij omega-3, ook al is hij ook een bron van eiwit en vitamine D", () => {
    const forel = FOOD_CATALOG.find((entry) => entry.key === "forel")!;
    expect(hoofdStof(forel, ["protein", "omega3", "magnesium", "zinc", "vitamin_d"])).toBe("omega3");
    expect(hoofdStof(forel, ["magnesium", "zinc"])).toBeNull();
  });
});
