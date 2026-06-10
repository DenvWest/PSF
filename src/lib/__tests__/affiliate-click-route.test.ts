import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildNurtureAttributionToken,
} from "@/lib/nurture-attribution-token";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const { mockEmitEvent, mockInsert } = vi.hoisted(() => ({
  mockEmitEvent: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("@/lib/events", () => ({ emitEvent: mockEmitEvent }));
vi.mock("@/lib/organization", () => ({
  getDefaultOrganizationId: () => "org-uuid-default",
}));
vi.mock("@/lib/rate-limit", () => ({
  consumeRateLimit: () => ({ allowed: true, retryAfterSeconds: 0 }),
}));
vi.mock("@/lib/turnstile-verify", () => ({
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: () => ({
      insert: mockInsert,
    }),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/affiliate/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/affiliate/click — zonder nurture-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    process.env.COOKIE_SECRET = "test-secret-min-32-bytes-long!!xx";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("emitEvent krijgt alleen categorie + comparison_slug als nt ontbreekt", async () => {
    const { POST } = await import("@/app/api/affiliate/click/route");

    const req = makeRequest({
      product_id: "magnesium",
      categorie: "sleep",
    });

    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);

    const emitCall = mockEmitEvent.mock.calls[0]?.[0] as {
      eventType: string;
      payload: Record<string, unknown>;
    };
    expect(emitCall.eventType).toBe("affiliate.click");
    expect(emitCall.payload.categorie).toBe("sleep");
    expect(emitCall.payload.comparison_slug).toBe("magnesium");
    expect(emitCall.payload.session_id).toBeUndefined();
    expect(emitCall.payload.sequence_day).toBeUndefined();
    expect(emitCall.payload.profile_label).toBeUndefined();
  });

  it("affiliate_clicks insert blijft ongewijzigd (geen nt-veld)", async () => {
    const { POST } = await import("@/app/api/affiliate/click/route");

    const req = makeRequest({ product_id: "omega3", categorie: "energy" });
    await POST(req as Parameters<typeof POST>[0]);

    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(insertArg.product_id).toBe("omega3");
    expect("nt" in insertArg).toBe(false);
  });
});

describe("POST /api/affiliate/click — met geldig nurture-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    process.env.COOKIE_SECRET = "test-secret-min-32-bytes-long!!xx";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("emitEvent draagt session_id, sequence_day, profile_label en variant", async () => {
    const token = buildNurtureAttributionToken({
      sessionId: "session-uuid-abc",
      sequenceDay: 14,
      profileLabel: "Stressdrager",
      variant: "variant-b",
    });

    const { POST } = await import("@/app/api/affiliate/click/route");

    const req = makeRequest({
      product_id: "ashwagandha",
      categorie: "stress",
      nt: token,
    });

    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);

    const emitCall = mockEmitEvent.mock.calls[0]?.[0] as {
      eventType: string;
      payload: Record<string, unknown>;
    };
    expect(emitCall.eventType).toBe("affiliate.click");
    expect(emitCall.payload.comparison_slug).toBe("ashwagandha");
    expect(emitCall.payload.categorie).toBe("stress");
    expect(emitCall.payload.session_id).toBe("session-uuid-abc");
    expect(emitCall.payload.sequence_day).toBe(14);
    expect(emitCall.payload.profile_label).toBe("Stressdrager");
    expect(emitCall.payload.variant).toBe("variant-b");
  });

  it("affiliate_clicks insert is ongewijzigd — geen extra token-velden", async () => {
    const token = buildNurtureAttributionToken({
      sessionId: "session-uuid-xyz",
      sequenceDay: 21,
      profileLabel: "Onrustige Slaper",
      variant: null,
    });

    const { POST } = await import("@/app/api/affiliate/click/route");

    const req = makeRequest({ product_id: "magnesium", nt: token });
    await POST(req as Parameters<typeof POST>[0]);

    const insertArg = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect("session_id" in insertArg).toBe(false);
    expect("sequence_day" in insertArg).toBe(false);
    expect("nt" in insertArg).toBe(false);
  });

  it("payload bevat geen PII (geen email, geen naam)", async () => {
    const token = buildNurtureAttributionToken({
      sessionId: "session-uuid-pii-check",
      sequenceDay: 7,
      profileLabel: "Lage Batterij",
      variant: null,
    });

    const { POST } = await import("@/app/api/affiliate/click/route");

    const req = makeRequest({ product_id: "omega3", nt: token });
    await POST(req as Parameters<typeof POST>[0]);

    const emitCall = mockEmitEvent.mock.calls[0]?.[0] as {
      payload: Record<string, unknown>;
    };
    const payload = emitCall.payload;

    const ALLOWED_KEYS = new Set([
      "categorie",
      "comparison_slug",
      "session_id",
      "sequence_day",
      "profile_label",
      "variant",
    ]);
    for (const key of Object.keys(payload)) {
      expect(ALLOWED_KEYS.has(key), `Verboden payload-sleutel: ${key}`).toBe(true);
    }
  });
});

describe("POST /api/affiliate/click — ongeldig nurture-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    process.env.COOKIE_SECRET = "test-secret-min-32-bytes-long!!xx";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("ongeldig token → gedrag exact als zonder token (geen attributie)", async () => {
    const { POST } = await import("@/app/api/affiliate/click/route");

    const req = makeRequest({
      product_id: "magnesium",
      categorie: "sleep",
      nt: "v1.tampered.invalidsig",
    });

    const res = await POST(req as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);

    const emitCall = mockEmitEvent.mock.calls[0]?.[0] as {
      payload: Record<string, unknown>;
    };
    expect(emitCall.payload.session_id).toBeUndefined();
    expect(emitCall.payload.sequence_day).toBeUndefined();
    expect(emitCall.payload.profile_label).toBeUndefined();
    expect(emitCall.payload.variant).toBeUndefined();
  });
});

describe("POST /api/affiliate/click — variant: null in token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    process.env.COOKIE_SECRET = "test-secret-min-32-bytes-long!!xx";
  });

  afterEach(() => {
    delete process.env.COOKIE_SECRET;
  });

  it("token met variant: null → event payload heeft variant: null", async () => {
    const token = buildNurtureAttributionToken({
      sessionId: "session-variant-null",
      sequenceDay: 21,
      profileLabel: "In Balans",
      variant: null,
    });

    const { POST } = await import("@/app/api/affiliate/click/route");
    const req = makeRequest({ product_id: "omega3", nt: token });
    await POST(req as Parameters<typeof POST>[0]);

    const emitCall = mockEmitEvent.mock.calls[0]?.[0] as {
      payload: Record<string, unknown>;
    };
    expect(emitCall.payload.session_id).toBe("session-variant-null");
    expect(emitCall.payload.variant).toBeNull();
  });
});
