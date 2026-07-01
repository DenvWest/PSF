import { describe, it, expect, vi, afterEach } from "vitest";
import {
  resolveNurtureCta,
  lifestyleCtaForProfile,
  pillarCtaForProfile,
  supplementCtaForProfile,
  type NurtureSequenceDay,
} from "@/lib/resolve-nurture-cta";
import * as comparisonAvailability from "@/lib/comparison-availability";
import {
  approvedClaims,
  type IngredientClaimKey,
} from "@/data/approved-claims";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import type { NurtureProfileKey } from "@/data/nurture-content";
import type { DomainKey } from "@/data/nurture-content";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";
import type { DomainScores } from "@/lib/intake-engine";
import type { RecommendationInput } from "@/types/recommendation";

const PROFILES: NurtureProfileKey[] = [
  "Stressdrager",
  "Onrustige Slaper",
  "Lage Batterij",
  "Overtrainer",
  "In Balans",
];

const DAYS: NurtureSequenceDay[] = [0, 3, 7, 14, 21, 30];

const WEAKEST: DomainKey = "sleep_score";

const gateFull: NurturePlanGate = {
  visibleTiers: [1, 2, 3],
  completedPlanPhases: 2,
  organizationId: "org-1",
};

const gateTier1Only: NurturePlanGate = {
  visibleTiers: [1],
  completedPlanPhases: 0,
  organizationId: "org-1",
};

