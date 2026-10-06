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

  it("geeft voeding Vergelijken en Favorieten — Producten gaat op in Vergelijken", () => {
    // Sinds 6 oktober: per stof voeding naast supplement (met PS-Score) op één
    // tab. Producten droeg dezelfde vijf stoffen en dubbelde
    // (BESLUIT_KEUZE_VERGELIJKEN_2026-10.md). De id blijft `logboek`.
    expect(resolveSchapTabs("voeding")).toEqual([
      { id: "logboek", label: "Vergelijken" },
      { id: "favorieten", label: "Favorieten" },
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
  it("opent op het aanbod: producten, en op voeding Vergelijken", () => {
    expect(resolveDefaultSchapTab("beweging")).toBe("producten");
    expect(resolveDefaultSchapTab("slaap")).toBe("producten");
    expect(resolveDefaultSchapTab("voeding")).toBe("logboek");
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
    expect(resolveSchapTabForDomain("voeding", "diensten")).toBe("logboek");
    // Een oude link naar Producten op voeding landt op Vergelijken.
    expect(resolveSchapTabForDomain("voeding", "producten")).toBe("logboek");
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
