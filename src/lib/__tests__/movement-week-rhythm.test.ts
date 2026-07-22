import { describe, expect, it } from "vitest";
import { buildWeekRhythm } from "@/lib/movement-week-rhythm";

describe("buildWeekRhythm", () => {
  it("geeft bij lege input een lege array", () => {
    expect(buildWeekRhythm([])).toEqual([]);
  });

  it("telt herhaalde stepIds per modaliteit-tag", () => {
    expect(
      buildWeekRhythm(["mov-thuis-basisoefening", "mov-thuis-basisoefening"]),
    ).toEqual([{ tag: "kracht", label: "Kracht", count: 2 }]);
  });

  it("retourneert chips in vaste volgorde kracht, conditie, herstel", () => {
    expect(
      buildWeekRhythm([
        "mov-rustdag-na-inspanning",
        "mov-trap-of-wandeling",
        "mov-thuis-basisoefening",
        "mov-trap-of-wandeling",
      ]),
    ).toEqual([
      { tag: "kracht", label: "Kracht", count: 1 },
      { tag: "conditie", label: "Conditie", count: 2 },
      { tag: "herstel", label: "Herstel", count: 1 },
    ]);
  });

  it("negeert onbekende of verwijderde stepIds zonder crash", () => {
    expect(
      buildWeekRhythm(["mov-thuis-basisoefening", "mov-legacy-removed-step"]),
    ).toEqual([{ tag: "kracht", label: "Kracht", count: 1 }]);
  });
});
