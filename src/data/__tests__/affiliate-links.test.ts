import { describe, expect, it } from "vitest";
import { affiliateLinks, affiliateSlugToComparison } from "@/data/affiliate-links";
import { DEFAULT_ORG } from "@/config/org";

describe("affiliateSlugToComparison", () => {
  it("dekt elke affiliate-slug (satisfies Record<AffiliateSlug, string> vangt dit al bij build, maar expliciet is beter dan impliciet)", () => {
    const slugs = Object.keys(affiliateLinks);
    const mapped = Object.keys(affiliateSlugToComparison);
    expect(mapped.sort()).toEqual(slugs.sort());
  });

  it("wijst alleen naar vergelijkingsslugs die ook echt live staan", () => {
    const liveComparisons = new Set(DEFAULT_ORG.supplements);
    const usedComparisons = new Set(Object.values(affiliateSlugToComparison));

    for (const comparison of usedComparisons) {
      expect(
        liveComparisons.has(comparison),
        `"${comparison}" staat in affiliateSlugToComparison maar niet in DEFAULT_ORG.supplements`,
      ).toBe(true);
    }
  });
});
