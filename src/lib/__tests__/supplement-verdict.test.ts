import { describe, it, expect } from "vitest";
import { approvedClaims, type IngredientClaimKey } from "@/data/approved-claims";
import { RULES_VERSION } from "@/lib/intake-engine";
import {
  deriveSupplementVerdict,
  deriveSupplementVerdicts,
  resolveNextReviewDate,
  VERDICT_REVIEW_DAYS,
} from "@/lib/supplement-verdict";
import type { RecommendationInput } from "@/types/recommendation";

/**
 * Basislijn zonder enig behoefte-signaal: alle domeinen ruim boven de drempels,
 * verbinding als laagste domein (zodat de zink/creatine-matchers niet op
 * "herstel is je zwakste domein" aanslaan) en NUT_O3 > 1 zodat de omega-3
 * hubregel niet vuurt.
 */
function baselineInput(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    scores: {
      sleep_score: 80,
      energy_score: 78,
      stress_score: 76,
      nutrition_score: 74,
      movement_score: 72,
      recovery_score: 70,
      connection_score: 60,
    },
    signals: {
      omega3_deficiency: false,
      magnesium_signal: false,
      cortisol_risk: false,
      creatine_signal: false,
      melatonine_signal: false,
      protein_gap_signal: false,
      low_recovery_no_load: false,
      sleep_issue_no_stress: false,
      energy_dip_unexplained: false,
    },
    profileLabel: { name: "In Balans", domain: "nutrition", score: 74 },
    answers: { NUT_O3: 3, MOV_CARD: 1, MOV_STR: 1, RCV_PHYS: 3 },
    rulesVersion: RULES_VERSION,
    ...overrides,
  };
}

const COMPLETED = { nutritionLogCompleted: true };

describe("deriveSupplementVerdict — precedentie", () => {
  it("melatonine is verboden en wint van elk signaal", () => {
    const verdict = deriveSupplementVerdict("melatonine", baselineInput(), COMPLETED);
    expect(verdict.verdict).toBe("nooit");
    expect(verdict.reasonKey).toBe("claim_forbidden");
    expect(verdict.comparisonPath).toBeNull();
  });

  it("ashwagandha staat on-hold → geen koopoordeel", () => {
    const verdict = deriveSupplementVerdict("ashwagandha", baselineInput(), COMPLETED);
    expect(verdict.verdict).toBe("eerst_leefstijl");
    expect(verdict.reasonKey).toBe("claim_on_hold");
  });

  it("zonder voedingslog mag 'niet nodig' niet gezegd worden", () => {
    const verdict = deriveSupplementVerdict("magnesium", baselineInput());
    expect(verdict.verdict).toBe("eerst_leefstijl");
    expect(verdict.reasonKey).toBe("nutrition_log_incomplete");
  });

  it("verboden claim blijft 'nooit', ook zonder voedingslog", () => {
    expect(deriveSupplementVerdict("melatonine", baselineInput()).verdict).toBe("nooit");
  });
});

describe("deriveSupplementVerdict — het 'nee'", () => {
  it.each<IngredientClaimKey>(["magnesium", "omega3", "zink", "creatine", "eiwitpoeder"])(
    "%s zonder trigger → niet_nodig",
    (ingredientKey) => {
      const verdict = deriveSupplementVerdict(ingredientKey, baselineInput(), COMPLETED);
      expect(verdict.verdict).toBe("niet_nodig");
      expect(verdict.reasonKey).toBe("no_trigger_matched");
      expect(verdict.evidence.triggeredBy).toEqual([]);
    },
  );
});

describe("deriveSupplementVerdict — het 'ja'", () => {
  it("omega-3 tekortsignaal → kopen, met vergelijkingspad", () => {
    const input = baselineInput({
      signals: { ...baselineInput().signals, omega3_deficiency: true },
    });
    const verdict = deriveSupplementVerdict("omega3", input, COMPLETED);

    expect(verdict.verdict).toBe("kopen");
    expect(verdict.reasonKey).toBe("trigger_matched");
    expect(verdict.comparisonPath).toBe("/beste/omega-3-supplement");
    expect(verdict.evidence.triggeredBy).toContainEqual({
      type: "signal",
      signal: "omega3_deficiency",
    });
  });

  it("lage slaapscore → magnesium kopen", () => {
    const base = baselineInput();
    const input = baselineInput({ scores: { ...base.scores, sleep_score: 30 } });

    expect(deriveSupplementVerdict("magnesium", input, COMPLETED).verdict).toBe("kopen");
  });

  it("eiwitgat is een hubregel maar telt wel mee als behoefte", () => {
    const base = baselineInput();
    const input = baselineInput({
      signals: { ...base.signals, protein_gap_signal: true },
    });

    expect(deriveSupplementVerdict("eiwitpoeder", input, COMPLETED).verdict).toBe("kopen");
  });
});

describe("deriveSupplementVerdicts", () => {
  it("oordeelt over elk ingrediënt, niet alleen over de aanraders", () => {
    const verdicts = deriveSupplementVerdicts(baselineInput(), COMPLETED);
    const keys = verdicts.map((verdict) => verdict.ingredientKey).sort();

    expect(keys).toEqual((Object.keys(approvedClaims) as IngredientClaimKey[]).sort());
  });

  it("legt de onderbouwing vast zodat het oordeel reproduceerbaar is", () => {
    const input = baselineInput();
    const [first] = deriveSupplementVerdicts(input, COMPLETED);

    expect(first.evidence.scores).toEqual(input.scores);
    expect(first.evidence.profileLabel).toBe("In Balans");
    expect(first.evidence.nutritionLogCompleted).toBe(true);
    expect(first.rulesVersion).toBe(RULES_VERSION);
  });
});

describe("resolveNextReviewDate", () => {
  it("kopen wordt na 90 dagen hertoetst", () => {
    const input = baselineInput({
      signals: { ...baselineInput().signals, omega3_deficiency: true },
    });
    const verdict = deriveSupplementVerdict("omega3", input, COMPLETED);

    expect(verdict.nextReviewInDays).toBe(VERDICT_REVIEW_DAYS.kopen);
    expect(resolveNextReviewDate(verdict, new Date("2026-01-01T00:00:00.000Z"))).toBe(
      "2026-04-01",
    );
  });

  it("een verboden ingrediënt vervalt niet op gebruikersdata", () => {
    const verdict = deriveSupplementVerdict("melatonine", baselineInput(), COMPLETED);

    expect(verdict.nextReviewInDays).toBeNull();
    expect(resolveNextReviewDate(verdict)).toBeNull();
  });
});
