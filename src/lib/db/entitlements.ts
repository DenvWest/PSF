/**
 * Account entitlements — fail-open → free.
 *
 * DB error, missing row, or expired valid_until → no feature (free tier).
 * Never throw to callers; a broken entitlements read must not break gratis pages.
 *
 * Contrast with security boundaries (auth, cron): those fail-closed.
 *
 * Future effective access = org maxTier cap (∧) account entitlement — see getVisibleTiers
 * in org-settings.ts. This module reads only the account layer.
 */

import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const ENTITLEMENT_FEATURES = ["trends", "coach", "q2"] as const;

export type EntitlementFeature = (typeof ENTITLEMENT_FEATURES)[number];

const ENTITLEMENT_FEATURE_SET = new Set<string>(ENTITLEMENT_FEATURES);

type EntitlementRow = {
  feature: string;
  valid_until: string | null;
};

function isEntitlementFeature(value: string): value is EntitlementFeature {
  return ENTITLEMENT_FEATURE_SET.has(value);
}

function isActiveEntitlement(row: EntitlementRow, now: Date): boolean {
  if (row.valid_until === null) {
    return true;
  }
  const expiresAt = new Date(row.valid_until);
  if (Number.isNaN(expiresAt.getTime())) {
    return false;
  }
  return expiresAt > now;
}

function isMissingEntitlementsTableError(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST205") {
    return true;
  }
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("could not find the table") ||
    message.includes("relation") && message.includes("does not exist")
  );
}

function logEntitlementsError(error: { code?: string; message?: string }): void {
  if (isMissingEntitlementsTableError(error)) {
    return;
  }
  console.error("[entitlements] getEntitlements failed", error.message);
}

export async function getEntitlements(accountId: string): Promise<Set<EntitlementFeature>> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return new Set();
  }

  const { data, error } = await admin
    .from("account_entitlements")
    .select("feature, valid_until")
    .eq("account_id", accountId);

  if (error) {
    logEntitlementsError(error);
    return new Set();
  }

  const now = new Date();
  const active = new Set<EntitlementFeature>();

  for (const row of (data ?? []) as EntitlementRow[]) {
    if (!isEntitlementFeature(row.feature)) {
      continue;
    }
    if (isActiveEntitlement(row, now)) {
      active.add(row.feature);
    }
  }

  return active;
}

export async function hasFeature(
  accountId: string,
  feature: EntitlementFeature,
): Promise<boolean> {
  const entitlements = await getEntitlements(accountId);
  return entitlements.has(feature);
}
