import { describe, expect, it } from "vitest";
import type { InterventionBuckets } from "@/lib/content/match-interventions";
import { resolveNurtureInterventionHighlight } from "@/lib/content/nurture-interventions";
import {
  filterByVisibleTiers,
  isTierVisible,
  resolveNurtureTierAction,
} from "@/lib/content/resolve-nurture-tier";

function makeIntervention(
  kind: "free_action" | "measurement" | "supplement",
  tier: 1 | 2 | 3,
) {
  return {
    id: `${kind}-id`,
    slug: `${kind}-slug`,
    name: `${kind} name`,
    kind,
    description: `${kind} description`,
    goalPhrase: `${kind} goal`,
    affiliateUrl: kind === "supplement" ? "https://example.com" : null,
    comparisonPath: kind === "supplement" ? "/beste/magnesium" : null,
    tier,
    isPaid: kind === "supplement",
    paidDisclosureKey: null,
    externalProviderLabel: null,
    externalProviderUrl: null,
    compositeScore: 10,
    scores: {
      scoreMoeite: 3,
      scoreMechanisme: 3,
      scoreOnderbouwing: 3,
      scoreVeiligheid: 5,
    },
  };
}

function makeBuckets(): InterventionBuckets {
  return {
    free_action: makeIntervention("free_action", 1),
    measurement: makeIntervention("measurement", 2),
    supplement: makeIntervention("supplement", 3),
  };
}

describe("resolveNurtureTierAction", () => {
  const buckets = makeBuckets();

  it("keeps day 3 on tier 1 without phase gating", () => {
    const result = resolveNurtureTierAction(buckets, [1, 2, 3], 0, 3);
    expect(result.effectiveTier).toBe(1);
    expect(result.intervention?.kind).toBe("free_action");
    expect(result.degraded).toBe(false);
  });

  it("degrades day 14 to tier 1 when no plan phases are complete", () => {
    const result = resolveNurtureTierAction(buckets, [1, 2, 3], 0, 14);
    expect(result.requestedTier).toBe(2);
    expect(result.effectiveTier).toBe(1);
    expect(result.intervention?.kind).toBe("free_action");
    expect(result.degraded).toBe(true);
  });

  it("unlocks day 14 tier 2 after phase 1 is complete", () => {
    const result = resolveNurtureTierAction(buckets, [1, 2, 3], 1, 14);
    expect(result.effectiveTier).toBe(2);
    expect(result.intervention?.kind).toBe("measurement");
    expect(result.degraded).toBe(false);
  });

  it("blocks day 21 supplement without completed measurement phase", () => {
    const result = resolveNurtureTierAction(buckets, [1, 2, 3], 1, 21);
    expect(result.effectiveTier).toBe(2);
    expect(result.intervention?.kind).toBe("measurement");
    expect(result.intervention?.kind).not.toBe("supplement");
    expect(result.degraded).toBe(true);
  });

  it("unlocks day 21 supplement after phase 2 is complete", () => {
    const result = resolveNurtureTierAction(buckets, [1, 2, 3], 2, 21);
    expect(result.effectiveTier).toBe(3);
    expect(result.intervention?.kind).toBe("supplement");
    expect(result.degraded).toBe(false);
  });

  it("never exposes tier 3 on day 21 when org maxTier is 1", () => {
    const result = resolveNurtureTierAction(buckets, [1], 2, 21);
    expect(result.effectiveTier).toBe(1);
    expect(result.intervention?.kind).toBe("free_action");
    expect(result.intervention?.comparisonPath).toBeNull();
    expect(result.degraded).toBe(true);
  });
});

describe("shared visible-tier gate", () => {
  it("uses the same tier visibility rule for plan actions and nurture", () => {
    const visibleTiers = [1, 2];
    const actions = [
      { tier: 1, slug: "a" },
      { tier: 2, slug: "b" },
      { tier: 3, slug: "c" },
    ];

    const planVisible = filterByVisibleTiers(actions, visibleTiers).map(
      (action) => action.tier,
    );
    const nurtureVisible = ([1, 2, 3] as const).filter((tier) =>
      isTierVisible(tier, visibleTiers),
    );

    expect(planVisible).toEqual([1, 2]);
    expect(nurtureVisible).toEqual([1, 2]);

    const day21 = resolveNurtureTierAction(makeBuckets(), visibleTiers, 2, 21);
    expect(day21.effectiveTier).toBe(2);
    expect(day21.intervention?.tier).toBe(2);
  });
});

describe("resolveNurtureInterventionHighlight", () => {
  const buckets = makeBuckets();

  it("renders no supplement highlight on day 21 without plan progress", () => {
    const highlight = resolveNurtureInterventionHighlight({
      interventionBuckets: buckets,
      sequenceDay: 21,
      completedPlanPhases: 0,
      visibleTiers: [1, 2, 3],
    });

    expect(highlight).not.toBeNull();
    expect(highlight?.kindLabel).not.toBe("Supplement");
    expect(highlight?.comparePath).toBeFalsy();
  });

  it("renders supplement highlight on day 21 after measurement phase", () => {
    const highlight = resolveNurtureInterventionHighlight({
      interventionBuckets: buckets,
      sequenceDay: 21,
      completedPlanPhases: 2,
      visibleTiers: [1, 2, 3],
    });

    expect(highlight?.kindLabel).toBe("Supplement");
    expect(highlight?.comparePath).toBe("/beste/magnesium");
  });
});
