import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockConsentInsert, mockEmitEvent } = vi.hoisted(() => ({
  mockConsentInsert: vi.fn(),
  mockEmitEvent: vi.fn(),
}));

vi.mock("@/lib/client-ip", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/events", () => ({ emitEvent: mockEmitEvent }));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({
      insert: mockConsentInsert,
    }),
  }),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/consent/analytics/route";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/consent/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "vitest",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/consent/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.COOKIE_SECRET = "test-cookie-secret";
    mockConsentInsert.mockReturnValue({
      select: () => ({
        limit: () =>
          Promise.resolve({
            data: [
              {
                id: "11111111-1111-1111-1111-111111111111",
                granted_at: "2026-07-04T10:00:00.000Z",
              },
            ],
            error: null,
          }),
      }),
    });
  });

  it("accepteert grant en zet analytics + marketing cookies", async () => {
    const res = await POST(
      makeRequest({ statistics: true, marketing: true, source: "banner" }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok: boolean;
      consentRecordId: string;
      marketing: boolean;
    };
    expect(json.ok).toBe(true);
    expect(json.marketing).toBe(true);

    const setCookie = res.headers.getSetCookie?.() ?? [];
    expect(setCookie.some((c) => c.startsWith("psf_analytics_state=granted"))).toBe(true);
    expect(setCookie.some((c) => c.startsWith("psf_marketing_state=granted"))).toBe(true);
    expect(mockConsentInsert).toHaveBeenCalled();
  });

  it("backward compat: granted zet alleen statistics", async () => {
    const res = await POST(makeRequest({ granted: true, source: "banner" }));
    expect(res.status).toBe(200);
    const setCookie = res.headers.getSetCookie?.() ?? [];
    expect(setCookie.some((c) => c.startsWith("psf_analytics_state=granted"))).toBe(true);
    expect(setCookie.some((c) => c.startsWith("psf_marketing_state=denied"))).toBe(true);
  });

  it("weigert ongeldige body", async () => {
    const res = await POST(makeRequest({ source: "banner" }));
    expect(res.status).toBe(400);
  });
});
