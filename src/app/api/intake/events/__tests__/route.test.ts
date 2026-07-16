import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockEmitEvent, mockGetAnalyticsConsent } = vi.hoisted(() => ({
  mockEmitEvent: vi.fn(),
  mockGetAnalyticsConsent: vi.fn(),
}));

vi.mock("@/lib/events", () => ({
  emitEvent: mockEmitEvent,
  isDomainEventType: (value: string) =>
    [
      "intake.started",
      "intake.phase_completed",
      "intake.theme_revealed",
      "dashboard.first_checkin_started",
    ].includes(value),
}));
vi.mock("@/lib/analytics-consent", () => ({
  getAnalyticsConsentFromRequest: mockGetAnalyticsConsent,
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi
    .fn()
    .mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
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
