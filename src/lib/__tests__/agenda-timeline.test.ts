import { describe, expect, it } from "vitest";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  ANALYSIS_BLOCK_DURATION_MINUTES,
  buildDayTimeline,
  buildPlanStepBlock,
  buildWeekColumnBlocks,
  DEFAULT_BLOCK_DURATION_MINUTES,
  getBlockRoleLabel,
  getBlockTimelineHeightPx,
  getBlockTimelineSpanPx,
  getBlockTimelineStyle,
  getBlockTimelineTopPx,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineHalfHourMarks,
  getTimelineTrackHeightPx,
  isCompactTimelineBlock,
  minutesToTime,
  positionToTimelineTime,
  positionToWeekGridTime,
  resolveBlockRole,
  resolvePlanStepPlacement,
  snapTimelineMinutes,
  TIMELINE_COMPACT_BLOCK_HEIGHT_PX,
  TIMELINE_END_MINUTES,
  TIMELINE_MIN_BLOCK_HEIGHT_PX,
  TIMELINE_START_MINUTES,
  TIMELINE_TOTAL_MINUTES,
  timeToMinutes,
  WEEK_GRID_SNAP_MINUTES,
  WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX,
} from "@/lib/agenda-timeline";
import { buildModel } from "@/lib/dashboard-model";
import type { AgendaBlockRecord, TimelineBlock } from "@/types/agenda";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

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

describe("buildDayTimeline", () => {
  it("returns only routine blocks sorted by time", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const routineBlocks: AgendaBlockRecord[] = [
      {
        id: "block-1",
        date: todaySlot.date,
        categoryId: "water",
        title: "Water drinken",
        startTime: "08:00",
        endTime: "08:15",
        source: "routine",
        status: "open",
        externalProvider: null,
        externalRef: null,
      },
    ];

    const timeline = buildDayTimeline(model, todaySlot, routineBlocks);
    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.id).toBe("block-1");
    expect(timeline.some((block) => block.kind === "analysis")).toBe(false);
  });
});

describe("buildPlanStepBlock", () => {
  it("builds an analysis block for the selected day", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const planStep = buildPlanStepBlock(model, todaySlot);
    expect(planStep).toBeDefined();
    expect(planStep?.kind).toBe("analysis");
    expect(planStep?.source).toBe("analysis");
    expect(planStep?.id).toBe(`analysis:${todaySlot.date}`);
  });

  it("derives end time from start plus default duration", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const planStep = buildPlanStepBlock(model, todaySlot);
    expect(planStep).toBeDefined();
    if (!planStep) {
      return;
    }

    const expectedEnd = minutesToTime(
      timeToMinutes(planStep.startTime) + ANALYSIS_BLOCK_DURATION_MINUTES,
    );
    expect(planStep.endTime).toBe(expectedEnd);
    expect(planStep.durationLabel).toBe("45 min");
  });

  it("derives end time from beweging tier upper bound", () => {
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
      evidenceHref: "/onderbouwing",
      planLink: null,
    };

    const planStep = buildPlanStepBlock(model, slot);
    expect(planStep).not.toBeNull();
    if (!planStep) {
      return;
    }

    expect(planStep.durationLabel).toBe("10–20 min");
    expect(planStep.endTime).toBe(
      minutesToTime(timeToMinutes(planStep.startTime) + 20),
    );
  });

  it("returns null when plan step is dismissed for today", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const dismissedModel = {
      ...model,
      planStepDismissedDate: todaySlot.date,
    };
    expect(buildPlanStepBlock(dismissedModel, todaySlot)).toBeNull();
  });

  it("returns null when plan step is dismissed for a non-today slot", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const previewSlot = slots.find((slot) => !slot.isToday);
    expect(previewSlot).toBeDefined();
    if (!previewSlot) {
      return;
    }

    const dismissedModel = {
      ...model,
      planStepDismissedDate: previewSlot.date,
    };
    expect(buildPlanStepBlock(dismissedModel, previewSlot)).toBeNull();
  });

  it("returns null when all plan steps are hidden", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const hiddenModel = {
      ...model,
      planStepsHidden: true,
    };
    expect(buildPlanStepBlock(hiddenModel, todaySlot)).toBeNull();
  });
});

