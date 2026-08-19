import { describe, expect, it } from "vitest";
import { selectChangedVerdicts } from "@/lib/supplement-verdict-store";
import type { IngredientClaimKey } from "@/data/approved-claims";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import type {
  StoredSupplementVerdict,
  SupplementVerdict,
  VerdictEvidence,
} from "@/types/verdict";

const SCORES = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 60,
  recovery_score: 60,
  connection_score: 60,
};

// selectChangedVerdicts kijkt niet naar de onderbouwing; één geldig
// snapshot volstaat voor alle fixtures.
const input = buildRecommendationInput({ scores: SCORES });
const EVIDENCE: VerdictEvidence = {
  scores: input.scores,
  signals: input.signals,
  profileLabel: input.profileLabel.name,
  triggeredBy: [],
  nutritionLogCompleted: true,
};

function stored(
  overrides: Partial<StoredSupplementVerdict> & { ingredientKey: string },
): StoredSupplementVerdict {
  return {
    id: `id-${overrides.ingredientKey}`,
    verdict: "niet_nodig",
    reasonKey: "no_trigger_matched",
    rulesVersion: "1.6.0",
    nextReviewAt: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    supersededAt: null,
    basedOn: null,
    ...overrides,
  };
}

function derived(
  overrides: Partial<SupplementVerdict> & { ingredientKey: IngredientClaimKey },
): SupplementVerdict {
  return {
    verdict: "niet_nodig",
    reasonKey: "no_trigger_matched",
    rulesVersion: "1.6.0",
    comparisonPath: null,
    nextReviewInDays: null,
    evidence: EVIDENCE,
    ...overrides,
  };
}

describe("selectChangedVerdicts", () => {
  it("levert niets op als elk oordeel gelijk is — de render hoeft dan niet te schrijven", () => {
    const previous = [stored({ ingredientKey: "magnesium" }), stored({ ingredientKey: "zink" })];
    const next = [derived({ ingredientKey: "magnesium" }), derived({ ingredientKey: "zink" })];

    expect(selectChangedVerdicts(previous, next)).toEqual([]);
  });

  it("ziet een omslag in verdict", () => {
    const previous = [stored({ ingredientKey: "magnesium" })];
    const next = [derived({ ingredientKey: "magnesium", verdict: "kopen" })];

    expect(selectChangedVerdicts(previous, next).map((v) => v.ingredientKey)).toEqual([
      "magnesium",
    ]);
  });

  it("ziet een gewijzigde reden bij hetzelfde verdict", () => {
    const previous = [stored({ ingredientKey: "magnesium" })];
    const next = [derived({ ingredientKey: "magnesium", reasonKey: "claim_on_hold" })];

    expect(selectChangedVerdicts(previous, next)).toHaveLength(1);
  });

  it("ziet een nieuwe regelversie", () => {
    const previous = [stored({ ingredientKey: "magnesium" })];
    const next = [derived({ ingredientKey: "magnesium", rulesVersion: "1.7.0" })];

    expect(selectChangedVerdicts(previous, next)).toHaveLength(1);
  });

  it("ziet een ingrediënt dat er nog niet was", () => {
    const next = [derived({ ingredientKey: "creatine" })];

    expect(selectChangedVerdicts([], next).map((v) => v.ingredientKey)).toEqual(["creatine"]);
  });
});
