import { describe, expect, it } from "vitest";
import { buildDomainTrendRow, buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { buildModel } from "@/lib/dashboard-model";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

const scores: CheckScores = {
  slaap: 55,
  energie: 60,
  stress: 50,
  voeding: 45,
  beweging: 38,
  herstel: 67,
  verbinding: 50,
};

const trend: CheckTrend = {
  slaap: [40, 48, 55],
  energie: [50, 55, 60],
  stress: [55, 52, 50],
  voeding: [42, 44, 45],
  beweging: [30, 34, 38],
  herstel: [33, 50, 67],
  verbinding: [50, 50, 50],
};

describe("buildLeefstijllijnRows", () => {
  it("returns only intervention domains in pillar order", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      null,
      null,
      null,
    );
    const rows = buildLeefstijllijnRows(model);

    expect(rows).toHaveLength(5);
    expect(rows.map((row) => row.pillarId)).toEqual([
      "slaap",
      "stress",
      "voeding",
      "beweging",
      "verbinding",
    ]);
  });

  it("derives baseline, current and delta from trend series", () => {
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend },
      null,
      [],
      false,
      null,
      null,
      null,
    );
    const beweging = buildLeefstijllijnRows(model).find((row) => row.pillarId === "beweging");

    expect(beweging?.baselineScore).toBe(30);
    expect(beweging?.currentScore).toBe(38);
    expect(beweging?.delta).toBe(8);
  });

  it("returns null delta when fewer than two points", () => {
    const singlePointTrend: CheckTrend = {
      ...trend,
      beweging: [38],
    };
    const model = buildModel(
      { scores, vitality: 46, date: "10 jul 2026", trend: singlePointTrend },
      null,
      [],
      false,
      null,
      null,
      null,
    );
    const row = buildDomainTrendRow(model, "beweging");

    expect(row.baselineScore).toBe(38);
    expect(row.delta).toBeNull();
  });
});
