import { describe, expect, it } from "vitest";
import {
  buildDomainRailTools,
  buildKeuzeRailDomains,
  buildKompasRailDomains,
  resolveVoortgangRailActiveItem,
  KOMPAS_RAIL_PILLAR_IDS,
  VOORTGANG_RAIL_ITEMS,
} from "@/lib/context-rail";

describe("buildKompasRailDomains", () => {
  it("geeft de zichtbare domeinen in vaste volgorde", () => {
    const domains = buildKompasRailDomains({});
    expect(domains.map((domain) => domain.id)).toEqual(KOMPAS_RAIL_PILLAR_IDS);
    expect(domains).toHaveLength(1);
  });

  // Verbinding en stress worden nog gemeten maar niet meer getoond; zie
  // `zichtbare-domeinen.ts` voor waarom de score wél blijft bestaan.
  it("laat elk verborgen domein uit de rail", () => {
    const domains = buildKompasRailDomains({
      verbinding: 40, stress: 10, slaap: 20, beweging: 30,
    });
    expect(domains.map((domain) => domain.id)).toEqual(["voeding"]);
  });

  it("vult label, icon en kleur uit de pilaar-data en rondt de score af", () => {
    const domains = buildKompasRailDomains({ voeding: 62.4 });
    const voeding = domains[0];

    expect(voeding.label).toBe("Voeding");
    expect(voeding.score).toBe(62);
    expect(buildKompasRailDomains({ voeding: 41.6 })[0].score).toBe(42);
  });

  it("valt terug op 0 voor domeinen zonder score", () => {
    const domains = buildKompasRailDomains({ slaap: 70 });
    expect(domains.find((domain) => domain.id === "voeding")?.score).toBe(0);
  });
});

describe("buildDomainRailTools", () => {
  it("houdt de beweegcheck een echte link naar de intake", () => {
    const tools = buildDomainRailTools("beweging");

    expect(tools.find((tool) => tool.id === "checkin")?.href).toBe(
      "/intake/beweging?from=dashboard&kompas=beweging",
    );
  });

  it("geeft beweging check, keuze en gids — in die volgorde", () => {
    const tools = buildDomainRailTools("beweging");

    expect(tools.map((tool) => tool.id)).toEqual(["checkin", "schap", "gids"]);
    expect(tools.find((tool) => tool.id === "schap")?.label).toBe("Keuze");
    expect(tools.find((tool) => tool.id === "schap")?.href).toBe(
      "/dashboard?tab=keuze&domein=beweging&deel=producten",
    );
    expect(tools.find((tool) => tool.id === "gids")?.href).toBe("/gids/beweging");
  });

  it("geeft elk domein een check, ook waar geen gids bestaat", () => {
    for (const domain of ["slaap", "stress", "voeding", "verbinding"] as const) {
      const tools = buildDomainRailTools(domain);
      expect(tools[0]?.id).toBe("checkin");
    }
  });

  it("draagt schap alleen op de domeinen die er een hebben", () => {
    for (const domain of ["beweging", "slaap", "voeding"] as const) {
      expect(buildDomainRailTools(domain).map((tool) => tool.id)).toContain("schap");
    }
    for (const domain of ["stress", "verbinding"] as const) {
      expect(buildDomainRailTools(domain).map((tool) => tool.id)).not.toContain("schap");
    }
  });

  it("draagt geen reset-ingang — die wordt pas ingesteld als het scherm bestaat", () => {
    for (const domain of ["beweging", "slaap", "stress", "voeding", "verbinding"] as const) {
      expect(buildDomainRailTools(domain).map((tool) => tool.id)).not.toContain("reset");
    }
  });

  it("zet verbinding-check op disabled — die meet mee in de hermeting", () => {
    const check = buildDomainRailTools("verbinding")[0];

    expect(check?.disabled).toBe(true);
    expect(check?.href).toBeUndefined();
    expect(check?.disabledHint).toContain("hermeting");
  });
});

describe("VOORTGANG_RAIL_ITEMS", () => {
  it("toont Je patroon en Hermeting — het schap is de Keuze-tab, Leefstijlprofiel is opgeheven", () => {
    expect(VOORTGANG_RAIL_ITEMS.map((item) => item.id)).toEqual(["hub", "hermeting"]);
    expect(VOORTGANG_RAIL_ITEMS.find((item) => item.id === "hermeting")?.icon).toBe(
      "Calendar",
    );
  });
});

describe("resolveVoortgangRailActiveItem", () => {
  it("licht hub en hermeting op", () => {
    expect(resolveVoortgangRailActiveItem("hub")).toBe("hub");
    expect(resolveVoortgangRailActiveItem("hermeting")).toBe("hermeting");
  });
});

describe("buildKeuzeRailDomains", () => {
  it("zet alle vijf domeinen in de schakelaar", () => {
    expect(buildKeuzeRailDomains().map((item) => item.id)).toEqual(KOMPAS_RAIL_PILLAR_IDS);
  });

  it("laat alleen voeding open", () => {
    const open = buildKeuzeRailDomains().filter((item) => item.disabledHint == null);
    expect(open.map((item) => item.id).sort()).toEqual(["voeding"]);
  });

  /**
   * Stress was het laatste domein achter een poort. Nu het helemaal verborgen
   * is, staat er niets meer dicht — en dat hoort zo te blijven: een domein
   * dat in de rail staat, moet ook ergens heen gaan.
   */
  it("laat geen dicht domein in de keuzerail achter", () => {
    const gated = buildKeuzeRailDomains().filter((item) => item.disabledHint != null);
    expect(gated).toEqual([]);
  });

  it("toont stress niet meer in de keuzerail", () => {
    expect(buildKeuzeRailDomains().map((item) => item.id)).not.toContain("stress");
  });
});
