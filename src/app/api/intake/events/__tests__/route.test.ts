import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockEmitEvent, mockGetAnalyticsConsent, mockConsumeRateLimitForIp } =
  vi.hoisted(() => ({
    mockEmitEvent: vi.fn(),
    mockGetAnalyticsConsent: vi.fn(),
    mockConsumeRateLimitForIp: vi.fn(),
  }));

vi.mock("@/lib/events", () => ({
  emitEvent: mockEmitEvent,
  isDomainEventType: (value: string) =>
    [
      "intake.started",
      "intake.phase_completed",
      "intake.theme_revealed",
      "dashboard.first_checkin_started",
      "comparison.page_viewed",
    ].includes(value),
}));
vi.mock("@/lib/analytics-consent", () => ({
  getAnalyticsConsentFromRequest: mockGetAnalyticsConsent,
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: mockConsumeRateLimitForIp,
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({}),
}));
vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/intake-session-cookie", () => ({
  INTAKE_SESSION_COOKIE_NAME: "psf_intake_sid",
  verifySignedIntakeSessionCookie: () => null,
}));

import { POST } from "@/app/api/intake/events/route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/intake/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/intake/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAnalyticsConsent.mockReturnValue(true);
    mockConsumeRateLimitForIp.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
      remaining: 999,
    });
  });

  it("accepteert intake.phase_completed zonder sessie-cookie", async () => {
    const res = await POST(
      makeRequest({
        event_type: "intake.phase_completed",
        payload: { phase: "intro" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "intake.phase_completed",
        sessionId: null,
        payload: { phase: "intro" },
      }),
    );
  });

  it("accepteert intake.started zonder sessie-cookie", async () => {
    const res = await POST(
      makeRequest({
        event_type: "intake.started",
        payload: { source: "intake" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "intake.started",
        sessionId: null,
      }),
    );
  });

  it("dropt stil zonder analytics-consent", async () => {
    mockGetAnalyticsConsent.mockReturnValue(false);

    const res = await POST(
      makeRequest({
        event_type: "intake.phase_completed",
        payload: { phase: "symptoms" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });

  it("accepteert comparison.page_viewed van koud verkeer zonder sessie", async () => {
    const res = await POST(
      makeRequest({
        event_type: "comparison.page_viewed",
        payload: { slug: "magnesium", categorie: "magnesium" },
      }),
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "comparison.page_viewed",
        sessionId: null,
        payload: { slug: "magnesium", categorie: "magnesium" },
      }),
    );
  });

  it("telt een paginaweergave uit een eigen emmer, niet uit het intake-budget", async () => {
    await POST(
      makeRequest({
        event_type: "comparison.page_viewed",
        payload: { slug: "zink" },
      }),
    );
    expect(mockConsumeRateLimitForIp).toHaveBeenCalledWith(
      "comparison_view",
      expect.anything(),
      expect.anything(),
    );

    mockConsumeRateLimitForIp.mockClear();

    await POST(
      makeRequest({ event_type: "intake.started", payload: {} }),
    );
    expect(mockConsumeRateLimitForIp).toHaveBeenCalledWith(
      "intake_session",
      expect.anything(),
      expect.anything(),
    );
  });

  it("limiteert een onleesbare body alsnog, uit de strengste emmer", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/intake/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ dit is geen json",
      }),
    );

    expect(res.status).toBe(400);
    expect(mockConsumeRateLimitForIp).toHaveBeenCalledWith(
      "intake_session",
      expect.anything(),
      expect.anything(),
    );
  });

  it("geeft 429 zodra de emmer leeg is", async () => {
    mockConsumeRateLimitForIp.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 42,
      remaining: 0,
    });

    const res = await POST(
      makeRequest({ event_type: "comparison.page_viewed", payload: { slug: "zink" } }),
    );

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });

  it("weigert intake.theme_revealed zonder sessie-cookie", async () => {
    const res = await POST(
      makeRequest({
        event_type: "intake.theme_revealed",
        payload: { theme_slug: "sleep" },
      }),
    );

    expect(res.status).toBe(401);
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });
});
