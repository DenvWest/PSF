import { describe, it, expect } from "vitest";
import {
  resolveNurtureCta,
  lifestyleCtaForProfile,
  pillarCtaForProfile,
  supplementCtaForProfile,
  type NurtureSequenceDay,
} from "@/lib/resolve-nurture-cta";
import type { NurtureProfileKey } from "@/data/nurture-content";
import type { DomainKey } from "@/data/nurture-content";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";

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
});

describe("lifestyleCtaForProfile", () => {
  it("Stressdrager wijst naar stressgids", () => {
    const cta = lifestyleCtaForProfile("Stressdrager");
    expect(cta.url).toBe("/stress-verminderen-man");
    expect(cta.kind).toBe("lifestyle");
  });
});

describe("pillarCtaForProfile", () => {
  it("volgt zwakste domein", () => {
    const cta = pillarCtaForProfile("Lage Batterij", "nutrition_score");
    expect(cta.url).toBe("/voeding-na-40");
    expect(cta.kind).toBe("pillar");
  });
});
