import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  haalNevoFoodsOp,
  nevoCodeUitProdId,
  nevoFoodNaarRij,
  nevoProdId,
  rijNaarNevoFood,
  schrijfNevoFoods,
  zoekNevoFoods,
} from "@/lib/nevo-foods";
import {
  NEVO_BEREKEND_ANDERE_CITATION,
  NEVO_BEREKEND_CITATION,
  NEVO_CITATION,
  nevoBerekendeBronRegel,
  nevoBronLabel,
  nevoBronRegel,
} from "@/lib/nevo-bron";
import { NEVO_WAARDE_KOLOMMEN, type NevoFood, type NevoWaardeKolom } from "@/types/nevo-food";

function waarden(deel: Partial<Record<NevoWaardeKolom, number>>): NevoFood["waarden"] {
  const alle = {} as NevoFood["waarden"];
  for (const kolom of NEVO_WAARDE_KOLOMMEN) alle[kolom] = deel[kolom] ?? null;
  return alle;
}

const FOOD: NevoFood = {
  prodId: "nevo:1590",
  nevoCode: "1590",
  nevoVersie: "2025/9.0",
  groep: "Vis",
  naamNl: "Tonijn blik in water",
  naamEn: "Tuna canned in water",
  per: "100g",
  waarden: waarden({ protein_g: 24.9, vitamin_d_ug: 3.6 }),
  spoor: ["iron_mg"],
  verrijkt: [],
};

type Aanroep = { methode: string; args: unknown[] };

function nepClient(resultaat: { data: unknown; error: { message: string } | null }) {
  const aanroepen: Aanroep[] = [];
  const keten: Record<string, unknown> = {};
  for (const methode of ["select", "ilike", "order", "limit", "in", "upsert"]) {
    keten[methode] = (...args: unknown[]) => {
      aanroepen.push({ methode, args });
      return keten;
    };
  }
  keten.then = (resolve: (waarde: unknown) => unknown) => resolve(resultaat);
  const client = {
    from: (tabel: string) => {
      aanroepen.push({ methode: "from", args: [tabel] });
      return keten;
    },
  };
  return { client: client as unknown as SupabaseClient, aanroepen };
}

describe("rijNaarNevoFood / nevoFoodNaarRij", () => {
  it("is een gesloten cirkel", () => {
    expect(rijNaarNevoFood(nevoFoodNaarRij(FOOD))).toEqual(FOOD);
  });

  it("laat waarden ongewijzigd: geen afronding, geen omrekening", () => {
    const rij = nevoFoodNaarRij({ ...FOOD, waarden: waarden({ zinc_mg: 3.133 }) });
    expect(rij.zinc_mg).toBe(3.133);
  });

  it("vult zoek_tekst genormaliseerd", () => {
    expect(nevoFoodNaarRij({ ...FOOD, naamNl: "Crème fraîche" }).zoek_tekst).toBe("creme fraiche");
  });

  it("vertaalt een numerieke string uit Postgres naar een getal en laat null staan", () => {
    const food = rijNaarNevoFood({ ...nevoFoodNaarRij(FOOD), protein_g: "24.90", fat_g: null });
    expect(food?.waarden.protein_g).toBe(24.9);
    expect(food?.waarden.fat_g).toBeNull();
  });

  it("wijst een rij zonder naam, versie of geldige eenheid af", () => {
    expect(rijNaarNevoFood({ ...nevoFoodNaarRij(FOOD), naam_nl: "" })).toBeNull();
    expect(rijNaarNevoFood({ ...nevoFoodNaarRij(FOOD), nevo_versie: null })).toBeNull();
    expect(rijNaarNevoFood({ ...nevoFoodNaarRij(FOOD), per: "100l" })).toBeNull();
  });

  it("negeert onbekende kolomnamen in spoor en verrijkt", () => {
    const food = rijNaarNevoFood({ ...nevoFoodNaarRij(FOOD), spoor: ["iron_mg", "epa_mg"] });
    expect(food?.spoor).toEqual(["iron_mg"]);
  });

  it("heeft geen omega-3-kolom: een EPA+DHA-som is een bewerking", () => {
    expect(NEVO_WAARDE_KOLOMMEN.some((k) => /omega|epa|dha/i.test(k))).toBe(false);
  });
});

