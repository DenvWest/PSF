import { describe, expect, it } from "vitest";
import { approvedClaims } from "@/data/approved-claims";
import { SUPPLEMENT_CATALOG } from "@/data/supplement-catalog";
import { type DomainScores } from "@/lib/intake-engine";
import { MEASURED_DOMAIN_TO_PILLAR } from "@/lib/measured-pillar-map";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { buildRevealModel } from "@/lib/reveal-model";
import { isZichtbaarDomein } from "@/lib/zichtbare-domeinen";

const BASELINE = 70;

function makeScores(overrides: Partial<DomainScores>): DomainScores {
  return {
    sleep_score: BASELINE,
    energy_score: BASELINE,
    stress_score: BASELINE,
    nutrition_score: BASELINE,
    movement_score: BASELINE,
    recovery_score: BASELINE,
    connection_score: BASELINE,
    ...overrides,
  };
}

const LADDER_SCORE_VECTORS: Array<{ name: string; scores: DomainScores }> = [
  { name: "slaap-zwakst", scores: makeScores({ sleep_score: 25 }) },
  { name: "stress-zwakst", scores: makeScores({ stress_score: 25 }) },
  { name: "voeding-zwakst", scores: makeScores({ nutrition_score: 25 }) },
  { name: "beweging-zwakst", scores: makeScores({ movement_score: 25 }) },
  {
    name: "alles-gelijk",
    scores: makeScores({}),
  },
];

describe("gate-symmetrie (compliance-canary)", () => {
  it("catalog comparisonPath implies approved claim status", () => {
    for (const entry of SUPPLEMENT_CATALOG) {
      if (entry.comparisonPath !== null) {
        expect(approvedClaims[entry.claimKey].status).toBe("approved");
      }
    }
  });
});

describe("ladder-eenheid (reveal-kop ≡ priority)", () => {
  /**
   * De kop op REVEAL en de prioriteit eronder moeten hetzelfde domein noemen.
   *
   * Voor een zichtbaar domein is dat het gemeten thema zelf. Valt de meting op
   * een verborgen domein (stress, verbinding), dan wijst de kop naar het
   * laagst scorende zichtbare domein — anders stuurt hij naar een scherm dat
   * niet bestaat. Zie `resolvePrimaryPillar` in `reveal-model.ts`.
   */
  it.each(LADDER_SCORE_VECTORS)(
    "priority.id matches primary theme for $name",
    ({ scores }) => {
      const model = buildRevealModel(scores, {});
      const theme = getPrimaryTheme(scores, {});
      const gemeten = MEASURED_DOMAIN_TO_PILLAR[theme];

      if (isZichtbaarDomein(gemeten)) {
        expect(model.priority.id).toBe(gemeten);
      } else {
        expect(model.priority.id).toBe(model.ladder[0]?.id);
      }

      // Wat in beide gevallen moet gelden: de kop wijst nooit naar een domein
      // dat uit de interface is.
      expect(isZichtbaarDomein(model.priority.id)).toBe(true);
    },
  );
});
