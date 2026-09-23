import { describe, expect, it } from "vitest";
import { buildModel } from "@/lib/dashboard-model";
import {
  buildPriorityTimeline,
  countEnginePriorityChanges,
  formatPriorityShiftSummary,
  shouldShowEngineShiftNudge,
} from "@/lib/priority-over-time";
import type { CheckLogEntry, CheckScores, CheckTrend } from "@/types/dashboard";

function buildScores(): CheckScores {
  return {
    slaap: 44,
    energie: 57,
    stress: 50,
    voeding: 52,
    beweging: 73,
    herstel: 54,
    verbinding: 66,
  };
}

describe("priority-over-time", () => {
  it("builds timeline from history", () => {
    const scores = buildScores();
    const trend: CheckTrend = Object.fromEntries(
      Object.keys(scores).map((key) => [key, [scores[key as keyof CheckScores]]]),
    ) as CheckTrend;
    const history: CheckLogEntry[] = [
      { seq: 1, date: "1 jun", priority: "slaap", vitality: 50 },
      { seq: 2, date: "1 jul", priority: "voeding", vitality: 52 },
    ];
    const model = buildModel(
      { scores, vitality: 52, date: "1 jul 2026", trend },
      null,
      history,
      true,
      null,
      null,
      null,
      null,
    );

    const timeline = buildPriorityTimeline(model);
    expect(timeline).toHaveLength(2);
    expect(formatPriorityShiftSummary(model)).toBe("slaap → voeding");
    expect(countEnginePriorityChanges(history)).toBe(1);
  });

  /**
   * De nudge vuurt alleen als een eigen pin van de engine afwijkt. Met voeding
   * als enige zichtbare interventiedomein kán dat niet meer — de pin en de
   * engine wijzen altijd hetzelfde aan. Deze test legt die stand vast; komt er
   * een tweede domein terug, dan faalt hij en hoort de oorspronkelijke
   * divergentie-assertie er weer in.
   */
  it("flags no nudge while only one domain is visible", () => {
    const scores = buildScores();
    const trend: CheckTrend = Object.fromEntries(
      Object.keys(scores).map((key) => [key, [scores[key as keyof CheckScores]]]),
    ) as CheckTrend;
    const model = buildModel(
      { scores, vitality: 52, date: "1 jul 2026", trend },
      null,
      [],
      false,
      { MOV_CARD: 1 },
      null,
      null,
      "voeding",
      null,
    );

    expect(shouldShowEngineShiftNudge(model)).toBe(false);
  });
});
