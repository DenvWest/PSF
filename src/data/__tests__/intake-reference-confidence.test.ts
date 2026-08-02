import { describe, expect, it } from "vitest";
import {
  NUTRIENT_IDS,
  nutrientReferences,
} from "@/data/nutrition/intake-reference";

describe("nutrientReferences zekerheid", () => {
  it("geeft elke nutriënt een zekerheid van 1 tot 4 met een toelichting", () => {
    for (const id of NUTRIENT_IDS) {
      const reference = nutrientReferences[id];
      expect(reference.confidence, `zekerheid ontbreekt voor ${id}`).toBeGreaterThanOrEqual(1);
      expect(reference.confidence).toBeLessThanOrEqual(4);
      expect(reference.confidenceWhy.length, `toelichting leeg voor ${id}`).toBeGreaterThan(0);
    }
  });

  it("houdt de rangorde uit de bron-comments aan: eiwit hoogst, magnesium en vitamine D laagst", () => {
    expect(nutrientReferences.protein.confidence).toBe(4);
    expect(nutrientReferences.omega3.confidence).toBe(3);
    expect(nutrientReferences.zinc.confidence).toBe(2);
    expect(nutrientReferences.magnesium.confidence).toBe(1);
    expect(nutrientReferences.vitamin_d.confidence).toBe(1);
  });
});

describe("nutrientReferences bloedmarker", () => {
  it("geeft elke nutriënt een bloedmarker met reden", () => {
    for (const id of NUTRIENT_IDS) {
      const marker = nutrientReferences[id].bloodMarker;
      expect(["improves", "limited", "none"]).toContain(marker.value);
      expect(marker.why.length, `bloedmarker-reden leeg voor ${id}`).toBeGreaterThan(0);
    }
  });

  it("laat vitamine D als enige stof waar een bloedwaarde de schatting harder maakt", () => {
    const improving = NUTRIENT_IDS.filter(
      (id) => nutrientReferences[id].bloodMarker.value === "improves",
    );
    expect(improving).toEqual(["vitamin_d"]);
  });
});
