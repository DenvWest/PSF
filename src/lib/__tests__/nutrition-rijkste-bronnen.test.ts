import { describe, expect, it } from "vitest";
import { FOOD_CATALOG_NEVO_GEHALTES } from "@/data/nutrition/food-catalog-nevo-gehaltes";
import { INFORMATIEVE_STOFFEN, MIN_KCAL_PER_100G, rijksteBronnen, stofInfo } from "@/lib/nutrition-rijkste-bronnen";

describe("rijksteBronnen", () => {
  it("rangschikt aflopend en beperkt tot de limiet", () => {
    const bronnen = rijksteBronnen("magnesium", "portie", 5);
    expect(bronnen).toHaveLength(5);
    for (let i = 1; i < bronnen.length; i++) {
      expect(bronnen[i - 1].waarde).toBeGreaterThanOrEqual(bronnen[i].waarde);
    }
  });

  it("houdt per bereidingsgroep alleen de rijkste variant", () => {
    const groepen = rijksteBronnen("magnesium", "100kcal", 50).map((b) => b.entry.imageOwner ?? b.entry.key);
    expect(new Set(groepen).size).toBe(groepen.length);
  });

  it("laat per 100 kcal producten met bijna geen energie weg", () => {
    for (const bron of rijksteBronnen("magnesium", "100kcal", 50)) {
      expect(FOOD_CATALOG_NEVO_GEHALTES[bron.entry.key]?.energy_kcal ?? 0).toBeGreaterThanOrEqual(MIN_KCAL_PER_100G);
    }
  });

  it("geeft per 100 kcal een andere volgorde dan per 100 g", () => {
    const per100g = rijksteBronnen("magnesium", "100g", 3).map((b) => b.entry.key);
    const perKcal = rijksteBronnen("magnesium", "100kcal", 3).map((b) => b.entry.key);
    expect(perKcal).not.toEqual(per100g);
  });

  it("draagt vezels en energie per portie als context", () => {
    const spinazie = rijksteBronnen("magnesium", "100kcal", 50).find((b) => b.entry.key === "spinazie-gekookt");
    expect(spinazie?.vezelsPerPortie).toBeGreaterThan(0);
    expect(spinazie?.kcalPerPortie).toBeGreaterThan(0);
  });
});

describe("rijksteBronnen voor informatieve stoffen", () => {
  it("levert voor elke informatieve stof een lijst uit NEVO", () => {
    for (const stof of INFORMATIEVE_STOFFEN) {
      expect(rijksteBronnen(stof, "portie", 5).length).toBeGreaterThan(0);
    }
  });

  it("laat sauzen buiten de lijst", () => {
    for (const stof of INFORMATIEVE_STOFFEN) {
      for (const bron of rijksteBronnen(stof, "100kcal", 50)) {
        expect(bron.entry.category).not.toBe("sauzen");
      }
    }
  });

  it("geeft een RI voor mineralen en vitamines, niet voor vezels", () => {
    expect(stofInfo("calciumMg").ri).toBe(800);
    expect(stofInfo("fiberG").ri).toBeNull();
    expect(stofInfo("protein").ri).toBeNull();
    expect(stofInfo("magnesium").ri).toBe(375);
  });
});
