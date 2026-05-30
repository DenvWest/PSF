import { createSupabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_VISIBLE_TIERS: readonly number[] = [1];

type OrgSettingsRow = { settings: Record<string, unknown> | null };

export async function getVisibleTiers(orgId: string): Promise<number[]> {
  const fallback = [...DEFAULT_VISIBLE_TIERS];

  const admin = createSupabaseAdmin();
  if (!admin) {
    return fallback;
  }

  const { data, error } = await admin
    .from("organizations")
    .select("settings")
    .eq("id", orgId)
    .maybeSingle<OrgSettingsRow>();

  if (error || !data?.settings) {
    return fallback;
  }

  const raw = data.settings.visibleTiers;
  if (!Array.isArray(raw)) {
    return fallback;
  }

  const tiers = raw.filter(
    (value): value is number =>
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 5,
  );

  return tiers.length > 0 ? tiers : fallback;
}
