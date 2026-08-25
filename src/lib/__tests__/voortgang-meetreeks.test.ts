import { describe, expect, it } from "vitest";
import {
  buildMeetreeks,
  resolvePlotRow,
  SCORE_ROW_KEY,
} from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement, DomainMeasurementValue } from "@/types/dashboard";

function value(
  key: string,
  label: string,
  answerLabel: string,
  level: number | null,
  levelMax = 3,
  scale: DomainMeasurementValue["scale"] = "zelfrapportage",
): DomainMeasurementValue {
  return { key, label, answerLabel, benchmarkLabel: null, level, levelMax, scale };
}

function moment(
  id: string,
  score: number,
  values: DomainMeasurementValue[],
): DomainMeasurement {
  return {
    id,
    dateIso: "2026-08-01",
    dateLabel: "1 aug 2026",
    daysAgo: 1,
    score,
    source: "checkin",
    values,
  };
}

describe("buildMeetreeks", () => {
  it("turns the reeks around: newest left, older to the right", () => {
    const reeks = buildMeetreeks([
      moment("oud", 50, []),
      moment("nieuw", 60, []),
    ]);
    expect(reeks.moments.map((m) => m.id)).toEqual(["nieuw", "oud"]);
    expect(reeks.scoreRow.cells.map((cell) => cell?.answerLabel)).toEqual(["60", "50"]);
  });

  it("unions the keys and leaves a gap where a moment did not measure one", () => {
    const reeks = buildMeetreeks([
      moment("a", 50, [value("oud", "Oud veld", "Ja", 2)]),
      moment("b", 60, [value("nieuw", "Nieuw veld", "Nee", 1)]),
    ]);

    // Het nieuwste moment bepaalt de volgorde; wat alleen eerder gemeten is,
    // komt eronder in plaats van te verdwijnen. Kolom 0 is het nieuwste moment.
    expect(reeks.valueRows.map((row) => row.key)).toEqual(["nieuw", "oud"]);
    expect(reeks.valueRows[0].cells.map((cell) => cell?.answerLabel ?? null)).toEqual([
      "Nee",
      null,
    ]);
    expect(reeks.valueRows[1].cells.map((cell) => cell?.answerLabel ?? null)).toEqual([
      null,
      "Ja",
    ]);
  });

  it("takes the newest label for a renamed question", () => {
    const reeks = buildMeetreeks([
      moment("a", 50, [value("k", "Oude naam", "Ja", 2)]),
      moment("b", 60, [value("k", "Nieuwe naam", "Nee", 1)]),
    ]);
    expect(reeks.valueRows[0].label).toBe("Nieuwe naam");
  });

  it("marks a row plottable only from two positioned points", () => {
    const reeks = buildMeetreeks([
      moment("a", 50, [value("een", "Eén punt", "Ja", 2), value("geen", "Zonder positie", "Eigen antwoord", null)]),
      moment("b", 60, [value("geen", "Zonder positie", "Eigen antwoord", null)]),
    ]);

    const een = reeks.valueRows.find((row) => row.key === "een");
    const geen = reeks.valueRows.find((row) => row.key === "geen");
    expect(een?.plottable).toBe(false);
    expect(geen?.plottable).toBe(false);
  });

  it("never plots a single moment, not even the score", () => {
    const reeks = buildMeetreeks([moment("a", 50, [])]);
    expect(reeks.scoreRow.plottable).toBe(false);
  });

  it("carries the scale length of the source, not a guess", () => {
    const reeks = buildMeetreeks([
      moment("a", 50, [value("str", "Spanning", "Regelmatig", 2, 4)]),
      moment("b", 60, [value("str", "Spanning", "Zelden", 4, 4)]),
    ]);
    expect(reeks.valueRows[0].levelMax).toBe(4);
    expect(reeks.valueRows[0].plottable).toBe(true);
  });

  it("carries where the scale rests, so the UI knows what it may claim", () => {
    const reeks = buildMeetreeks([
      moment("a", 50, [
        value("duur", "Slaapduur", "7 uur", 2, 3, "richtlijn"),
        value("eiwit", "Eiwit", "Aan de lage kant", 1, 2, "vuistregel"),
      ]),
    ]);
    expect(reeks.scoreRow.scale).toBe("score");
    expect(reeks.valueRows.find((row) => row.key === "duur")?.scale).toBe("richtlijn");
    expect(reeks.valueRows.find((row) => row.key === "eiwit")?.scale).toBe("vuistregel");
  });

  it("lets a renewed source govern the whole row, not just its own column", () => {
    const reeks = buildMeetreeks([
      moment("a", 50, [value("k", "Veld", "Ja", 2, 3, "zelfrapportage")]),
      moment("b", 60, [value("k", "Veld", "Nee", 1, 3, "richtlijn")]),
    ]);
    expect(reeks.valueRows[0].scale).toBe("richtlijn");
  });

  it("survives an empty domain", () => {
    const reeks = buildMeetreeks([]);
    expect(reeks.valueRows).toEqual([]);
    expect(reeks.scoreRow.cells).toEqual([]);
    expect(reeks.scoreRow.plottable).toBe(false);
  });
});

describe("resolvePlotRow", () => {
  const reeks = buildMeetreeks([
    moment("a", 50, [value("los", "Los punt", "Ja", 2)]),
    moment("b", 60, []),
  ]);

  it("returns the asked row when it can be plotted", () => {
    expect(resolvePlotRow(reeks, SCORE_ROW_KEY)?.key).toBe(SCORE_ROW_KEY);
  });

  it("falls back to the first plottable row instead of drawing nothing", () => {
    expect(resolvePlotRow(reeks, "los")?.key).toBe(SCORE_ROW_KEY);
  });

  it("returns null when nothing in the reeks can carry a line", () => {
    const leeg = buildMeetreeks([moment("a", 50, [])]);
    expect(resolvePlotRow(leeg, SCORE_ROW_KEY)).toBeNull();
  });
});
