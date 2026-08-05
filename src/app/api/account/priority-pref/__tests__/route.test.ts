import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const {
  mockGetAccountFromCookie,
  mockEmitEvent,
  mockGetAccountPriorityPref,
  mockDeleteAccountPriorityPref,
  mockLoadAccountDashboardData,
} = vi.hoisted(() => ({
  mockGetAccountFromCookie: vi.fn(),
  mockEmitEvent: vi.fn(),
  mockGetAccountPriorityPref: vi.fn(),
  mockDeleteAccountPriorityPref: vi.fn(),
  mockLoadAccountDashboardData: vi.fn(),
}));

vi.mock("@/lib/account-server", () => ({
  getAccountFromCookie: mockGetAccountFromCookie,
}));
vi.mock("@/lib/events", () => ({ emitEvent: mockEmitEvent }));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimitForIp: vi
    .fn()
    .mockResolvedValue({ allowed: true, retryAfterSeconds: 0, remaining: 999 }),
}));
vi.mock("@/lib/rate-limit-config", () => ({ getRateLimitConfig: () => ({}) }));
vi.mock("@/lib/turnstile-verify", () => ({ getClientIp: () => "127.0.0.1" }));
vi.mock("@/lib/supabase-admin", () => ({ createSupabaseAdmin: () => ({}) }));
vi.mock("@/lib/account-dashboard", () => ({
  loadAccountDashboardData: mockLoadAccountDashboardData,
}));
vi.mock("@/lib/account-priority-pref", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/account-priority-pref")>()),
  getAccountPriorityPref: mockGetAccountPriorityPref,
  deleteAccountPriorityPref: mockDeleteAccountPriorityPref,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCOUNT = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "dennis@example.com",
  status: "active",
  organization_id: "00000000-0000-0000-0000-000000000001",
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/account/priority-pref", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe('POST /api/account/priority-pref — action "reset"', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccountFromCookie.mockResolvedValue(ACCOUNT);
    mockLoadAccountDashboardData.mockResolvedValue({ current: null, answers: null });
    mockGetAccountPriorityPref.mockResolvedValue({
      pillarId: "slaap",
      source: "user_selected",
    });
    mockDeleteAccountPriorityPref.mockResolvedValue(undefined);
  });

  it("wist de pref en meldt dat durable met source reset", async () => {
    const { POST } = await import("@/app/api/account/priority-pref/route");

    const res = await POST(makeRequest({ action: "reset", surface: "account_settings" }));
    const body = (await res.json()) as { ok: boolean; pillarId: string | null };

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true, pillarId: null });
    expect(mockDeleteAccountPriorityPref).toHaveBeenCalledWith(
      expect.anything(),
      ACCOUNT.id,
    );
    expect(mockEmitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "dashboard.priority_selected",
        organizationId: ACCOUNT.organization_id,
        payload: expect.objectContaining({
          pillar_id: null,
          previous_pillar_id: "slaap",
          source: "reset",
          surface: "account_settings",
        }),
      }),
    );
  });

  it("zonder surface valt het event terug op dashboard", async () => {
    const { POST } = await import("@/app/api/account/priority-pref/route");

    await POST(makeRequest({ action: "reset" }));

    expect(mockEmitEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ surface: "dashboard" }),
      }),
    );
  });

  it("niet ingelogd → 401, geen delete en geen event", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);
    const { POST } = await import("@/app/api/account/priority-pref/route");

    const res = await POST(makeRequest({ action: "reset" }));

    expect(res.status).toBe(401);
    expect(mockDeleteAccountPriorityPref).not.toHaveBeenCalled();
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });
});