describe("resolvePlanStepPlacement", () => {
  it("houdt de stap in de tray zonder expliciet gezette tijd", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    expect(resolvePlanStepPlacement({ ...model, scheduledTime: null }, todaySlot)).toBe(
      "tray",
    );
  });

  it("zet de stap in het raster zodra de gebruiker een tijd koos", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    expect(resolvePlanStepPlacement({ ...model, scheduledTime: "18:00" }, todaySlot)).toBe(
      "grid",
    );
  });

  it("houdt voorbeelddagen in de tray, ook met een gezette tijd", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const previewSlot = slots.find((slot) => !slot.isToday);
    expect(previewSlot).toBeDefined();
    if (!previewSlot) {
      return;
    }

    expect(resolvePlanStepPlacement({ ...model, scheduledTime: "18:00" }, previewSlot)).toBe(
      "tray",
    );
  });

  it("verbergt de stap als hij is weggeklikt", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    expect(
      resolvePlanStepPlacement(
        { ...model, scheduledTime: "18:00", planStepsHidden: true },
        todaySlot,
      ),
    ).toBe("hidden");
  });
});

describe("basis versus aanvulling", () => {
  const routineBlock: TimelineBlock = {
    id: "block-1",
    kind: "routine",
    categoryId: "water",
    title: "Water drinken",
    startTime: "08:00",
    endTime: "08:15",
    done: false,
    source: "routine",
    isEditable: true,
  };

  it("labelt de plan-stap als basis met zijn domeinnaam", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const planStep = buildPlanStepBlock(model, todaySlot);
    expect(planStep).not.toBeNull();
    if (!planStep) {
      return;
    }

    expect(resolveBlockRole(planStep)).toBe("basis");
    expect(getBlockRoleLabel(planStep).endsWith(" · basis")).toBe(true);
  });

  it("labelt een eigen moment als aanvulling met zijn categorienaam", () => {
    expect(resolveBlockRole(routineBlock)).toBe("aanvulling");
    expect(getBlockRoleLabel(routineBlock)).toBe("Water drinken · aanvulling");
  });

  it("geeft een geïmporteerde afspraak geen rol-achtervoegsel", () => {
    const externalBlock: TimelineBlock = {
      ...routineBlock,
      id: "external:2026-08-02:1",
      kind: "external",
      categoryId: "werk",
      title: "Overleg",
      source: "external:google_calendar",
      isEditable: false,
    };

    expect(resolveBlockRole(externalBlock)).toBeNull();
    expect(getBlockRoleLabel(externalBlock)).toBe("Werk");
  });
});

describe("leesbare chip-hoogte", () => {
  const HOUR_HEIGHT_PX = 58;

  it("tilt een kwartierblok naar de leesbare bodem", () => {
    const height = getBlockTimelineHeightPx("09:00", "09:15", HOUR_HEIGHT_PX);
    expect(height).toBe(TIMELINE_MIN_BLOCK_HEIGHT_PX);
  });

  it("laat de tijdregel weg zolang eyebrow en titel de ruimte nodig hebben", () => {
    expect(isCompactTimelineBlock("09:00", "09:15", HOUR_HEIGHT_PX)).toBe(true);
    expect(isCompactTimelineBlock("09:00", "09:45", HOUR_HEIGHT_PX)).toBe(true);
  });

  it("toont de tijdregel weer zodra het blok een uur beslaat", () => {
    const height = getBlockTimelineHeightPx("09:00", "10:00", HOUR_HEIGHT_PX);
    expect(height).toBeGreaterThanOrEqual(TIMELINE_COMPACT_BLOCK_HEIGHT_PX);
    expect(isCompactTimelineBlock("09:00", "10:00", HOUR_HEIGHT_PX)).toBe(false);
  });

  it("laat een lang blok zijn eigen hoogte houden", () => {
    const height = getBlockTimelineHeightPx("09:00", "11:00", HOUR_HEIGHT_PX);
    expect(height).toBeCloseTo(2 * HOUR_HEIGHT_PX, 5);
  });
});

