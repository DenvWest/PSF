import { describe, it, expect, vi, afterEach } from "vitest";
import { latestMeasurementAt, saveIntakeSession } from "@/lib/intake-storage";

const okScores = {
  sleep_score: 50,
  energy_score: 50,
  stress_score: 50,
  nutrition_score: 50,
  movement_score: 50,
  recovery_score: 50,
    connection_score: 50,
};

const baseInput = {
  symptoms: [] as string[],
  answers: {} as Record<string, number>,
  ageRange: "45–49",
  turnstileToken: "t",
  website: "",
  consent: {
    healthDataProcessing: true,
    anonymousAnalytics: false,
    marketingEmail: false,
    marketingEmailAddress: null,
    firstName: null,
  },
} as Parameters<typeof saveIntakeSession>[0];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saveIntakeSession", () => {
  it("geeft de server-canonieke scores terug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ sessionId: "s1", scores: okScores }),
      })),
    );
    const res = await saveIntakeSession(baseInput);
    expect(res?.sessionId).toBe("s1");
    expect(res?.scores).toEqual(okScores);
  });

  it("scores = null als de server ze niet (geldig) teruggeeft", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ sessionId: "s1" }),
      })),
    );
    const res = await saveIntakeSession(baseInput);
    expect(res?.sessionId).toBe("s1");
    expect(res?.scores).toBeNull();
  });

  it("geeft de server-primaryTheme terug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ sessionId: "s1", scores: okScores, primaryTheme: "sleep" }),
      })),
    );
    const res = await saveIntakeSession(baseInput);
    expect(res?.primaryTheme).toBe("sleep");
  });

  it("primaryTheme = null bij een ongeldige waarde", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ sessionId: "s1", primaryTheme: "banana" }),
      })),
    );
    const res = await saveIntakeSession(baseInput);
    expect(res?.primaryTheme).toBeNull();
  });
});

describe("latestMeasurementAt", () => {
  const sept3 = Date.parse("2026-09-03T10:00:00Z");

  it("gebruikt de voedingscheck-datum als die recenter is dan de brede check", () => {
    expect(latestMeasurementAt(sept3, "2026-09-24T08:00:00Z")).toBe(
      Date.parse("2026-09-24T08:00:00Z"),
    );
  });

  it("houdt de sessie-datum aan als de voedingscheck ouder is", () => {
    expect(latestMeasurementAt(sept3, "2026-08-01T08:00:00Z")).toBe(sept3);
  });

  it("valt terug op de sessie-datum zonder of met ongeldige voedingslog", () => {
    expect(latestMeasurementAt(sept3, null)).toBe(sept3);
    expect(latestMeasurementAt(sept3, "geen-datum")).toBe(sept3);
  });
});
