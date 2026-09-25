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
  mockVerifyTurnstile,
  mockGetAccount,
  mockAttributeLead,
  mockRollback,
  mockSessionInsert,
  mockSessionInsertResult,
} = vi.hoisted(() => ({
  mockConsentInsert: vi.fn(),
  mockLogInsert: vi.fn(),
  mockPrevLogSelect: vi.fn(),
  mockVerifyCookie: vi.fn(),
  mockEmitEvent: vi.fn(),
  mockVerifyTurnstile: vi.fn(),
  mockGetAccount: vi.fn(),
  mockAttributeLead: vi.fn(),
  mockRollback: vi.fn(),
  mockSessionInsert: vi.fn(),
  mockSessionInsertResult: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({}),
}));
vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: () => "127.0.0.1",
  verifyTurnstileToken: mockVerifyTurnstile,
}));
vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: mockGetAccount,
}));
vi.mock("@/lib/affiliate/conversions", () => ({
  attributeIntakeLead: mockAttributeLead,
}));
vi.mock("@/lib/intake-session-rollback", () => ({
  rollbackIntakeSession: mockRollback,
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
  signIntakeSessionId: (id: string) => `signed.${id}`,
  intakeSessionCookieOptions: () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60,
  }),
}));
vi.mock("@/lib/events", () => ({
  emitEvent: mockEmitEvent,
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table === "consent_records") return { insert: mockConsentInsert };
      if (table === "intake_sessions") {
        return {
          insert: (row: unknown) => {
            mockSessionInsert(row);
            return { select: () => ({ single: mockSessionInsertResult }) };
          },
        };
      }
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
  nutsSeedsLegumes: 1,
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
      lifestyleExtras: unknown[];
      score: number;
      band: { id: string };
    };
    expect(Array.isArray(data.estimate)).toBe(true);
    expect(data.estimate.length).toBeGreaterThan(0);
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBe(data.estimate.length);
    expect(Array.isArray(data.advice)).toBe(true);
    expect(Array.isArray(data.lifestyleExtras)).toBe(true);
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

// ---------------------------------------------------------------------------
// Nieuwe sessie vanuit de check (BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md §3.3)
// ---------------------------------------------------------------------------

const NEW_SESSION_ID = "770e8400-e29b-41d4-a716-446655440000";

describe("POST /api/intake/nutrition-log — zonder sessie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CHECK_SESSION_CREATE_ENABLED", "true");
    vi.stubEnv("COOKIE_SECRET", "test-secret");
    mockVerifyCookie.mockReturnValue(null);
    mockConsentInsert.mockResolvedValue({ error: null });
    mockLogInsert.mockResolvedValue({ error: null });
    mockPrevLogSelect.mockResolvedValue({ data: null });
    mockEmitEvent.mockResolvedValue(undefined);
    mockVerifyTurnstile.mockResolvedValue({ ok: true });
    mockGetAccount.mockResolvedValue(null);
    mockAttributeLead.mockResolvedValue(undefined);
    mockRollback.mockResolvedValue(undefined);
    mockSessionInsertResult.mockResolvedValue({ data: { id: NEW_SESSION_ID }, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("zonder token blijft het een 401 — een oude client toont zo nog zijn doorverwijzing", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(makeRequest({ answers: VALID_ANSWERS, consent: true }));

    expect(res.status).toBe(401);
    expect(mockSessionInsert).not.toHaveBeenCalled();
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
  });

  it("vlag uit → 401, ook mét token", async () => {
    vi.stubEnv("CHECK_SESSION_CREATE_ENABLED", "false");
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true, turnstileToken: "tok" }),
    );

    expect(res.status).toBe(401);
    expect(mockSessionInsert).not.toHaveBeenCalled();
  });

  it("mislukte botcheck → 403, niets ingevoegd", async () => {
    mockVerifyTurnstile.mockResolvedValue({ ok: false, reason: "invalid" });
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true, turnstileToken: "tok" }),
    );

    expect(res.status).toBe(403);
    expect(mockVerifyTurnstile).toHaveBeenCalledWith(
      expect.objectContaining({ token: "tok", expectedAction: "nutrition_check_save" }),
    );
    expect(mockSessionInsert).not.toHaveBeenCalled();
    expect(mockLogInsert).not.toHaveBeenCalled();
  });

  it("honeypot gevuld → 400, geen botcheck en niets ingevoegd", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({
        answers: VALID_ANSWERS,
        consent: true,
        turnstileToken: "tok",
        website: "spam.example",
      }),
    );

    expect(res.status).toBe(400);
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
    expect(mockSessionInsert).not.toHaveBeenCalled();
  });

  it("geldige botcheck → sessie 'nutrition', toestemming, log, lead en cookie", async () => {
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true, turnstileToken: "tok" }),
    );

    expect(res.status).toBe(200);
    expect(mockSessionInsert).toHaveBeenCalledWith({
      organization_id: "org-uuid-default",
      session_kind: "nutrition",
      account_id: null,
      referral_source: null,
    });

    expect(mockConsentInsert).toHaveBeenCalledOnce();
    const consentArg = mockConsentInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(consentArg.session_id).toBe(NEW_SESSION_ID);
    expect(consentArg.consent_type).toBe("nutrition_intake_logging");

    const logArg = mockLogInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(logArg.session_id).toBe(NEW_SESSION_ID);
    expect(mockPrevLogSelect).not.toHaveBeenCalled();

    expect(mockAttributeLead).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sessionId: NEW_SESSION_ID }),
    );

    const event = mockEmitEvent.mock.calls.find(
      (call) => (call[0] as { eventType: string }).eventType === "measurement.checkin_completed",
    )?.[0] as { payload: Record<string, unknown> };
    expect(event.payload).toMatchObject({ session_created: true, session_kind: "nutrition" });

    expect(res.headers.get("set-cookie")).toContain(`psf_intake_sid=signed.${NEW_SESSION_ID}`);
    expect(mockRollback).not.toHaveBeenCalled();
  });

  it("ingelogd zonder cookie → sessie hangt aan het account, met bewaar-toestemming", async () => {
    mockGetAccount.mockResolvedValue({ id: "account-1" });
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true, turnstileToken: "tok" }),
    );

    expect(res.status).toBe(200);
    expect(mockSessionInsert).toHaveBeenCalledWith(
      expect.objectContaining({ session_kind: "nutrition", account_id: "account-1" }),
    );
    const consentTypes = mockConsentInsert.mock.calls.map(
      (call) => (call[0] as { consent_type: string }).consent_type,
    );
    expect(consentTypes).toEqual(["nutrition_intake_logging", "account_storage"]);
  });

  it("log-insert faalt → de nieuwe sessie wordt teruggedraaid, geen lead, geen cookie", async () => {
    mockLogInsert.mockResolvedValue({ error: { message: "db error" } });
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true, turnstileToken: "tok" }),
    );

    expect(res.status).toBe(500);
    expect(mockRollback).toHaveBeenCalledWith(expect.anything(), NEW_SESSION_ID);
    expect(mockAttributeLead).not.toHaveBeenCalled();
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("met bestaande cookie verandert er niets: geen botcheck, geen nieuwe sessie", async () => {
    mockVerifyCookie.mockReturnValue(VALID_SESSION_ID);
    const { POST } = await import("@/app/api/intake/nutrition-log/route");
    const res = await POST(
      makeRequest({ answers: VALID_ANSWERS, consent: true }, "signed-cookie-value"),
    );

    expect(res.status).toBe(200);
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
    expect(mockSessionInsert).not.toHaveBeenCalled();
    expect(mockAttributeLead).not.toHaveBeenCalled();
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
