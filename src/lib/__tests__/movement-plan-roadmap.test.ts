import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildMovementPositionLine } from "@/lib/movement-plan-roadmap";

describe("buildMovementPositionLine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("vertaalt de eerste fase naar 'basis leggen'", () => {
    const line = buildMovementPositionLine({
      currentPhaseId: "mov-phase-deze-week",
      startedAt: "2026-07-30T12:00:00.000Z",
    });
    expect(line).toBe("Je bouwt basis leggen · week 1 · sinds 30 juli");
  });

  it("vertaalt de tweede fase naar 'opbouwen'", () => {
    const line = buildMovementPositionLine({
      currentPhaseId: "mov-phase-week-2-4",
      startedAt: "2026-07-30T12:00:00.000Z",
    });
    expect(line).toContain("Je bouwt opbouwen");
  });

  it("vertaalt de derde fase naar 'onderhouden'", () => {
    const line = buildMovementPositionLine({
      currentPhaseId: "mov-phase-week-4-12",
      startedAt: "2026-07-30T12:00:00.000Z",
    });
    expect(line).toContain("Je bouwt onderhouden");
  });

  it("valt terug op 'basis leggen' voor een onbekende fase-id", () => {
    const line = buildMovementPositionLine({
      currentPhaseId: "onbekend",
      startedAt: "2026-07-30T12:00:00.000Z",
    });
    expect(line).toContain("Je bouwt basis leggen");
  });

  it("telt weeknummers op vanaf startedAt, nooit lager dan 1", () => {
    const week1 = buildMovementPositionLine({
      currentPhaseId: "mov-phase-deze-week",
      startedAt: "2026-07-30T12:00:00.000Z",
    });
    expect(week1).toContain("week 1");

    const week3 = buildMovementPositionLine({
      currentPhaseId: "mov-phase-week-2-4",
      startedAt: "2026-07-16T12:00:00.000Z",
    });
    expect(week3).toContain("week 3");
  });

  it("noemt de startdatum in nl-NL-formaat", () => {
    const line = buildMovementPositionLine({
      currentPhaseId: "mov-phase-deze-week",
      startedAt: "2026-07-14T09:00:00.000Z",
    });
    expect(line).toContain("sinds 14 juli");
  });

  it("laat 'sinds ...' weg bij een onbruikbare startedAt", () => {
    const line = buildMovementPositionLine({
      currentPhaseId: "mov-phase-deze-week",
      startedAt: "niet-een-datum",
    });
    expect(line).toBe("Je bouwt basis leggen · week 1");
  });
});
