import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockConsumeRateLimit = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: mockConsumeRateLimit,
}));
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({ limit: 30, windowMs: 60_000 }),
}));
vi.mock("@/lib/intake-strategy", () => ({
  createIntakeStrategy: () => ({
    computeResults: () => ({
      scores: {},
      urgency: "low",
      profile: "test",
      advice: [],
      signals: [],
    }),
  }),
}));

function makeRequest(apiKey: string, body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/partner/intake", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/partner/intake rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PARTNER_API_KEYS", "valid-key:11111111-1111-1111-1111-111111111111");
    vi.stubEnv("ORGANIZATION_ID", "11111111-1111-1111-1111-111111111111");
    mockConsumeRateLimit.mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
      remaining: 29,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 429 with Retry-After when rate limit exceeded", async () => {
    mockConsumeRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 42,
      remaining: 0,
    });

    const { POST } = await import("@/app/api/partner/intake/route");
    const res = await POST(
      makeRequest("valid-key", { answers: { q1: "a" } }),
    );
    if (!res) {
      throw new Error("POST returned no response");
    }

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("42");
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Rate limit exceeded");
    expect(mockConsumeRateLimit).toHaveBeenCalledWith(
      "partner_intake:valid-key",
      { limit: 30, windowMs: 60_000 },
    );
  });
});
