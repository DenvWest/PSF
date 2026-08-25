import { describe, expect, it } from "vitest";
import { meetreeksScaleHint } from "@/lib/voortgang-meetreeks-format";
import type { MeetreeksRow } from "@/lib/voortgang-meetreeks";

function row(scale: MeetreeksRow["scale"]): MeetreeksRow {
  return {
    key: "x",
    label: "X",
    cells: [],
    levelMax: 3,
    scale,
    plottable: false,
  };
}

describe("meetreeksScaleHint", () => {
  it("reserves norm-taal for richtlijn", () => {
    expect(meetreeksScaleHint(row("richtlijn"))).toContain("onder de richtlijn");
    expect(meetreeksScaleHint(row("zelfrapportage"))).toContain("Geen richtlijn");
    expect(meetreeksScaleHint(row("vuistregel"))).toContain("geen norm");
  });
});
