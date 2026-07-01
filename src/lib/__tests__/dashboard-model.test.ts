import { describe, expect, it } from "vitest";
import { buildModel } from "@/lib/dashboard-model";
import { MEASURED_DOMAIN_TO_PILLAR } from "@/lib/measured-pillar-map";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { mapCheckScoresToDomainScores } from "@/lib/reveal-model";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

describe("buildModel priority", () => {
  it("is de measured primary theme (nooit energie/herstel) en matcht nurture.primary_domain", () => {
    const scores: CheckScores = {
      slaap: 60, energie: 70, stress: 70, voeding: 70, beweging: 70, herstel: 20,
    verbinding: 20,
    };
    const trend: CheckTrend = {
      slaap: [60], energie: [70], stress: [70], voeding: [70], beweging: [70], herstel: [20],
      verbinding: [20],
    };
    const model = buildModel(
      { scores, vitality: 50, date: "1 jul 2026", trend },
      null, [], false, null, null, null,
    );
    const expected =
      MEASURED_DOMAIN_TO_PILLAR[getPrimaryTheme(mapCheckScoresToDomainScores(scores), {})];
    expect(model.priority.id).toBe(expected);
    expect(["slaap", "stress", "voeding", "beweging", "verbinding"]).toContain(model.priority.id);
    expect(["slaap", "stress", "voeding", "beweging", "verbinding"]).toContain(model.strongest.id);
  });

  it("suppresses vitality delta when baseline rules version predates 1.3.0", () => {
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
    const model = buildModel(
      { scores, vitality: 55, date: "10 jul 2026", trend },
      { scores, vitality: 50, date: "10 jun 2026", rulesVersion: "1.2.0" },
      [],
      true,
      null,
      null,
      null,
    );
    expect(model.vitalityDelta).toBeNull();
    expect(model.vitalityDeltaNote).toContain("Methodiek gewijzigd");
  });

  it("suppresses vitality delta when baseline rules version predates 1.2.0", () => {
    const scores: CheckScores = {
      slaap: 60, energie: 70, stress: 70, voeding: 70, beweging: 70, herstel: 20,
    verbinding: 20,
    };
    const trend: CheckTrend = {
      slaap: [60, 65], energie: [70, 70], stress: [70, 70], voeding: [70, 70],
      beweging: [70, 70], herstel: [20, 20],
      verbinding: [20, 20],
    };
    const model = buildModel(
      { scores, vitality: 55, date: "10 jul 2026", trend },
      { scores, vitality: 50, date: "10 jun 2026", rulesVersion: "1.0.0" },
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
