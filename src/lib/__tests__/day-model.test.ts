import { describe, expect, it } from "vitest";
import { PILLARS } from "@/data/dashboard";
import { isAgendaCategoryId } from "@/data/agenda/categories";
import {
  deriveDefaultTimeBucket,
  deriveTimeBucketFromLocalTime,
} from "@/lib/account-priority-pref";
import { buildPlanStepBlock } from "@/lib/agenda-timeline";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import {
  buildDaySlot,
  isPlanStepHidden,
  isTodayActionDone,
  resolveActionKey,
  resolveEffectiveActionKey,
  resolveScheduledTime,
} from "@/lib/day-model";
import { REST_DAY_STEP_ID } from "@/lib/movement-recovery-hint";
import { resolveMovementTodayChoiceOptions } from "@/lib/movement-today-choices";
import { buildModel } from "@/lib/dashboard-model";
import type { CheckScores, CheckTrend, PillarId } from "@/types/dashboard";

function buildFixtureModel(scores: CheckScores) {
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

function slotForDomain(domain: PillarId): WeekDaySlot {
  return {
    date: "2026-07-15",
    dayLabel: "Wo",
    isToday: false,
    dayOffset: 0,
    domain,
    stepId: "step-x",
    title: "Test",
    detail: null,
    rationale: null,
    evidenceHref: "/onderbouwing",
    planLink: null,
  };
}

function getTodaySlot(model: ReturnType<typeof buildFixtureModel>): WeekDaySlot {
  const todaySlot = buildWeekSchedulePreview(model).find((slot) => slot.isToday);
  expect(todaySlot).toBeDefined();
  return todaySlot as WeekDaySlot;
}

describe("day-model pariteit: content", () => {
  it("timeline-block draagt dezelfde titel als het week-slot", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(model);

    const block = buildPlanStepBlock(model, todaySlot);
    expect(block).not.toBeNull();
    expect(block?.title).toBe(todaySlot.title);
    expect(block?.domain).toBe(todaySlot.domain);
  });
});

describe("day-model pariteit: actionKey", () => {
  it("resolveActionKey is gelijk aan slot.stepId voor vandaag met activeHabit", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(model);

    expect(model.activeHabit).not.toBeNull();
    expect(resolveActionKey(model, todaySlot)).toBe(todaySlot.stepId);
  });

  it("resolveActionKey volgt letterlijk de habit-eerst-fallback", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(model);

    expect(resolveActionKey(model, todaySlot)).toBe(
      model.activeHabit?.stepId ?? todaySlot.stepId,
    );

    const withoutHabit = { ...model, activeHabit: null };
    expect(resolveActionKey(withoutHabit, todaySlot)).toBe(todaySlot.stepId);
  });

  it("buildDaySlot verrijkt het slot met scheduledTime en actionKey", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(model);

    const daySlot = buildDaySlot(model, todaySlot);
    expect(daySlot.stepId).toBe(todaySlot.stepId);
    expect(daySlot.actionKey).toBe(resolveActionKey(model, todaySlot));
    expect(daySlot.scheduledTime).toBe(resolveScheduledTime(model, todaySlot));
  });
});

describe("day-model pariteit: tijd-fallback", () => {
  it("timeline-fallback en hero-activeBucket leiden hetzelfde dagdeel af", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(model);
    expect(model.scheduledTime).toBeNull();

    const heroBucket = model.timeBucket ?? deriveDefaultTimeBucket();
    const timelineTime = resolveScheduledTime(model, todaySlot);
    expect(deriveTimeBucketFromLocalTime(timelineTime)).toBe(heroBucket);
  });

  it("expliciete timeBucket wint van de default in beide afleidingen", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      timeBucket: "avond" as const,
    };
    const todaySlot = getTodaySlot(model);

    const heroBucket = model.timeBucket ?? deriveDefaultTimeBucket();
    expect(heroBucket).toBe("avond");
    expect(deriveTimeBucketFromLocalTime(resolveScheduledTime(model, todaySlot))).toBe(
      "avond",
    );
  });

  it("expliciete scheduledTime wint van elke bucket voor vandaag", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      scheduledTime: "07:30",
    };
    const todaySlot = getTodaySlot(model);
    expect(resolveScheduledTime(model, todaySlot)).toBe("07:30");
  });
});

