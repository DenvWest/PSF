import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalogEntry } from "@/data/nutrition/food-catalog";
import { snelItemVoorEten, snelItemVoorProduct, verwijderSnel, voegSnelToe } from "@/lib/keuze-snel-loggen";
import type { DagboekItem } from "@/lib/nutrition-dagboek-items";
import type { KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";

const DATUM = "2026-10-09";
let opgeslagen: DagboekItem[];
let posts: { date: string; items: DagboekItem[] }[];

beforeEach(() => {
  posts = [];
  opgeslagen = [{ moment: "ontbijt", bron: "voeding", key: "haring", grams: 80 }];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { date: string; items: DagboekItem[] };
        posts.push(body);
        opgeslagen = body.items;
        return new Response("{}", { status: 200 });
      }
      return new Response(JSON.stringify({ days: [{ date: DATUM, items: opgeslagen }] }), { status: 200 });
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("snel loggen vanuit Mijn keuzes", () => {
  it("maakt voor een voedingsmiddel een item met de eerste portie als gewicht", () => {
    const entry = catalogEntry("haring");
    expect(entry).not.toBeNull();
    const item = snelItemVoorEten(entry!, "lunch");
    expect(item).toEqual({ moment: "lunch", bron: "voeding", key: "haring", grams: entry!.porties[0].grams });
  });

  it("maakt voor een supplement één dagdosis met het etiket, en niets zonder vaste dosis", () => {
    const basis = {
      slug: "vital-nutrition-citraat",
      category: "magnesium",
      naam: "Vital Nutrition Magnesium Citraat",
      eenheid: "mg",
    } as KeuzeProduct;
    expect(snelItemVoorProduct({ ...basis, dosisPerDag: 200 }, "avondeten")).toEqual({
      moment: "avondeten",
      bron: "supplement",
      key: "vital-nutrition-citraat",
      grams: 1,
      product: { naam: "Vital Nutrition Magnesium Citraat", nutrient: "magnesium", dosis: 200, unit: "mg" },
    });
    expect(snelItemVoorProduct({ ...basis, dosisPerDag: null }, "avondeten")).toBeNull();
  });

  it("leest de dag vers en hangt het item eraan, zonder wat er al stond te wissen", async () => {
    const nieuw: DagboekItem = { moment: "lunch", bron: "voeding", key: "haring", grams: 100 };
    const lijst = await voegSnelToe(nieuw, DATUM);
    expect(lijst).toEqual([...[{ moment: "ontbijt", bron: "voeding", key: "haring", grams: 80 }], nieuw]);
    expect(posts).toHaveLength(1);
    expect(posts[0].date).toBe(DATUM);
    expect(posts[0].items).toHaveLength(2);
  });

  it("haalt bij ongedaan maken precies dat ene item weg", async () => {
    const nieuw: DagboekItem = { moment: "lunch", bron: "voeding", key: "haring", grams: 100 };
    await voegSnelToe(nieuw, DATUM);
    const lijst = await verwijderSnel(nieuw, DATUM);
    expect(lijst).toEqual([{ moment: "ontbijt", bron: "voeding", key: "haring", grams: 80 }]);
  });

  it("meldt null als het schrijven mislukt, zodat de UI een fout kan tonen", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) =>
        init?.method === "POST" ? new Response("{}", { status: 500 }) : new Response(JSON.stringify({ days: [] }), { status: 200 }),
      ),
    );
    expect(await voegSnelToe({ moment: "lunch", bron: "voeding", key: "haring", grams: 100 }, DATUM)).toBeNull();
  });

  it("twee snelle tikken halen elkaar niet in: de tweede ziet de eerste", async () => {
    const a: DagboekItem = { moment: "lunch", bron: "voeding", key: "haring", grams: 100 };
    const b: DagboekItem = { moment: "avondeten", bron: "voeding", key: "haring", grams: 100 };
    await Promise.all([voegSnelToe(a, DATUM), voegSnelToe(b, DATUM)]);
    expect(opgeslagen).toHaveLength(3);
  });
});
