import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  escapeLikeTerm,
  haalSupermarktProductenOp,
  isPlausibelSupermarktProduct,
  MAX_IDS_PER_VERZOEK,
  MAX_ZOEKRESULTATEN,
  normaliseerZoektekst,
  productNaarRij,
  rijNaarProduct,
  schrijfSupermarktProducten,
  zoekSupermarktProducten,
  zoektermenUit,
} from "@/lib/supermarkt-products";
import type { SupermarktProduct } from "@/types/supermarkt-product";

const PRODUCT: SupermarktProduct = {
  prodId: "off:8710400123456",
  bron: "off",
  bronId: "8710400123456",
  naam: "Crème fraîche 30% vet",
  merk: "Campina",
  categorie: "Zuivel",
  snapshotDatum: "2026-10-01",
  energyKcal: 292,
  fatG: 30,
  saturatedFatG: 20,
  carbohydrateG: 3,
  sugarsG: 3,
  fiberG: null,
  proteinG: 2.5,
  saltG: 0.1,
  sodiumMg: null,
  calciumMg: 80,
  ironMg: null,
  vitaminCMg: null,
  vitaminDµg: null,
};

type Aanroep = { methode: string; args: unknown[] };

/** Een nepclient die elke methode van de queryketen vastlegt en daarna het opgegeven resultaat geeft. */
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

describe("normaliseerZoektekst", () => {
  it("haalt accenten weg en maakt kleine letters", () => {
    expect(normaliseerZoektekst("Crème Fraîche")).toBe("creme fraiche");
  });

  it("vouwt spaties samen", () => {
    expect(normaliseerZoektekst("  havermelk   barista ")).toBe("havermelk barista");
  });
});

describe("zoektermenUit", () => {
  it("splitst op spaties en normaliseert", () => {
    expect(zoektermenUit("Crème fraîche")).toEqual(["creme", "fraiche"]);
  });

  it("geeft null als geen enkele term lang genoeg is voor de trigram-index", () => {
    expect(zoektermenUit("ah")).toBeNull();
    expect(zoektermenUit("a b")).toBeNull();
    expect(zoektermenUit("   ")).toBeNull();
  });

  it("behoudt een korte term zolang er ook een lange term is", () => {
    expect(zoektermenUit("ah melk")).toEqual(["ah", "melk"]);
  });

  it("kapt het aantal en de lengte van termen af", () => {
    const termen = zoektermenUit("a1x b2x c3x d4x e5x f6x g7x h8x")!;
    expect(termen).toHaveLength(6);
    expect(zoektermenUit("x".repeat(500))![0]).toHaveLength(60);
  });
});

describe("escapeLikeTerm", () => {
  it("maakt LIKE-jokertekens letterlijk", () => {
    expect(escapeLikeTerm("100%")).toBe("100\\%");
    expect(escapeLikeTerm("a_b")).toBe("a\\_b");
    expect(escapeLikeTerm("a\\b")).toBe("a\\\\b");
  });
});

describe("rijNaarProduct / productNaarRij", () => {
  it("is een gesloten cirkel", () => {
    const rij = productNaarRij(PRODUCT);
    expect(rijNaarProduct(rij)).toEqual(PRODUCT);
  });

  it("vult zoek_tekst met naam én merk, genormaliseerd", () => {
    expect(productNaarRij(PRODUCT).zoek_tekst).toBe("creme fraiche 30% vet campina");
  });

  it("leest numeric-waarden die als string binnenkomen", () => {
    const rij = { ...productNaarRij(PRODUCT), energy_kcal: "292.0", protein_g: "2.50" };
    const product = rijNaarProduct(rij);
    expect(product?.energyKcal).toBe(292);
    expect(product?.proteinG).toBe(2.5);
  });

  it("laat onbekend onbekend: null blijft null, nooit een verzonnen 0", () => {
    const product = rijNaarProduct(productNaarRij(PRODUCT));
    expect(product?.fiberG).toBeNull();
    expect(product?.vitaminDµg).toBeNull();
  });

  it("verwerpt een rij met een onbekende bron", () => {
    expect(rijNaarProduct({ ...productNaarRij(PRODUCT), bron: "pljwissink" })).toBeNull();
  });

  it("verwerpt een rij zonder naam of id", () => {
    expect(rijNaarProduct({ ...productNaarRij(PRODUCT), naam: "  " })).toBeNull();
    expect(rijNaarProduct({ ...productNaarRij(PRODUCT), prod_id: null })).toBeNull();
  });
});

describe("isPlausibelSupermarktProduct", () => {
  it("accepteert een normaal product", () => {
    expect(isPlausibelSupermarktProduct(PRODUCT)).toBe(true);
  });

  it.each([
    ["kcal boven 900", { energyKcal: 1112 }],
    ["vet boven 100 g", { fatG: 2900 }],
    ["negatieve calcium", { calciumMg: -1 }],
    ["prod_id die niet bij bron+id past", { prodId: "off:anders" }],
    ["lege naam", { naam: "" }],
  ])("verwerpt %s", (_naam, wijziging) => {
    expect(isPlausibelSupermarktProduct({ ...PRODUCT, ...wijziging })).toBe(false);
  });
});

