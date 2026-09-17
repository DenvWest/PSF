import { describe, expect, it } from "vitest";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import {
  allIndexedFoods,
  amountOf,
  FOOD_INDEX,
  indexedFood,
  multiNutrientFoods,
  NUTRIENT_ORDER,
} from "@/lib/nutrition-food-index";

describe("de omkering zelf", () => {
  it("kent elk voedingsmiddel precies één keer, over alle vijf de lijsten", () => {
    const alleRijen = NUTRIENT_ORDER.flatMap((n) => FOOD_SOURCES[n] ?? []);
    const unieke = new Set(alleRijen.map((r) => r.key));

    expect(FOOD_INDEX.size).toBe(unieke.size);
    expect(alleRijen.length).toBeGreaterThan(FOOD_INDEX.size);
  });

  it("verwijst naar dezelfde objecten als FOOD_SOURCES, zonder te kopiëren", () => {
    const eersteMagnesium = FOOD_SOURCES.magnesium[0];
    const viaIndex = indexedFood(eersteMagnesium.key)
      ?.nutrients.find((n) => n.nutrient === "magnesium");

    expect(viaIndex?.source).toBe(eersteMagnesium);
  });

  it("houdt de nutriëntvolgorde vast, zodat kolommen niet verschuiven", () => {
    for (const food of allIndexedFoods()) {
      const posities = food.nutrients.map((n) => NUTRIENT_ORDER.indexOf(n.nutrient));
      expect(posities).toEqual([...posities].sort((a, b) => a - b));
    }
  });
});

/**
 * De invariant die de omkering aan het licht bracht.
 *
 * Zolang de tabel per nutriënt gelezen werd, zag je altijd maar één rij per
 * voedingsmiddel en viel een verschil tussen twee lijsten niet op. In de
 * omkering staan ze naast elkaar, en dan moet er één winnen. Deze twee tests
 * zorgen dat zo'n verschil voortaan de build breekt in plaats van stilletjes
 * een andere portie te tonen afhankelijk van welk scherm je opent.
 */
describe("dezelfde sleutel beschrijft hetzelfde voedingsmiddel", () => {
  it("draagt overal dezelfde portie", () => {
    const perKey = new Map<string, Map<string, string[]>>();

    for (const nutrient of NUTRIENT_ORDER) {
      for (const rij of FOOD_SOURCES[nutrient] ?? []) {
        const porties = perKey.get(rij.key) ?? new Map<string, string[]>();
        porties.set(rij.portionNl, [...(porties.get(rij.portionNl) ?? []), nutrient]);
        perKey.set(rij.key, porties);
      }
    }

    const conflicten = [...perKey.entries()]
      .filter(([, porties]) => porties.size > 1)
      .map(([key, porties]) => {
        const uitleg = [...porties.entries()]
          .map(([portie, lijsten]) => `${portie} (${lijsten.join(", ")})`)
          .join(" vs. ");
        return `${key}: ${uitleg}`;
      });

    expect(conflicten).toEqual([]);
  });

  it("draagt overal hetzelfde label", () => {
    const perKey = new Map<string, Set<string>>();

    for (const nutrient of NUTRIENT_ORDER) {
      for (const rij of FOOD_SOURCES[nutrient] ?? []) {
        perKey.set(rij.key, (perKey.get(rij.key) ?? new Set()).add(rij.labelNl));
      }
    }

    const conflicten = [...perKey.entries()]
      .filter(([, labels]) => labels.size > 1)
      .map(([key, labels]) => `${key}: ${[...labels].join(" vs. ")}`);

    expect(conflicten).toEqual([]);
  });
});

describe("opzoeken", () => {
  it("geeft een gehalte terug per eigen portie", () => {
    const havermout = indexedFood("havermout");

    expect(havermout).not.toBeNull();
    expect(havermout!.nutrients.length).toBeGreaterThan(1);
    expect(amountOf("havermout", "magnesium")).toBeGreaterThan(0);
  });

  it("geeft null en nooit nul voor wat de tabel niet weet", () => {
    expect(indexedFood("bestaat-niet")).toBeNull();
    expect(amountOf("bestaat-niet", "magnesium")).toBeNull();
    // Havermout kent de tabel wél, maar niet voor omega-3.
    expect(amountOf("havermout", "omega3")).toBeNull();
  });

  it("zet de voedingsmiddelen met de meeste nutriënten vooraan", () => {
    const multi = multiNutrientFoods();

    expect(multi.length).toBeGreaterThan(0);
    expect(multi[0].nutrients.length).toBeGreaterThanOrEqual(
      multi[multi.length - 1].nutrients.length,
    );
    expect(multi.every((f) => f.nutrients.length > 1)).toBe(true);
  });
});
