import { beforeEach, describe, expect, it, vi } from "vitest";
import { runNutritionRelogInvites } from "@/lib/nutrition-relog-nurture";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const { mockResendSend } = vi.hoisted(() => ({
  mockResendSend: vi.fn(),
}));

vi.mock("resend", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn().mockImplementation(function (this: any) {
    this.emails = { send: mockResendSend };
  }),
}));
vi.mock("@/lib/supabase-admin");
vi.mock("@/lib/events", () => ({ emitEvent: vi.fn() }));
vi.mock("@/lib/public-site-url", () => ({ getPublicSiteUrl: () => "https://example.com" }));
vi.mock("@/lib/recovery-token", () => ({
  ANON_PROFILE_LABEL: "—",
  createRecoveryToken: vi.fn().mockResolvedValue("raw-token"),
  buildRecoveryUrl: vi.fn().mockReturnValue("https://example.com/api/intake/recover?token=raw"),
}));
vi.mock("@/lib/nurture-unsubscribe", () => ({
  buildNurtureUnsubscribeUrl: () => "https://example.com/unsub",
}));
vi.mock("@/lib/intake-marketing-consent-server", () => ({
  hasActiveIntakeMarketingEmailConsent: vi.fn().mockResolvedValue(true),
}));

describe("runNutritionRelogInvites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResendSend.mockResolvedValue({ data: { id: "relog-1" }, error: null });
  });

  it("stuurt her-log-mail bij één log ouder dan 14 dagen", async () => {
    const oldDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

    const nurtureEmails: Array<Record<string, unknown>> = [];
    const stub = {
      from: vi.fn((table: string) => {
        if (table === "intake_intake_log") {
          return {
            select: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ session_id: "sess-1", logged_at: oldDate }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "nurture_emails") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnThis(),
              limit: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn((row: Record<string, unknown>) => {
              nurtureEmails.push(row);
              return Promise.resolve({ error: null });
            }),
          };
        }
        if (table === "intake_sessions") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    marketing_email: "test@example.com",
                    first_name: "Dennis",
                    profile_label: "Onrustige Slaper",
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createSupabaseAdmin).mockReturnValue(
      stub as unknown as ReturnType<typeof createSupabaseAdmin>,
    );

    const result = await runNutritionRelogInvites();

    expect(result.sent).toBe(1);
    expect(mockResendSend).toHaveBeenCalledTimes(1);
    expect(nurtureEmails[0]?.source).toBe("nutrition_relog");
    const html = mockResendSend.mock.calls[0]?.[0]?.html as string;
    expect(html).toContain("dest=voeding");
  });

  it("stuurt geen mail als sessie al twee logs heeft", async () => {
    const oldDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

    const stub = {
      from: vi.fn((table: string) => {
        if (table === "intake_intake_log") {
          return {
            select: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { session_id: "sess-1", logged_at: oldDate },
                    { session_id: "sess-1", logged_at: new Date().toISOString() },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createSupabaseAdmin).mockReturnValue(
      stub as unknown as ReturnType<typeof createSupabaseAdmin>,
    );

    const result = await runNutritionRelogInvites();

    expect(result.sent).toBe(0);
    expect(mockResendSend).not.toHaveBeenCalled();
  });
});