describe("zoekSupermarktProducten", () => {
  it("geeft [] en doet geen databaseverzoek bij een te korte zoekopdracht", async () => {
    const { client, aanroepen } = nepClient({ data: [], error: null });
    expect(await zoekSupermarktProducten(client, "ah")).toEqual([]);
    expect(aanroepen).toHaveLength(0);
  });

  it("zoekt elke term apart (AND) op zoek_tekst, kortste naam eerst, met een limiet", async () => {
    const { client, aanroepen } = nepClient({ data: [productNaarRij(PRODUCT)], error: null });
    const producten = await zoekSupermarktProducten(client, "Crème 100%");

    expect(producten).toEqual([PRODUCT]);
    expect(aanroepen.find((a) => a.methode === "from")?.args).toEqual(["sm_products"]);
    expect(aanroepen.filter((a) => a.methode === "ilike").map((a) => a.args)).toEqual([
      ["zoek_tekst", "%creme%"],
      ["zoek_tekst", "%100\\%%"],
    ]);
    expect(aanroepen.filter((a) => a.methode === "order").map((a) => a.args)).toEqual([
      ["naam_lengte", { ascending: true }],
      ["naam", { ascending: true }],
    ]);
    expect(aanroepen.find((a) => a.methode === "limit")?.args).toEqual([MAX_ZOEKRESULTATEN]);
  });

  it("begrenst een groter gevraagde limiet", async () => {
    const { client, aanroepen } = nepClient({ data: [], error: null });
    await zoekSupermarktProducten(client, "melk", 5000);
    expect(aanroepen.find((a) => a.methode === "limit")?.args).toEqual([MAX_ZOEKRESULTATEN]);
  });

  it("slaat kapotte rijen over in plaats van te falen", async () => {
    const { client } = nepClient({
      data: [productNaarRij(PRODUCT), { prod_id: "off:x", bron: "off", naam: null }],
      error: null,
    });
    expect(await zoekSupermarktProducten(client, "creme")).toEqual([PRODUCT]);
  });

  it("gooit bij een databasefout, zodat de route een 500 kan geven", async () => {
    const { client } = nepClient({ data: null, error: { message: "relation does not exist" } });
    await expect(zoekSupermarktProducten(client, "creme")).rejects.toThrow("relation does not exist");
  });
});

describe("haalSupermarktProductenOp", () => {
  it("doet geen verzoek zonder ids", async () => {
    const { client, aanroepen } = nepClient({ data: [], error: null });
    expect((await haalSupermarktProductenOp(client, [])).size).toBe(0);
    expect(aanroepen).toHaveLength(0);
  });

  it("ontdubbelt ids en geeft een map op prod_id", async () => {
    const { client, aanroepen } = nepClient({ data: [productNaarRij(PRODUCT)], error: null });
    const map = await haalSupermarktProductenOp(client, [PRODUCT.prodId, PRODUCT.prodId]);
    expect(map.get(PRODUCT.prodId)).toEqual(PRODUCT);
    expect(aanroepen.find((a) => a.methode === "in")?.args).toEqual(["prod_id", [PRODUCT.prodId]]);
  });

  it("laat een onbekend id gewoon ontbreken", async () => {
    const { client } = nepClient({ data: [], error: null });
    expect((await haalSupermarktProductenOp(client, ["off:onbekend"])).has("off:onbekend")).toBe(false);
  });

  it("begrenst het aantal ids per verzoek", async () => {
    const { client, aanroepen } = nepClient({ data: [], error: null });
    const veel = Array.from({ length: MAX_IDS_PER_VERZOEK + 50 }, (_, i) => `off:${i}`);
    await haalSupermarktProductenOp(client, veel);
    const ids = aanroepen.find((a) => a.methode === "in")?.args[1] as string[];
    expect(ids).toHaveLength(MAX_IDS_PER_VERZOEK);
  });
});

describe("schrijfSupermarktProducten", () => {
  it("schrijft in batches via upsert op prod_id en filtert onmogelijke rijen eruit", async () => {
    const { client, aanroepen } = nepClient({ data: null, error: null });
    const kapot = { ...PRODUCT, prodId: "off:2", bronId: "2", energyKcal: 1112 };
    const goed = { ...PRODUCT, prodId: "off:3", bronId: "3" };

    const resultaat = await schrijfSupermarktProducten(client, [PRODUCT, kapot, goed], 1);

    expect(resultaat).toEqual({ geschreven: 2, overgeslagen: 1 });
    const upserts = aanroepen.filter((a) => a.methode === "upsert");
    expect(upserts).toHaveLength(2);
    expect(upserts[0]?.args[1]).toEqual({ onConflict: "prod_id" });
  });

  it("verwijdert nooit iets: dagboeklogs verwijzen via prod_id", async () => {
    const { aanroepen, client } = nepClient({ data: null, error: null });
    await schrijfSupermarktProducten(client, [PRODUCT]);
    expect(aanroepen.some((a) => a.methode === "delete")).toBe(false);
  });

  it("gooit bij een databasefout", async () => {
    const { client } = nepClient({ data: null, error: { message: "boem" } });
    await expect(schrijfSupermarktProducten(client, [PRODUCT])).rejects.toThrow("boem");
  });
});
