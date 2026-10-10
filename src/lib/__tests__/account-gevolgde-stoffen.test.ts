import { describe, expect, it } from "vitest";
import {
  getGevolgdeStoffen,
  isVolgbaarVeld,
  schoonGevolgdeStoffen,
  VOLGBARE_VELDEN,
} from "@/lib/account-gevolgde-stoffen";
import type { OrgScopedClient } from "@/lib/db/scoped";

function client(resultaat: { data: unknown; error: { code?: string; message: string } | null }) {
  const keten = {
    select: () => keten,
    eq: () => keten,
    maybeSingle: async () => resultaat,
  };
  return { from: () => keten } as unknown as OrgScopedClient;
}

describe("VOLGBARE_VELDEN", () => {
  it("bevat geen kernstoffen, eiwit of koolhydraten, wel energie en vet", () => {
    const velden = VOLGBARE_VELDEN.map((v) => v.veld);
    for (const uitgesloten of ["magnesiumMg", "zincMg", "vitaminDµg", "proteinG", "carbohydrateG"]) {
      expect(velden).not.toContain(uitgesloten);
    }
    expect(velden).toContain("energyKcal");
    expect(velden).toContain("fatG");
    expect(velden).toContain("fiberG");
    expect(velden).toContain("calciumMg");
  });
});

describe("schoonGevolgdeStoffen", () => {
  it("houdt alleen volgbare velden over, zonder dubbelen, in volgorde", () => {
    expect(schoonGevolgdeStoffen(["ironMg", "x", "fiberG", "ironMg", 3])).toEqual(["ironMg", "fiberG"]);
    expect(isVolgbaarVeld("zincMg")).toBe(false);
  });
});

describe("getGevolgdeStoffen", () => {
  it("geeft een lege lijst zolang de migratie niet gedraaid is", async () => {
    const stoffen = await getGevolgdeStoffen(client({ data: null, error: { code: "42P01", message: "x" } }), "a");
    expect(stoffen).toEqual([]);
  });

  it("filtert een oude rij met een veld dat niet meer volgbaar is", async () => {
    const stoffen = await getGevolgdeStoffen(client({ data: { stoffen: ["fiberG", "oudVeld"] }, error: null }), "a");
    expect(stoffen).toEqual(["fiberG"]);
  });
});

describe("stofNaam", () => {
  it("schrijft de waarvan-regels uit als eigen stof", async () => {
    const { stofNaam } = await import("@/lib/nutrition-voedingswaarde");
    expect(stofNaam("waarvan verzadigd")).toBe("Verzadigd vet");
    expect(stofNaam("waarvan suikers")).toBe("Suikers");
    expect(stofNaam("vezels")).toBe("Vezels");
  });
});
