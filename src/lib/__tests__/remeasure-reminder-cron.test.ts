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
        // Past het session_kind-filter echt toe, zodat de test het gedrag van
        // de query meet en niet alleen wat de mock teruggeeft.
        const filters: Record<string, string[]> = {};
        const chain = {
          in: (column: string, values: string[]) => {
            filters[column] = values;
            return chain;
          },
          order: async () => {
            const kinds = filters.session_kind;
            const rows = (mockSessionRows() as { session_kind: string }[]).filter(
              (row) => !kinds || kinds.includes(row.session_kind),
            );
            return { data: rows, error: null };
          },
        };
        return { select: () => chain };
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
  session_kind: "initial",
};

const VOEDINGSSESSIE = {
  id: "660e8400-e29b-41d4-a716-446655440000",
  account_id: "account-1",
  created_at: "2026-02-01T10:00:00.000Z",
  profile_label: null,
  session_kind: "nutrition",
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

  it("houdt een account met één brede check als kandidaat, ook als er een voedingssessie naast staat (R3)", async () => {
    mockSessionRows.mockReturnValue([BREDE_CHECK, VOEDINGSSESSIE]);
    await expect(runPendingRemeasureReminders()).resolves.toEqual({
      scanned: 1,
      sent: 0,
      skipped: 1,
    });
  });

  it("slaat een account met twee brede checks nog steeds over (die heeft al een hermeting)", async () => {
    mockSessionRows.mockReturnValue([
      BREDE_CHECK,
      { ...BREDE_CHECK, id: "770e8400-e29b-41d4-a716-446655440000", session_kind: "remeasure" },
    ]);
    await expect(runPendingRemeasureReminders()).resolves.toEqual({
      scanned: 0,
      sent: 0,
      skipped: 0,
    });
  });
});
