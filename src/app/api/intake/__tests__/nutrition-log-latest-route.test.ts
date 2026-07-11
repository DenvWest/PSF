import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockVerifyCookie, mockLimit, mockConsume } = vi.hoisted(() => ({
  mockVerifyCookie: vi.fn(),
  mockLimit: vi.fn(),
  mockConsume: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: mockConsume,
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({}),
}));
vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/intake-session-cookie", () => ({
  INTAKE_SESSION_COOKIE_NAME: "psf_intake_sid",
  verifySignedIntakeSessionCookie: mockVerifyCookie,
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: mockLimit,
      };
      return chain;
    },
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_SESSION_ID = "550e8400-e29b-41d4-a716-446655440000";

const VALID_SLIDERS: Record<string, number> = {
  fruit: 3,
  berries: 2,
  vegetables: 1,
  nutsSeedsLegumes: 1,
  wholegrain: 2,
  oilyFish: 1,
  proteinMeals: 1,
  meatLegumes: 1,
  dairy: 1,
  sugaryDrinks: 2,
  daylight: 2,
};

const VALID_RAW = {
  sliders: VALID_SLIDERS,
  allergies: [] as string[],
  preference: "none",
};

function makeGet(cookieValue?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (cookieValue !== undefined) {
    headers["Cookie"] = `psf_intake_sid=${cookieValue}`;
  }
  return new NextRequest("http://localhost/api/intake/nutrition-log/latest", {
    method: "GET",
    headers,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/intake/nutrition-log/latest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsume.mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 });
    mockVerifyCookie.mockReturnValue(VALID_SESSION_ID);
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("rate-limit overschreden → 429 met Retry-After, GEEN db-call", async () => {
    mockConsume.mockResolvedValue({ allowed: false, retryAfterSeconds: 42 });

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet("signed-cookie-value"));

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("geen/ongeldige sessiecookie → 401", async () => {
    mockVerifyCookie.mockReturnValue(null);

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet());

    expect(res.status).toBe(401);
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("geen logs → 404", async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet("signed-cookie-value"));

    expect(res.status).toBe(404);
  });

  it("db-fout bij ophalen → 500", async () => {
    mockLimit.mockResolvedValue({ data: null, error: { message: "boom" } });

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet("signed-cookie-value"));

    expect(res.status).toBe(500);
  });

  it("ongeldige opgeslagen antwoorden → 500", async () => {
    mockLimit.mockResolvedValue({
      data: [{ estimate: [], raw_inputs: null, logged_at: "2026-07-11T10:00:00Z" }],
      error: null,
    });

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet("signed-cookie-value"));

    expect(res.status).toBe(500);
  });

  it("één log → 200 met estimate/statements/advice/score, delta null", async () => {
    mockLimit.mockResolvedValue({
      data: [{ estimate: [], raw_inputs: VALID_RAW, logged_at: "2026-07-11T10:00:00Z" }],
      error: null,
    });

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet("signed-cookie-value"));

    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      estimate: unknown[];
      statements: string[];
      advice: unknown[];
      delta: unknown | null;
      score: number;
      loggedAt: string;
    };
    expect(Array.isArray(data.estimate)).toBe(true);
    expect(data.estimate.length).toBeGreaterThan(0);
    expect(data.statements.length).toBe(data.estimate.length);
    expect(Array.isArray(data.advice)).toBe(true);
    expect(typeof data.score).toBe("number");
    expect(data.delta).toBeNull();
    expect(data.loggedAt).toBe("2026-07-11T10:00:00Z");
  });

  it("twee logs → 200 met delta-array t.o.v. de vorige log", async () => {
    const { estimateNutritionIntake } = await import("@/lib/nutrition-intake-estimate");
    const { nutritionReportFromAnswers } = await import("@/lib/nutrition-score");
    const previousEstimate = estimateNutritionIntake(
      nutritionReportFromAnswers(VALID_SLIDERS),
    );

    mockLimit.mockResolvedValue({
      data: [
        { estimate: [], raw_inputs: VALID_RAW, logged_at: "2026-07-11T10:00:00Z" },
        { estimate: previousEstimate, raw_inputs: VALID_RAW, logged_at: "2026-07-04T10:00:00Z" },
      ],
      error: null,
    });

    const { GET } = await import("@/app/api/intake/nutrition-log/latest/route");
    const res = await GET(makeGet("signed-cookie-value"));

    expect(res.status).toBe(200);
    const data = (await res.json()) as { delta: unknown[] | null };
    expect(Array.isArray(data.delta)).toBe(true);
  });
});
