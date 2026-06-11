import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks (vi.hoisted zodat ze vóór imports beschikbaar zijn)
// ---------------------------------------------------------------------------

const {
  mockConsentInsert,
  mockLogInsert,
  mockVerifyCookie,
} = vi.hoisted(() => ({
  mockConsentInsert: vi.fn(),
  mockLogInsert: vi.fn(),
  mockVerifyCookie: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: () => ({ allowed: true, retryAfterSeconds: 0 }),
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
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table === "consent_records") return { insert: mockConsentInsert };
      if (table === "intake_intake_log") return { insert: mockLogInsert };
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    },
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_SESSION_ID = "550e8400-e29b-41d4-a716-446655440000";

const VALID_REPORT = {
  oilyFishPerWeek: 0,
  proteinMealsPerDay: 1,
  vegFruitPerDay: 1,
  dairyServingsPerDay: 1,
  meatLegumesPerDay: 1,
  sunExposurePerWeek: 1,
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
    mockVerifyCookie.mockReturnValue(VALID_SESSION_ID);
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("geldige sessie + consent true + report → consent-rij en log-rij ge-insert; response 200 met estimate, statements, advice", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ report: VALID_REPORT, consent: true }, "signed-cookie-value"),
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
    expect(logArg.raw_inputs).toEqual(VALID_REPORT);
    expect(Array.isArray(logArg.estimate)).toBe(true);
    expect(typeof logArg.estimate_version).toBe("string");

    const data = (await res.json()) as {
      estimate: unknown[];
      statements: string[];
      advice: unknown[];
    };
    expect(Array.isArray(data.estimate)).toBe(true);
    expect(data.estimate.length).toBeGreaterThan(0);
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBe(data.estimate.length);
    expect(Array.isArray(data.advice)).toBe(true);
  });

  it("estimate in response en log-insert komt uit estimateNutritionIntake (server-berekend), niet uit body", async () => {
    const { estimateNutritionIntake } = await import("@/lib/nutrition-intake-estimate");
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const bodyWithFakeEstimate = {
      report: VALID_REPORT,
      consent: true,
      estimate: [{ nutrient: "protein", band: "meets", referenceLabel: "FAKE" }],
    };

    const res = await POST(
      makeRequest(bodyWithFakeEstimate, "signed-cookie-value"),
    );

    expect(res.status).toBe(200);

    const expected = estimateNutritionIntake(VALID_REPORT);
    const logArg = mockLogInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(logArg.estimate).toEqual(expected);

    const data = (await res.json()) as { estimate: unknown };
    expect(data.estimate).toEqual(expected);
  });

  it("consent false → 400, GEEN insert", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ report: VALID_REPORT, consent: false }, "signed-cookie-value"),
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

    const res = await POST(
      makeRequest({ report: VALID_REPORT, consent: true }),
    );

    expect(res.status).toBe(401);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();
  });

  it("consent ontbreekt → 400, GEEN insert", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ report: VALID_REPORT }, "signed-cookie-value"),
    );

    expect(res.status).toBe(400);
    expect(mockConsentInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();
  });

  it("consent-insert DB-fout → 500, log-insert NIET aangeroepen", async () => {
    mockConsentInsert.mockResolvedValue({ error: { message: "db error" } });

    const { POST } = await import("@/app/api/intake/nutrition-log/route");

    const res = await POST(
      makeRequest({ report: VALID_REPORT, consent: true }, "signed-cookie-value"),
    );

    expect(res.status).toBe(500);
    expect(mockLogInsert).not.toHaveBeenCalled();
  });
});
