import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  approvedClaims,
  type IngredientClaimKey,
} from "@/data/approved-claims";
import { affiliateLinks, type AffiliateSlug } from "@/data/affiliate-links";
import { magnesiumData } from "@/data/supplements/magnesium";
import { omega3Data } from "@/data/supplements/omega-3";
import { ashwagandhaData } from "@/data/supplements/ashwagandha";
import { vitamineDData } from "@/data/supplements/vitamine-d";
import { creatineData } from "@/data/supplements/creatine";
import { zinkData } from "@/data/supplements/zink";
import { eiwitpoederData } from "@/data/supplements/eiwitpoeder";
import { melatonineData } from "@/data/supplements/melatonine";
import { resolveDomainSupplementTip } from "@/lib/resolve-domain-supplement-tip";
import {
  resolveNurtureCta,
  supplementCtaForProfile,
} from "@/lib/resolve-nurture-cta";
import { nurtureOutputHasCrossDomainBalance } from "@/data/nurture-content";
import { resolveGatedComparisonPath } from "@/lib/supplement-gate";
import { getAffiliateShopLabel } from "@/lib/affiliate-shop-labels";
import type { ComparisonPageData } from "@/types/supplement";

const SLUG_TO_CLAIM_KEY: Record<string, IngredientClaimKey> = {
  magnesium: "magnesium",
  "magnesium-glycinaat": "magnesium",
  "omega-3": "omega3",
  "omega-3-supplement": "omega3",
  "vitamine-d": "vitamineD",
  creatine: "creatine",
  zink: "zink",
  ashwagandha: "ashwagandha",
  melatonine: "melatonine",
  eiwitpoeder: "eiwitpoeder",
};

function claimKeyForSlug(slug: string): IngredientClaimKey | undefined {
  return SLUG_TO_CLAIM_KEY[slug];
}

function affiliateLinkClaimKey(
  slug: string,
  url: string,
): IngredientClaimKey | undefined {
  const wsMatch = url.match(/[?&]ws=([^&]+)/);
  if (wsMatch?.[1]) {
    const fromWs = claimKeyForSlug(decodeURIComponent(wsMatch[1]));
    if (fromWs) {
      return fromWs;
    }
  }
  if (claimKeyForSlug(slug)) {
    return claimKeyForSlug(slug);
  }
  for (const [pattern, key] of Object.entries(SLUG_TO_CLAIM_KEY)) {
    if (slug.startsWith(`${pattern}-`)) {
      return key;
    }
  }
  return undefined;
}

const SUPPLEMENT_MODULES: Array<{ file: string; data: ComparisonPageData }> = [
  { file: "src/data/supplements/magnesium.ts", data: magnesiumData },
  { file: "src/data/supplements/omega-3.ts", data: omega3Data },
  { file: "src/data/supplements/ashwagandha.ts", data: ashwagandhaData },
  { file: "src/data/supplements/vitamine-d.ts", data: vitamineDData },
  { file: "src/data/supplements/creatine.ts", data: creatineData },
  { file: "src/data/supplements/zink.ts", data: zinkData },
  { file: "src/data/supplements/eiwitpoeder.ts", data: eiwitpoederData },
  { file: "src/data/supplements/melatonine.ts", data: melatonineData },
];

function collectAffiliateSlugs(data: ComparisonPageData): string[] {
  const slugs: string[] = [];
  for (const route of data.choiceRoutes ?? []) {
    slugs.push(route.affiliateSlug);
  }
  for (const product of data.products) {
    slugs.push(product.affiliateSlug);
  }
  return slugs;
}

function assertForbiddenNoLiveFootprint(): void {
  const violations: string[] = [];

  for (const [claimKey, entry] of Object.entries(approvedClaims)) {
    if (entry.status !== "forbidden") {
      continue;
    }

    const supplementsDir = join(process.cwd(), "src/data/supplements");
    for (const filename of readdirSync(supplementsDir)) {
      if (!filename.endsWith(".ts") || filename === "index.ts") {
        continue;
      }
      const basename = filename.replace(/\.ts$/, "");
      if (claimKeyForSlug(basename) === claimKey) {
        violations.push(
          `FORBIDDEN_SUPPLEMENT_HAS_LIVE_DATA: ${claimKey} (bron: src/data/supplements/${filename})`,
        );
      }
    }

    const forbiddenAffiliateSlugs: AffiliateSlug[] = [];
    for (const [slug, url] of Object.entries(affiliateLinks)) {
      const affiliateSlug = slug as AffiliateSlug;
      const linkKey = affiliateLinkClaimKey(affiliateSlug, url);
      if (linkKey === claimKey || affiliateSlug.startsWith(`${claimKey}-`)) {
        forbiddenAffiliateSlugs.push(affiliateSlug);
      }
    }

    if (forbiddenAffiliateSlugs.length > 0) {
      violations.push(
        `FORBIDDEN_SUPPLEMENT_HAS_LIVE_DATA: ${claimKey} (bron: src/data/affiliate-links.ts)`,
      );
    }

    const hasShopLabel = forbiddenAffiliateSlugs.some(
      (slug) => getAffiliateShopLabel(slug) !== "aanbieder",
    );
    if (hasShopLabel) {
      violations.push(
        `FORBIDDEN_SUPPLEMENT_HAS_LIVE_DATA: ${claimKey} (bron: src/lib/affiliate-shop-labels.ts)`,
      );
    }
  }

  expect(violations).toEqual([]);
}

function assertNoOrphanAffiliateSlugs(): void {
  const violations: string[] = [];

  for (const { file, data } of SUPPLEMENT_MODULES) {
    for (const slug of collectAffiliateSlugs(data)) {
      if (!(slug in affiliateLinks)) {
        violations.push(`ORPHAN_AFFILIATE_SLUG: ${slug} in ${file}`);
      }
    }
  }

  expect(violations).toEqual([]);
}

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

describe("governance invariants", () => {
  // TODO invariant: elke claim in productdata verwijst alleen naar verified:true entries

  const GOVERNANCE_INVARIANTS = [
    { id: "forbidden-no-live-footprint", run: assertForbiddenNoLiveFootprint },
    { id: "no-orphan-affiliate-slugs", run: assertNoOrphanAffiliateSlugs },
  ] as const;

  for (const invariant of GOVERNANCE_INVARIANTS) {
    it(invariant.id, invariant.run);
  }
});

describe("supplement invariant matrix", () => {
  it("claim-poort: on_hold hebben geen gated path", () => {
    expect(resolveGatedComparisonPath("ashwagandha")).toBeNull();
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
