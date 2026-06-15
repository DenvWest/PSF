import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockEmitEvent, mockInsert, mockLoadSession, mockGetPrimaryTheme } =
  vi.hoisted(() => ({
    mockEmitEvent: vi.fn(),
    mockInsert: vi.fn(),
    mockLoadSession: vi.fn(),
    mockGetPrimaryTheme: vi.fn(),
  }));

vi.mock("@/lib/events", () => ({ emitEvent: mockEmitEvent }));
vi.mock("@/lib/organization", () => ({
  getDefaultOrganizationId: () => "org-uuid-default",
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
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));
vi.mock("@/lib/intake-session-server", () => ({
  loadIntakeSessionPayloadBySessionId: mockLoadSession,
}));
vi.mock("@/lib/primary-theme", () => ({
  getPrimaryTheme: mockGetPrimaryTheme,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_SESSION_ID = "550e8400-e29b-41d4-a716-446655440000";

const MOCK_SESSION = {
  profile: "Stressdrager",
  scores: {
    stress_score: 25,
    sleep_score: 50,
    energy_score: 50,
    nutrition_score: 50,
    movement_score: 50,
    recovery_score: 50,
  },
  answers: {},
};

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/intake/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/intake/feedback — profile.recognition event", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockEmitEvent.mockResolvedValue(undefined);
    mockGetPrimaryTheme.mockReturnValue("stress");
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("geldige sessie + rating positive → emitEvent één keer met profile.recognition, payload zonder comment", async () => {
    mockLoadSession.mockResolvedValue({ ok: true, session: MOCK_SESSION });

    const { POST } = await import("@/app/api/intake/feedback/route");

    const res = await POST(
      makeRequest({
        rating: "positive",
        comment: "Heel herkenbaar — dit is PII",
        sessionId: VALID_SESSION_ID,
      }) as Parameters<typeof POST>[0],
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).toHaveBeenCalledOnce();

    const call = mockEmitEvent.mock.calls[0][0] as {
      eventType: string;
      sessionId: string;
      payload: Record<string, unknown>;
      deliveredTo: string[];
    };
    expect(call.eventType).toBe("profile.recognition");
    expect(call.sessionId).toBe(VALID_SESSION_ID);
    expect(call.payload.rating).toBe("positive");
    expect(call.payload.profile_label).toBe("Stressdrager");
    expect(call.payload.primary_domain).toBe("stress");
    expect("comment" in call.payload).toBe(false);
  });

  it("sessionId null → emitEvent NIET aangeroepen, response 200", async () => {
    const { POST } = await import("@/app/api/intake/feedback/route");

    const res = await POST(
      makeRequest({ rating: "negative" }) as Parameters<typeof POST>[0],
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).not.toHaveBeenCalled();
    expect(mockLoadSession).not.toHaveBeenCalled();
  });

  it("loaded.session === null (anon/herroepen) → emitEvent NIET aangeroepen, response 200", async () => {
    mockLoadSession.mockResolvedValue({ ok: true, session: null });

    const { POST } = await import("@/app/api/intake/feedback/route");

    const res = await POST(
      makeRequest({
        rating: "positive",
        sessionId: VALID_SESSION_ID,
      }) as Parameters<typeof POST>[0],
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });

  it("emitEvent gooit een error → response is nog steeds 200", async () => {
    mockLoadSession.mockResolvedValue({ ok: true, session: MOCK_SESSION });
    mockEmitEvent.mockRejectedValue(new Error("webhook down"));

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/intake/feedback/route");

    const res = await POST(
      makeRequest({
        rating: "positive",
        sessionId: VALID_SESSION_ID,
      }) as Parameters<typeof POST>[0],
    );

    expect(res.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith(
      "[api/intake/feedback] recognition event failed:",
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
