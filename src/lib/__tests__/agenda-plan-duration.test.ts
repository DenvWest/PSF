import { describe, expect, it } from "vitest";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  DEFAULT_PLAN_STEP_DURATION_LABEL,
  DEFAULT_PLAN_STEP_DURATION_MINUTES,
  parseDurationUpperMinutes,
  resolvePlanStepDuration,
} from "@/lib/agenda-plan-duration";
import { buildModel } from "@/lib/dashboard-model";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

function buildFixtureModel(
  scores: CheckScores,
  movementDayChoice: "herstel" | "matig" | "trainen" | null = null,
) {
  const trend: CheckTrend = Object.fromEntries(
    Object.keys(scores).map((key) => [key, [scores[key as keyof CheckScores]]]),
  ) as CheckTrend;

  return buildModel(
    { scores, vitality: 52, date: "10 jul 2026", trend },
    null,
    [],
    false,
    { MOV_CARD: 1, SLP_ONSET: 2 },
    null,
    null,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { startPattern: null, anchor: null },
    null,
    movementDayChoice,
  );
}

const FIXTURE_SCORES: CheckScores = {
  slaap: 44,
  energie: 57,
  stress: 50,
  voeding: 52,
  beweging: 73,
  herstel: 54,
  verbinding: 66,
};

describe("parseDurationUpperMinutes", () => {
  it("pakt de bovengrens uit een bereik", () => {
    expect(parseDurationUpperMinutes("10–20 min")).toBe(20);
    expect(parseDurationUpperMinutes("20–45 min")).toBe(45);
    expect(parseDurationUpperMinutes("30–45 min")).toBe(45);
  });

  it("accepteert een enkel getal", () => {
    expect(parseDurationUpperMinutes("45 min")).toBe(45);
  });

  it("valt terug op de default bij onleesbare input", () => {
    expect(parseDurationUpperMinutes("onbekend")).toBe(DEFAULT_PLAN_STEP_DURATION_MINUTES);
  });
});

describe("resolvePlanStepDuration", () => {
  it("geeft 45 min voor niet-beweging", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const duration = resolvePlanStepDuration(model, todaySlot);
    expect(duration.durationMinutes).toBe(45);
    expect(duration.durationLabel).toBe(DEFAULT_PLAN_STEP_DURATION_LABEL);
  });

  it("volgt movementDayChoice voor beweging vandaag", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      activeHabit: null,
      movementPrefs: { startPattern: null, anchor: null },
      movementDayChoice: "herstel" as const,
    };
    const slot = {
      date: "2026-08-01",
      dayLabel: "Vandaag",
      isToday: true,
      dayOffset: 0,
      domain: "beweging" as const,
      stepId: "mov-kracht-onderhoud-week",
      title: "Rustdag of lichte wandeling",
      detail: null,
      rationale: null,
      evidenceHref: "/test",
      planLink: null,
    };

    const duration = resolvePlanStepDuration(model, slot);
    expect(duration.durationLabel).toBe("10–20 min");
    expect(duration.durationMinutes).toBe(20);
  });

  it("inferCompletedChoice wint boven matig-fallback", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      activeHabit: null,
      movementPrefs: { startPattern: null, anchor: null },
      movementDayChoice: null,
    };
    const slot = {
      date: "2026-08-01",
      dayLabel: "Vandaag",
      isToday: true,
      dayOffset: 0,
      domain: "beweging" as const,
      stepId: "mov-kracht-onderhoud-week",
      title: "Kracht onderhoud",
      detail: null,
      rationale: null,
      evidenceHref: "/test",
      planLink: null,
    };

    const duration = resolvePlanStepDuration(model, slot, [REST_DAY_STEP_ID]);
    expect(duration.durationLabel).toBe("10–20 min");
    expect(duration.durationMinutes).toBe(20);
  });

  it("valt terug op matig tier zonder keuze of log", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      activeHabit: null,
      movementPrefs: { startPattern: null, anchor: null },
      movementDayChoice: null,
    };
    const slot = {
      date: "2026-08-01",
      dayLabel: "Vandaag",
      isToday: true,
      dayOffset: 0,
      domain: "beweging" as const,
      stepId: "mov-kracht-onderhoud-week",
      title: "Kracht onderhoud",
      detail: null,
      rationale: null,
      evidenceHref: "/test",
      planLink: null,
    };

    const duration = resolvePlanStepDuration(model, slot, []);
    expect(duration.durationLabel).toBe("20–45 min");
    expect(duration.durationMinutes).toBe(45);
  });
});