describe("day-model pariteit: zichtbaarheid", () => {
  it("isPlanStepHidden en buildPlanStepBlock zijn equivalent voor alle vier combinaties", () => {
    const base = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(base);

    const combos = [
      { planStepsHidden: false, planStepDismissedDate: null },
      { planStepsHidden: false, planStepDismissedDate: todaySlot.date },
      { planStepsHidden: true, planStepDismissedDate: null },
      { planStepsHidden: true, planStepDismissedDate: todaySlot.date },
    ];

    for (const combo of combos) {
      const model = { ...base, ...combo };
      const hidden = isPlanStepHidden(model, todaySlot);
      expect(buildPlanStepBlock(model, todaySlot) === null).toBe(hidden);
    }
  });

  it("dismissed op een andere dag verbergt het slot niet", () => {
    const base = buildFixtureModel(FIXTURE_SCORES);
    const todaySlot = getTodaySlot(base);

    const model = { ...base, planStepDismissedDate: "1999-01-01" };
    expect(isPlanStepHidden(model, todaySlot)).toBe(false);
    expect(buildPlanStepBlock(model, todaySlot)).not.toBeNull();
  });
});

describe("day-model pariteit: categorie-mapping", () => {
  it("elk domein levert een geldige agenda-categorie op", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);

    for (const pillar of PILLARS) {
      const block = buildPlanStepBlock(model, slotForDomain(pillar.id));
      expect(block).not.toBeNull();
      expect(isAgendaCategoryId(block?.categoryId ?? "")).toBe(true);
    }
  });

  it("interventie-domeinen behouden hun eigen categorie, readouts vallen terug", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);

    expect(buildPlanStepBlock(model, slotForDomain("slaap"))?.categoryId).toBe(
      "slaap",
    );
    expect(buildPlanStepBlock(model, slotForDomain("energie"))?.categoryId).toBe(
      "persoonlijke_routine",
    );
    expect(buildPlanStepBlock(model, slotForDomain("herstel"))?.categoryId).toBe(
      "persoonlijke_routine",
    );
  });
});

describe("isTodayActionDone", () => {
  function movementTodaySlot(overrides: Partial<WeekDaySlot> = {}): WeekDaySlot {
    return {
      date: "2026-08-01",
      dayLabel: "Vandaag",
      isToday: true,
      dayOffset: 0,
      domain: "beweging",
      stepId: "mov-kracht-onderhoud-week",
      title: "Kracht onderhoud",
      detail: null,
      rationale: null,
      evidenceHref: "/onderbouwing",
      planLink: null,
      ...overrides,
    };
  }

  it("volgt daily_action_log voor een niet-beweging slot", () => {
    const model = { ...buildFixtureModel(FIXTURE_SCORES), activeHabit: null };
    const slot: WeekDaySlot = {
      ...slotForDomain("slaap"),
      isToday: true,
      stepId: "slp-step",
    };

    expect(isTodayActionDone(model, slot, [])).toBe(false);
    expect(isTodayActionDone(model, slot, ["slp-step"])).toBe(true);
    expect(isTodayActionDone(model, slot, ["other-step"])).toBe(false);
  });

  it("herkent beweging-tier via inferCompletedChoice wanneer geen movementDayChoice", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      activeHabit: null,
      movementPrefs: { startPattern: null, anchor: null },
      movementDayChoice: null,
    };
    const slot = movementTodaySlot();
    const options = resolveMovementTodayChoiceOptions(model, slot);

    expect(options.length).toBeGreaterThan(0);
    expect(isTodayActionDone(model, slot, [REST_DAY_STEP_ID])).toBe(true);
    expect(isTodayActionDone(model, slot, ["mov-trap-of-wandeling"])).toBe(true);
    expect(isTodayActionDone(model, slot, [slot.stepId])).toBe(true);
  });

  it("volgt movementDayChoice boven inferCompletedChoice", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      activeHabit: null,
      movementPrefs: { startPattern: null, anchor: null },
      movementDayChoice: "matig" as const,
    };
    const slot = movementTodaySlot();

    expect(
      isTodayActionDone(model, slot, ["mov-trap-of-wandeling"]),
    ).toBe(true);
    expect(isTodayActionDone(model, slot, [REST_DAY_STEP_ID])).toBe(false);
  });

  it("is false voor verborgen planstappen en ontbrekend slot", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slot = movementTodaySlot();
    const hiddenModel = { ...model, planStepsHidden: true };

    expect(isTodayActionDone(hiddenModel, slot, [slot.stepId])).toBe(false);
    expect(isTodayActionDone(model, null, [slot.stepId])).toBe(false);
  });

  it("resolveEffectiveActionKey matcht AgendaTodayHero-tierlogica", () => {
    const model = {
      ...buildFixtureModel(FIXTURE_SCORES),
      activeHabit: null,
      movementPrefs: { startPattern: null, anchor: null },
      movementDayChoice: null,
    };
    const slot = movementTodaySlot();
    const keys = [REST_DAY_STEP_ID];

    expect(resolveEffectiveActionKey(model, slot, keys)).toBe(REST_DAY_STEP_ID);
    expect(resolveEffectiveActionKey(model, slot, [])).toBe(
      resolveActionKey(model, slot),
    );
  });
});
