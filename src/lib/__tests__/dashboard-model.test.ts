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
    };
    const trend: CheckTrend = {
      slaap: [60], energie: [70], stress: [70], voeding: [70], beweging: [70], herstel: [20],
    };
    const model = buildModel(
      { scores, vitality: 50, date: "1 jul 2026", trend },
      null, [], false, null, null, null,
    );
    const expected =
      MEASURED_DOMAIN_TO_PILLAR[getPrimaryTheme(mapCheckScoresToDomainScores(scores), {})];
    expect(model.priority.id).toBe(expected);
    expect(["slaap", "stress", "voeding", "beweging"]).toContain(model.priority.id);
  });
});
