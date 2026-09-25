import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createNutritionCheckSession,
  isCheckSessionCreateEnabled,
  normalizeReferralSource,
} from "@/lib/intake-session-create";

function adminReturning(result: { data: unknown; error: unknown }) {
  const insert = vi.fn(() => ({
    select: () => ({ single: async () => result }),
  }));
  const admin = { from: vi.fn(() => ({ insert })) } as unknown as SupabaseClient;
  return { admin, insert };
}

describe("isCheckSessionCreateEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("staat standaard uit", () => {
    vi.stubEnv("CHECK_SESSION_CREATE_ENABLED", "");
    expect(isCheckSessionCreateEnabled()).toBe(false);
  });

  it("gaat alleen aan op precies 'true'", () => {
    vi.stubEnv("CHECK_SESSION_CREATE_ENABLED", "true");
    expect(isCheckSessionCreateEnabled()).toBe(true);
    vi.stubEnv("CHECK_SESSION_CREATE_ENABLED", "1");
    expect(isCheckSessionCreateEnabled()).toBe(false);
  });
});

describe("normalizeReferralSource", () => {
  it("decodeert, knipt witruimte en kapt af op 200 tekens", () => {
    expect(normalizeReferralSource("youtube%20%20kanaal")).toBe("youtube kanaal");
    expect(normalizeReferralSource("a".repeat(300))?.length).toBe(200);
  });

  it("geeft null bij leeg of onleesbaar", () => {
    expect(normalizeReferralSource(undefined)).toBeNull();
    expect(normalizeReferralSource("   ")).toBeNull();
    expect(normalizeReferralSource("%E0%A4%A")).toBeNull();
  });
});

describe("createNutritionCheckSession", () => {
  it("voegt een sessie 'nutrition' in zonder brede-check-kolommen", async () => {
    const { admin, insert } = adminReturning({ data: { id: "sessie-1" }, error: null });

    await expect(
      createNutritionCheckSession(admin, {
        organizationId: "org-1",
        accountId: "account-1",
        referralSource: "youtube",
      }),
    ).resolves.toEqual({ ok: true, sessionId: "sessie-1" });

    expect(insert).toHaveBeenCalledWith({
      organization_id: "org-1",
      session_kind: "nutrition",
      account_id: "account-1",
      referral_source: "youtube",
    });
  });

  it("meldt een mislukte insert", async () => {
    const { admin } = adminReturning({ data: null, error: { message: "check violation" } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      createNutritionCheckSession(admin, {
        organizationId: "org-1",
        accountId: null,
        referralSource: null,
      }),
    ).resolves.toEqual({ ok: false });

    errorSpy.mockRestore();
  });
});
