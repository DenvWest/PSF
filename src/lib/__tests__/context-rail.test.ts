import { describe, expect, it } from "vitest";
import {
  buildDomainRailTools,
  buildKeuzeRailDomains,
  buildKompasRailDomains,
  resolveVoortgangRailActiveItem,
  KOMPAS_RAIL_PILLAR_IDS,
  VOEDING_RAIL_LAYERS,
  VOORTGANG_RAIL_ITEMS,
} from "@/lib/context-rail";

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

describe("VOEDING_RAIL_LAYERS", () => {
  it("draagt de drie voeding-knoppen, met meten & timing vooraan", () => {
    expect(VOEDING_RAIL_LAYERS.map((layer) => layer.slug)).toEqual([
      "meten-timing",
      "eetbasis",
      "aanvullen",
    ]);
    expect(VOEDING_RAIL_LAYERS.map((layer) => layer.id)).toEqual([5, 1, 6]);
    expect(VOEDING_RAIL_LAYERS.map((layer) => layer.label)).toEqual([
      "Meten & timing",
      "Voedingsbasis",
      "Aanvullen & vergelijken",
    ]);
  });
});

describe("VOORTGANG_RAIL_ITEMS", () => {
  it("toont Overzicht, Leefstijlprofiel (User) en Hermeting (Calendar) — het schap is de Keuze-tab", () => {
    expect(VOORTGANG_RAIL_ITEMS.map((item) => item.id)).toEqual([
      "hub",
      "leefstijlprofiel",
      "hermeting",
    ]);
    expect(VOORTGANG_RAIL_ITEMS.find((item) => item.id === "leefstijlprofiel")?.icon).toBe(
      "User",
    );
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

  it("licht Leefstijlprofiel op voor inzichten, domein en leefstijlprofiel", () => {
    expect(resolveVoortgangRailActiveItem("leefstijlprofiel")).toBe("leefstijlprofiel");
    expect(resolveVoortgangRailActiveItem("inzichten")).toBe("leefstijlprofiel");
    expect(resolveVoortgangRailActiveItem("domein")).toBe("leefstijlprofiel");
  });

  it("valt terug op Overzicht voor het legacy schap-scherm", () => {
    expect(resolveVoortgangRailActiveItem("schap")).toBe("hub");
  });
});

describe("buildKeuzeRailDomains", () => {
  it("zet alle vijf domeinen in de schakelaar", () => {
    expect(buildKeuzeRailDomains().map((item) => item.id)).toEqual(KOMPAS_RAIL_PILLAR_IDS);
  });

  it("laat beweging, slaap en voeding open", () => {
    const open = buildKeuzeRailDomains().filter((item) => item.disabledHint == null);
    expect(open.map((item) => item.id).sort()).toEqual(["beweging", "slaap", "voeding"]);
  });

  it("houdt stress en verbinding dicht mét reden — geen onzichtbare poort", () => {
    const gated = buildKeuzeRailDomains().filter((item) => item.disabledHint != null);
    expect(gated.map((item) => item.id).sort()).toEqual(["stress", "verbinding"]);
    for (const item of gated) {
      expect(item.disabledHint).not.toBe("");
    }
  });
});
