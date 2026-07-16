import { describe, expect, it } from "vitest";
import { perfectSupplementMeasurementConfig } from "@/data/measurement-config";
import { mapSessionSnapshotToPrev } from "@/lib/account-dashboard";
import { buildModel } from "@/lib/dashboard-model";
import { buildDeltaReport } from "@/lib/delta-report";
import type { DomainScores } from "@/lib/intake-engine";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

const scores: CheckScores = {
  slaap: 60,
  energie: 70,
  stress: 70,
  voeding: 70,
  beweging: 70,
  herstel: 20,
  verbinding: 20,
};

const trend: CheckTrend = {
  slaap: [60, 65],
  energie: [70, 70],
  stress: [70, 70],
  voeding: [70, 70],
  beweging: [70, 70],
  herstel: [20, 20],
  verbinding: [20, 20],
};

describe("mapSessionSnapshotToPrev", () => {
  it("preserves rulesVersion on the prev shape used by buildModel", () => {
    const prev = mapSessionSnapshotToPrev({
      scores,
      vitality: 50,
      date: "10 jun 2026",
      rulesVersion: "1.3.1",
    });

    expect(prev.rulesVersion).toBe("1.3.1");

    const model = buildModel(
      { scores, vitality: 55, date: "10 jul 2026", trend },
      prev,
      [],
      true,
      null,
      null,
      null,
    );

    expect(model.vitalityDelta).toBeNull();
    expect(model.vitalityDeltaNote).toContain("Methodiek gewijzigd");
  });
});

describe("buildDeltaReport methodology gating", () => {
  it("zeros domain and vitality deltas across the 1.4.0 item-scale boundary", () => {
    const baseline: DomainScores = {
      sleep_score: 40,
      energy_score: 50,
      stress_score: 55,
      nutrition_score: 45,
      movement_score: 35,
      recovery_score: 30,
      connection_score: 25,
    };
    const current: DomainScores = {
      sleep_score: 60,
      energy_score: 70,
      stress_score: 70,
      nutrition_score: 70,
      movement_score: 70,
      recovery_score: 20,
      connection_score: 20,
    };

    const report = buildDeltaReport({
      baseline,
      current,
      daysBetween: 30,
      sustainedActions: [],
      config: perfectSupplementMeasurementConfig,
      baselineRulesVersion: "1.3.1",
      currentRulesVersion: "1.4.0",
    });

    expect(report.methodologyChanged).toBe(true);
    expect(report.vitality.delta).toBe(0);
    expect(report.perDomain.every((entry) => entry.delta === 0)).toBe(true);
  });
});
