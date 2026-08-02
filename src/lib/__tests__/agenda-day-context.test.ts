import { describe, expect, it } from "vitest";
import {
  findEngineSlot,
  isAgendaEngineDate,
  resolveAgendaDayContext,
} from "@/lib/agenda-day-context";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

function slot(date: string): WeekDaySlot {
  return {
    date,
    dayLabel: "Ma",
    isToday: date === "2026-08-03",
    dayOffset: 0,
    domain: "beweging",
    stepId: "step-1",
    title: "Kracht thuis",
    detail: null,
    rationale: null,
    evidenceHref: "/inzichten",
    planLink: null,
  };
}

const SLOTS = [
  slot("2026-08-03"),
  slot("2026-08-04"),
  slot("2026-08-05"),
  slot("2026-08-06"),
  slot("2026-08-07"),
  slot("2026-08-08"),
  slot("2026-08-09"),
];

const MODEL = {} as DashboardModel;

describe("resolveAgendaDayContext", () => {
  it("geeft de engine-slot terug binnen de adviesweek", () => {
    const context = resolveAgendaDayContext(MODEL, "2026-08-06", SLOTS);
    expect(context.kind).toBe("engine");
    expect(context.date).toBe("2026-08-06");
    if (context.kind === "engine") {
      expect(context.slot.date).toBe("2026-08-06");
    }
  });

  it("geeft orphan terug buiten de adviesweek — geen verzonnen dagstap", () => {
    const context = resolveAgendaDayContext(MODEL, "2026-08-19", SLOTS);
    expect(context.kind).toBe("orphan");
    expect(context.date).toBe("2026-08-19");
    expect("slot" in context).toBe(false);
  });

  it("herkent engine-dagen los van de context", () => {
    expect(isAgendaEngineDate(SLOTS, "2026-08-03")).toBe(true);
    expect(isAgendaEngineDate(SLOTS, "2026-07-31")).toBe(false);
    expect(findEngineSlot(SLOTS, "2026-08-09")?.date).toBe("2026-08-09");
    expect(findEngineSlot(SLOTS, "2026-08-10")).toBeNull();
  });
});
