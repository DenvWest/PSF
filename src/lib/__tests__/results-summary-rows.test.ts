import { describe, it, expect } from "vitest";
import { buildSummaryRows } from "@/lib/results-summary-rows";
import type { DomainScores } from "@/lib/intake-engine";

function makeScores(overrides: Partial<DomainScores> = {}): DomainScores {
  return {
    sleep_score: 70,
    energy_score: 70,
    stress_score: 35,
    nutrition_score: 80,
    movement_score: 55,
    recovery_score: 70,
    ...overrides,
  };
}

describe("buildSummaryRows", () => {
  it("returns four rows in intro order with display statuses", () => {
    const { rows } = buildSummaryRows(makeScores(), "stress");

    expect(rows.map((row) => row.label)).toEqual([
      "Slaap",
      "Stress",
      "Voeding",
      "Beweging",
    ]);
    expect(rows[1]).toMatchObject({
      label: "Stress",
      status: "Prioriteit",
      tone: "terra-deep",
    });
  });

  it("marks the primary pillar label for accent", () => {
    const { primaryLabel } = buildSummaryRows(makeScores(), "stress");
    expect(primaryLabel).toBe("Stress");
  });
});
