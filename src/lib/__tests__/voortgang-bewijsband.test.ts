import { describe, expect, it } from "vitest";
import {
  buildBandCaption,
  buildWachtendCaption,
  CYCLE_LENGTH,
  dayToDate,
  formatShortDate,
  measurementsOf,
  scrubZone,
} from "@/lib/voortgang-bewijsband";

const CYCLE_START = "2026-07-16";
const REMEASURE_DUE = "2026-08-14";

describe("dayToDate / formatShortDate", () => {
  it("day 1 equals cycle start date", () => {
    expect(formatShortDate(dayToDate(CYCLE_START, 1))).toBe("16 jul");
  });

  it("day 12 is eleven days after start", () => {
    expect(formatShortDate(dayToDate(CYCLE_START, 12))).toBe("27 jul");
  });
});

describe("measurementsOf", () => {
  it("always starts with leefstijlcheck on day 1", () => {
    const result = measurementsOf({ cycleDay: 12, domainCheckDaysAgo: {} });
    expect(result).toEqual([
      { day: 1, pillarId: null, label: "Je leefstijlcheck" },
    ]);
  });

  it("adds one domain check within cycle", () => {
    const result = measurementsOf({
      cycleDay: 12,
      domainCheckDaysAgo: { slaap: 4 },
    });
    expect(result).toEqual([
      { day: 1, pillarId: null, label: "Je leefstijlcheck" },
      { day: 8, pillarId: "slaap", label: "Slaap" },
    ]);
  });

  it("adds multiple domain checks sorted by day", () => {
    const result = measurementsOf({
      cycleDay: 12,
      domainCheckDaysAgo: { slaap: 4, voeding: 9 },
    });
    expect(result).toEqual([
      { day: 1, pillarId: null, label: "Je leefstijlcheck" },
      { day: 3, pillarId: "voeding", label: "Voeding" },
      { day: 8, pillarId: "slaap", label: "Slaap" },
    ]);
  });

  it("drops domain checks outside [1, 30]", () => {
    const result = measurementsOf({
      cycleDay: 12,
      domainCheckDaysAgo: { slaap: 20 },
    });
    expect(result).toEqual([
      { day: 1, pillarId: null, label: "Je leefstijlcheck" },
    ]);
  });
});

describe("buildBandCaption", () => {
  const baseMeasurements = measurementsOf({
    cycleDay: 12,
    domainCheckDaysAgo: { slaap: 4, voeding: 9 },
  });

  it("verleden with measurement", () => {
    const caption = buildBandCaption({
      cycleStartDate: CYCLE_START,
      cycleDay: 12,
      remeasureDueDate: REMEASURE_DUE,
      measurements: baseMeasurements,
      headDay: 8,
      activeDays: 8,
      priorityLabel: "Slaap",
    });
    expect(caption).toEqual({
      title: "Dag 8 · 23 jul",
      body: "Je mat je slaap.",
    });
  });

  it("verleden without measurement", () => {
    const caption = buildBandCaption({
      cycleStartDate: CYCLE_START,
      cycleDay: 12,
      remeasureDueDate: REMEASURE_DUE,
      measurements: baseMeasurements,
      headDay: 9,
      activeDays: 8,
      priorityLabel: "Slaap",
    });
    expect(caption).toEqual({
      title: "Dag 9 · 24 jul",
      body: "Nog geen bijzonderheid gelogd op deze dag.",
    });
  });

  it("vandaag", () => {
    const caption = buildBandCaption({
      cycleStartDate: CYCLE_START,
      cycleDay: 12,
      remeasureDueDate: REMEASURE_DUE,
      measurements: baseMeasurements,
      headDay: 12,
      activeDays: 8,
      priorityLabel: "Slaap",
    });
    expect(caption).toEqual({
      title: "Dag 12 · vandaag",
      body: "8 dagen waarop je iets pakte deze cyclus.",
    });
  });

  it("dag 30 / hermeting", () => {
    const caption = buildBandCaption({
      cycleStartDate: CYCLE_START,
      cycleDay: 12,
      remeasureDueDate: REMEASURE_DUE,
      measurements: baseMeasurements,
      headDay: CYCLE_LENGTH,
      activeDays: 8,
      priorityLabel: "Slaap",
    });
    expect(caption).toEqual({
      title: "Dag 30 · 14 aug",
      body: "Je hermeting.",
      future: "Hier lees je terug of er beweging in je slaap zit.",
    });
  });

  it("toekomst", () => {
    const caption = buildBandCaption({
      cycleStartDate: CYCLE_START,
      cycleDay: 12,
      remeasureDueDate: REMEASURE_DUE,
      measurements: baseMeasurements,
      headDay: 20,
      activeDays: 8,
      priorityLabel: "Slaap",
    });
    expect(caption).toEqual({
      title: "Dag 20 · 4 aug",
      body: "Nog te gaan.",
      future: "Wat je tussen nu en dan neerzet, lees je op 14 aug terug.",
    });
  });
});

describe("buildWachtendCaption", () => {
  it("returns wachtend copy without start date", () => {
    expect(buildWachtendCaption(REMEASURE_DUE)).toEqual({
      title: "Nog niets gelogd",
      body: "Je hermeting staat op 14 aug.",
      future: "Wat je vanaf vandaag neerzet, lees je op die dag terug.",
    });
  });
});

describe("scrubZone", () => {
  it("returns verleden when headDay < cycleDay", () => {
    expect(scrubZone(12, 8)).toBe("verleden");
  });

  it("returns vandaag when headDay === cycleDay", () => {
    expect(scrubZone(12, 12)).toBe("vandaag");
  });

  it("returns toekomst when headDay > cycleDay", () => {
    expect(scrubZone(12, 20)).toBe("toekomst");
  });
});
