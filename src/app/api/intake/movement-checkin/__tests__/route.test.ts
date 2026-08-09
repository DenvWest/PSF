import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockEmitEvent, mockLoadBaselineSnapshot, mockResolveSessionId, tables } =
  vi.hoisted(() => ({
    mockEmitEvent: vi.fn(),
    mockLoadBaselineSnapshot: vi.fn(),
    mockResolveSessionId: vi.fn(),
    tables: {
      sessionAnswers: {} as Record<string, unknown>,
      sessionReadFails: false,
      answersUpdateFails: false,
      updateCalls: 0,
      checkinRows: [] as Record<string, unknown>[],
    },
  }));

vi.mock("@/lib/events", () => ({ emitEvent: mockEmitEvent }));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi
    .fn()
    .mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: () => ({}) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/organization", () => ({
  getDefaultOrganizationId: () => "00000000-0000-0000-0000-000000000001",
}));
vi.mock("@/lib/intake-session-cookie", () => ({
  INTAKE_SESSION_COOKIE_NAME: "psf_intake_session",
  verifySignedIntakeSessionCookie: () => SESSION_ID,
}));
vi.mock("@/lib/intake-session-resolve", () => ({
  resolveActiveIntakeSessionId: mockResolveSessionId,
}));
vi.mock("@/lib/intake-baseline", () => ({
  loadBaselineSnapshot: mockLoadBaselineSnapshot,
}));
vi.mock("@/lib/supabase-admin", () => ({ createSupabaseAdmin: () => makeAdmin() }));

// ---------------------------------------------------------------------------
// Supabase-admin dubbel — alleen de paden die deze route aanraakt
// ---------------------------------------------------------------------------

const SESSION_ID = "22222222-2222-4222-8222-222222222222";

function makeAdmin() {
  return {
    from(table: string) {
      if (table === "consent_records") {
        return { insert: async () => ({ error: null }) };
      }

      if (table === "intake_domain_checkin") {
        return {
          insert: async (row: Record<string, unknown>) => {
            tables.checkinRows.push(row);
            return { error: null };
          },
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({ maybeSingle: async () => ({ data: null }) }),
                }),
              }),
            }),
          }),
        };
      }

      if (table === "intake_sessions") {
        return {
          select: () => ({
            eq: () => ({
              single: async () =>
                tables.sessionReadFails
                  ? { data: null, error: { message: "read failed" } }
                  : { data: { answers: tables.sessionAnswers }, error: null },
            }),
          }),
          update: (patch: Record<string, unknown>) => ({
            eq: async () => {
              tables.updateCalls += 1;
              if (tables.answersUpdateFails) {
                return { error: { message: "update failed" } };
              }
              tables.sessionAnswers = patch.answers as Record<string, unknown>;
              return { error: null };
            },
          }),
        };
      }

      throw new Error(`Onverwachte tabel in test: ${table}`);
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FULL_REPORT = {
  MOV2_STR: 4,
  MOV2_CARD: 3,
  MOV2_VIG: 2,
  MOV2_SIT: 5,
  MOV2_COND: 3,
  RCV_FEEL: 4,
  MOV2_PAIN: 1,
  MOV2_MOB: 3,
  MOV2_FUNC: 4,
  MOV2_CONSIST: 2,
  MOV2_MOTIV: 5,
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/intake/movement-checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function post(body: unknown) {
  const { POST } = await import("../route");
  return POST(makeRequest(body));
}

describe("POST /api/intake/movement-checkin — answers-sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    tables.sessionAnswers = { MOV_CARD: 2, MOV_STR: 3 };
    tables.sessionReadFails = false;
    tables.answersUpdateFails = false;
    tables.updateCalls = 0;
    tables.checkinRows = [];
    mockResolveSessionId.mockResolvedValue(SESSION_ID);
    mockLoadBaselineSnapshot.mockResolvedValue(null);
    mockEmitEvent.mockResolvedValue(undefined);
  });

  it("schrijft de vier huidige-beeld-velden naar intake_sessions.answers bij een full check", async () => {
    const response = await post({ consent: true, mode: "full", report: FULL_REPORT });

    expect(response.status).toBe(200);
    expect(tables.sessionAnswers).toMatchObject({
      MOV_CARD: 2,
      MOV_STR: 3,
      MOV2_CARD: 3,
      MOV2_VIG: 2,
      MOV2_SIT: 5,
      MOV2_STR: 4,
    });
  });

  it("laat de overige rapportvelden buiten de answers", async () => {
    await post({ consent: true, mode: "full", report: FULL_REPORT });

    expect(tables.sessionAnswers).not.toHaveProperty("MOV2_COND");
    expect(tables.sessionAnswers).not.toHaveProperty("RCV_FEEL");
    expect(tables.sessionAnswers).not.toHaveProperty("MOV2_MOTIV");
  });

  it("raakt de answers niet aan bij een pulse check", async () => {
    const response = await post({
      consent: true,
      mode: "pulse",
      report: { RCV_FEEL: 3 },
    });

    expect(response.status).toBe(200);
    expect(tables.updateCalls).toBe(0);
    expect(tables.sessionAnswers).toEqual({ MOV_CARD: 2, MOV_STR: 3 });
  });

  it("overschrijft een eerdere beweegcheck — laatste wint", async () => {
    tables.sessionAnswers = {
      MOV_CARD: 2,
      MOV2_CARD: 1,
      MOV2_VIG: 1,
      MOV2_SIT: 1,
      MOV2_STR: 1,
    };

    await post({ consent: true, mode: "full", report: FULL_REPORT });

    expect(tables.sessionAnswers).toMatchObject({
      MOV_CARD: 2,
      MOV2_CARD: 3,
      MOV2_VIG: 2,
      MOV2_SIT: 5,
      MOV2_STR: 4,
    });
  });

  it("houdt de check-in geslaagd als de answers-update faalt", async () => {
    tables.answersUpdateFails = true;

    const response = await post({ consent: true, mode: "full", report: FULL_REPORT });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.mode).toBe("full");
    expect(payload.assessment).toBeDefined();
    expect(tables.checkinRows).toHaveLength(1);
  });

  it("houdt de check-in geslaagd als de answers-read faalt", async () => {
    tables.sessionReadFails = true;

    const response = await post({ consent: true, mode: "full", report: FULL_REPORT });

    expect(response.status).toBe(200);
    expect(tables.updateCalls).toBe(0);
  });
});
