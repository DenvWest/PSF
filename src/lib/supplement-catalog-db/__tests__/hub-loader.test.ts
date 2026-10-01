import { describe, expect, it } from "vitest";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { creatineData } from "@/data/supplements/creatine";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { zinkData } from "@/data/supplements/zink";
import { loadHubProductsForCategory, loadInputsForCategory } from "@/lib/supplement-catalog-db/hub-loader";
import { buildHubProductsFromSource, getHubProducts } from "@/lib/supplement-hub/product-catalog";
import type { ComparisonPageData } from "@/types/supplement";

/**
 * Minimale fake-DB: ondersteunt precies de query-vorm die hub-loader.ts
 * gebruikt (sup_products met sup_categories!inner(slug)-filter, en
 * sup_offers als geneste array). Rows per tabel zijn vooraf gezet — geen
 * generieke Supabase-simulatie, dat is backfill.ts/loader.ts al getest met
 * een rijkere stub (__tests__/loader.test.ts).
 */
function createFakeDb(options: {
  categoryBySlug?: Record<string, { slug: string }>;
  productsByCategory?: Record<
    string,
    Array<{
      slug: string;
      score_inputs: unknown;
      servings_per_container: number | null;
      sup_offers: { price_cents: number | null; price_checked_at: string | null }[];
    }>
  >;
}) {
  const productsByCategory = options.productsByCategory ?? {};

  return {
    from(table: string) {
      if (table !== "sup_products") {
        throw new Error(`Onverwachte tabel in test-stub: ${table}`);
      }
      return {
        select() {
          return {
            eq(column: string, value: string) {
              if (column !== "sup_categories.slug") {
                throw new Error(`Onverwachte eq-kolom in test-stub: ${column}`);
              }
              return Promise.resolve({ data: productsByCategory[value] ?? [], error: null });
            },
          };
        },
      };
    },
  };
}

describe("loadInputsForCategory", () => {
  it("valt volledig terug op de statische invoer als de DB niets teruggeeft (lege database)", async () => {
    const db = createFakeDb({ productsByCategory: {} });
    const inputs = await loadInputsForCategory(db as never, "magnesium");
    expect(inputs).toEqual(new Map(Object.entries(PRODUCT_SCORE_INPUTS.magnesium)));
  });

  it("combineert DB-score-invoer met DB-prijs wanneer beide aanwezig zijn", async () => {
    const staticInputs = PRODUCT_SCORE_INPUTS.magnesium["vitaminstore-super-magnesium"];
    const db = createFakeDb({
      productsByCategory: {
        magnesium: [
          {
            slug: "vitaminstore-super-magnesium",
            score_inputs: {
              formKey: staticInputs.formKey,
              label: staticInputs.label,
              certificeringen: staticInputs.certificeringen,
              kwaliteitsmarkers: staticInputs.kwaliteitsmarkers,
              dosisOnzekerReden: staticInputs.dosisOnzekerReden,
            },
            servings_per_container: 60,
            sup_offers: [{ price_cents: 2580, price_checked_at: "2026-09-30" }],
          },
        ],
      },
    });

    const inputs = await loadInputsForCategory(db as never, "magnesium");
    const result = inputs.get("vitaminstore-super-magnesium");
    expect(result?.prijsPerEtiketdagCent).toBe(43); // 2580 / 60 = 43
    expect(result?.prijsGecontroleerdOp).toBe("2026-09-30");
    expect(result?.formKey).toBe(staticInputs.formKey);
  });

  it("valt terug op de statische prijs als servings_per_container of price_cents ontbreekt", async () => {
    const db = createFakeDb({
      productsByCategory: {
        magnesium: [
          {
            slug: "vitaminstore-super-magnesium",
            score_inputs: null,
            servings_per_container: null,
            sup_offers: [{ price_cents: null, price_checked_at: null }],
          },
        ],
      },
    });

    const staticInputs = PRODUCT_SCORE_INPUTS.magnesium["vitaminstore-super-magnesium"];
    const inputs = await loadInputsForCategory(db as never, "magnesium");
    const result = inputs.get("vitaminstore-super-magnesium");
    expect(result?.prijsPerEtiketdagCent).toBe(staticInputs.prijsPerEtiketdagCent);
    expect(result?.prijsGecontroleerdOp).toBe(staticInputs.prijsGecontroleerdOp);
  });
});

describe("pariteit: DB-loader (lege database) vs. de statische hub", () => {
  const COMPARISONS: ComparisonPageData[] = [
    magnesiumData,
    omega3Data,
    vitamineDData,
    zinkData,
    creatineData,
    ashwagandhaData,
    eiwitpoederData,
  ];

  function bySlug<T extends { slug: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  it("levert exact dezelfde 25 HubProduct-objecten op als getHubProducts(), categorie per categorie", async () => {
    const statisch = getHubProducts();
    const db = createFakeDb({ productsByCategory: {} });

    for (const comparison of COMPARISONS) {
      const viaLoader = await loadHubProductsForCategory(db as never, comparison);
      const viaStatisch = statisch.filter((p) => p.category === comparison.category);
      // kwaliteitsrang bepaalt de array-volgorde binnen buildHubProductsFromSource,
      // los van de globale score-sortering die getHubProducts() toepast — de
      // pariteitsclaim gaat over de verzameling objecten, niet over volgorde.
      expect(bySlug(viaLoader)).toEqual(bySlug(viaStatisch));
    }
  });

  it("buildHubProductsFromSource is de gedeelde kern: zelfde input geeft zelfde output, DB-pad of statisch pad", () => {
    const inputsBySlug = new Map(Object.entries(PRODUCT_SCORE_INPUTS.magnesium));
    const viaDirectCall = buildHubProductsFromSource("magnesium", magnesiumData.products, inputsBySlug);
    const viaStatisch = getHubProducts().filter((p) => p.category === "magnesium");
    expect(bySlug(viaDirectCall)).toEqual(bySlug(viaStatisch));
  });
});
