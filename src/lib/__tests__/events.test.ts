import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DOMAIN_EVENT_TYPES, isDomainEventType } from "@/lib/events";

describe("isDomainEventType", () => {
  it("accepts known event types", () => {
    for (const type of DOMAIN_EVENT_TYPES) {
      expect(isDomainEventType(type)).toBe(true);
    }
  });

  it("rejects unknown types", () => {
    expect(isDomainEventType("intake.unknown")).toBe(false);
    expect(isDomainEventType("")).toBe(false);
  });

  it("accepts evidence.chat_queried", () => {
    expect(isDomainEventType("evidence.chat_queried")).toBe(true);
  });

  it("accepts remeasure.completed", () => {
    expect(isDomainEventType("remeasure.completed")).toBe(true);
  });
});

describe("emitEvent — geen e-mailadres naar domain_events (audit N6a)", () => {
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockSingle = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockSingle.mockResolvedValue({
      data: {
        id: "event-1",
        organization_id: "org-uuid-default",
        occurred_at: "2026-10-01T00:00:00.000Z",
        event_type: "account.logged_in",
        session_id: null,
        payload: {},
      },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });

    vi.doMock("@/lib/supabase-admin", () => ({
      createSupabaseAdmin: () => ({ from: () => ({ insert: mockInsert }) }),
    }));
    vi.doMock("@/lib/organization", () => ({
      getDefaultOrganizationId: () => "org-uuid-default",
    }));
    vi.doMock("@/lib/n8n-webhook", () => ({
      publishDomainEventToN8n: vi.fn().mockResolvedValue(false),
      markDomainEventDelivered: vi.fn(),
    }));
  });

  afterEach(() => {
    mockInsert.mockClear();
    mockSelect.mockClear();
    mockSingle.mockClear();
    vi.doUnmock("@/lib/supabase-admin");
    vi.doUnmock("@/lib/organization");
    vi.doUnmock("@/lib/n8n-webhook");
  });

  it("negeert een meegegeven email-veld volledig bij de insert", async () => {
    const { emitEvent } = await import("@/lib/events");

    await emitEvent({
      eventType: "account.logged_in",
      email: "user@example.com",
      payload: { login_method: "magic_link" },
    });

    expect(mockInsert).toHaveBeenCalledTimes(1);
    const insertedRow = mockInsert.mock.calls[0]?.[0];
    expect(insertedRow).not.toHaveProperty("email");
  });
});
