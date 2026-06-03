import { describe, it, expect, vi } from "vitest";
import { hasActiveIntakeMarketingEmailConsent } from "@/lib/intake-marketing-consent-server";

const SESSION_ID = "00000000-0000-4000-8000-000000000099";

function createConsentRecordsAdmin(maybeSingleResult: {
  data: { id: string } | null;
  error: unknown;
}) {
  const maybeSingle = vi.fn(async () => maybeSingleResult);
  const limit = vi.fn(() => ({ maybeSingle }));
  const is = vi.fn(() => ({ limit }));
  const eq = vi.fn(() => ({ eq, is }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    from,
    _maybeSingle: maybeSingle,
  } as unknown as import("@supabase/supabase-js").SupabaseClient;
}

describe("hasActiveIntakeMarketingEmailConsent", () => {
  it("returns true when an active marketing_email record exists", async () => {
    const admin = createConsentRecordsAdmin({
      data: { id: "consent-1" },
      error: null,
    });

    expect(
      await hasActiveIntakeMarketingEmailConsent(admin, SESSION_ID),
    ).toBe(true);
    expect(admin.from).toHaveBeenCalledWith("consent_records");
  });

  it("returns false when no record exists", async () => {
    const admin = createConsentRecordsAdmin({
      data: null,
      error: null,
    });

    expect(
      await hasActiveIntakeMarketingEmailConsent(admin, SESSION_ID),
    ).toBe(false);
  });

  it("returns false on database error", async () => {
    const admin = createConsentRecordsAdmin({
      data: null,
      error: { message: "db down" },
    });

    expect(
      await hasActiveIntakeMarketingEmailConsent(admin, SESSION_ID),
    ).toBe(false);
  });
});
