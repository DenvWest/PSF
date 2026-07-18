import { describe, expect, it } from "vitest";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  ANALYSIS_BLOCK_DURATION_MINUTES,
  buildDayTimeline,
  buildPlanStepBlock,
  DEFAULT_BLOCK_DURATION_MINUTES,
  getBlockTimelineStyle,
  getHourMarkerTopPx,
  getNowLinePercent,
  getTimelineTrackHeightPx,
  minutesToTime,
  positionToTimelineTime,
  snapTimelineMinutes,
  TIMELINE_END_MINUTES,
  TIMELINE_START_MINUTES,
  TIMELINE_TOTAL_MINUTES,
  timeToMinutes,
} from "@/lib/agenda-timeline";
import { buildModel } from "@/lib/dashboard-model";
import type { AgendaBlockRecord } from "@/types/agenda";
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

describe("timeline layout helpers", () => {
  it("returns block style within day bounds", () => {
    const style = getBlockTimelineStyle("09:00", "10:00");
    expect(style.topPercent).toBeGreaterThan(0);
    expect(style.heightPercent).toBeGreaterThan(0);
  });

  it("returns null now line outside visible hours", () => {
    const beforeTimeline = new Date("2026-07-18T04:00:00.000Z");
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

  it("maps top of track to 07:00", () => {
    const result = positionToTimelineTime(0, TRACK_HEIGHT_PX);
    expect(result.startTime).toBe("07:00");
    expect(result.endTime).toBe(
      minutesToTime(timeToMinutes("07:00") + DEFAULT_BLOCK_DURATION_MINUTES),
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

  it("clamps bottom of track within 22:00", () => {
    const result = positionToTimelineTime(TRACK_HEIGHT_PX, TRACK_HEIGHT_PX);
    expect(timeToMinutes(result.endTime)).toBeLessThanOrEqual(TIMELINE_END_MINUTES);
  });
});
