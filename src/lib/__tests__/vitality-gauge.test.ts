import { describe, expect, it } from "vitest";
import { CHECKS } from "@/data/dashboard";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import {
  countVitalityFacetsOnPeil,
  getVitalityBand,
  getVitalityBandMessage,
  VITALITY_BANDS,
  VITALITY_BAND_ARC_LABELS,
  VITALITY_FACET_COUNT,
  VITALITY_ON_PEIL_MIN,
} from "@/lib/vitality-gauge";
import type { CheckScores } from "@/types/dashboard";

describe("getVitalityBand", () => {
  it("returns uit_balans for low scores", () => {
    expect(getVitalityBand(10).id).toBe("uit_balans");
  });

  it("returns optimaal for high scores", () => {
    expect(getVitalityBand(90).id).toBe("optimaal");
  });

  it("clamps out-of-range values", () => {
    expect(getVitalityBand(-5).id).toBe(VITALITY_BANDS[0].id);
    expect(getVitalityBand(150).id).toBe("optimaal");
  });
});

describe("getVitalityBandMessage", () => {
  it("includes the optional category label", () => {
    const message = getVitalityBandMessage(90, "Je voeding");
    expect(message).toContain("Je voeding");
  });
});

describe("VITALITY_BAND_ARC_LABELS", () => {
  it("matches band labels for consistent gauge copy", () => {
    for (const band of VITALITY_BANDS) {
      expect(VITALITY_BAND_ARC_LABELS[band.id]).toBe(band.label);
    }
  });
});

describe("countVitalityFacetsOnPeil", () => {
  const baseScores: CheckScores = {
    slaap: 50,
    energie: 50,
    stress: 50,
    voeding: 50,
    beweging: 50,
    herstel: 50,
  };

  it("derives threshold from goed band", () => {
    expect(VITALITY_ON_PEIL_MIN).toBe(55);
    expect(VITALITY_FACET_COUNT).toBe(4);
  });

  it("counts all four intervention facets when each is on peil", () => {
    const scores: CheckScores = {
      ...baseScores,
      slaap: 58,
      stress: 58,
      voeding: 58,
      beweging: 58,
      herstel: 58,
    };
    expect(countVitalityFacetsOnPeil(scores)).toBe(4);
    expect(getVitalityBand(58).id).toBe("goed");
  });

  it("excludes energie from the count", () => {
    expect(
      countVitalityFacetsOnPeil({
        ...baseScores,
        energie: 80,
      }),
    ).toBe(0);
  });

  it("matches dev check1 facet scores", () => {
    const scores = CHECKS.check1.scores;
    expect(countVitalityFacetsOnPeil(scores)).toBe(2);
    const domainScores = {
      sleep_score: scores.slaap,
      energy_score: scores.energie,
      stress_score: scores.stress,
      nutrition_score: scores.voeding,
      movement_score: scores.beweging,
      recovery_score: scores.herstel,
    };
    expect(computeVitaliteit(resolveVitaliteitFacets(domainScores))).toBe(54);
  });
});
