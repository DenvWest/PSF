import { describe, expect, it } from "vitest";
import { backfillComparisonPage } from "@/lib/supplement-catalog-db/backfill";
import type { ComparisonPageData } from "@/types/supplement";
import { withClaimFields } from "@/lib/product-claim-fields";

/**
 * In-memory stub van de Supabase-client, alleen de calls die backfill.ts nodig
 * heeft: upsert(...).select("id").single(), delete().eq(...), insert(...).
 * Geen echte DB — dit test de mapping-logica (welke rijen backfill.ts probeert
 * te schrijven), niet de RLS/schema-laag zelf.
 */
function createFakeDb() {
  const tables: Record<string, unknown[]> = {};
  const upsertedBy: Record<string, Map<string, unknown>> = {};

  function table(name: string) {
    if (!tables[name]) tables[name] = [];
    if (!upsertedBy[name]) upsertedBy[name] = new Map();
    return tables[name];
  }

  const db = {
    from(name: string) {
      table(name);
      return {
        upsert(row: Record<string, unknown>, opts: { onConflict: string }) {
          const key = String(row[opts.onConflict]);
          const existing = upsertedBy[name]?.get(key);
          const id = (existing as { id?: string } | undefined)?.id ?? `${name}-${key}`;
          const stored = { ...row, id };
          upsertedBy[name]!.set(key, stored);
          return {
            select() {
              return {
                async single() {
                  return { data: { id }, error: null };
                },
              };
            },
          };
        },
        delete() {
          return {
            async eq(column: string, value: unknown) {
              tables[name] = table(name).filter(
                (row) => (row as Record<string, unknown>)[column] !== value,
              );
              return { error: null };
            },
          };
        },
        async insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
          const list = Array.isArray(rows) ? rows : [rows];
          table(name).push(...list);
          return { error: null };
        },
      };
    },
  };

  return { db, tables, upsertedBy };
}

function samplePage(): ComparisonPageData {
  return {
    category: "zink",
    slug: "zink",
    h1: "Test",
    intro: "Test",
    seoTitle: "Test",
    seoDescription: "Test",
    lastUpdated: "2026-09-26",
    tableDoseringColumnLabel: "Dosis",
    choiceRoutes: [],
    tableRows: [],
    comparisonCriteria: [],
    faq: [],
    breadcrumbs: [],
    products: [
      withClaimFields({
        slug: "test-product",
        name: "Test Zink 15mg",
        brand: "Testmerk",
        affiliateSlug: "vitalnutrition-zink",
        score: 8.5,
        bestFor: "Topkeuze",
        variantTag: "100 tabletten",
        summary: "Testomschrijving",
        specs: [{ label: "Dosering", value: "15 mg" }],
        pros: ["Goed"],
        cons: ["Duur"],
        breakdown: [{ criterium: "Dosering", score: 9 }],
        imageSrc: "/images/producten/test.jpg",
        imageAlt: "Test",
        werkzameStof: "zink",
        vorm: "zinkmethionine",
        doseringPerDagdosis: { hoeveelheid: 15, eenheid: "mg", elementair: true },
        efsaClaimIds: ["zink.immune"],
        thirdPartyTested: true,
      }),
    ],
  };
}

describe("backfillComparisonPage", () => {
  it("schrijft categorie, merk en product", async () => {
    const { db } = createFakeDb();
    const result = await backfillComparisonPage(db as never, samplePage());

    expect(result.errors).toEqual([]);
    expect(result.categoriesUpserted).toBe(1);
    expect(result.brandsUpserted).toBe(1);
    expect(result.productsUpserted).toBe(1);
  });

  it("bewaart specs/pros/cons/breakdown in raw_legacy_fields", async () => {
    const { db, upsertedBy } = createFakeDb();
    await backfillComparisonPage(db as never, samplePage());

    const product = upsertedBy.sup_products?.get("test-product") as
      | { raw_legacy_fields: Record<string, unknown> }
      | undefined;
    expect(product?.raw_legacy_fields.specs).toEqual([
      { label: "Dosering", value: "15 mg" },
    ]);
    expect(product?.raw_legacy_fields.pros).toEqual(["Goed"]);
    expect(product?.raw_legacy_fields.cons).toEqual(["Duur"]);
    expect(product?.raw_legacy_fields.breakdown).toEqual([
      { criterium: "Dosering", score: 9 },
    ]);
  });

  it("schrijft sup_product_actives voor een niet-omega3-product", async () => {
    const { db, tables } = createFakeDb();
    await backfillComparisonPage(db as never, samplePage());

    expect(tables.sup_product_actives).toHaveLength(1);
    expect(tables.sup_product_actives?.[0]).toMatchObject({
      nutrient_key: "zink",
      amount_per_serving: 15,
      unit: "mg",
      is_elemental: true,
    });
  });

  it("splitst omega-3 in aparte epa/dha-rijen", async () => {
    const { db, tables } = createFakeDb();
    const page = samplePage();
    page.products = [
      withClaimFields({
        ...page.products[0],
        slug: "omega-test",
        werkzameStof: "omega3",
        doseringPerDagdosis: {
          hoeveelheid: 1000,
          eenheid: "mg",
          elementair: false,
          epaMg: 590,
          dhaMg: 130,
        },
        efsaClaimIds: ["omega3.heart"],
      }),
    ];

    await backfillComparisonPage(db as never, page);

    expect(tables.sup_product_actives).toHaveLength(2);
    const keys = tables.sup_product_actives?.map(
      (row) => (row as Record<string, unknown>).nutrient_key,
    );
    expect(keys).toEqual(expect.arrayContaining(["epa", "dha"]));
  });

  it("schrijft third_party_tested-certificering alleen wanneer van toepassing", async () => {
    const { db, tables } = createFakeDb();
    await backfillComparisonPage(db as never, samplePage());

    expect(tables.sup_product_certifications).toHaveLength(1);
    expect(tables.sup_product_certifications?.[0]).toMatchObject({
      certification_key: "third_party_tested",
    });
  });

  it("schrijft geen afbeeldingsrij zonder imageSrc", async () => {
    const { db, tables } = createFakeDb();
    const page = samplePage();
    page.products = [{ ...page.products[0], imageSrc: undefined }];

    await backfillComparisonPage(db as never, page);

    expect(tables.sup_product_images ?? []).toHaveLength(0);
  });

  it("is idempotent: tweede run overschrijft dezelfde product-slug", async () => {
    const { db, upsertedBy } = createFakeDb();
    const page = samplePage();

    await backfillComparisonPage(db as never, page);
    await backfillComparisonPage(db as never, page);

    expect(upsertedBy.sup_products?.size).toBe(1);
  });
});
