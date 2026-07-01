import { emailHasActiveAccount } from "@/lib/account-server";
import { hasActiveMainNurture } from "@/lib/nurture";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type IntakeMarketingContinuity = {
  mainNurtureActive: boolean;
  hasActiveAccount: boolean;
};

export function normalizeMarketingEmail(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export async function resolveIntakeMarketingContinuity(
  email: string,
): Promise<IntakeMarketingContinuity> {
  const normalized = normalizeMarketingEmail(email);
  if (!normalized) {
    return { mainNurtureActive: false, hasActiveAccount: false };
  }

  const admin = createSupabaseAdmin();
  const [mainNurtureActive, hasActiveAccount] = await Promise.all([
    hasActiveMainNurture(normalized),
    admin ? emailHasActiveAccount(admin, normalized) : Promise.resolve(false),
  ]);

  return { mainNurtureActive, hasActiveAccount };
}

export function shouldSteerToDashboard(
  continuity: IntakeMarketingContinuity,
): boolean {
  return continuity.mainNurtureActive || continuity.hasActiveAccount;
}
