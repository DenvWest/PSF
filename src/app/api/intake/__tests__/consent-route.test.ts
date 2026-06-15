import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockConsumeRateLimit = vi.hoisted(() => vi.fn());
const mockRevoke = vi.hoisted(() => vi.fn());
const mockVerifyCookie = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: mockConsumeRateLimit,
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({ limit: 5, windowMs: 60_000 }),
}));
vi.mock("@/lib/intake-session-cookie", () => ({
  INTAKE_SESSION_COOKIE_NAME: "psf_intake_session",
  verifySignedIntakeSessionCookie: mockVerifyCookie,
}));
vi.mock("@/lib/intake-consent-revoke", () => ({
  revokeIntakeConsentForSession: mockRevoke,
}));
vi.mock("@/lib/events", () => ({ emitEvent: vi.fn() }));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({}),
}));

describe("DELETE /api/intake/consent rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyCookie.mockReturnValue("session-abc");
    mockConsumeRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 30,
      remaining: 0,
    });
  });

  it("returns 429 with Retry-After when rate limit exceeded", async () => {
    const { DELETE } = await import("@/app/api/intake/consent/route");
    const request = new NextRequest("http://localhost/api/intake/consent", {
      method: "DELETE",
      headers: {
        cookie: "psf_intake_session=signed-value",
      },
    });

    const res = await DELETE(request);

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Te veel pogingen. Probeer het later opnieuw.");
    expect(mockConsumeRateLimit).toHaveBeenCalledWith(
      "intake_consent_delete:session-abc",
      { limit: 5, windowMs: 60_000 },
    );
    expect(mockRevoke).not.toHaveBeenCalled();
  });
});
