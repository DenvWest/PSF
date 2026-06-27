import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks (vi.hoisted zodat ze vóór imports beschikbaar zijn)
// ---------------------------------------------------------------------------

const {
  mockConsentInsert,
  mockLogInsert,
  mockPrevLogSelect,
  mockVerifyCookie,
  mockEmitEvent,
} = vi.hoisted(() => ({
  mockConsentInsert: vi.fn(),
  mockLogInsert: vi.fn(),
  mockPrevLogSelect: vi.fn(),
  mockVerifyCookie: vi.fn(),
  mockEmitEvent: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({}),
}));
vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/consent-hashing", () => ({
  sha256Hex: (v: string) => `hash:${v}`,
}));
vi.mock("@/lib/organization", () => ({
  getDefaultOrganizationId: () => "org-uuid-default",
}));
vi.mock("@/lib/intake-session-cookie", () => ({
  INTAKE_SESSION_COOKIE_NAME: "psf_intake_sid",
  verifySignedIntakeSessionCookie: mockVerifyCookie,
}));
vi.mock("@/lib/events", () => ({
  emitEvent: mockEmitEvent,
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table === "consent_records") return { insert: mockConsentInsert };
      if (table === "intake_intake_log") {
        // Ondersteun zowel insert als select-chain (voor vorige log)
        const selectChain = {
          eq: () => selectChain,
          order: () => selectChain,
          limit: mockPrevLogSelect,
        };
        return { insert: mockLogInsert, select: () => selectChain };
      }
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
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
  wholegrain: 2,
  oilyFish: 1,
  proteinMeals: 1,
  meatLegumes: 1,
  dairy: 1,
  sugaryDrinks: 2,
  daylight: 2,
};

const VALID_ANSWERS = {
  sliders: VALID_SLIDERS,
  allergies: [] as string[],
  preference: "none",
};

function makeRequest(
  body: Record<string, unknown>,
  cookieValue?: string,
): NextRequest {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookieValue !== undefined) {
    headers["Cookie"] = `psf_intake_sid=${cookieValue}`;
  }
  return new NextRequest("http://localhost/api/intake/nutrition-log", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/intake/nutrition-log", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsentInsert.mockResolvedValue({ error: null });
    mockLogInsert.mockResolvedValue({ error: null });
    mockPrevLogSelect.mockResolvedValue({ data: null });
    mockEmitEvent.mockResolvedValue(undefined);
    mockVerifyCookie.mockReturnValue(VALID_SESSION_ID);
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("geldige sessie + consent true + answers → consent-rij en log-rij ge-insert; response 200 met estimate, statements, advice, score", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true }, "signed-cookie-value"),
    );

    expect(res.status).toBe(200);

    expect(mockConsentInsert).toHaveBeenCalledOnce();
    const consentArg = mockConsentInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(consentArg.consent_type).toBe("nutrition_intake_logging");
    expect(consentArg.granted).toBe(true);
    expect(consentArg.session_id).toBe(VALID_SESSION_ID);

    expect(mockLogInsert).toHaveBeenCalledOnce();
    const logArg = mockLogInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(logArg.session_id).toBe(VALID_SESSION_ID);
    expect(logArg.organization_id).toBe("org-uuid-default");
    expect(logArg.raw_inputs).toMatchObject({
      sliders: VALID_SLIDERS,
      allergies: [],
      preference: "none",
    });
    expect(typeof logArg.nutrition_score).toBe("number");
    expect(Array.isArray(logArg.estimate)).toBe(true);
    expect(typeof logArg.estimate_version).toBe("string");

    const data = (await res.json()) as {
      estimate: unknown[];
      statements: string[];
      advice: unknown[];
      score: number;
      band: { id: string };
    };
    expect(Array.isArray(data.estimate)).toBe(true);
    expect(data.estimate.length).toBeGreaterThan(0);
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBe(data.estimate.length);
    expect(Array.isArray(data.advice)).toBe(true);
    expect(typeof data.score).toBe("number");
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);
    expect(typeof data.band.id).toBe("string");
  });

  it("estimate en score worden server-berekend uit de slider-antwoorden, niet uit body", async () => {
    const { estimateNutritionIntake } = await import("@/lib/nutrition-intake-estimate");
    const { computeNutritionScore, nutritionReportFromAnswers } = await import(
      "@/lib/nutrition-score"
    );
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const bodyWithFakeEstimate = {
      answers: VALID_ANSWERS,
      consent: true,
      estimate: [{ nutrient: "protein", band: "meets", referenceLabel: "FAKE" }],
      score: 999,
    };

    const res = await POST(makeRequest(bodyWithFakeEstimate, "signed-cookie-value"));

    expect(res.status).toBe(200);

    const expectedReport = nutritionReportFromAnswers(VALID_SLIDERS);
    const expectedEstimate = estimateNutritionIntake(expectedReport);
    const expectedScore = computeNutritionScore(VALID_SLIDERS);

    const logArg = mockLogInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(logArg.estimate).toEqual(expectedEstimate);
    expect(logArg.nutrition_score).toBe(expectedScore);

    const data = (await res.json()) as { estimate: unknown; score: number };
    expect(data.estimate).toEqual(expectedEstimate);
    expect(data.score).toBe(expectedScore);
  });

  it("consent false → 400, GEEN insert", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: false }, "signed-cookie-value"),
    );

    expect(res.status).toBe(400);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();

    const data = (await res.json()) as { error: string };
    expect(data.error).toContain("Toestemming");
  });

  it("geen/ongeldige sessiecookie → 401, GEEN insert", async () => {
    mockVerifyCookie.mockReturnValue(null);

    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(makeRequest({ answers: VALID_ANSWERS, consent: true }));

    expect(res.status).toBe(401);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();
  });

  it("consent ontbreekt → 400, GEEN insert", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS }, "signed-cookie-value"),
    );

    expect(res.status).toBe(400);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();
  });

  it("ongeldig answers-formaat → 400, GEEN insert", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ answers: "nope", consent: true }, "signed-cookie-value"),
    );

    expect(res.status).toBe(400);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();
  });

  it("consent-insert DB-fout → 500, log-insert NIET aangeroepen", async () => {
    mockConsentInsert.mockResolvedValue({ error: { message: "db error" } });

    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true }, "signed-cookie-value"),
    );

    expect(res.status).toBe(500);
    expect(mockLogInsert).not.toHaveBeenCalled();
  });
});
