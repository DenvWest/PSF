import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSessionRows, mockHasConsent } = vi.hoisted(() => ({
  mockSessionRows: vi.fn(),
  mockHasConsent: vi.fn(),
}));

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table === "accounts") {
        return {
          select: () => ({
            neq: async () => ({
              data: [{ id: "account-1", email: "iemand@example.nl" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "intake_sessions") {
        return {
          select: () => ({
            in: () => ({
              order: async () => ({ data: mockSessionRows(), error: null }),
            }),
          }),
        };
      }
      if (table === "remeasure_reminders") {
        return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
      }
      throw new Error(`onverwachte tabel: ${table}`);
    },
  }),
}));

vi.mock("@/lib/intake-marketing-consent-server", () => ({
  hasActiveIntakeMarketingEmailConsent: mockHasConsent,
}));
vi.mock("@/lib/events", () => ({ emitEvent: vi.fn() }));
vi.mock("@/lib/public-site-url", () => ({ getPublicSiteUrl: () => "https://example.nl" }));

import { runPendingRemeasureReminders } from "@/lib/remeasure-reminder-cron";

const LANG_GELEDEN = "2026-01-01T10:00:00.000Z";

const BREDE_CHECK = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  account_id: "account-1",
  created_at: LANG_GELEDEN,
  profile_label: "Lage Batterij",
};

const VOEDINGSSESSIE = {
  id: "660e8400-e29b-41d4-a716-446655440000",
  account_id: "account-1",
  created_at: "2026-02-01T10:00:00.000Z",
  profile_label: null,
};

describe("runPendingRemeasureReminders — kandidaatselectie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasConsent.mockResolvedValue(false);
  });

  it("neemt een account met één brede check (ouder dan 30 dagen) als kandidaat", async () => {
    mockSessionRows.mockReturnValue([BREDE_CHECK]);
    await expect(runPendingRemeasureReminders()).resolves.toEqual({
      scanned: 1,
      sent: 0,
      skipped: 1,
    });
  });

  it("slaat een account met alleen een voedingssessie over", async () => {
    mockSessionRows.mockReturnValue([VOEDINGSSESSIE]);
    await expect(runPendingRemeasureReminders()).resolves.toEqual({
      scanned: 0,
      sent: 0,
      skipped: 0,
    });
  });

  it("slaat een account over zodra er naast de brede check een tweede sessie is (huidig gedrag = R3; S2 filtert op session_kind)", async () => {
    mockSessionRows.mockReturnValue([BREDE_CHECK, VOEDINGSSESSIE]);
    await expect(runPendingRemeasureReminders()).resolves.toEqual({
      scanned: 0,
      sent: 0,
      skipped: 0,
    });
  });
});
