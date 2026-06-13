import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  mockHasActiveGuideSequence,
  mockScheduleGuideNurtureSequence,
  mockHasActiveMainNurture,
  mockHasActiveIntakeMarketingEmailConsent,
  mockConsumeRateLimit,
  mockGuideOptInInsert,
} = vi.hoisted(() => ({
  mockHasActiveGuideSequence: vi.fn(),
  mockScheduleGuideNurtureSequence: vi.fn(),
  mockHasActiveMainNurture: vi.fn(),
  mockHasActiveIntakeMarketingEmailConsent: vi.fn(),
  mockConsumeRateLimit: vi.fn(),
  mockGuideOptInInsert: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: mockConsumeRateLimit,
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({}),
}));
vi.mock("@/lib/client-ip", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/events", () => ({ emitEvent: vi.fn() }));
vi.mock("@/lib/intake-session-cookie", () => ({
  INTAKE_SESSION_COOKIE_NAME: "psf_intake_session",
  verifySignedIntakeSessionCookie: vi.fn(() => null),
}));
vi.mock("@/lib/intake-marketing-consent-server", () => ({
  hasActiveIntakeMarketingEmailConsent: mockHasActiveIntakeMarketingEmailConsent,
}));
vi.mock("@/lib/nurture", () => ({
  hasActiveMainNurture: mockHasActiveMainNurture,
}));
vi.mock("@/lib/guide-nurture", () => ({
  hasActiveGuideSequence: mockHasActiveGuideSequence,
  scheduleGuideNurtureSequence: mockScheduleGuideNurtureSequence,
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({
      insert: mockGuideOptInInsert,
    }),
  }),
}));

import { POST } from "@/app/api/gids/opt-in/route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/gids/opt-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  email: "lead@example.com",
  thema: "slaap",
  marketingConsent: true,
  turnstileToken: "token",
};

describe("POST /api/gids/opt-in nurture dedup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test";
    mockConsumeRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mockGuideOptInInsert.mockResolvedValue({ error: null });
    mockHasActiveGuideSequence.mockResolvedValue(false);
    mockHasActiveMainNurture.mockResolvedValue(false);
    mockHasActiveIntakeMarketingEmailConsent.mockResolvedValue(false);
    mockScheduleGuideNurtureSequence.mockResolvedValue(6);
  });

  it("active main nurture: one-off PDF, no full guide sequence", async () => {
    mockHasActiveMainNurture.mockResolvedValue(true);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockScheduleGuideNurtureSequence).toHaveBeenCalledWith({
      email: "lead@example.com",
      thema: "slaap",
      oneOffOnly: true,
    });
  });

  it("cold lead: full guide sequence unchanged", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockScheduleGuideNurtureSequence).toHaveBeenCalledWith({
      email: "lead@example.com",
      thema: "slaap",
      oneOffOnly: false,
    });
  });

  it("existing guide sequence without main nurture: skips rescheduling", async () => {
    mockHasActiveGuideSequence.mockResolvedValue(true);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockScheduleGuideNurtureSequence).not.toHaveBeenCalled();
  });
});
