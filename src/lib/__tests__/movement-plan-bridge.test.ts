import { describe, expect, it } from "vitest";
import {
  buildPlanIntakeContext,
  evaluatePlanCondition,
} from "@/lib/lifestyle-plan-eval";
import { buildMovementNutrientBridge } from "@/lib/movement-nutrient-bridge";
import { getMovementTrack } from "@/lib/movement-plan-track";
import { getPlanCrossDomainChips } from "@/lib/plan-cross-domain-chips";
import type { DomainScores } from "@/lib/intake-engine";

const BASE_SCORES: DomainScores = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 40,
  recovery_score: 60,
  connection_score: 60,
};

function ctxForAnswers(answers: Record<string, number>) {
  return buildPlanIntakeContext(BASE_SCORES, answers, "movement", null);
}

describe("getMovementTrack", () => {
  it("labels starter when both MOV dimensions are low", () => {
    const track = getMovementTrack(ctxForAnswers({ MOV_STR: 1, MOV_CARD: 1 }));
    expect(track.label).toContain("Starter");
  });

  it("labels onderhoud when both MOV dimensions are strong", () => {
    const track = getMovementTrack(ctxForAnswers({ MOV_STR: 4, MOV_CARD: 4 }));
    expect(track.label).toContain("Onderhoud");
  });

  it("labels kracht opbouwen when only strength is low", () => {
    const track = getMovementTrack(ctxForAnswers({ MOV_STR: 2, MOV_CARD: 4 }));
    expect(track.label).toBe("Kracht opbouwen");
  });
});

describe("buildMovementNutrientBridge", () => {
  it("always includes protein CTA", () => {
    const items = buildMovementNutrientBridge(
      ctxForAnswers({ MOV_STR: 4, MOV_CARD: 4, NUT_PROT: 4 }),
    );
    expect(items.some((item) => item.id === "bridge-protein")).toBe(true);
  });

  it("includes creatine for starter strength band", () => {
    const items = buildMovementNutrientBridge(
      ctxForAnswers({ MOV_STR: 2, MOV_CARD: 2 }),
    );
    expect(items.some((item) => item.id === "bridge-creatine")).toBe(true);
  });

  it("omits creatine for trained strength band", () => {
    const items = buildMovementNutrientBridge(
      ctxForAnswers({ MOV_STR: 4, MOV_CARD: 4 }),
    );
    expect(items.some((item) => item.id === "bridge-creatine")).toBe(false);
  });

  it("emphasizes protein label when protein_gap_signal is true", () => {
    const ctx = ctxForAnswers({ MOV_STR: 3, MOV_CARD: 3, NUT_PROT: 1 });
    expect(ctx.signals.protein_gap_signal).toBe(true);
    const protein = buildMovementNutrientBridge(ctx).find(
      (item) => item.id === "bridge-protein",
    );
    expect(protein?.label).toContain("Eiwittekort");
    expect(protein?.emphasis).toBe(true);
  });
});

describe("getPlanCrossDomainChips", () => {
  it("returns herstel and energie for movement domain", () => {
    const chips = getPlanCrossDomainChips("movement");
    expect(chips.map((chip) => chip.pillarId)).toEqual(["herstel", "energie"]);
  });
});

describe("movement plan creatine showWhen", () => {
  it("matches bridge creatine gate for MOV_STR at most 2", () => {
    const low = evaluatePlanCondition(
      { type: "answerAtMost", question: "MOV_STR", value: 2 },
      ctxForAnswers({ MOV_STR: 2 }),
    );
    const high = evaluatePlanCondition(
      { type: "answerAtMost", question: "MOV_STR", value: 2 },
      ctxForAnswers({ MOV_STR: 3 }),
    );
    expect(low).toBe(true);
    expect(high).toBe(false);
  });
});
