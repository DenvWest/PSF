import { describe, expect, it } from "vitest";
import {
  NUTRITION_GAP_NUTRIENTS,
  nutritionGapCoverage,
  nutritionGapLowCount,
} from "@/data/voedingstekort";

describe("voedingstekort-dekking", () => {
  it("plaatst plantaardig zonder aandacht onder gemengd eten op B12, jodium en omega-3", () => {
    expect(nutritionGapCoverage("b12", "plant")).toBeLessThan(
      nutritionGapCoverage("b12", "mixed"),
    );
    expect(nutritionGapCoverage("iodine", "plant")).toBeLessThan(
      nutritionGapCoverage("iodine", "mixed"),
    );
    expect(nutritionGapCoverage("omega3", "plant")).toBeLessThan(
      nutritionGapCoverage("omega3", "mixed"),
    );
  });

  it("laat B12 in een plantaardig patroon zonder aandacht bijna leeg", () => {
    expect(nutritionGapCoverage("b12", "plant")).toBeLessThan(15);
  });

  it("trekt de plantaardige gaten dicht tot boven de krappe-drempel", () => {
    for (const nutrient of NUTRITION_GAP_NUTRIENTS) {
      expect(
        nutrient.coverage.plantClosed,
        `${nutrient.id} blijft krap mét aandacht`,
      ).toBeGreaterThanOrEqual(70);
      expect(nutrient.coverage.plantClosed).toBeGreaterThan(
        nutrient.coverage.plant,
      );
    }
  });

  it("houdt vitamine D in elk patroon zonder winteraandacht krap", () => {
    expect(nutritionGapCoverage("vitaminD", "mixed")).toBeLessThan(50);
    expect(nutritionGapCoverage("vitaminD", "plant")).toBeLessThan(50);
  });

  it("telt meer krappe stoffen bij plantaardig zonder aandacht dan bij gemengd", () => {
    expect(nutritionGapLowCount("plant")).toBeGreaterThan(
      nutritionGapLowCount("mixed"),
    );
    expect(nutritionGapLowCount("plantClosed")).toBe(0);
  });

  it("houdt dekkingswaarden binnen 0–100", () => {
    for (const nutrient of NUTRITION_GAP_NUTRIENTS) {
      for (const value of Object.values(nutrient.coverage)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });
});
