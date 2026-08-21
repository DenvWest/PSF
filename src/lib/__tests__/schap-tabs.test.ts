import { describe, expect, it } from "vitest";
import {
  resolveDefaultSchapTab,
  resolveSchapTabForDomain,
  resolveSchapTabs,
} from "@/lib/schap-tabs";

describe("resolveSchapTabs", () => {
  it("geeft beweging leefstijl, producten, diensten en favorieten — nooit begeleiding", () => {
    expect(resolveSchapTabs("beweging").map((tab) => tab.id)).toEqual([
      "leefstijl",
      "producten",
      "diensten",
      "favorieten",
    ]);
  });

  it("geeft slaap en voeding leefstijl, producten en favorieten, zonder diensten", () => {
    expect(resolveSchapTabs("slaap").map((tab) => tab.id)).toEqual([
      "leefstijl",
      "producten",
      "favorieten",
    ]);
    expect(resolveSchapTabs("voeding").map((tab) => tab.id)).toEqual([
      "leefstijl",
      "producten",
      "favorieten",
    ]);
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
      "Leefstijl",
      "Producten",
      "Diensten",
      "Favorieten",
    ]);
  });
});

describe("resolveDefaultSchapTab", () => {
  it("valt op producten waar die bestaat", () => {
    expect(resolveDefaultSchapTab("beweging")).toBe("producten");
    expect(resolveDefaultSchapTab("slaap")).toBe("producten");
    expect(resolveDefaultSchapTab("voeding")).toBe("producten");
  });

  it("valt op leefstijl waar geen productenlijst bestaat", () => {
    expect(resolveDefaultSchapTab("stress")).toBe("leefstijl");
    expect(resolveDefaultSchapTab("verbinding")).toBe("leefstijl");
  });
});

describe("resolveSchapTabForDomain — je onderdeel reist mee bij een domeinwissel", () => {
  it("houdt de tab vast waar het doeldomein hem draagt", () => {
    expect(resolveSchapTabForDomain("voeding", "leefstijl")).toBe("leefstijl");
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
      for (const wanted of ["leefstijl", "producten", "diensten", "favorieten", "begeleiding"] as const) {
        const resolved = resolveSchapTabForDomain(domain, wanted);
        expect(resolveSchapTabs(domain).map((tab) => tab.id)).toContain(resolved);
      }
    }
  });
});
