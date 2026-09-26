import { describe, expect, it } from "vitest";
import { backfillComparisonPage } from "@/lib/supplement-catalog-db/backfill";
import { loadCategoryProducts } from "@/lib/supplement-catalog-db/loader";
import type { ComparisonPageData } from "@/types/supplement";
import { withClaimFields } from "@/lib/product-claim-fields";

/**
 * Zelfde in-memory stub als backfill.test.ts, maar dan met de select/eq/in-
 * calls die loader.ts nodig heeft. Round-trip-test: backfill schrijft,
 * loader leest terug — output moet gelijk zijn aan het origineel op de velden
 * die de DB draagt (zie plak 1: "/beste/* gaat lezen uit een DB-loader met
 * identieke output").
 */
function createFakeDb() {
  const rows: Record<string, Record<string, unknown>[]> = {};
  const byKey: Record<string, Map<string, Record<string, unknown>>> = {};

  function table(name: string) {
    if (!rows[name]) rows[name] = [];
    if (!byKey[name]) byKey[name] = new Map();
    return rows[name];
  }

  function selectChain(name: string, currentRows: Record<string, unknown>[]) {
    return {
      eq(column: string, value: unknown) {
        const filtered = currentRows.filter((r) => r[column] === value);
        return {
          ...selectChain(name, filtered),
          async single() {
            return filtered[0]
              ? { data: filtered[0], error: null }
              : { data: null, error: { message: "not found" } };
          },
        };
      },
      in(column: string, values: unknown[]) {
        const set = new Set(values);
        const filtered = currentRows.filter((r) => set.has(r[column]));
        return selectChain(name, filtered);
      },
      order(column: string, opts?: { ascending?: boolean }) {
        const sorted = [...currentRows].sort((a, b) => {
          const av = a[column] as number;
          const bv = b[column] as number;
          const dir = opts?.ascending === false ? -1 : 1;
          return av < bv ? -dir : av > bv ? dir : 0;
        });
        return selectChain(name, sorted);
      },
      then(resolve: (v: { data: Record<string, unknown>[]; error: null }) => void) {
        resolve({ data: currentRows, error: null });
      },
    };
  }

  const db = {
    from(name: string) {
      table(name);
      return {
        upsert(row: Record<string, unknown>, opts: { onConflict: string }) {
          const key = String(row[opts.onConflict]);
          const existing = byKey[name]!.get(key);
          const id = (existing?.id as string | undefined) ?? `${name}-${key}`;
          const stored = { ...row, id };
          byKey[name]!.set(key, stored);
          const list = table(name);
          const idx = list.findIndex((r) => r[opts.onConflict] === row[opts.onConflict]);
          if (idx >= 0) {
            list[idx] = stored;
          } else {
            list.push(stored);
          }
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
              rows[name] = table(name).filter((r) => r[column] !== value);
              return { error: null };
            },
          };
        },
        async insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
          const list = Array.isArray(payload) ? payload : [payload];
          table(name).push(...list);
          return { error: null };
        },
        select(columns: string) {
          // sup_products join: "id, slug, ..., sup_brands(name)"
          const withBrand = columns.includes("sup_brands");
          const source = withBrand
            ? table(name).map((row) => ({
                ...row,
                sup_brands: [
                  byKey.sup_brands
                    ? [...byKey.sup_brands.values()].find(
                        (b) => b.id === row.brand_id,
                      )
                    : null,
                ].filter(Boolean)[0] ?? null,
              }))
            : table(name);
          return selectChain(name, source);
        },
      };
    },
  };

  return { db };
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
        score: 8.8,
        bestFor: "Topkeuze",
        variantTag: "Zinkmethionine — 100 tabletten",
        summary: "Testomschrijving",
        specs: [
          { label: "Dosering", value: "15 mg" },
          { label: "Prijs", value: "€ 17,95" },
        ],
        pros: ["Goed opneembaar", "Nederlands"],
        cons: ["Duurder"],
        breakdown: [
          { criterium: "Biobeschikbaarheid", score: 9 },
          { criterium: "Dosering", score: 8 },
        ],
        imageSrc: "/images/producten/test-zink.jpg",
        imageAlt: "Test Zink 15mg — 100 tabletten",
        werkzameStof: "zink",
        vorm: "zinkmethionine",
        doseringPerDagdosis: { hoeveelheid: 15, eenheid: "mg", elementair: true },
        efsaClaimIds: ["zink.immune", "zink.testosterone"],
        thirdPartyTested: true,
      }),
    ],
  };
}

describe("backfill -> loader round-trip", () => {
  it("reconstrueert een product identiek aan het origineel", async () => {
    const { db } = createFakeDb();
    const page = samplePage();

    const backfillResult = await backfillComparisonPage(db as never, page);
    expect(backfillResult.errors).toEqual([]);

    const loaded = await loadCategoryProducts(db as never, "zink");

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(page.products[0]);
  });

  it("reconstrueert omega-3-dosering met epaMg/dhaMg apart", async () => {
    const { db } = createFakeDb();
    const page = samplePage();
    page.category = "omega-3";
    page.products = [
      withClaimFields({
        ...page.products[0],
        slug: "omega-test",
        werkzameStof: "omega3",
        doseringPerDagdosis: {
          hoeveelheid: 720,
          eenheid: "mg",
          elementair: false,
          epaMg: 590,
          dhaMg: 130,
        },
        efsaClaimIds: ["omega3.heart"],
      }),
    ];

    await backfillComparisonPage(db as never, page);
    const loaded = await loadCategoryProducts(db as never, "omega-3");

    expect(loaded).toHaveLength(1);
    expect(loaded[0].doseringPerDagdosis).toEqual({
      hoeveelheid: 720,
      eenheid: "mg",
      elementair: false,
      epaMg: 590,
      dhaMg: 130,
    });
  });

  it("geeft lege array voor een categorie zonder producten", async () => {
    const { db } = createFakeDb();
    const loaded = await loadCategoryProducts(db as never, "onbekend");
    expect(loaded).toEqual([]);
  });

  it("behoudt de oorspronkelijke array-volgorde (display_order), niet insertievolgorde", async () => {
    // Regressietest voor de /beste/magnesium-bevinding van 26 sep: zonder
    // ORDER BY display_order kwam Viridian vóór Vitaminstore te staan.
    const { db } = createFakeDb();
    const page = samplePage();
    page.products = [
      withClaimFields({ ...page.products[0], slug: "eerste", name: "Eerste product" }),
      withClaimFields({ ...page.products[0], slug: "tweede", name: "Tweede product" }),
      withClaimFields({ ...page.products[0], slug: "derde", name: "Derde product" }),
    ];

    await backfillComparisonPage(db as never, page);
    const loaded = await loadCategoryProducts(db as never, "zink");

    expect(loaded.map((p) => p.slug)).toEqual(["eerste", "tweede", "derde"]);
  });
});
