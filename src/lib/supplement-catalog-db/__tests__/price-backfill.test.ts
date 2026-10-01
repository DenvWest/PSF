import { describe, expect, it } from "vitest";
import { backfillPrices } from "@/lib/supplement-catalog-db/price-backfill";

/**
 * Minimale fake-DB: ondersteunt alleen de select/update-vorm die
 * price-backfill.ts gebruikt (sup_products op slug, sup_offers op
 * product_id). Eén rij per product/offer, vooraf gezet.
 */
function createFakeDb(options: {
  products: Record<string, { id: string; servings_per_container: number | null }>;
  offersByProductId: Record<string, { id: string; price_cents: number | null; price_checked_at: string | null }>;
}) {
  const offers = { ...options.offersByProductId };

  return {
    from(table: string) {
      if (table === "sup_products") {
        return {
          select() {
            return {
              eq(_col: string, slug: string) {
                return {
                  async maybeSingle() {
                    const row = options.products[slug];
                    return { data: row ?? null, error: null };
                  },
                };
              },
            };
          },
        };
      }
      if (table === "sup_offers") {
        return {
          select() {
            return {
              eq(_col: string, productId: string) {
                return {
                  async maybeSingle() {
                    return { data: offers[productId] ?? null, error: null };
                  },
                };
              },
            };
          },
          update(values: { price_cents: number; price_checked_at: string }) {
            return {
              async eq(_col: string, offerId: string) {
                const entry = Object.values(offers).find((o) => o.id === offerId);
                if (entry) Object.assign(entry, values);
                return { error: null };
              },
            };
          },
        };
      }
      throw new Error(`Onverwachte tabel in test-stub: ${table}`);
    },
  };
}

describe("backfillPrices", () => {
  it("gebruikt de 'Prijs'-spec rechtstreeks als totaalprijs, geen omrekening nodig", async () => {
    // Zink heeft een "Prijs"-spec naast "Prijs / dag"; vitalnutrition-zink
    // draagt "Prijs / dag": "€ 0,18" en "Prijs": "€ 17,95".
    const db = createFakeDb({
      products: { "vitalnutrition-zink": { id: "p1", servings_per_container: 100 } },
      offersByProductId: { p1: { id: "o1", price_cents: null, price_checked_at: null } },
    });

    const result = await backfillPrices(db as never);
    expect(result.written).toContain("zink/vitalnutrition-zink");
  });

  it("berekent de totaalprijs uit 'Prijs / dag' × servings_per_container wanneer 'Prijs' ontbreekt", async () => {
    // Magnesium heeft geen "Prijs"-spec; vitaminstore-super-magnesium heeft
    // "Prijs / dag": "€ 0,43" en 120 tabletten (120 servings, 1 per dag-item,
    // niet relevant hier — servings_per_container komt uit de DB-rij).
    const db = createFakeDb({
      products: {
        "vitaminstore-super-magnesium": { id: "p1", servings_per_container: 60 },
      },
      offersByProductId: { p1: { id: "o1", price_cents: null, price_checked_at: null } },
    });

    const result = await backfillPrices(db as never);
    expect(result.written).toContain("magnesium/vitaminstore-super-magnesium");
    expect(result.errors).toEqual([]);
  });

  it("laat een product in 'unparsed' als er geen 'Prijs' is en servings_per_container ontbreekt", async () => {
    const db = createFakeDb({
      products: {
        "vitaminstore-super-magnesium": { id: "p1", servings_per_container: null },
      },
      offersByProductId: { p1: { id: "o1", price_cents: null, price_checked_at: null } },
    });

    const result = await backfillPrices(db as never);
    expect(result.unparsed).toContain("magnesium/vitaminstore-super-magnesium");
  });

  it("slaat een bestaande price_cents standaard over (idempotent)", async () => {
    const db = createFakeDb({
      products: {
        "vitaminstore-super-magnesium": { id: "p1", servings_per_container: 120 },
      },
      offersByProductId: { p1: { id: "o1", price_cents: 43, price_checked_at: "2026-04-18" } },
    });

    const result = await backfillPrices(db as never);
    expect(result.skippedExisting).toContain("magnesium/vitaminstore-super-magnesium");
  });

  it("force=true herberekent alleen rijen met de ongewijzigde backfill-stempel (lastUpdated)", async () => {
    const touchedDb = createFakeDb({
      products: {
        "vitaminstore-super-magnesium": { id: "p1", servings_per_container: 120 },
      },
      // price_checked_at = vandaag, dus NIET de lastUpdated-stempel — dit
      // simuleert een handmatige "Prijs gecontroleerd"-klik in de admin.
      offersByProductId: { p1: { id: "o1", price_cents: 4300, price_checked_at: "2026-10-01" } },
    });

    const touchedResult = await backfillPrices(touchedDb as never, { force: true });
    expect(touchedResult.skippedExisting).toContain("magnesium/vitaminstore-super-magnesium");

    const untouchedDb = createFakeDb({
      products: {
        "vitaminstore-super-magnesium": { id: "p1", servings_per_container: 120 },
      },
      // price_checked_at = exact de lastUpdated van magnesium.ts (2026-09-15):
      // dit is de vorige (foute) backfill, nog nooit handmatig aangepast.
      offersByProductId: { p1: { id: "o1", price_cents: 43, price_checked_at: "2026-09-15" } },
    });

    const untouchedResult = await backfillPrices(untouchedDb as never, { force: true });
    expect(untouchedResult.written).toContain("magnesium/vitaminstore-super-magnesium");
  });
});
