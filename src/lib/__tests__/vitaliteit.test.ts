import { describe, expect, it } from "vitest";
import type { DomainScores } from "@/lib/intake-engine";
import {
  computeVitaliteit,
  resolveVitaliteitFacets,
  vitaliteitBand,
  type FacetKey,
  type VitaliteitFacet,
} from "@/lib/vitaliteit";

const sampleScores: DomainScores = {
  sleep_score: 70,
  energy_score: 99,
  stress_score: 60,
  nutrition_score: 50,
  movement_score: 40,
  recovery_score: 30,
};

describe("resolveVitaliteitFacets", () => {
  it("levert 4 interventie-facets met self_report, weight 1.0 en juiste value-mapping", () => {
    const facets = resolveVitaliteitFacets(sampleScores);

    expect(facets).toHaveLength(4);

    const expected: Record<FacetKey, number> = {
      sleep: 70,
      stress: 60,
      nutrition: 50,
      movement: 40,
    };

    for (const facet of facets) {
      expect(facet.source).toBe("self_report");
      expect(facet.weight).toBe(1.0);
      expect(facet.value).toBe(expected[facet.key]);
    }

    expect(facets.some((facet) => facet.key === "sleep" && facet.value === 99)).toBe(
      false,
    );
  });
});

describe("computeVitaliteit", () => {
  it("geeft het gewogen gemiddelde terug", () => {
    const facets = resolveVitaliteitFacets(sampleScores);
    expect(computeVitaliteit(facets)).toBe(55);
  });

  it("geeft 0 bij lege input", () => {
    expect(computeVitaliteit([])).toBe(0);
  });

  it("geeft 0 bij totaalgewicht 0", () => {
    const facets: VitaliteitFacet[] = [
      { key: "sleep", value: 80, source: "self_report", weight: 0 },
      { key: "stress", value: 60, source: "self_report", weight: 0 },
    ];
    expect(computeVitaliteit(facets)).toBe(0);
  });
});

describe("vitaliteitBand", () => {
  it("hergebruikt display-drempels", () => {
    expect(vitaliteitBand(85)).toBe("Sterk");
    expect(vitaliteitBand(65)).toBe("Voldoende");
    expect(vitaliteitBand(45)).toBe("Aandacht");
    expect(vitaliteitBand(20)).toBe("Prioriteit");
  });
});
