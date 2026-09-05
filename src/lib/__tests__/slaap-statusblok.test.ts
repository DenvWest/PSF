import { describe, expect, it } from "vitest";
import { buildSlaapStatusRijen } from "@/lib/slaap-statusblok";
import type { LadderEvidenceRow } from "@/lib/domain-ladder-readout";

describe("buildSlaapStatusRijen", () => {
  it("pakt één rij per laag 1–3", () => {
    const evidence: Partial<Record<number, LadderEvidenceRow[]>> = {
      1: [
        {
          key: "duur",
          label: "Slaapduur",
          answerLabel: "6 uur",
          whyLine: "Onder de ondergrens.",
        },
      ],
      3: [
        {
          key: "winddown",
          label: "Avondafbouw",
          answerLabel: "Zelden",
          whyLine: "Geen afbouw.",
        },
        {
          key: "morninglight",
          label: "Ochtendlicht",
          answerLabel: "Soms",
          whyLine: "Licht helpt.",
        },
      ],
    };
    const rows = buildSlaapStatusRijen(evidence);
    expect(rows).toEqual([
      {
        key: "duur",
        label: "Gelegenheid",
        answerLabel: "6 uur",
        whyLine: "Onder de ondergrens.",
      },
      {
        key: "winddown",
        label: "Gedrag",
        answerLabel: "Zelden",
        whyLine: "Geen afbouw.",
      },
    ]);
  });

  it("geeft leeg zonder evidence", () => {
    expect(buildSlaapStatusRijen(null)).toEqual([]);
    expect(buildSlaapStatusRijen({})).toEqual([]);
  });
});
