import { describe, expect, it, vi } from "vitest";
import { upsertDaybookDay } from "@/lib/account-nutrition-daybook";
import { buildDagboekVoegHref, leesDagboekVoeg } from "@/lib/dagboek-deeplink";
import type { OrgScopedClient } from "@/lib/db/scoped";
import { actueleDagboekProducten, dagboekProductVan } from "@/lib/keuze-dagboek-product";
import {
  behoudBekendeProducten,
  bedragVanItem,
  nutrientenGesplitstUitItems,
  sanitizeItems,
  supplementVanItem,
  type DagboekItem,
  type DagboekSupplementProduct,
} from "@/lib/nutrition-dagboek-items";
import type { KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";

const VITAMINE_D: DagboekSupplementProduct = { naam: "Merk Vitamine D3 25 µg", nutrient: "vitamin_d", dosis: 25, unit: "µg" };

const ITEM: DagboekItem = { moment: "ontbijt", bron: "supplement", key: "merk-vitamine-d3", grams: 1, product: VITAMINE_D };

function keuzeProduct(over: Partial<KeuzeProduct> = {}): KeuzeProduct {
  return {
    slug: "merk-vitamine-d3",
    category: "vitamine-d",
    naam: "Merk Vitamine D3 25 µg",
    score: "80,0",
    scoreTotaal: 80,
    bandLabel: "Goed",
    vorm: "D3",
    href: "/product/merk-vitamine-d3",
    dosisPerDag: 25,
    eenheid: "µg",
    centenPerDag: 5,
    claimStance: "toegestaan" as KeuzeProduct["claimStance"],
    imageSrc: null,
    imageAlt: "",
    ...over,
  };
}

describe("merkproduct in het dagboek", () => {
  it("bewaart een geldig merkproduct, met slug en etiket", () => {
    expect(sanitizeItems([ITEM])).toEqual([ITEM]);
  });

  it("weigert een merkproduct met een kapot etiket of een rare slug", () => {
    expect(sanitizeItems([{ ...ITEM, product: { ...VITAMINE_D, dosis: -1 } }])).toEqual([]);
    expect(sanitizeItems([{ ...ITEM, product: { ...VITAMINE_D, unit: "IU" } }])).toEqual([]);
    expect(sanitizeItems([{ ...ITEM, product: { ...VITAMINE_D, nutrient: "calcium" } }])).toEqual([]);
    expect(sanitizeItems([{ ...ITEM, key: "../geheim" }])).toEqual([]);
  });

  it("telt een dagdosis als supplement in de ring", () => {
    expect(bedragVanItem({ ...ITEM, grams: 2 }, "vitamin_d")).toEqual({ value: 50, unit: "µg" });
    expect(bedragVanItem(ITEM, "magnesium")).toBeNull();
    const [stof] = nutrientenGesplitstUitItems([ITEM]);
    expect(stof).toMatchObject({ nutrient: "vitamin_d", uitSupplement: 25, uitVoeding: 0, zonderGehalte: 0 });
  });

  it("toont een merkproduct als catalogusregel met één dagdosis", () => {
    expect(supplementVanItem(ITEM)).toEqual({
      key: "merk-vitamine-d3",
      labelNl: "Merk Vitamine D3 25 µg",
      nutrient: "vitamin_d",
      porties: [{ labelNl: "dagdosis", amount: 25, unit: "µg" }],
    });
  });
});

describe("behoudBekendeProducten", () => {
  const actueel = new Map([["merk-vitamine-d3", VITAMINE_D]]);

  it("neemt een regel aan die klopt met de hub van nu", () => {
    expect(behoudBekendeProducten([ITEM], [], actueel)).toEqual([ITEM]);
  });

  it("weigert een verzonnen dosis", () => {
    const vals = { ...ITEM, product: { ...VITAMINE_D, dosis: 2500 } };
    expect(behoudBekendeProducten([vals], [], actueel)).toEqual([]);
  });

  it("houdt een oude dag staan als het etiket intussen veranderde", () => {
    const oud = { ...ITEM, product: { ...VITAMINE_D, dosis: 20 } };
    expect(behoudBekendeProducten([{ ...oud, grams: 2 }], [oud], actueel)).toEqual([{ ...oud, grams: 2 }]);
  });

  it("laat voeding en catalogus-supplementen ongemoeid", () => {
    const voeding: DagboekItem = { moment: "lunch", bron: "voeding", key: "havermout", grams: 60 };
    expect(behoudBekendeProducten([voeding], [], new Map())).toEqual([voeding]);
  });
});

describe("dagboekProductVan", () => {
  it("leidt stof, dosis en eenheid af uit het Keuze-product", () => {
    expect(dagboekProductVan(keuzeProduct())).toEqual(VITAMINE_D);
    expect(actueleDagboekProducten([keuzeProduct()]).get("merk-vitamine-d3")).toEqual(VITAMINE_D);
  });

  it("geeft null zonder vaste dosis per dag", () => {
    expect(dagboekProductVan(keuzeProduct({ dosisPerDag: null }))).toBeNull();
    expect(dagboekProductVan(keuzeProduct({ eenheid: null }))).toBeNull();
  });
});

describe("deeplink naar een merkproduct", () => {
  it("bouwt en leest product:<slug>", () => {
    const href = buildDagboekVoegHref({ bron: "product", key: "merk-vitamine-d3", moment: "avondeten" });
    expect(leesDagboekVoeg(href.split("?")[1] ?? "")).toEqual({ bron: "product", key: "merk-vitamine-d3", moment: "avondeten" });
    expect(leesDagboekVoeg("?voeg=product:Geen%20Slug")).toBeNull();
  });
});

describe("upsertDaybookDay met een merkproduct", () => {
  function client(bestaand: Record<string, unknown> | null) {
    const rows: Record<string, unknown>[] = [];
    const supabase = {
      raw: {},
      from: vi.fn(() => ({
        select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: bestaand, error: null }) }) }) }),
        upsert: (row: Record<string, unknown>) => {
          rows.push(row);
          return Promise.resolve({ error: null });
        },
      })),
    } as unknown as OrgScopedClient;
    return { supabase, rows };
  }

  it("schrijft een regel die met de hub klopt, en laat een verzonnen dosis weg", async () => {
    const { supabase, rows } = client(null);
    const vals = { ...ITEM, key: "ander-product", product: { ...VITAMINE_D, dosis: 999 } };
    await upsertDaybookDay(supabase, "acc", {
      date: "2026-10-08",
      items: [ITEM, vals],
      producten: new Map([["merk-vitamine-d3", VITAMINE_D]]),
    });
    expect(rows[0]!.items).toEqual([ITEM]);
  });
});
