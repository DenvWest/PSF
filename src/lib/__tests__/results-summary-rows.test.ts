import { describe, it, expect } from "vitest";
import { buildSummaryRows } from "@/lib/results-summary-rows";
import type { DomainScores } from "@/lib/intake-engine";
import { QUICK_WIN_FALLBACK_BY_DOMAIN } from "@/lib/intake-engine";

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
  it("returns five rows in intro order with display statuses and quick wins", () => {
    const { rows } = buildSummaryRows(makeScores(), "stress");

    expect(rows.map((row) => row.label)).toEqual([
      "Slaap",
      "Stress",
      "Voeding",
      "Beweging",
      "Herstel",
    ]);
    expect(rows[1]).toMatchObject({
      label: "Stress",
      status: "Prioriteit",
      tone: "terra-deep",
      quickWin: QUICK_WIN_FALLBACK_BY_DOMAIN.stress_score,
    });
    expect(rows[4]).toMatchObject({
      label: "Herstel",
      status: "Voldoende",
      quickWin: QUICK_WIN_FALLBACK_BY_DOMAIN.recovery_score,
    });
  });

  it("marks the primary pillar label for accent", () => {
    const { primaryLabel } = buildSummaryRows(makeScores(), "stress");
    expect(primaryLabel).toBe("Stress");
  });
});
