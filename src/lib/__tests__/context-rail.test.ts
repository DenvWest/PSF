import { describe, expect, it } from "vitest";
import {
  buildBewegingRailTools,
  buildKompasRailDomains,
  resolveVoortgangRailActiveItem,
  KOMPAS_RAIL_PILLAR_IDS,
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

describe("buildBewegingRailTools", () => {
  it("houdt de beweegcheck een echte link naar de intake", () => {
    const tools = buildBewegingRailTools();

    expect(tools.find((tool) => tool.id === "checkin")?.href).toBe(
      "/intake/beweging?from=dashboard&kompas=beweging",
    );
  });

  it("bevat alleen checkin en gids — supplementen en inzichten zijn verhuisd (S5)", () => {
    const tools = buildBewegingRailTools();

    expect(tools).toHaveLength(2);
    expect(tools.map((tool) => tool.id)).toEqual(["checkin", "gids"]);
    expect(tools.find((tool) => tool.id === "gids")?.href).toBe("/gids/beweging");
  });
});

describe("resolveVoortgangRailActiveItem", () => {
  it("laat de vier rail-items ongemoeid", () => {
    expect(resolveVoortgangRailActiveItem("hub")).toBe("hub");
    expect(resolveVoortgangRailActiveItem("statistieken")).toBe("statistieken");
    expect(resolveVoortgangRailActiveItem("inzichten")).toBe("inzichten");
    expect(resolveVoortgangRailActiveItem("favorieten")).toBe("favorieten");
  });

  it("licht 'Overzicht' op voor een domein-detailscherm (Voortgang › Beweging)", () => {
    // Spiegelt VoortgangHub.tsx's eigen goBack(): "domein" gaat terug naar "hub".
    expect(resolveVoortgangRailActiveItem("domein")).toBe("hub");
  });

  it("licht 'Statistieken' op voor lichaamssamenstelling", () => {
    // Spiegelt goBack(): "lichaamssamenstelling" gaat terug naar "statistieken".
    expect(resolveVoortgangRailActiveItem("lichaamssamenstelling")).toBe("statistieken");
  });
});
