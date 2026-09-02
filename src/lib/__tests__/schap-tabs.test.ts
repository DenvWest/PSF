import { describe, expect, it } from "vitest";
import { isSchapTabId } from "@/lib/dashboard-url";
import {
  resolveDefaultSchapTab,
  resolveSchapTabForDomain,
  resolveSchapTabs,
} from "@/lib/schap-tabs";

describe("resolveSchapTabs", () => {
  it("geeft beweging producten, diensten en favorieten — nooit begeleiding", () => {
    expect(resolveSchapTabs("beweging").map((tab) => tab.id)).toEqual([
      "producten",
      "diensten",
      "favorieten",
    ]);
  });

  it("geeft slaap producten en favorieten, zonder diensten", () => {
    expect(resolveSchapTabs("slaap").map((tab) => tab.id)).toEqual(["producten", "favorieten"]);
  });

  it("geeft voeding een eigen logboek-tab tussen producten en favorieten", () => {
    // De vijf nutriëntroutes stonden tot 1 september als vast blok bóven de
    // tabs, waar ze alles wat je kwam doen een scherm naar beneden duwden.
    // Als tab staan ze náást het aanbod dat ze verantwoorden.
    expect(resolveSchapTabs("voeding").map((tab) => tab.id)).toEqual([
      "producten",
      "logboek",
      "favorieten",
    ]);
  });

  it("geeft het logboek alleen aan voeding — daarbuiten bestaan er geen routes", () => {
    // Dezelfde regel als bij Diensten: geen tab zonder inhoud.
    for (const domain of ["beweging", "slaap", "stress", "verbinding"] as const) {
      expect(
        resolveSchapTabs(domain).map((tab) => tab.id),
        domain,
      ).not.toContain("logboek");
    }
  });

  // W4a: de Leefstijl-tab was de enige echte doublure van het schap —
  // dezelfde ladder, dezelfde knop en dezelfde favoriet-sleutel als
  // Kompas-domein en leefstijlprofiel. Het schap gaat over aanbod.
  it("draagt nergens nog een leefstijl-werkplek", () => {
    const allTabs = (["beweging", "slaap", "voeding", "stress", "verbinding"] as const).flatMap(
      (domain) => resolveSchapTabs(domain).map((tab) => tab.id as string),
    );
    expect(allTabs).not.toContain("leefstijl");
  });

  it("geeft stress en verbinding niets — die domeinen hebben geen schap", () => {
    expect(resolveSchapTabs("stress")).toEqual([]);
    expect(resolveSchapTabs("verbinding")).toEqual([]);
  });

  it("rendert nooit een begeleiding-tab", () => {
    const allTabs = (["beweging", "slaap", "voeding", "stress", "verbinding"] as const).flatMap(
      (domain) => resolveSchapTabs(domain).map((tab) => tab.id),
    );
    expect(allTabs).not.toContain("begeleiding");
  });

  it("draagt Nederlandse labels", () => {
    expect(resolveSchapTabs("beweging").map((tab) => tab.label)).toEqual([
      "Producten",
      "Diensten",
      "Favorieten",
    ]);
  });
});

describe("resolveDefaultSchapTab", () => {
  it("opent altijd op producten — een schap bestaat exact waar aanbod bestaat", () => {
    expect(resolveDefaultSchapTab("beweging")).toBe("producten");
    expect(resolveDefaultSchapTab("slaap")).toBe("producten");
    expect(resolveDefaultSchapTab("voeding")).toBe("producten");
  });
});

describe("resolveSchapTabForDomain — je onderdeel reist mee bij een domeinwissel", () => {
  it("houdt de tab vast waar het doeldomein hem draagt", () => {
    expect(resolveSchapTabForDomain("voeding", "favorieten")).toBe("favorieten");
    expect(resolveSchapTabForDomain("slaap", "favorieten")).toBe("favorieten");
    expect(resolveSchapTabForDomain("beweging", "diensten")).toBe("diensten");
  });

  it("valt terug op de default waar het doeldomein die tab niet heeft", () => {
    // Diensten bestaat alleen op beweging — slaap krijgt zijn default.
    expect(resolveSchapTabForDomain("slaap", "diensten")).toBe("producten");
    expect(resolveSchapTabForDomain("voeding", "diensten")).toBe("producten");
  });

  it("valt terug zonder gekozen tab", () => {
    expect(resolveSchapTabForDomain("slaap", null)).toBe("producten");
  });

  it("draagt nooit een tab die het domein niet rendert", () => {
    for (const domain of ["beweging", "slaap", "voeding"] as const) {
      for (const wanted of ["producten", "diensten", "favorieten", "begeleiding"] as const) {
        const resolved = resolveSchapTabForDomain(domain, wanted);
        expect(resolveSchapTabs(domain).map((tab) => tab.id)).toContain(resolved);
      }
    }
  });
});

describe("deeplinks", () => {
  it("maakt elke tab die een domein draagt ook deeplinkbaar", () => {
    // Twee lijsten die uiteen kunnen lopen: `resolveSchapTabs` bepaalt wat er
    // rendert, `isSchapTabId` wat een URL mag openen. Een tab die alleen in de
    // eerste staat is onbereikbaar via een link, en dat merk je pas als je hem
    // deelt.
    for (const domain of ["beweging", "slaap", "voeding"] as const) {
      for (const tab of resolveSchapTabs(domain)) {
        expect(isSchapTabId(tab.id), `${domain}/${tab.id}`).toBe(true);
      }
    }
  });
});
