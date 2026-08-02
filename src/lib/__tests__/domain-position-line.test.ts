import { describe, expect, it } from "vitest";
import { buildDomainPositionLine } from "@/lib/domain-position-line";

const NOW = new Date("2026-07-30T12:00:00.000Z");

describe("buildDomainPositionLine", () => {
  it("vertaalt elke bouwfase naar zijn Nederlandse label", () => {
    const labels = (["building_base", "progressing", "maintaining", "returning"] as const).map(
      (phase) =>
        buildDomainPositionLine({ phase, startedAt: "2026-07-30T12:00:00.000Z", now: NOW })
          .phaseLabel,
    );
    expect(labels).toEqual(["basis leggen", "opbouwen", "onderhouden", "terugkomen"]);
  });

  it("telt weken vanaf startedAt en nooit lager dan 1", () => {
    const week1 = buildDomainPositionLine({
      phase: "building_base",
      startedAt: "2026-07-30T12:00:00.000Z",
      now: NOW,
    });
    expect(week1.weekNumber).toBe(1);

    const week3 = buildDomainPositionLine({
      phase: "progressing",
      startedAt: "2026-07-16T12:00:00.000Z",
      now: NOW,
    });
    expect(week3.weekNumber).toBe(3);

    const future = buildDomainPositionLine({
      phase: "building_base",
      startedAt: "2026-08-30T12:00:00.000Z",
      now: NOW,
    });
    expect(future.weekNumber).toBe(1);
  });

  it("zet de startdatum in nl-NL-formaat in de regel", () => {
    const line = buildDomainPositionLine({
      phase: "building_base",
      startedAt: "2026-07-14T09:00:00.000Z",
      now: NOW,
    });
    expect(line.sinceLabel).toBe("14 juli");
    expect(line.text).toBe("Je bouwt basis leggen · week 3 · sinds 14 juli");
  });

  it("laat 'sinds ...' weg bij een onbruikbare startedAt", () => {
    const line = buildDomainPositionLine({
      phase: "maintaining",
      startedAt: "niet-een-datum",
      now: NOW,
    });
    expect(line.sinceLabel).toBeNull();
    expect(line.text).toBe("Je bouwt onderhouden · week 1");
  });

  it("noemt nooit een rangnummer — geen 'fase N van M' in de regel", () => {
    const line = buildDomainPositionLine({
      phase: "progressing",
      startedAt: "2026-07-16T12:00:00.000Z",
      now: NOW,
    });
    expect(line.text).not.toMatch(/fase\s*\d+\s*van\s*\d+/i);
  });
});
