import { describe, expect, it } from "vitest";
import {
  addAgendaMonths,
  formatAgendaDayNumber,
  getMonthEnd,
  getMonthGridDates,
  getMonthRange,
  getMonthStart,
  isSameAgendaMonth,
} from "@/lib/agenda-month";

describe("maandgrenzen", () => {
  it("bepaalt eerste en laatste dag van de maand", () => {
    expect(getMonthStart("2026-08-19")).toBe("2026-08-01");
    expect(getMonthEnd("2026-08-19")).toBe("2026-08-31");
    expect(getMonthEnd("2026-02-10")).toBe("2026-02-28");
    expect(getMonthEnd("2028-02-10")).toBe("2028-02-29");
  });

  it("levert een fetch-range van de eerste tot de laatste dag", () => {
    expect(getMonthRange("2026-08-19")).toEqual({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });
  });

  it("springt maanden vooruit en terug over jaargrenzen", () => {
    expect(addAgendaMonths("2026-08-19", 1)).toBe("2026-09-01");
    expect(addAgendaMonths("2026-01-15", -1)).toBe("2025-12-01");
    expect(addAgendaMonths("2026-12-05", 1)).toBe("2027-01-01");
  });
});

describe("getMonthGridDates", () => {
  it("vult volledige weken van maandag tot zondag", () => {
    const dates = getMonthGridDates("2026-08-19");
    expect(dates.length % 7).toBe(0);
    expect(dates[0]).toBe("2026-07-27");
    expect(dates[dates.length - 1]).toBe("2026-09-06");
    expect(dates).toContain("2026-08-01");
    expect(dates).toContain("2026-08-31");
  });

  it("markeert rand-dagen als andere maand", () => {
    expect(isSameAgendaMonth("2026-07-27", "2026-08-19")).toBe(false);
    expect(isSameAgendaMonth("2026-08-31", "2026-08-01")).toBe(true);
  });

  it("toont dagnummers zonder voorloopnul", () => {
    expect(formatAgendaDayNumber("2026-08-03")).toBe("3");
    expect(formatAgendaDayNumber("2026-08-31")).toBe("31");
  });
});
