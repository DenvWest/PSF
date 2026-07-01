import { describe, expect, it } from "vitest";
import type { DomainScores } from "@/lib/intake-engine";
import { INTERVENTION_DOMAIN_SCORE_KEYS } from "@/lib/intake-engine";
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
  connection_score: 55,
};

describe("resolveVitaliteitFacets", () => {
  it("levert 5 interventie-facets met self_report, weight 1.0 en juiste value-mapping", () => {
    const facets = resolveVitaliteitFacets(sampleScores);

    expect(facets).toHaveLength(5);

    const expected: Record<FacetKey, number> = {
      sleep: 70,
      stress: 60,
      nutrition: 50,
      movement: 40,
      connection: 55,
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

  it("default ontbrekende connection_score naar 0 (pre-1.3.0 sessies)", () => {
    const { connection_score: _ignored, ...withoutConnection } = sampleScores;
    void _ignored;
    const facets = resolveVitaliteitFacets(withoutConnection as DomainScores);
    const connection = facets.find((facet) => facet.key === "connection");
    expect(connection?.value).toBe(0);
    expect(computeVitaliteit(facets)).toBe(44);
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

describe("intervention facet invariant", () => {
  it("heeft voor elke INTERVENTION_DOMAIN_SCORE_KEY een vitaliteits-facet", () => {
    const facets = resolveVitaliteitFacets(sampleScores);
    const facetScoreKeys = facets.map((facet) => {
      if (facet.key === "sleep") return "sleep_score";
      if (facet.key === "stress") return "stress_score";
      if (facet.key === "nutrition") return "nutrition_score";
      if (facet.key === "movement") return "movement_score";
      return "connection_score";
    });
    for (const key of INTERVENTION_DOMAIN_SCORE_KEYS) {
      expect(facetScoreKeys).toContain(key);
    }
  });
});
