import { describe, expect, it } from "vitest";
import { alleArtikelen } from "@/data/blog";
import {
  CONTENT_METADATA,
  getContentMetadata,
} from "@/data/insight-metadata";
import { allInsights } from "@/data/insights";
import { kennisbankTerms } from "@/data/kennisbank";
import { getCatalogEntryById } from "@/data/supplement-catalog";
import { THEME_CONTENT_MAP } from "@/data/theme-content-map";
import { getDeficiencySignals } from "@/lib/intake-engine";

describe("content metadata overlay", () => {
  const SIGNAL_KEYS = new Set(Object.keys(getDeficiencySignals({})));
  const SLUGS = new Set(allInsights.map((i) => i.slug));

  it("elke CONTENT_METADATA-entry verwijst naar een bestaande slug", () => {
    for (const [slug, meta] of Object.entries(CONTENT_METADATA)) {
      expect(SLUGS.has(slug), `onbekende content-slug: ${slug}`).toBe(true);
      if (meta.theme) expect(meta.theme in THEME_CONTENT_MAP).toBe(true);
      if (meta.gapSignal) expect(SIGNAL_KEYS.has(meta.gapSignal)).toBe(true);
      if (meta.relatedSupplementId) {
        expect(getCatalogEntryById(meta.relatedSupplementId)).toBeDefined();
      }
      if (meta.planPhase) expect([1, 2, 3]).toContain(meta.planPhase);
    }
  });

  it("allInsights blijft inert qua aantal items", () => {
    expect(allInsights.length).toBe(
      alleArtikelen.length + kennisbankTerms.length,
    );
  });

  it("geseede slug draagt metadata door normalizer", () => {
    const tagged = allInsights.find((i) => i.slug === "eiwitbehoefte-na-40");
    expect(tagged?.relatedSupplementId).toBeDefined();
  });

  it("getContentMetadata geeft leeg object voor onbekende slug", () => {
    expect(getContentMetadata("___bestaat-niet___")).toEqual({});
  });
});
