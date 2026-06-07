import { describe, it, expect } from "vitest";
import { magnesiumData } from "@/data/supplements/magnesium";
import { resolveDomainSupplementTip } from "@/lib/resolve-domain-supplement-tip";
import {
  resolveNurtureCta,
  supplementCtaForProfile,
} from "@/lib/resolve-nurture-cta";
import { nurtureOutputHasCrossDomainBalance } from "@/data/nurture-content";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";

const gateFull = {
  visibleTiers: [1, 2, 3],
  completedPlanPhases: 2,
  organizationId: "org-1",
};

const gateTier1Only = {
  visibleTiers: [1],
  completedPlanPhases: 0,
  organizationId: "org-1",
};

describe("supplement invariant matrix", () => {
  it("claim-poort: on_hold/forbidden hebben geen gated path", () => {
    expect(resolveGatedComparisonPath("ashwagandha")).toBeNull();
    expect(resolveGatedComparisonPath("melatonine")).toBeNull();
  });

  it("comparison-poort: approved ingredienten hebben pad", () => {
    expect(resolveGatedComparisonPath("magnesium")).toBe("/beste/magnesium");
    expect(resolveGatedComparisonPath("omega3")).toBe(
      "/beste/omega-3-supplement",
    );
  });

  it("tier-gate: dag 14 zonder tier 3 → geen supplement-CTA", () => {
    const result = resolveNurtureCta(
      "Onrustige Slaper",
      14,
      gateTier1Only,
      true,
      "sleep_score",
    );
    expect(result.kind).not.toBe("supplement");
  });

  it("tier-gate: dag 14 met tier 3 → supplement-CTA voor Onrustige Slaper", () => {
    const result = resolveNurtureCta(
      "Onrustige Slaper",
      14,
      gateFull,
      true,
      "sleep_score",
    );
    expect(result.kind).toBe("supplement");
    expect(result.url).toBe("/beste/magnesium");
  });

  it("B8: energy_score tip bevat geen /beste/-URL (omega3.note)", () => {
    const tip = resolveDomainSupplementTip("energy_score", gateFull);
    expect(tip.supplement.url).not.toMatch(/^\/beste\//);
  });

  it("B8: sleep_score tip gebruikt gated magnesium-pad", () => {
    const tip = resolveDomainSupplementTip("sleep_score", gateFull);
    expect(tip.supplement.url).toBe("/beste/magnesium");
  });

  it("balansregel: tip-domein ≠ supplement-domein check", () => {
    expect(
      nurtureOutputHasCrossDomainBalance("nutrition_score", "sleep_score"),
    ).toBe(true);
    expect(
      nurtureOutputHasCrossDomainBalance("sleep_score", "sleep_score"),
    ).toBe(false);
  });

  it("Stressdrager slaat on_hold ashwagandha over naar magnesium", () => {
    const supplement = supplementCtaForProfile("Stressdrager");
    expect(supplement?.url).toBe("/beste/magnesium");
  });

  it("gemigreerde magnesium-producten met claims voldoen aan drempel", () => {
    const claimed = magnesiumData.products.filter(
      (product) => product.efsaClaimIds.length > 0,
    );
    expect(claimed.length).toBeGreaterThan(0);
    for (const product of claimed) {
      expect(product.voldoetAanClaimConditie).toBe(true);
    }
  });
});