describe("prod_id", () => {
  it("gaat heen en terug", () => {
    expect(nevoProdId("1590")).toBe("nevo:1590");
    expect(nevoCodeUitProdId("nevo:1590")).toBe("1590");
  });

  it("herkent een ander id niet", () => {
    expect(nevoCodeUitProdId("off:8710400123456")).toBeNull();
    expect(nevoCodeUitProdId("nevo:")).toBeNull();
  });
});

describe("zoekNevoFoods", () => {
  it("zoekt alle termen (AND) in nevo_foods, kortste naam eerst", async () => {
    const { client, aanroepen } = nepClient({ data: [nevoFoodNaarRij(FOOD)], error: null });
    const resultaat = await zoekNevoFoods(client, "Tonijn blik");
    expect(resultaat).toEqual([FOOD]);
    expect(aanroepen.find((a) => a.methode === "from")?.args).toEqual(["nevo_foods"]);
    expect(aanroepen.filter((a) => a.methode === "ilike").map((a) => a.args)).toEqual([
      ["zoek_tekst", "%tonijn%"],
      ["zoek_tekst", "%blik%"],
    ]);
    expect(aanroepen.filter((a) => a.methode === "order").map((a) => a.args[0])).toEqual(["naam_lengte", "naam_nl"]);
  });

  it("zoekt niet bij een te korte query", async () => {
    const { client, aanroepen } = nepClient({ data: [], error: null });
    expect(await zoekNevoFoods(client, "ei")).toEqual([]);
    expect(aanroepen).toHaveLength(0);
  });

  it("gooit bij een databasefout", async () => {
    const { client } = nepClient({ data: null, error: { message: "kapot" } });
    await expect(zoekNevoFoods(client, "tonijn")).rejects.toThrow("kapot");
  });
});

describe("haalNevoFoodsOp", () => {
  it("geeft een map op prod_id en slaat onbekende codes over", async () => {
    const { client, aanroepen } = nepClient({ data: [nevoFoodNaarRij(FOOD)], error: null });
    const map = await haalNevoFoodsOp(client, ["1590", "1590", "9999"]);
    expect([...map.keys()]).toEqual(["nevo:1590"]);
    expect(aanroepen.find((a) => a.methode === "in")?.args).toEqual(["nevo_code", ["1590", "9999"]]);
  });

  it("doet geen query zonder codes", async () => {
    const { client, aanroepen } = nepClient({ data: [], error: null });
    expect((await haalNevoFoodsOp(client, [])).size).toBe(0);
    expect(aanroepen).toHaveLength(0);
  });
});

describe("schrijfNevoFoods", () => {
  it("upsert op nevo_code in batches, zonder te verwijderen", async () => {
    const { client, aanroepen } = nepClient({ data: null, error: null });
    const foods = Array.from({ length: 5 }, (_, i) => ({ ...FOOD, nevoCode: String(i), prodId: `nevo:${i}` }));
    expect(await schrijfNevoFoods(client, foods, 2)).toEqual({ geschreven: 5 });
    expect(aanroepen.filter((a) => a.methode === "upsert")).toHaveLength(3);
    expect(aanroepen.some((a) => a.methode === "upsert" && (a.args[1] as { onConflict: string }).onConflict === "nevo_code")).toBe(true);
  });
});

describe("bronvermelding (RIVM-voorwaarden 2025/9.0)", () => {
  it("noemt bron, versie en plaats letterlijk", () => {
    expect(NEVO_CITATION).toBe("NEVO-online versie 2025/9.0, RIVM, Bilthoven");
  });

  it("heeft voor berekende uitvoer de voorgeschreven tekst, met en zonder 'en andere gegevens'", () => {
    expect(NEVO_BEREKEND_CITATION).toBe("Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven");
    expect(NEVO_BEREKEND_ANDERE_CITATION).toBe(`${NEVO_BEREKEND_CITATION} en andere gegevens`);
    expect(nevoBerekendeBronRegel(false)).toBe(NEVO_BEREKEND_CITATION);
    expect(nevoBerekendeBronRegel(true)).toBe(NEVO_BEREKEND_ANDERE_CITATION);
  });

  it("neemt de versie van de rij over in de bronregel en het label", () => {
    expect(nevoBronRegel({ nevoVersie: "2025/9.0" })).toBe(NEVO_CITATION);
    expect(nevoBronRegel({ nevoVersie: "2029/10.0" })).toBe("NEVO-online versie 2029/10.0, RIVM, Bilthoven");
    expect(nevoBronLabel({ nevoVersie: "2025/9.0" })).toBe("NEVO 2025/9.0 (RIVM)");
  });
});
