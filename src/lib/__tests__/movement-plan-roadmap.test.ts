import { describe, expect, it } from "vitest";
import { movementPlanTemplate } from "@/data/lifestyle-plans/movement";
import { buildPlanIntakeContext, selectVisibleSteps } from "@/lib/lifestyle-plan-eval";
import { buildMovementPlanRoadmapView } from "@/lib/movement-plan-roadmap";
import { EMPTY_MOVEMENT_PLAN_PROFILE } from "@/lib/movement-plan-profile";
import type { MovementPlanProfile } from "@/lib/movement-plan-profile";
import type { DomainScores } from "@/lib/intake-engine";
import type { PlanIntakeContext, PlanStepState } from "@/types/lifestyle-plan";

const SCORES: DomainScores = {
  sleep_score: 60,
  energy_score: 60,
  stress_score: 60,
  nutrition_score: 60,
  movement_score: 60,
  recovery_score: 60,
  connection_score: 60,
};

const ANSWERS: Record<string, number> = { MOV_STR: 2, MOV_CARD: 4 };

const PHASE_IDS = movementPlanTemplate.phases.map((phase) => phase.id);

function ctxFor(answers: Record<string, number> = ANSWERS): PlanIntakeContext {
  return buildPlanIntakeContext(SCORES, answers, "movement");
}

function profile(patch: Partial<MovementPlanProfile> = {}): MovementPlanProfile {
  return { ...EMPTY_MOVEMENT_PLAN_PROFILE, ...patch };
}

function stateGetter(doneIds: readonly string[]): (id: string) => PlanStepState {
  const done = new Set(doneIds);
  return (id) => (done.has(id) ? "done" : "todo");
}

describe("buildMovementPlanRoadmapView — fase-as", () => {
  it("markeert fases als afgerond / actief / vooruit rond de actieve fase", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[1],
      profile: profile(),
      getStepState: stateGetter([]),
    });

    expect(view.phases.map((phase) => phase.state)).toEqual([
      "done",
      "active",
      "ahead",
    ]);
    expect(view.activePhaseId).toBe(PHASE_IDS[1]);
    expect(view.positionLabel).toBe("Fase 2 van 3");
    expect(view.headline).toBe(movementPlanTemplate.phases[1].title);
  });

  it("valt terug op de eerste fase als de fase-id onbekend is", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: "onbekend",
      profile: profile(),
      getStepState: stateGetter([]),
    });

    expect(view.activePhaseId).toBe(PHASE_IDS[0]);
    expect(view.positionLabel).toBe("Fase 1 van 3");
  });

  it("telt de gelogde stappen per fase uit de afgeleide staat (lock 5)", () => {
    const ctx = ctxFor();
    const visible = selectVisibleSteps(movementPlanTemplate.phases[0], ctx);
    expect(visible.length).toBeGreaterThan(1);

    const view = buildMovementPlanRoadmapView({
      ctx,
      currentPhaseId: PHASE_IDS[0],
      profile: profile(),
      getStepState: stateGetter([visible[0].id]),
    });

    expect(view.phases[0].stepCount).toBe(visible.length);
    expect(view.phases[0].loggedCount).toBe(1);
    expect(view.progressLine).toBe(
      `Afgelopen 7 dagen: 1 van ${visible.length} stappen gelogd`,
    );
  });

  it("meldt een lege log zonder oordeel", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[0],
      profile: profile(),
      getStepState: stateGetter([]),
    });

    expect(view.progressLine).toBe("Afgelopen 7 dagen: nog geen stap gelogd");
  });
});

describe("buildMovementPlanRoadmapView — personalisatie is copy", () => {
  it("bouwt de routeregel uit spoor, dosis en anker", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[0],
      profile: profile({
        startPattern: "kracht",
        weeklyFrequency: "2x",
        anchor: "kracht",
      }),
      getStepState: stateGetter([]),
    });

    expect(view.routeLine).toBe(
      "Jouw route: kracht, 2× per week. Want jij wilt je sterk en capabel blijven voelen.",
    );
  });

  it("belooft geen dosis bij het spoor dagelijks ritme", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[0],
      profile: profile({ startPattern: "dagelijks_ritme", weeklyFrequency: "3x" }),
      getStepState: stateGetter([]),
    });

    expect(view.routeLine).toBe("Jouw route: dagelijks ritme.");
    expect(view.phases[0].spoorNote).toContain("Dagelijks ritme");
  });

  it("laat de routeregel weg zonder gekozen spoor en anker", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[0],
      profile: profile(),
      getStepState: stateGetter([]),
    });

    expect(view.routeLine).toBeNull();
    expect(view.phases[0].spoorNote).toBeNull();
  });

  it("noemt per fase hoeveel stappen bij jouw spoor horen", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[0],
      profile: profile({ startPattern: "kracht" }),
      getStepState: stateGetter([]),
    });

    expect(view.phases[0].spoorNote).toMatch(
      /^Jouw spoor Kracht: \d+ van de \d+ stappen in deze fase\.$/,
    );
  });

  it("zegt eerlijk dat een fase geen eigen spoor-stap heeft", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor(),
      currentPhaseId: PHASE_IDS[0],
      profile: profile({ startPattern: "conditie" }),
      getStepState: stateGetter([]),
    });

    // Fase 3 (verankeren en meten) heeft geen conditie-getagde stap.
    expect(view.phases[2].spoorNote).toBe(
      "Jouw spoor Conditie: deze fase heeft geen eigen conditie-stap — wat hier staat geldt voor elk spoor.",
    );
  });

  it("leidt de focusregel uit de bestaande MOV_STR/MOV_CARD-band af", () => {
    const view = buildMovementPlanRoadmapView({
      ctx: ctxFor({ MOV_STR: 2, MOV_CARD: 4 }),
      currentPhaseId: PHASE_IDS[0],
      profile: profile(),
      getStepState: stateGetter([]),
    });

    expect(view.focusLine).toContain("Uit je beweegcheck — Kracht opbouwen.");

    const strong = buildMovementPlanRoadmapView({
      ctx: ctxFor({ MOV_STR: 4, MOV_CARD: 2 }),
      currentPhaseId: PHASE_IDS[0],
      profile: profile(),
      getStepState: stateGetter([]),
    });

    expect(strong.focusLine).toContain("Uit je beweegcheck — Conditie opbouwen.");
  });
});