describe("pixel-positionering op raster", () => {
  const WEEK_HOUR_HEIGHT_PX = 44;

  it("plaatst blok-top op dezelfde px als het halfuurraster", () => {
    for (const time of ["09:30", "14:30", "17:00"]) {
      const topPx = getBlockTimelineTopPx(time, WEEK_HOUR_HEIGHT_PX);
      const hour = timeToMinutes(time) / 60;
      expect(topPx).toBe(getHourMarkerTopPx(hour, WEEK_HOUR_HEIGHT_PX));
    }
  });

  it("geeft week-blokspan minimaal WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX", () => {
    const rawSpan =
      getHourMarkerTopPx(10, WEEK_HOUR_HEIGHT_PX) -
      getHourMarkerTopPx(9.5, WEEK_HOUR_HEIGHT_PX);
    const span = getBlockTimelineSpanPx(
      "09:30",
      "10:00",
      WEEK_HOUR_HEIGHT_PX,
      WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX,
    );
    expect(rawSpan).toBeLessThan(WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX);
    expect(span).toBe(WEEK_TIMELINE_MIN_BLOCK_HEIGHT_PX);
  });
});

describe("halfuurraster", () => {
  it("levert een halfuurlijn per uursegment, zonder het eindpunt", () => {
    const marks = getTimelineHalfHourMarks();
    expect(marks[0]).toBe(6.5);
    expect(marks[marks.length - 1]).toBe(23.5);
    expect(marks).toHaveLength(18);
  });

  it("plaatst de halfuurlijn precies tussen twee uurlijnen", () => {
    const hourHeight = 58;
    const nine = getHourMarkerTopPx(9, hourHeight);
    const halfPastNine = getHourMarkerTopPx(9.5, hourHeight);
    const ten = getHourMarkerTopPx(10, hourHeight);
    expect(halfPastNine - nine).toBeCloseTo(hourHeight / 2, 5);
    expect(ten - halfPastNine).toBeCloseTo(hourHeight / 2, 5);
  });
});

describe("timeline layout helpers", () => {
  it("returns block style within day bounds", () => {
    const style = getBlockTimelineStyle("09:00", "10:00");
    expect(style.topPercent).toBeGreaterThan(0);
    expect(style.heightPercent).toBeGreaterThan(0);
  });

  it("returns null now line outside visible hours", () => {
    const beforeTimeline = new Date("2026-07-18T02:00:00.000Z");
    expect(getNowLinePercent(beforeTimeline)).toBeNull();
  });
});

describe("tap-to-create helpers", () => {
  const HOUR_HEIGHT_PX = 52;
  const TRACK_HEIGHT_PX = getTimelineTrackHeightPx(HOUR_HEIGHT_PX);

  it("snaps minutes to the nearest 15-minute step", () => {
    expect(snapTimelineMinutes(timeToMinutes("14:07"))).toBe(timeToMinutes("14:00"));
    expect(snapTimelineMinutes(timeToMinutes("14:08"))).toBe(timeToMinutes("14:15"));
  });

  it("maps top of track to 06:00", () => {
    const result = positionToTimelineTime(0, TRACK_HEIGHT_PX);
    expect(result.startTime).toBe("06:00");
    expect(result.endTime).toBe(
      minutesToTime(timeToMinutes("06:00") + DEFAULT_BLOCK_DURATION_MINUTES),
    );
  });

  it("maps 11:00 grid line to 11:00 start time", () => {
    const offsetY = getHourMarkerTopPx(11, HOUR_HEIGHT_PX);
    const result = positionToTimelineTime(offsetY, TRACK_HEIGHT_PX);
    expect(result.startTime).toBe("11:00");
    expect(result.endTime).toBe("11:30");
  });

  it("maps middle of track to roughly mid-day", () => {
    const result = positionToTimelineTime(TRACK_HEIGHT_PX / 2, TRACK_HEIGHT_PX);
    const startMinutes = timeToMinutes(result.startTime);
    const midMinutes = TIMELINE_START_MINUTES + TIMELINE_TOTAL_MINUTES / 2;
    expect(Math.abs(startMinutes - snapTimelineMinutes(midMinutes))).toBeLessThanOrEqual(15);
  });

  it("clamps bottom of track within 24:00", () => {
    const result = positionToTimelineTime(TRACK_HEIGHT_PX, TRACK_HEIGHT_PX);
    expect(timeToMinutes(result.endTime)).toBeLessThanOrEqual(TIMELINE_END_MINUTES);
  });
});

