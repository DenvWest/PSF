import { describe, expect, it } from "vitest";
import {
  buildBewegingRailTools,
  buildKompasRailDomains,
  KOMPAS_RAIL_PILLAR_IDS,
} from "@/lib/context-rail";

const baseTools = {
  nutritionLogCompleted: true,
  hasRecommendations: true,
};

describe("buildKompasRailDomains", () => {
  it("geeft vijf domeinen in vaste volgorde", () => {
    const domains = buildKompasRailDomains({});
    expect(domains.map((domain) => domain.id)).toEqual(KOMPAS_RAIL_PILLAR_IDS);
    expect(domains).toHaveLength(5);
  });

  it("vult label, icon en kleur uit de pilaar-data en rondt de score af", () => {
    const domains = buildKompasRailDomains({ slaap: 62.4, beweging: 41.6 });
    const slaap = domains[0];
    const beweging = domains[1];

    expect(slaap.label).toBe("Slaap");
    expect(slaap.icon).toBe("Moon");
    expect(slaap.color).toBe("#5B6EAE");
    expect(slaap.score).toBe(62);
    expect(beweging.score).toBe(42);
  });

  it("valt terug op 0 voor domeinen zonder score", () => {
    const domains = buildKompasRailDomains({ slaap: 70 });
    expect(domains.find((domain) => domain.id === "verbinding")?.score).toBe(0);
  });
});

describe("buildBewegingRailTools", () => {
  it("zet supplementen op slot zolang de voedingscheck niet gedaan is", () => {
    const tools = buildBewegingRailTools({
      ...baseTools,
      nutritionLogCompleted: false,
    });
    const supplementen = tools.find((tool) => tool.id === "supplementen");

    expect(supplementen?.disabled).toBe(true);
    expect(supplementen?.disabledHint).toContain("voedingscheck");
  });

  it("opent supplementen zodra de voedingscheck gedaan is, ook zonder signalen", () => {
    const tools = buildBewegingRailTools({
      ...baseTools,
      hasRecommendations: false,
    });
    const supplementen = tools.find((tool) => tool.id === "supplementen");

    expect(supplementen?.disabled).toBe(false);
    expect(supplementen?.disabledHint).toBeUndefined();
  });

  it("houdt de beweegcheck een echte link naar de intake", () => {
    const tools = buildBewegingRailTools(baseTools);

    expect(tools.find((tool) => tool.id === "checkin")?.href).toBe(
      "/intake/beweging?from=dashboard&kompas=beweging",
    );
  });

  it("bevat ook de gratis Bewegingsgids en Leefstijl & inzichten als echte links", () => {
    const tools = buildBewegingRailTools(baseTools);

    expect(tools).toHaveLength(4);
    expect(tools.find((tool) => tool.id === "gids")?.href).toBe("/gids/beweging");
    expect(tools.find((tool) => tool.id === "inzichten")?.href).toBe("/inzichten");
  });
});
