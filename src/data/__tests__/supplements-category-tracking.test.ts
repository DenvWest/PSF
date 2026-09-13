import { describe, expect, it } from "vitest";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";

/**
 * Bewaakt de meet-keten voor elke /beste/*-pagina: AffiliateLink krijgt zijn
 * `category`-prop overal via `data.category` (zie ChoiceHero, ProductCard,
 * ComboVariantSection, StickyMobileCta, en de page zelf). Zonder een
 * niet-lege `category` valt een klik terug op de generieke "vergelijking"-
 * waarde in affiliate_clicks.categorie, en is niet meer te zien welke stof
 * de klik opleverde (getClicksPerCategory() wordt dan zinloos).
 *
 * Deze test dwingt af dat elke huidige én toekomstige /beste/*-pagina een
 * eigen, niet-lege category draagt — regressie hierop moet rood worden,
 * niet stilzwijgend "vergelijking" opleveren.
 */
describe("supplements — category per /beste/*-pagina (affiliate_clicks-tracking)", () => {
  it("SUPPLEMENT_SLUGS is niet leeg", () => {
    expect(SUPPLEMENT_SLUGS.length).toBeGreaterThan(0);
  });

  it.each(SUPPLEMENT_SLUGS)(
    "/beste/%s heeft een niet-lege, unieke category (≠ generieke 'vergelijking')",
    (slug) => {
      const data = getSupplementComparisonData(slug);
      expect(data).toBeDefined();
      expect(typeof data?.category).toBe("string");
      expect(data?.category.trim().length).toBeGreaterThan(0);
      expect(data?.category).not.toBe("vergelijking");
    },
  );

  it("elke stof heeft een unieke category (geen twee /beste/*-pagina's delen er één)", () => {
    const categories = SUPPLEMENT_SLUGS.map(
      (slug) => getSupplementComparisonData(slug)?.category,
    );
    expect(new Set(categories).size).toBe(categories.length);
  });
});
