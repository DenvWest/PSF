import { describe, expect, it } from "vitest";
import { kennisbankTerms } from "@/data/kennisbank";
import {
  getPremiumKennisbankInsights,
  isPremiumKennisbankInsight,
} from "@/data/insights";

describe("kennisbank insightTier metadata", () => {
  it("elke kennisbank-term heeft insightTier 1, 2 of 3", () => {
    for (const term of kennisbankTerms) {
      expect(term.insightTier).toBeGreaterThanOrEqual(1);
      expect(term.insightTier).toBeLessThanOrEqual(3);
    }
    expect(kennisbankTerms.length).toBe(25);
  });
});

describe("premium kennisbank filter", () => {
  it("sluit tier 1 begrippen uit", () => {
    const premium = getPremiumKennisbankInsights();
    expect(premium.length).toBeGreaterThan(0);
    expect(premium.every(isPremiumKennisbankInsight)).toBe(true);
    expect(premium.some((item) => item.slug === "adh")).toBe(false);
    expect(premium.some((item) => item.slug === "biobeschikbaarheid")).toBe(
      false,
    );
    expect(premium.some((item) => item.slug === "slaaphygiene")).toBe(false);
    expect(premium.some((item) => item.slug === "eiwitbehoefte-na-40")).toBe(
      false,
    );
  });

  it("bevat tier 2 en tier 3 begrippen", () => {
    const premium = getPremiumKennisbankInsights();
    expect(premium.some((item) => item.slug === "circadiaan-ritme")).toBe(true);
    expect(premium.some((item) => item.slug === "cortisol")).toBe(true);
  });

  it("filtert op pijler", () => {
    const slaap = getPremiumKennisbankInsights({ pijler: "slaap" });
    expect(slaap.every((item) => item.pijler === "slaap")).toBe(true);
    expect(slaap.some((item) => item.slug === "melatonine")).toBe(true);
    expect(slaap.some((item) => item.slug === "cortisol")).toBe(false);
  });
});