describe("positionToWeekGridTime", () => {
  const HOUR_HEIGHT_PX = 44;
  const TRACK_HEIGHT_PX = getTimelineTrackHeightPx(HOUR_HEIGHT_PX);

  it("snaps to 15-minute steps (same as day timeline)", () => {
    const nearQuarter = positionToWeekGridTime(
      getHourMarkerTopPx(9.25, HOUR_HEIGHT_PX),
      TRACK_HEIGHT_PX,
    );
    expect(nearQuarter.startTime).toBe("09:15");
    expect(WEEK_GRID_SNAP_MINUTES).toBe(15);
  });

  it("maps 14:00 grid line to 14:00 start time", () => {
    const offsetY = getHourMarkerTopPx(14, HOUR_HEIGHT_PX);
    const result = positionToWeekGridTime(offsetY, TRACK_HEIGHT_PX);
    expect(result.startTime).toBe("14:00");
    expect(result.endTime).toBe("14:30");
  });
});

describe("buildWeekColumnBlocks", () => {
  it("includes plan step on grid when scheduled for today", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const modelWithTime = {
      ...model,
      scheduledTime: "10:00",
    };
    const blocks = buildWeekColumnBlocks(modelWithTime, todaySlot.date, todaySlot, []);
    expect(blocks.some((block) => block.kind === "analysis")).toBe(true);
  });

  it("returns only routine blocks when no plan slot", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const routineBlocks: AgendaBlockRecord[] = [
      {
        id: "block-week",
        date: "2026-07-15",
        categoryId: "water",
        title: "Water",
        startTime: "08:00",
        endTime: "08:30",
        source: "routine",
        status: "open",
        externalProvider: null,
        externalRef: null,
      },
    ];
    const blocks = buildWeekColumnBlocks(model, "2026-07-15", null, routineBlocks);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.kind).toBe("routine");
  });

  it("draagt de gedaan-staat van de dagstap door naar het weekblok", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const modelWithTime = { ...model, scheduledTime: "10:00" };
    const blocks = buildWeekColumnBlocks(
      modelWithTime,
      todaySlot.date,
      todaySlot,
      [],
      true,
    );
    const planStep = blocks.find((block) => block.kind === "analysis");
    expect(planStep?.done).toBe(true);
  });
});

describe("gedaan-staat van de plan-stap", () => {
  it("is standaard niet gedaan", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    expect(buildPlanStepBlock(model, todaySlot)?.done).toBe(false);
  });

  it("neemt de doorgegeven gedaan-staat over", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    expect(buildPlanStepBlock(model, todaySlot, true)?.done).toBe(true);
  });

  it("laat de tray/raster-regel ongemoeid: gedaan verandert de plaatsing niet", () => {
    const model = buildFixtureModel(FIXTURE_SCORES);
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const withoutTime = { ...model, scheduledTime: null };
    expect(resolvePlanStepPlacement(withoutTime, todaySlot)).toBe("tray");
    expect(buildWeekColumnBlocks(withoutTime, todaySlot.date, todaySlot, [], true)).toEqual(
      [],
    );
  });
});
