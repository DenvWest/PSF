import { describe, expect, it } from "vitest";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import {
  ANALYSIS_BLOCK_DURATION_MINUTES,
  buildDayTimeline,
  getBlockTimelineStyle,
  getNowLinePercent,
  minutesToTime,
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

describe("buildDayTimeline", () => {
  it("merges analysis block with routine blocks sorted by time", () => {
    const model = buildFixtureModel({
      slaap: 44,
      energie: 57,
      stress: 50,
      voeding: 52,
      beweging: 73,
      herstel: 54,
      verbinding: 66,
    });
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
    expect(timeline).toHaveLength(2);
    expect(timeline[0]?.id).toBe("block-1");
    expect(timeline[1]?.kind).toBe("analysis");
    expect(timeline[1]?.source).toBe("analysis");
  });

  it("derives analysis end time from start plus default duration", () => {
    const model = buildFixtureModel({
      slaap: 44,
      energie: 57,
      stress: 50,
      voeding: 52,
      beweging: 73,
      herstel: 54,
      verbinding: 66,
    });
    const slots = buildWeekSchedulePreview(model);
    const todaySlot = slots.find((slot) => slot.isToday);
    expect(todaySlot).toBeDefined();
    if (!todaySlot) {
      return;
    }

    const timeline = buildDayTimeline(model, todaySlot, []);
    const analysis = timeline.find((block) => block.kind === "analysis");
    expect(analysis).toBeDefined();
    if (!analysis) {
      return;
    }

    const expectedEnd = minutesToTime(
      timeToMinutes(analysis.startTime) + ANALYSIS_BLOCK_DURATION_MINUTES,
    );
    expect(analysis.endTime).toBe(expectedEnd);
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
