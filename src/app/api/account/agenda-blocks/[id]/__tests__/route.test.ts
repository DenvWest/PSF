import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockGetAccountFromCookie, mockEmitEvent, mockMaybeSingle, mockUpdate } =
  vi.hoisted(() => ({
    mockGetAccountFromCookie: vi.fn(),
    mockEmitEvent: vi.fn(),
    mockMaybeSingle: vi.fn(),
    mockUpdate: vi.fn(),
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
vi.mock("@/lib/rate-limit-config", () => ({
  getRateLimitConfig: () => ({}),
}));
vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: () => "127.0.0.1",
}));

// Fluent chain die exact matcht met updateBlock()/restoreBlock() in agenda-blocks.ts:
// .from().update().eq().eq().is()/.not().select().maybeSingle()
function buildChain() {
  const chain: Record<string, unknown> = {};
  chain.update = mockUpdate.mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.is = vi.fn().mockReturnValue(chain);
  chain.not = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = mockMaybeSingle;
  return chain;
}

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => buildChain(),
  }),
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

const BLOCK_ROW = {
  id: "22222222-2222-4222-8222-222222222222",
  date: "2026-08-05",
  category_id: "beweging",
  title: "Wandelen",
  start_time: "18:00",
  end_time: "18:30",
  source: "routine",
  status: "open",
  external_provider: null,
  external_ref: null,
  deleted_at: null,
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest(
    "http://localhost/api/account/agenda-blocks/22222222-2222-4222-8222-222222222222",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

function makeContext() {
  return { params: Promise.resolve({ id: BLOCK_ROW.id }) };
}

describe("PATCH /api/account/agenda-blocks/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccountFromCookie.mockResolvedValue(ACCOUNT);
    mockMaybeSingle.mockResolvedValue({ data: BLOCK_ROW, error: null });
  });

  it("niet ingelogd → 401, geen db-call", async () => {
    mockGetAccountFromCookie.mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/account/agenda-blocks/[id]/route");

    const res = await PATCH(makeRequest({ status: "done" }), makeContext());

    expect(res.status).toBe(401);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });

  it("eindtijd 24:00 → 400 Ongeldig eindtijd, geen emit", async () => {
    const { PATCH } = await import("@/app/api/account/agenda-blocks/[id]/route");

    const res = await PATCH(
      makeRequest({ startTime: "23:00", endTime: "24:00" }),
      makeContext(),
    );
    const body = (await res.json()) as { error: string };

    expect(res.status).toBe(400);
    expect(body.error).toBe("Ongeldig eindtijd.");
    expect(mockMaybeSingle).not.toHaveBeenCalled();
    expect(mockEmitEvent).not.toHaveBeenCalled();
  });

  it("categoryId in de body wordt genegeerd — geen allowlist, geen crash", async () => {
    const { PATCH } = await import("@/app/api/account/agenda-blocks/[id]/route");

    const res = await PATCH(
      makeRequest({ categoryId: "slaap", title: "Wandelen buiten" }),
      makeContext(),
    );

    expect(res.status).toBe(200);
    // update() krijgt alleen title + updated_at — categoryId zit er niet in.
    const patchArg = mockUpdate.mock.calls[0][0] as Record<string, unknown>;
    expect(patchArg).not.toHaveProperty("category_id");
    expect(patchArg.title).toBe("Wandelen buiten");
  });

  it("blok niet gevonden (maybeSingle geeft null) → 404", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const { PATCH } = await import("@/app/api/account/agenda-blocks/[id]/route");

    const res = await PATCH(makeRequest({ status: "done" }), makeContext());

    expect(res.status).toBe(404);
  });

  it("status-wijziging → emit agenda.block_toggled met done afgeleid uit status", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { ...BLOCK_ROW, status: "done" },
      error: null,
    });
    const { PATCH } = await import("@/app/api/account/agenda-blocks/[id]/route");

    const res = await PATCH(makeRequest({ status: "done" }), makeContext());

    expect(res.status).toBe(200);
    expect(mockEmitEvent).toHaveBeenCalledOnce();
    const call = mockEmitEvent.mock.calls[0][0] as {
      eventType: string;
      payload: Record<string, unknown>;
    };
    expect(call.eventType).toBe("agenda.block_toggled");
    expect(call.payload.done).toBe(true);
  });

  it("geldige verplaatsing binnen de dag → 200, emit agenda.block_updated", async () => {
    const { PATCH } = await import("@/app/api/account/agenda-blocks/[id]/route");

    const res = await PATCH(
      makeRequest({ startTime: "23:00", endTime: "23:45" }),
      makeContext(),
    );

    expect(res.status).toBe(200);
    expect(mockEmitEvent).toHaveBeenCalledOnce();
    const call = mockEmitEvent.mock.calls[0][0] as { eventType: string };
    expect(call.eventType).toBe("agenda.block_updated");
  });
});
