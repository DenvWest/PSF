import { describe, expect, it } from "vitest";
import { resolveDefaultSchapTab, resolveSchapTabs } from "@/lib/schap-tabs";

describe("resolveSchapTabs", () => {
  it("geeft beweging leefstijl, producten en diensten — nooit begeleiding", () => {
    expect(resolveSchapTabs("beweging").map((tab) => tab.id)).toEqual([
      "leefstijl",
      "producten",
      "diensten",
    ]);
  });

  it("geeft slaap en voeding leefstijl en producten, zonder diensten", () => {
    expect(resolveSchapTabs("slaap").map((tab) => tab.id)).toEqual(["leefstijl", "producten"]);
    expect(resolveSchapTabs("voeding").map((tab) => tab.id)).toEqual(["leefstijl", "producten"]);
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
