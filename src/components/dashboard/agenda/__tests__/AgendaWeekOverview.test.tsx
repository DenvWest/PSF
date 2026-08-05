// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import AgendaWeekOverview from "@/components/dashboard/agenda/AgendaWeekOverview";
import type { AgendaWeekDayEntry } from "@/components/dashboard/agenda/AgendaWeekOverview";

afterEach(() => {
  cleanup();
});

function buildDay(date: string, overrides: Partial<AgendaWeekDayEntry> = {}): AgendaWeekDayEntry {
  return {
    date,
    dayLabel: "Ma",
    dayNumber: "3",
    isToday: false,
    domain: null,
    planStepTitle: null,
    planStepDurationLabel: null,
    planStepScheduledTime: null,
    blocks: [],
    ...overrides,
  };
}

describe("AgendaWeekOverview", () => {
  it("blijft altijd 1 kolom — regressie bug: md:grid-cols-7 was onleesbaar krap op iPad (768-1023px)", () => {
    const days = Array.from({ length: 7 }, (_, index) => buildDay(`2026-08-0${index + 3}`));
    const { container } = render(
      <AgendaWeekOverview days={days} selectedDate={days[0].date} onSelectDate={vi.fn()} />,
    );

    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    expect(list?.className).toContain("grid-cols-1");
    expect(list?.className).not.toContain("md:grid-cols-7");
  });
});
