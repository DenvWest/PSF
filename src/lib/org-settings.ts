import { createSupabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_MAX_TIER = 1;
const MIN_TIER = 1;
const MAX_TIER = 5;

type OrgSettingsRow = { settings: Record<string, unknown> | null };

function parseMaxTier(settings: Record<string, unknown>): number {
  const raw = settings.maxTier;
  if (
    typeof raw !== "number" ||
    !Number.isInteger(raw) ||
    raw < MIN_TIER ||
    raw > MAX_TIER
  ) {
    return DEFAULT_MAX_TIER;
  }

  return raw;
}

function tiersUpToMax(maxTier: number): number[] {
  return Array.from({ length: maxTier }, (_, index) => index + 1);
}

export async function getVisibleTiers(orgId: string): Promise<number[]> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return tiersUpToMax(DEFAULT_MAX_TIER);
  }

  const { data, error } = await admin
    .from("organizations")
    .select("settings")
    .eq("id", orgId)
    .maybeSingle<OrgSettingsRow>();

  if (error || !data?.settings) {
    return tiersUpToMax(DEFAULT_MAX_TIER);
  }

  return tiersUpToMax(parseMaxTier(data.settings));
}
