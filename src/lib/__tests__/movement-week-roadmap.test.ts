import { describe, expect, it } from "vitest";
import { buildPlanIntakeContext } from "@/lib/lifestyle-plan-eval";
import {
  buildMovementSpoorDetail,
  buildMovementWeekRoadmap,
  buildNutrientBridgeIntro,
  getMicroRationale,
  parseSpoorFromUrl,
  spoorParamToWeekCategory,
  splitSpoorSteps,
  weekCategoryToSpoorParam,
} from "@/lib/movement-week-roadmap";
import type { DomainScores } from "@/lib/intake-engine";
import type { PlanStep } from "@/types/lifestyle-plan";

const BASE_SCORES: DomainScores = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 40,
  recovery_score: 35,
  connection_score: 60,
};

function ctxForAnswers(answers: Record<string, number>) {
  return buildPlanIntakeContext(BASE_SCORES, answers, "movement", null);
}

const weekSteps: PlanStep[] = [
  {
    id: "mov-kracht-1",
    title: "Plan één krachtsessie",
    tags: ["kracht"],
  },
  {
    id: "mov-rustdag-na-inspanning",
    title: "Plan rustdag",
    tags: ["herstel"],
  },
  {
    id: "mov-conditie-1",
    title: "Plan wandeling",
    tags: ["conditie"],
  },
];

describe("buildMovementWeekRoadmap", () => {
  it("builds compact hub copy", () => {
    const roadmap = buildMovementWeekRoadmap(
      ctxForAnswers({ MOV_STR: 1, MOV_CARD: 1 }),
      weekSteps,
      () => "todo",
      null,
    );

    expect(roadmap.trackLine).toContain("leefstijlcheck");
    expect(roadmap.progressLabel).toBe("0 van 2 sporen");
    expect(roadmap.spoorRows).toHaveLength(3);
  });

  it("includes today line from recovery hint", () => {
    const roadmap = buildMovementWeekRoadmap(
      ctxForAnswers({ MOV_STR: 1, MOV_CARD: 1 }),
      weekSteps,
      () => "todo",
      {
        level: "rest",
        headline: "Op basis van je check-in: vandaag liever rust",
        body: "Herstel is waar je sterker wordt.",
        source: "checkin",
        promoteRustdagStep: true,
        showMedicalNote: false,
        overrideToday: true,
        recommendRestChoice: true,
      },
    );

    expect(roadmap.todayLine).toContain("check-in");
  });
});

describe("buildMovementSpoorDetail", () => {
  it("splits primary and alternative steps for kracht recovery", () => {
    const detail = buildMovementSpoorDetail(
      ctxForAnswers({ MOV_STR: 1, MOV_CARD: 1 }),
      weekSteps,
      "kracht",
      {
        level: "rest",
        headline: "Rust",
        body: "Herstel",
        source: "checkin",
        promoteRustdagStep: true,
        showMedicalNote: false,
        overrideToday: true,
        recommendRestChoice: true,
      },
    );

    expect(detail.primarySteps.map((step) => step.id)).toEqual([
      "mov-rustdag-na-inspanning",
    ]);
    expect(detail.alternativeSteps.map((step) => step.id)).toEqual(["mov-kracht-1"]);
  });
});

describe("splitSpoorSteps", () => {
  it("keeps a single step primary", () => {
    const result = splitSpoorSteps(
      "conditie",
      [weekSteps[2]],
      null,
    );
    expect(result.primarySteps).toHaveLength(1);
    expect(result.alternativeSteps).toHaveLength(0);
  });
});

describe("spoor url helpers", () => {
  it("roundtrips category params", () => {
    expect(weekCategoryToSpoorParam("dagelijks_ritme")).toBe("dagelijks-ritme");
    expect(spoorParamToWeekCategory("dagelijks-ritme")).toBe("dagelijks_ritme");
    expect(parseSpoorFromUrl("http://localhost/intake/plan/movement?spoor=kracht")).toBe(
      "kracht",
    );
  });
});

describe("buildNutrientBridgeIntro", () => {
  it("returns focus-specific bridge copy", () => {
    expect(buildNutrientBridgeIntro("kracht")).toContain("Kracht");
    expect(buildNutrientBridgeIntro("conditie")).toContain("Conditie");
    expect(buildNutrientBridgeIntro("dagelijks_ritme")).toContain("dagelijks");
  });
});

describe("getMicroRationale", () => {
  it("returns first line truncated", () => {
    const body = `${"A".repeat(130)}\nSecond line`;
    expect(getMicroRationale(body)).toHaveLength(120);
    expect(getMicroRationale("Korte uitleg")).toBe("Korte uitleg");
  });
});
