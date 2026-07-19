import { describe, expect, it } from "vitest";
import {
  buildRemeasureCompletedPayload,
  computePerDomainDelta,
  sanitizePerDomainDelta,
  type BaselineSnapshot,
} from "@/lib/intake-baseline";
import type { DomainScores } from "@/lib/intake-engine";

const baselineScores: DomainScores = {
  sleep_score: 40,
  energy_score: 35,
  stress_score: 50,
  nutrition_score: 45,
  movement_score: 60,
  recovery_score: 30,
    connection_score: 30,
};

const currentScores: DomainScores = {
  sleep_score: 54,
  energy_score: 42,
  stress_score: 48,
  nutrition_score: 45,
  movement_score: 65,
  recovery_score: 38,
    connection_score: 38,
};

describe("computePerDomainDelta", () => {
  it("returns current minus baseline per domain", () => {
    expect(computePerDomainDelta(baselineScores, currentScores)).toEqual({
      sleep_score: 14,
      energy_score: 7,
      stress_score: -2,
      nutrition_score: 0,
      movement_score: 5,
      recovery_score: 8,
    connection_score: 8,
    });
  });

  it("retourneert nul voor identieke scores", () => {
    const delta = computePerDomainDelta(baselineScores, baselineScores);
    for (const v of Object.values(delta)) {
      expect(v).toBe(0);
    }
  });

  it("verwerkt negatieve delta correct (verslechtering)", () => {
    const worse: typeof baselineScores = {
      sleep_score: 30,
      energy_score: 20,
      stress_score: 40,
      nutrition_score: 40,
      movement_score: 55,
      recovery_score: 25,
    connection_score: 25,
    };
    const delta = computePerDomainDelta(currentScores, worse);
    expect(delta.sleep_score).toBe(-24);
    expect(delta.energy_score).toBe(-22);
  });
});

describe("buildRemeasureCompletedPayload", () => {
  const baseline: BaselineSnapshot = {
    sessionId: "00000000-0000-4000-8000-000000000001",
    organizationId: "00000000-0000-0000-0000-000000000001",
    frozenAt: "2026-05-10T10:00:00.000Z",
    domainScores: baselineScores,
    profileLabel: "Onrustige Slaper",
    urgencyLevel: "moderate",
    rulesVersion: "1.0.0",
    primaryTheme: "sleep",
    symptomProfile: ["slaap"],
    ageRange: "45–49",
  };

  it("builds anonymous payload without session identifiers", () => {
    const payload = buildRemeasureCompletedPayload({
      baseline,
      currentScores,
      currentRulesVersion: "1.0.0",
      completedAt: new Date("2026-06-09T10:00:00.000Z"),
    });

    expect(payload.profile_label).toBe("Onrustige Slaper");
    expect(payload.per_domain_delta.sleep_score).toBe(14);
    expect(payload.rules_version_baseline).toBe("1.0.0");
    expect(payload.rules_version_current).toBe("1.0.0");
    expect(payload.days_since_baseline).toBe(30);
    expect(payload.methodology_changed).toBe(false);
    expect(payload).not.toHaveProperty("session_id");
    expect(payload).not.toHaveProperty("email");
  });

  it("zeros recovery delta and flags methodology change across rules versions", () => {
    const payload = buildRemeasureCompletedPayload({
      baseline,
      currentScores,
      currentRulesVersion: "1.2.0",
      completedAt: new Date("2026-06-09T10:00:00.000Z"),
    });

    expect(payload.methodology_changed).toBe(true);
    expect(payload.per_domain_delta.recovery_score).toBe(0);
    expect(payload.per_domain_delta.sleep_score).toBe(14);
  });

  it("sanitizePerDomainDelta zeros recovery when baseline predates 1.1.0", () => {
    const delta = sanitizePerDomainDelta({
      baseline: baselineScores,
      current: currentScores,
      baselineRulesVersion: "1.0.0",
      currentRulesVersion: "1.2.0",
    });
    expect(delta.recovery_score).toBe(0);
    expect(delta.sleep_score).toBe(14);
  });

  it("sanitizePerDomainDelta zeros ALL domains across the 1.4.0 item-scale boundary", () => {
    const delta = sanitizePerDomainDelta({
      baseline: baselineScores,
      current: currentScores,
      baselineRulesVersion: "1.3.1",
      currentRulesVersion: "1.4.0",
    });
    // De item-herschaling maakt élk domein onvergelijkbaar — geen enkel schaal-artefact
    // mag als "verandering" naar de UI of de per_domain_delta-events lekken.
    for (const value of Object.values(delta)) {
      expect(value).toBe(0);
    }
  });

  it("sanitizePerDomainDelta zeros only movement_score across the 1.5.0 boundary", () => {
    const delta = sanitizePerDomainDelta({
      baseline: baselineScores,
      current: currentScores,
      baselineRulesVersion: "1.4.0",
      currentRulesVersion: "1.5.0",
    });
    expect(delta.movement_score).toBe(0);
    expect(delta.sleep_score).toBe(14);
    expect(delta.energy_score).toBe(7);
    expect(delta.recovery_score).toBe(8);
    expect(delta.connection_score).toBe(8);
  });
});
