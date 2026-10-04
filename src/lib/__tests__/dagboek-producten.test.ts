import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { haalDagboekProductenOp, zoekDagboekProducten } from "@/lib/dagboek-producten";
import type { NevoFood } from "@/types/nevo-food";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const mockHaalNevo = vi.fn();
const mockZoekNevo = vi.fn();
const mockHaalOff = vi.fn();
const mockZoekOff = vi.fn();

vi.mock("@/lib/nevo-foods", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/nevo-foods")>()),
  haalNevoFoodsOp: (...a: unknown[]) => mockHaalNevo(...a),
  zoekNevoFoods: (...a: unknown[]) => mockZoekNevo(...a),
}));
vi.mock("@/lib/supermarkt-products", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/supermarkt-products")>()),
  haalSupermarktProductenOp: (...a: unknown[]) => mockHaalOff(...a),
  zoekSupermarktProducten: (...a: unknown[]) => mockZoekOff(...a),
}));

const client = {} as SupabaseClient;

function nevoFood(code: string): NevoFood {
  return {
    prodId: `nevo:${code}`,
    nevoCode: code,
    nevoVersie: "2025/9.0",
    groep: "Vis",
    naamNl: `Voedingsmiddel ${code}`,
    naamEn: null,
    per: "100g",
    waarden: {
      energy_kcal: 100, protein_g: 20, fat_g: 1, saturated_fat_g: null, carbohydrate_g: 0, sugars_g: null,
      fiber_g: null, sodium_mg: null, potassium_mg: null, calcium_mg: null, magnesium_mg: null, iron_mg: null,
      zinc_mg: null, vitamin_d_ug: null, vitamin_b12_ug: null, vitamin_c_mg: null,
    },
    spoor: [],
    verrijkt: [],
  };
}

function offProduct(id: string): SupermarktProduct {
  return {
    prodId: `off:${id}`, bron: "off", bronId: id, naam: `Product ${id}`, merk: null, categorie: null,
    snapshotDatum: "2026-10-01", energyKcal: 50, fatG: null, saturatedFatG: null, carbohydrateG: null,
    sugarsG: null, fiberG: null, proteinG: null, saltG: null, sodiumMg: null, calciumMg: null, ironMg: null,
    vitaminCMg: null, vitaminDµg: null, potassiumMg: null, magnesiumMg: null, zincMg: null, vitaminB12µg: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHaalNevo.mockResolvedValue(new Map([["nevo:1", nevoFood("1")]]));
  mockHaalOff.mockResolvedValue(new Map([["off:9", offProduct("9")]]));
  mockZoekNevo.mockResolvedValue([nevoFood("1")]);
  mockZoekOff.mockResolvedValue([offProduct("9")]);
});

describe("haalDagboekProductenOp", () => {
  it("splitst op voorvoegsel en voegt de bronnen samen", async () => {
    const map = await haalDagboekProductenOp(client, ["nevo:1", "off:9"]);
    expect(mockHaalNevo).toHaveBeenCalledWith(client, ["1"]);
    expect(mockHaalOff).toHaveBeenCalledWith(client, ["off:9"]);
    expect(map.get("nevo:1")?.bron).toBe("nevo");
    expect(map.get("off:9")?.bron).toBe("off");
  });

  it("vraagt een bron niet aan zonder ids voor die bron", async () => {
    await haalDagboekProductenOp(client, ["off:9"]);
    expect(mockHaalNevo).not.toHaveBeenCalled();
  });

  it("houdt het resultaat van de werkende bron als de andere faalt", async () => {
    mockHaalNevo.mockRejectedValue(new Error('relation "nevo_foods" does not exist'));
    const map = await haalDagboekProductenOp(client, ["nevo:1", "off:9"]);
    expect([...map.keys()]).toEqual(["off:9"]);
  });

  it("gooit alleen als alle gevraagde bronnen falen", async () => {
    mockHaalNevo.mockRejectedValue(new Error("a"));
    mockHaalOff.mockRejectedValue(new Error("b"));
    await expect(haalDagboekProductenOp(client, ["nevo:1", "off:9"])).rejects.toThrow("b");
  });
});

describe("zoekDagboekProducten", () => {
  it("zet NEVO vóór Open Food Facts", async () => {
    const lijst = await zoekDagboekProducten(client, "tonijn");
    expect(lijst.map((p) => p.prodId)).toEqual(["nevo:1", "off:9"]);
  });

  it("geeft hooguit 20 resultaten, ruwweg half-half", async () => {
    mockZoekNevo.mockResolvedValue(Array.from({ length: 20 }, (_, i) => nevoFood(String(i))));
    mockZoekOff.mockResolvedValue(Array.from({ length: 20 }, (_, i) => offProduct(String(i))));
    const lijst = await zoekDagboekProducten(client, "tonijn");
    expect(lijst).toHaveLength(20);
    expect(lijst.filter((p) => p.bron === "nevo")).toHaveLength(10);
  });

  it("vult aan met de ene bron als de andere weinig heeft", async () => {
    mockZoekOff.mockResolvedValue([]);
    mockZoekNevo.mockResolvedValue(Array.from({ length: 20 }, (_, i) => nevoFood(String(i))));
    expect(await zoekDagboekProducten(client, "tonijn")).toHaveLength(20);
  });

  it("blijft werken als NEVO faalt", async () => {
    mockZoekNevo.mockRejectedValue(new Error("kapot"));
    expect((await zoekDagboekProducten(client, "tonijn")).map((p) => p.bron)).toEqual(["off"]);
  });

  it("gooit als beide bronnen falen", async () => {
    mockZoekNevo.mockRejectedValue(new Error("a"));
    mockZoekOff.mockRejectedValue(new Error("b"));
    await expect(zoekDagboekProducten(client, "tonijn")).rejects.toThrow();
  });
});
