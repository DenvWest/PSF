import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { SUPPLEMENT_SLUGS, getSupplementComparisonData } from "@/data/supplements";
import { ALL_SUPPLEMENT_SLUGS } from "@/data/supplement-guides";
import { VOEDING_STOF_SLUGS } from "@/lib/voeding-public";

describe("sitemap vergelijkingspagina's", () => {
  it("gebruikt de eigen lastUpdated-datum per supplement, niet een gedeelde fallback", () => {
    const entries = sitemap();
    const bySlug = new Map(SUPPLEMENT_SLUGS.map((slug) => [slug, getSupplementComparisonData(slug)]));

    for (const slug of SUPPLEMENT_SLUGS) {
      const data = bySlug.get(slug);
      if (!data) continue;
      const entry = entries.find((e) => e.url === `https://perfectsupplement.nl/beste/${slug}`);
      expect(entry, `geen sitemap-entry voor /beste/${slug}`).toBeDefined();
      expect(entry?.lastModified).toEqual(new Date(data.lastUpdated));
    }
  });

  it("bevat alle supplementgidsen en voedingsstof-pagina's", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((e) => e.url));

    for (const slug of ALL_SUPPLEMENT_SLUGS) {
      expect(urls.has(`https://perfectsupplement.nl/supplementen/${slug}`)).toBe(true);
    }
    for (const slug of VOEDING_STOF_SLUGS) {
      expect(urls.has(`https://perfectsupplement.nl/voeding/${slug}`)).toBe(true);
    }
    expect(urls.has("https://perfectsupplement.nl/voeding")).toBe(true);
    expect(urls.has("https://perfectsupplement.nl/intake/voeding")).toBe(true);
  });

  it("elke vergelijkingspagina heeft een unieke lastModified-datum wanneer de brondata dat ook heeft", () => {
    const uniqueLastUpdated = new Set(
      SUPPLEMENT_SLUGS.map((slug) => getSupplementComparisonData(slug)?.lastUpdated),
    );
    // Sanity check op de testdata zelf: als dit ooit 1 wordt, hebben alle
    // supplementen toevallig dezelfde datum en test dit niets meer zinvols.
    expect(uniqueLastUpdated.size).toBeGreaterThan(1);
  });
});
