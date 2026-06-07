import { describe, it, expect } from "vitest";
import { renderNurtureDayInner } from "@/lib/email-templates/nurture/prepare-nurture-mail";
import type {
  NurtureEmailData,
  NurtureEmailDispatchContext,
} from "@/lib/email-templates/nurture/types";

const CTX: NurtureEmailDispatchContext = {
  recipientEmail: "test@example.com",
  recoveryUrl: "https://www.perfectsupplement.nl/intake?token=test",
};

// Fragment uit AFFILIATE_DISCLAIMER_NL in src/lib/emails/shared.ts
const DISCLAIMER_FRAGMENT =
  "Sommige links in deze e-mail zijn affiliate links";

function buildDay14Data(
  visibleTiers: number[],
  completedPlanPhases: number,
): NurtureEmailData {
  return {
    profileLabel: "Onrustige Slaper",
    primaryDomain: "sleep",
    domainScores: {
      sleep_score: 25,
      energy_score: 50,
      stress_score: 50,
      nutrition_score: 50,
      movement_score: 50,
      recovery_score: 50,
    },
    sequenceDay: 14,
    urgencyLevel: "moderate",
    visibleTiers,
    completedPlanPhases,
  };
}

describe("affiliate-disclaimer", () => {
  it("dag 14 met supplement-tip in body (tier 1 gate, lifestyle CTA) → /beste/ én disclaimer aanwezig", () => {
    // Tier 1 only: resolveNurtureCta geeft lifestyle CTA (geen /beste/ via CTA).
    // Maar domainSupplementTips rendert wel een /beste/magnesium-link in de body.
    // Na de fix wordt affiliateDisclaimer afgeleid uit inner.includes("/beste/").
    const data = buildDay14Data([1], 0);
    const { html } = renderNurtureDayInner(data, CTX);

    expect(html).toMatch(/\/beste\//);
    expect(html).toContain(DISCLAIMER_FRAGMENT);
  });

  it("dag 14 met supplement-CTA (tier 3 gate) → /beste/ én disclaimer aanwezig", () => {
    const data = buildDay14Data([1, 2, 3], 2);
    const { html } = renderNurtureDayInner(data, CTX);

    expect(html).toMatch(/\/beste\//);
    expect(html).toContain(DISCLAIMER_FRAGMENT);
  });

  for (const day of [0, 3, 7] as const) {
    it(`dag ${day} → geen /beste/-link en geen affiliate-disclaimer`, () => {
      const data: NurtureEmailData = {
        profileLabel: "Onrustige Slaper",
        primaryDomain: "sleep",
        domainScores: {
          sleep_score: 25,
          energy_score: 50,
          stress_score: 50,
          nutrition_score: 50,
          movement_score: 50,
          recovery_score: 50,
        },
        sequenceDay: day,
        urgencyLevel: "moderate",
        visibleTiers: [1, 2, 3],
        completedPlanPhases: 2,
      };
      const { html } = renderNurtureDayInner(data, CTX);

      expect(html).not.toMatch(/\/beste\//);
      expect(html).not.toContain(DISCLAIMER_FRAGMENT);
    });
  }
});