function assertNoForbiddenCompareUrl(url: string): void {
  if (!url.startsWith("/beste/")) {
    return;
  }
  const slug = url.replace(/^\/beste\//, "");
  const forbidden = ["ashwagandha"];
  expect(forbidden).not.toContain(slug);
}

const SLUG_TO_CLAIM: Record<string, IngredientClaimKey> = {
  magnesium: "magnesium",
  "omega-3-supplement": "omega3",
  ashwagandha: "ashwagandha",
  melatonine: "melatonine",
  creatine: "creatine",
  zink: "zink",
  eiwitpoeder: "eiwitpoeder",
  "vitamine-d": "vitamineD",
};

function assertApprovedOrNull(
  cta: ReturnType<typeof supplementCtaForProfile>,
): void {
  if (!cta) {
    return;
  }
  const slug = cta.url.replace(/^\/beste\//, "");
  const claimKey = SLUG_TO_CLAIM[slug];
  expect(claimKey, `onbekende slug: ${slug}`).toBeDefined();
  expect(approvedClaims[claimKey!].status).toBe("approved");
}

function makeScores(overrides: Partial<DomainScores> = {}): DomainScores {
  return {
    sleep_score: 70,
    energy_score: 70,
    stress_score: 70,
    nutrition_score: 70,
    movement_score: 70,
    recovery_score: 70,
    connection_score: 70,
    ...overrides,
  };
}

const COMPLIANCE_INPUTS: RecommendationInput[] = [
  buildRecommendationInput({
    scores: makeScores({ sleep_score: 20 }),
    answers: {},
  }),
  buildRecommendationInput({
    scores: makeScores({ nutrition_score: 20 }),
    answers: {},
  }),
  buildRecommendationInput({
    scores: makeScores({ recovery_score: 20,
    connection_score: 20 }),
    answers: {},
  }),
];

describe("resolveNurtureCta", () => {
  for (const profile of PROFILES) {
    for (const day of DAYS) {
      for (const [label, planGate] of [
        ["full gate", gateFull],
        ["tier1 gate", gateTier1Only],
        ["null gate", null],
      ] as const) {
        it(`${profile} day ${day} with ${label} — dag 0/3 lifestyle`, () => {
          const result = resolveNurtureCta(
            profile,
            day,
            planGate,
            true,
            WEAKEST,
          );
          assertNoForbiddenCompareUrl(result.url);
          if (day === 0 || day === 3) {
            expect(result.kind).toBe("lifestyle");
          }
        });
      }
    }
  }

  it("dag 7 returns pillar or lifestyle", () => {
    for (const profile of PROFILES) {
      const result = resolveNurtureCta(profile, 7, gateFull, true, WEAKEST);
      expect(["pillar", "lifestyle"]).toContain(result.kind);
      assertNoForbiddenCompareUrl(result.url);
    }
  });

  it("dag 30 returns remeasure", () => {
    const result = resolveNurtureCta("In Balans", 30, gateFull, true, WEAKEST);
    expect(result.kind).toBe("remeasure");
    expect(result.url).toBe("/intake");
  });

  it("dag 14/21 zonder tier 3 gate — geen supplement als primaire CTA", () => {
    for (const profile of PROFILES) {
      for (const day of [14, 21] as const) {
        const result = resolveNurtureCta(
          profile,
          day,
          gateTier1Only,
          true,
          WEAKEST,
        );
        expect(result.kind).not.toBe("supplement");
      }
    }
  });

  it("dag 14/21 zonder compare path — geen supplement", () => {
    const result = resolveNurtureCta(
      "Onrustige Slaper",
      14,
      gateFull,
      false,
      WEAKEST,
    );
    expect(result.kind).not.toBe("supplement");
  });

  it("dag 14/21 met volledige gate en compare path — supplement voor Onrustige Slaper", () => {
    const result = resolveNurtureCta(
      "Onrustige Slaper",
      14,
      gateFull,
      true,
      WEAKEST,
    );
    expect(result.kind).toBe("supplement");
    expect(result.url).toBe("/beste/magnesium");
  });

  it("supplement CTAs alleen voor approved comparison paths", () => {
    for (const profile of PROFILES) {
      const supplement = supplementCtaForProfile(profile);
      if (supplement) {
        expect(supplement.url.startsWith("/beste/")).toBe(true);
        assertNoForbiddenCompareUrl(supplement.url);
      }
    }
  });

  it("on_hold ashwagandha wordt overgeslagen naar volgende kandidaat (magnesium)", () => {
    const supplement = supplementCtaForProfile("Stressdrager");
    expect(supplement).not.toBeNull();
    expect(supplement?.url).toBe("/beste/magnesium");
    expect(supplement?.kind).toBe("supplement");
  });

  it("geen kandidaat passeert gate — supplementCtaForProfile null en leefstijl-fallback", () => {
    const spy = vi
      .spyOn(comparisonAvailability, "isComparisonAllowed")
      .mockReturnValue(false);

    expect(supplementCtaForProfile("Onrustige Slaper")).toBeNull();

    const result = resolveNurtureCta(
      "Onrustige Slaper",
      14,
      gateFull,
      true,
      WEAKEST,
    );
    expect(result.kind).not.toBe("supplement");
    expect(result.kind).toBe("lifestyle");

    spy.mockRestore();
  });

  it("melatonine (forbidden, geen comparisonPath) verschijnt nooit als CTA", () => {
    const supplement = supplementCtaForProfile("In Balans");
    expect(supplement).not.toBeNull();
    expect(supplement?.url).toBe("/beste/omega-3-supplement");
    expect(supplement?.url).not.toContain("melatonine");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("lifestyleCtaForProfile", () => {
  it("Stressdrager wijst naar stressgids", () => {
    const cta = lifestyleCtaForProfile("Stressdrager");
    expect(cta.url).toBe("/stress-verminderen-na-40");
    expect(cta.kind).toBe("lifestyle");
  });
});

describe("pillarCtaForProfile", () => {
  it("volgt zwakste domein", () => {
    const cta = pillarCtaForProfile("Lage Batterij", "nutrition_score");
    expect(cta.url).toBe("/gids/voeding");
    expect(cta.kind).toBe("pillar");
  });

  it("beweging wijst naar gids-opt-in", () => {
    const cta = pillarCtaForProfile("Overtrainer", "movement_score");
    expect(cta.url).toBe("/gids/beweging");
    expect(cta.kind).toBe("pillar");
  });
});

// PERMANENTE compliance-invariant — overleeft latere meetlaag-uitbreiding.
// Exact huidige gedrag (magnesium/omega-3) zit in nurture-selection-snapshot.test.ts.
describe("supplementCtaForProfile status-based compliance", () => {
  for (const profile of PROFILES) {
    it(`${profile} zonder input — alleen approved claims of null`, () => {
      assertApprovedOrNull(supplementCtaForProfile(profile));
    });

    for (const [index, input] of COMPLIANCE_INPUTS.entries()) {
      it(`${profile} met compliance input ${index + 1} — alleen approved claims of null`, () => {
        assertApprovedOrNull(supplementCtaForProfile(profile, input));
      });
    }
  }
});
