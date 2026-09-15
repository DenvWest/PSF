import { describe, expect, it } from "vitest";
import {
  getAllPublicNutrientPages,
  getPublicNutrientPage,
  isVoedingStofSlug,
  voedingDatabaseStats,
  VOEDING_STOF_SLUGS,
} from "@/lib/voeding-public";
import { FOOD_SOURCES } from "@/data/nutrition/food-sources";
import { NUTRIENT_IDS } from "@/data/nutrition/intake-reference";

describe("voeding-public", () => {
  it("kent alle vijf stof-slugs", () => {
    expect(VOEDING_STOF_SLUGS).toHaveLength(5);
    for (const slug of VOEDING_STOF_SLUGS) {
      expect(isVoedingStofSlug(slug)).toBe(true);
    }
    expect(isVoedingStofSlug("onbekend")).toBe(false);
  });

  it("levert per stof maximaal zes bronnen uit FOOD_SOURCES", () => {
    for (const page of getAllPublicNutrientPages()) {
      expect(page.bronnen.length).toBeLessThanOrEqual(6);
      expect(page.bronnen.length).toBeGreaterThan(0);
      expect(page.comparisonPath.startsWith("/beste/")).toBe(true);
    }
  });

  it("houdt verifiedCount in sync met FOOD_SOURCES", () => {
    const page = getPublicNutrientPage("magnesium");
    const fromTable = FOOD_SOURCES.magnesium.slice(0, 6).filter((s) => s.verified && s.nutrientValue);
    expect(page.verifiedCount).toBe(fromTable.length);
  });

  it("rapporteert database-statistieken", () => {
    const stats = voedingDatabaseStats();
    expect(stats.catalogCount).toBeGreaterThan(300);
    expect(stats.verifiedCount).toBeGreaterThan(0);
    const manual = NUTRIENT_IDS.flatMap((id) => FOOD_SOURCES[id]).filter(
      (s) => s.verified && s.nutrientValue,
    ).length;
    expect(stats.verifiedCount).toBe(manual);
  });
});
