import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { isInterventionDomain } from "@/lib/domain-role";
import type { PillarId } from "@/types/dashboard";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

export type PriorityPrefSource = "user_selected" | "accept_engine";

export type TimeBucket = "ochtend" | "middag" | "avond";

export type AccountPriorityPref = {
  pillarId: PillarId;
  source: PriorityPrefSource;
  timeBucket: TimeBucket | null;
  updatedAt: string;
};

export const TIME_BUCKETS: readonly TimeBucket[] = [
  "ochtend",
  "middag",
  "avond",
] as const;

export function isTimeBucket(value: string): value is TimeBucket {
  return (TIME_BUCKETS as readonly string[]).includes(value);
}

export function isPriorityPrefSource(value: string): value is PriorityPrefSource {
  return value === "user_selected" || value === "accept_engine";
}

export function isPinablePillarId(value: string): value is PillarId {
  return isInterventionDomain(value as PillarId);
}

export function deriveDefaultTimeBucket(now = new Date()): TimeBucket {
  const hour = Number(
    new Intl.DateTimeFormat("nl-NL", {
      timeZone: "Europe/Amsterdam",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  if (hour < 12) {
    return "ochtend";
  }
  if (hour < 17) {
    return "middag";
  }
  return "avond";
}

export function timeBucketLabel(bucket: TimeBucket): string {
  if (bucket === "ochtend") {
    return "Vanmorgen";
  }
  if (bucket === "middag") {
    return "Vanmiddag";
  }
  return "Vanavond";
}

export function timeBucketAbbrev(bucket: TimeBucket): string {
  return bucket.charAt(0).toUpperCase();
}

export function deriveSuggestedTimeBucket(
  domain: PillarId,
  now = new Date(),
): TimeBucket {
  if (domain === "slaap" || domain === "verbinding") {
    return "avond";
  }
  if (domain === "voeding" || domain === "beweging") {
    return "ochtend";
  }
  if (domain === "stress") {
    return "middag";
  }
  return deriveDefaultTimeBucket(now);
}

type PrefRow = {
  pillar_id: string;
  source: string;
  time_bucket: string | null;
  updated_at: string;
};

function mapPrefRow(row: PrefRow): AccountPriorityPref | null {
  if (!isPinablePillarId(row.pillar_id) || !isPriorityPrefSource(row.source)) {
    return null;
  }
  const timeBucket =
    row.time_bucket && isTimeBucket(row.time_bucket) ? row.time_bucket : null;
  return {
    pillarId: row.pillar_id,
    source: row.source,
    timeBucket,
    updatedAt: row.updated_at,
  };
}

export async function getAccountPriorityPref(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<AccountPriorityPref | null> {
  const { data, error } = await admin
    .from("account_priority_pref")
    .select("pillar_id, source, time_bucket, updated_at")
    .eq("account_id", accountId)
    .maybeSingle<PrefRow>();

  if (error || !data) {
    return null;
  }
  return mapPrefRow(data);
}

export async function upsertAccountPriorityPref(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  input: {
    pillarId: PillarId;
    source: PriorityPrefSource;
    timeBucket?: TimeBucket | null;
  },
): Promise<AccountPriorityPref> {
  const existing = await getAccountPriorityPref(admin, accountId);
  const timeBucket =
    input.timeBucket !== undefined ? input.timeBucket : (existing?.timeBucket ?? null);

  const { data, error } = await admin
    .from("account_priority_pref")
    .upsert(
      {
        account_id: accountId,
        organization_id: organizationId,
        pillar_id: input.pillarId,
        source: input.source,
        time_bucket: timeBucket,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" },
    )
    .select("pillar_id, source, time_bucket, updated_at")
    .single<PrefRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Kon focus-voorkeur niet opslaan.");
  }

  const mapped = mapPrefRow(data);
  if (!mapped) {
    throw new Error("Ongeldige focus-voorkeur opgeslagen.");
  }
  return mapped;
}

export async function updateAccountTimeBucket(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  pillarId: PillarId,
  source: PriorityPrefSource,
  timeBucket: TimeBucket,
): Promise<AccountPriorityPref> {
  return upsertAccountPriorityPref(admin, accountId, organizationId, {
    pillarId,
    source,
    timeBucket,
  });
}

export async function deleteAccountPriorityPref(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<void> {
  await admin.from("account_priority_pref").delete().eq("account_id", accountId);
}
