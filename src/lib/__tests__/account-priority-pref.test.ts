import { describe, expect, it } from "vitest";
import {
  deriveDefaultTimeBucket,
  deriveSuggestedTimeBucket,
  isPinablePillarId,
  isTimeBucket,
  timeBucketAbbrev,
  timeBucketLabel,
} from "@/lib/account-priority-pref";
import { buildModel } from "@/lib/dashboard-model";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

describe("account-priority-pref helpers", () => {
  it("accepts intervention pillars only", () => {
    expect(isPinablePillarId("voeding")).toBe(true);
    expect(isPinablePillarId("energie")).toBe(false);
    expect(isPinablePillarId("herstel")).toBe(false);
  });

  it("validates time buckets", () => {
    expect(isTimeBucket("ochtend")).toBe(true);
    expect(isTimeBucket("nacht")).toBe(false);
  });

  it("labels buckets in Dutch", () => {
    expect(timeBucketLabel("avond")).toBe("Vanavond");
  });

  it("derives default bucket from hour", () => {
    expect(deriveDefaultTimeBucket(new Date("2026-07-18T08:00:00+02:00"))).toBe("ochtend");
    expect(deriveDefaultTimeBucket(new Date("2026-07-18T14:00:00+02:00"))).toBe("middag");
    expect(deriveDefaultTimeBucket(new Date("2026-07-18T20:00:00+02:00"))).toBe("avond");
  });

  it("abbreviates buckets", () => {
    expect(timeBucketAbbrev("ochtend")).toBe("O");
    expect(timeBucketAbbrev("middag")).toBe("M");
    expect(timeBucketAbbrev("avond")).toBe("A");
  });

  it("suggests buckets from intervention domain", () => {
    expect(deriveSuggestedTimeBucket("slaap")).toBe("avond");
    expect(deriveSuggestedTimeBucket("voeding")).toBe("ochtend");
    expect(deriveSuggestedTimeBucket("beweging")).toBe("ochtend");
    expect(deriveSuggestedTimeBucket("stress")).toBe("middag");
    expect(deriveSuggestedTimeBucket("verbinding")).toBe("avond");
  });
});

describe("buildModel priority override", () => {
  const scores: CheckScores = {
    slaap: 44,
    energie: 57,
    stress: 50,
    voeding: 52,
    beweging: 73,
    herstel: 54,
    verbinding: 66,
  };
  const trend: CheckTrend = Object.fromEntries(
    Object.keys(scores).map((key) => [key, [scores[key as keyof CheckScores]]]),
  ) as CheckTrend;

  it("keeps engine priority separate from user pin", () => {
    const model = buildModel(
      { scores, vitality: 52, date: "10 jul 2026", trend },
      null,
      [],
      false,
      { MOV_CARD: 1, SLP_ONSET: 2 },
      null,
      null,
      "beweging",
      "avond",
    );

    expect(model.enginePriority.id).not.toBe("beweging");
    expect(model.priority.id).toBe("beweging");
    expect(model.priorityIsUserChosen).toBe(true);
    expect(model.timeBucket).toBe("avond");
    expect(model.ladder[0]?.id).toBe(model.enginePriority.id);
  });
});
