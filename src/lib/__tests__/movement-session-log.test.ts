import { describe, expect, it } from "vitest";
import {
  bandMinutes,
  getMovementWeekSummary,
  parseMovementSessionInput,
} from "@/lib/movement-session-log";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";

describe("parseMovementSessionInput", () => {
  it("accepts a valid session and trims/caps the note", () => {
    const parsed = parseMovementSessionInput({
      modalityId: "wandelen",
      minutes: 42,
      note: "  frisse wandeling  ",
    });
    expect(parsed).toEqual({ modalityId: "wandelen", minutes: 42, note: "frisse wandeling" });
  });

  it("rounds fractional minutes", () => {
    expect(parseMovementSessionInput({ modalityId: "zone2", minutes: 30.6 })?.minutes).toBe(31);
  });

  it("rejects unknown modality", () => {
    expect(parseMovementSessionInput({ modalityId: "yoga", minutes: 20 })).toBeNull();
  });

  it("rejects non-positive or over-cap minutes", () => {
    expect(parseMovementSessionInput({ modalityId: "wandelen", minutes: 0 })).toBeNull();
    expect(parseMovementSessionInput({ modalityId: "wandelen", minutes: 601 })).toBeNull();
  });

  it("rejects malformed bodies", () => {
    expect(parseMovementSessionInput(null)).toBeNull();
    expect(parseMovementSessionInput([])).toBeNull();
    expect(parseMovementSessionInput({ minutes: 20 })).toBeNull();
  });

  it("drops an empty note to null", () => {
    expect(parseMovementSessionInput({ modalityId: "krachttraining", minutes: 20, note: "   " })?.note).toBeNull();
  });
});

describe("bandMinutes", () => {
  it("buckets minutes into privacy-safe bands", () => {
    expect(bandMinutes(10)).toBe("1-15");
    expect(bandMinutes(15)).toBe("1-15");
    expect(bandMinutes(16)).toBe("16-30");
    expect(bandMinutes(45)).toBe("31-60");
    expect(bandMinutes(120)).toBe("60+");
  });
});

type StubRow = { log_date: string; modality_id: string; minutes: number };

function stubAdmin(rows: StubRow[]) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    gte: () => builder,
    lte: () => Promise.resolve({ data: rows }),
  };
  return { from: () => builder } as never;
}

describe("getMovementWeekSummary", () => {
  it("aggregates minutes per day, total, count and modality-mix", async () => {
    const today = todayInAgendaTimezone();
    const rows: StubRow[] = [
      { log_date: today, modality_id: "wandelen", minutes: 30 },
      { log_date: today, modality_id: "krachttraining", minutes: 20 },
      { log_date: today, modality_id: "wandelen", minutes: 15 },
    ];
    const summary = await getMovementWeekSummary(stubAdmin(rows), "acc-1");

    expect(summary.totalMinutes).toBe(65);
    expect(summary.sessionCount).toBe(3);
    expect(summary.minutesByDate[today]).toBe(65);
    expect(summary.modalityMix.wandelen).toBe(45);
    expect(summary.modalityMix.krachttraining).toBe(20);
    expect(summary.dates).toContain(today);
  });

  it("returns an empty summary when there are no rows", async () => {
    const summary = await getMovementWeekSummary(stubAdmin([]), "acc-1");
    expect(summary.totalMinutes).toBe(0);
    expect(summary.sessionCount).toBe(0);
    expect(Object.keys(summary.minutesByDate)).toHaveLength(0);
  });

  it("skips rows with an unknown modality in the mix but still counts minutes", async () => {
    const today = todayInAgendaTimezone();
    const rows: StubRow[] = [
      { log_date: today, modality_id: "semi-legit", minutes: 10 },
      { log_date: today, modality_id: "zone2", minutes: 25 },
    ];
    const summary = await getMovementWeekSummary(stubAdmin(rows), "acc-1");
    expect(summary.totalMinutes).toBe(35);
    expect(summary.modalityMix.zone2).toBe(25);
    expect("semi-legit" in summary.modalityMix).toBe(false);
  });
});
