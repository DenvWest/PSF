import { describe, expect, it } from "vitest";
import {
  deriveDefaultScheduledTime,
  deriveDefaultTimeBucket,
  deriveSuggestedTimeBucket,
  deriveTimeBucketFromLocalTime,
  isMovementDayChoice,
  isPinablePillarId,
  isTimeBucket,
  isValidLocalTime,
  resolveMovementDayChoiceForToday,
  timeBucketAbbrev,
  timeBucketLabel,
} from "@/lib/account-priority-pref";
import { buildModel } from "@/lib/dashboard-model";
import type { CheckScores, CheckTrend } from "@/types/dashboard";

describe("movement dagkeuze", () => {
  it("accepteert alleen de drie belastings-tiers", () => {
    expect(isMovementDayChoice("herstel")).toBe(true);
    expect(isMovementDayChoice("matig")).toBe(true);
    expect(isMovementDayChoice("trainen")).toBe(true);
    expect(isMovementDayChoice("rust")).toBe(false);
    expect(isMovementDayChoice(null)).toBe(false);
  });

  it("houdt de keuze alleen geldig op de dag zelf", () => {
    expect(resolveMovementDayChoiceForToday("herstel", "2026-08-01", "2026-08-01")).toBe(
      "herstel",
    );
    expect(
      resolveMovementDayChoiceForToday("herstel", "2026-07-31", "2026-08-01"),
    ).toBeNull();
  });

  it("levert niets zonder keuze of zonder datum", () => {
    expect(resolveMovementDayChoiceForToday(null, "2026-08-01", "2026-08-01")).toBeNull();
    expect(resolveMovementDayChoiceForToday("trainen", null, "2026-08-01")).toBeNull();
  });
});

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

  it("validates local time strings", () => {
    expect(isValidLocalTime("09:30")).toBe(true);
    expect(isValidLocalTime("23:59")).toBe(true);
    expect(isValidLocalTime("24:00")).toBe(false);
    expect(isValidLocalTime("9:30")).toBe(true);
    expect(isValidLocalTime("09:60")).toBe(false);
  });

  it("labels buckets in Dutch", () => {
    expect(timeBucketLabel("avond")).toBe("Vanavond");
  });

  it("derives default bucket from hour", () => {
    expect(deriveDefaultTimeBucket(new Date("2026-07-18T08:00:00+02:00"))).toBe("ochtend");
    expect(deriveDefaultTimeBucket(new Date("2026-07-18T14:00:00+02:00"))).toBe("middag");
    expect(deriveDefaultTimeBucket(new Date("2026-07-18T20:00:00+02:00"))).toBe("avond");
  });

  it("derives bucket from local time", () => {
    expect(deriveTimeBucketFromLocalTime("08:30")).toBe("ochtend");
    expect(deriveTimeBucketFromLocalTime("14:00")).toBe("middag");
    expect(deriveTimeBucketFromLocalTime("19:45")).toBe("avond");
  });

  it("derives default scheduled time from bucket", () => {
    expect(deriveDefaultScheduledTime("ochtend")).toBe("09:00");
    expect(deriveDefaultScheduledTime("middag")).toBe("14:00");
    expect(deriveDefaultScheduledTime("avond")).toBe("19:00");
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
      "19:30",
    );

    expect(model.enginePriority.id).not.toBe("beweging");
    expect(model.priority.id).toBe("beweging");
    expect(model.priorityIsUserChosen).toBe(true);
    expect(model.timeBucket).toBe("avond");
    expect(model.scheduledTime).toBe("19:30");
    expect(model.ladder[0]?.id).toBe(model.enginePriority.id);
  });
});
