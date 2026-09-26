import { describe, expect, it } from "vitest";
import { backfillOffers } from "@/lib/supplement-catalog-db/offers-backfill";

/**
 * In-memory stub met de select/upsert-vorm die offers-backfill.ts nodig heeft:
 * pd_partners (select door slug), sup_retailers (upsert), sup_products (select
 * alle rijen), sup_offers (upsert). Geen echte DB — test de mapping-logica.
 */
function createFakeDb(options: {
  partners?: Array<{ slug: string; id: string }>;
  products?: Array<{
    id: string;
    slug: string;
    raw_legacy_fields: { affiliateSlug?: string } | null;
  }>;
}) {
  const partners = options.partners ?? [
    { slug: "vitaminstore", id: "partner-vitaminstore" },
    { slug: "vitalnutrition", id: "partner-vitalnutrition" },
    { slug: "arctic-blue", id: "partner-arctic-blue" },
  ];
  const products = options.products ?? [];

  const retailers = new Map<string, Record<string, unknown>>();
  const offers = new Map<string, Record<string, unknown>>();

  const db = {
    from(table: string) {
      if (table === "pd_partners") {
        return {
          select() {
            return {
              eq(_col: string, value: string) {
                return {
                  async single() {
                    const found = partners.find((p) => p.slug === value);
                    return found
                      ? { data: { id: found.id }, error: null }
                      : { data: null, error: { message: "not found" } };
                  },
                };
              },
            };
          },
        };
      }

      if (table === "sup_retailers") {
        return {
          upsert(row: Record<string, unknown>, opts: { onConflict: string }) {
            const key = String(row[opts.onConflict]);
            const id = `retailer-${key}`;
            retailers.set(key, { ...row, id });
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
        };
      }

      if (table === "sup_products") {
        return {
          select() {
            return Promise.resolve({ data: products, error: null });
          },
        };
      }

      if (table === "sup_offers") {
        return {
          async upsert(row: Record<string, unknown>, opts: { onConflict: string }) {
            const key = opts.onConflict
              .split(",")
              .map((col) => row[col])
              .join(":");
            offers.set(key, row);
            return { error: null };
          },
        };
      }

      throw new Error(`Onverwachte tabel in test-stub: ${table}`);
    },
  };

  return { db, retailers, offers };
}

describe("backfillOffers", () => {
  it("schrijft de 3 retailers wanneer hun pd_partners-rij bestaat", async () => {
    const { db, retailers } = createFakeDb({ products: [] });
    const result = await backfillOffers(db as never);

    expect(result.retailersUpserted).toBe(3);
    expect(retailers.get("vitaminstore")).toMatchObject({ relationship: "network" });
    expect(retailers.get("arctic-blue")).toMatchObject({ relationship: "direct" });
  });

  it("meldt een fout en slaat een retailer over als de pd_partners-rij ontbreekt", async () => {
    const { db } = createFakeDb({
      partners: [{ slug: "vitaminstore", id: "partner-vitaminstore" }],
      products: [],
    });
    const result = await backfillOffers(db as never);

    expect(result.retailersUpserted).toBe(1);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.stringContaining("vitalnutrition")]),
    );
  });

  it("koppelt een offer aan het juiste product via raw_legacy_fields.affiliateSlug", async () => {
    const { db, offers } = createFakeDb({
      products: [
        {
          id: "product-zink",
          slug: "vitalnutrition-zink",
          raw_legacy_fields: { affiliateSlug: "vitalnutrition-zink" },
        },
      ],
    });

    const result = await backfillOffers(db as never);

    expect(result.errors).toEqual([]);
    expect(result.offersUpserted).toBeGreaterThan(0);
    const offer = offers.get("product-zink:retailer-vitalnutrition");
    expect(offer).toMatchObject({
      product_id: "product-zink",
      retailer_id: "retailer-vitalnutrition",
      affiliate_url: expect.stringContaining("bdt9.net"),
    });
  });

  it("gebruikt raw_legacy_fields.affiliateSlug i.p.v. sup_products.slug wanneer die verschillen", async () => {
    // eiwitpoeder-precedent: sup_products.slug = "vital-nutrition-whey-proteine",
    // affiliateSlug = "proteine-vital-nutrition-whey".
    const { db, offers } = createFakeDb({
      products: [
        {
          id: "product-whey",
          slug: "vital-nutrition-whey-proteine",
          raw_legacy_fields: { affiliateSlug: "proteine-vital-nutrition-whey" },
        },
      ],
    });

    const result = await backfillOffers(db as never);

    expect(result.errors).toEqual([]);
    const offer = offers.get("product-whey:retailer-vitalnutrition");
    expect(offer).toBeDefined();
  });

  it("slaat affiliate-links over die aan geen enkel sup_products-rij hangen", async () => {
    const { db, offers } = createFakeDb({ products: [] });
    const result = await backfillOffers(db as never);

    expect(result.offersUpserted).toBe(0);
    expect(offers.size).toBe(0);
    // Geen fout: dit is verwacht gedrag, niet elke affiliate-slug hoeft een
    // backfilled product te hebben (bijv. nog niet omgeschakelde categorieën).
    expect(result.errors).toEqual([]);
  });
});
