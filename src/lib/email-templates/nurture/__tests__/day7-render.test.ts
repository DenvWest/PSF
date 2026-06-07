import { describe, it, expect } from "vitest";
import { renderNurtureDayInner } from "@/lib/email-templates/nurture/prepare-nurture-mail";
import type { NurtureProfileKey } from "@/data/nurture-content";
import type {
  NurtureEmailData,
  NurtureEmailDispatchContext,
} from "@/lib/email-templates/nurture/types";

const SUPPLEMENT_NAME_PATTERN = /Magnesium|Omega-3|omega-3|EPA|DHA/i;
const BESTE_LINK_PATTERN = /\/beste\//;

const BASE_SCORES: Record<string, number> = {
  sleep_score: 50,
  energy_score: 50,
  stress_score: 50,
  nutrition_score: 50,
  movement_score: 50,
  recovery_score: 50,
};

const PROFILE_FIXTURES: Record<
  NurtureProfileKey,
  { profileLabel: string; domainScores: Record<string, number> }
> = {
  "Onrustige Slaper": {
    profileLabel: "Onrustige Slaper",
    domainScores: { ...BASE_SCORES, sleep_score: 25 },
  },
  Stressdrager: {
    profileLabel: "Stressdrager",
    domainScores: { ...BASE_SCORES, stress_score: 25 },
  },
  "Lage Batterij": {
    profileLabel: "Lage Batterij",
    domainScores: { ...BASE_SCORES, energy_score: 25 },
  },
  "In Balans": {
    profileLabel: "In Balans",
    domainScores: {
      sleep_score: 70,
      energy_score: 65,
      stress_score: 68,
      nutrition_score: 72,
      movement_score: 66,
      recovery_score: 69,
    },
  },
  Overtrainer: {
    profileLabel: "Overtrainer",
    domainScores: {
      ...BASE_SCORES,
      movement_score: 50,
      recovery_score: 25,
    },
  },
};

const CTX: NurtureEmailDispatchContext = {
  recipientEmail: "test@example.com",
  recoveryUrl: "https://www.perfectsupplement.nl/intake?token=test",
};

function buildEmailData(
  profile: NurtureProfileKey,
  sequenceDay: number,
): NurtureEmailData {
  const fixture = PROFILE_FIXTURES[profile];
  return {
    profileLabel: fixture.profileLabel,
    primaryDomain: "sleep",
    domainScores: fixture.domainScores,
    sequenceDay,
    urgencyLevel: "moderate",
    visibleTiers: [1, 2, 3],
    completedPlanPhases: 2,
  };
}

describe("day7-render", () => {
  for (const profile of Object.keys(PROFILE_FIXTURES) as NurtureProfileKey[]) {
    it(`dag 7 ${profile} — gerenderde HTML bevat geen supplement-namen`, () => {
      const { html } = renderNurtureDayInner(buildEmailData(profile, 7), CTX);
      expect(html).not.toMatch(SUPPLEMENT_NAME_PATTERN);
    });
  }

  for (const day of [0, 3, 7] as const) {
    for (const profile of Object.keys(PROFILE_FIXTURES) as NurtureProfileKey[]) {
      it(`dag ${day} ${profile} — gerenderde HTML bevat geen /beste/-link`, () => {
        const { html } = renderNurtureDayInner(
          buildEmailData(profile, day),
          CTX,
        );
        expect(html).not.toMatch(BESTE_LINK_PATTERN);
      });
    }
  }
});
