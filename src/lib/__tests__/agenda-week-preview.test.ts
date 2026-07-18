import { describe, expect, it } from "vitest";
import { PILLAR } from "@/data/dashboard";
import {
  addAgendaDays,
  buildWeekSchedulePreview,
  getCalendarWeekDates,
  isWeekSlotCompleted,
  todayInAgendaTimezone,
} from "@/lib/agenda-week-preview";
import { buildModel } from "@/lib/dashboard-model";
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

describe("buildWeekSchedulePreview", () => {
  it("returns seven calendar days with today marked", () => {
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
    expect(slots).toHaveLength(7);
    expect(slots.some((slot) => slot.isToday)).toBe(true);
    expect(slots.map((slot) => slot.dayLabel)).toEqual([
      "Ma",
      "Di",
      "Wo",
      "Do",
      "Vr",
      "Za",
      "Zo",
    ]);
  });

  it("uses active habit for today slot", () => {
    const model = buildFixtureModel({
      slaap: 44,
      energie: 57,
      stress: 50,
      voeding: 52,
      beweging: 73,
      herstel: 54,
      verbinding: 66,
    });

    const todaySlot = buildWeekSchedulePreview(model).find((slot) => slot.isToday);
    expect(todaySlot?.stepId).toBe(model.activeHabit?.stepId);
    expect(todaySlot?.title).toBe(model.activeHabit?.title);
  });

  it("falls back to quickWin for domains without a plan template", () => {
    const model = buildFixtureModel({
      slaap: 60,
      energie: 70,
      stress: 70,
      voeding: 70,
      beweging: 70,
      herstel: 20,
      verbinding: 30,
    });

    const verbindingSlot = buildWeekSchedulePreview(model).find(
      (slot) => slot.domain === "verbinding" && !slot.isToday,
    );
    expect(verbindingSlot?.title).toBe(PILLAR.verbinding.quickWin.title);
    expect(verbindingSlot?.evidenceHref).toContain("/onderbouwing");
  });

  it("does not expose score values in slot payload", () => {
    const model = buildFixtureModel({
      slaap: 44,
      energie: 57,
      stress: 50,
      voeding: 52,
      beweging: 73,
      herstel: 54,
      verbinding: 66,
    });

    for (const slot of buildWeekSchedulePreview(model)) {
      expect(JSON.stringify(slot)).not.toMatch(/"score"|Lage Batterij/i);
    }
  });
});

describe("agenda date helpers", () => {
  it("adds days in ISO format", () => {
    expect(addAgendaDays("2026-07-10", 1)).toBe("2026-07-11");
    expect(addAgendaDays("2026-07-10", -1)).toBe("2026-07-09");
  });

  it("formats today in app timezone", () => {
    expect(todayInAgendaTimezone()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("builds Monday through Sunday for a given anchor date", () => {
    expect(getCalendarWeekDates("2026-07-18")).toEqual([
      "2026-07-13",
      "2026-07-14",
      "2026-07-15",
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
    ]);
  });
});

describe("isWeekSlotCompleted", () => {
  it("matches date and domain keys", () => {
    const slot = {
      date: "2026-07-10",
      domain: "beweging" as const,
    };
    const completed = new Set(["2026-07-10:beweging"]);
    expect(
      isWeekSlotCompleted(
        {
          ...slot,
          dayLabel: "Do",
          isToday: false,
          dayOffset: 0,
          stepId: "x",
          title: "t",
          detail: null,
          rationale: null,
          evidenceHref: "/onderbouwing",
          planLink: null,
        },
        completed,
      ),
    ).toBe(true);
  });
});
