import { describe, it, expect, vi, afterEach } from "vitest";
import { saveIntakeSession } from "@/lib/intake-storage";

const okScores = {
  sleep_score: 50,
  energy_score: 50,
  stress_score: 50,
  nutrition_score: 50,
  movement_score: 50,
  recovery_score: 50,
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
