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
  scheduledTime: string | null;
  planStepDismissedDate: string | null;
  planStepsHidden: boolean;
  /** Gekozen belastings-tier voor movementDayChoiceDate; null = nog niet gekozen. */
  movementDayChoice: MovementDayChoice | null;
  movementDayChoiceDate: string | null;
  updatedAt: string;
};

/** Drie belastings-tiers van de dagstap beweging — spiegelt TodayChoiceKind. */
export type MovementDayChoice = "herstel" | "matig" | "trainen";

const MOVEMENT_DAY_CHOICES: readonly MovementDayChoice[] = [
  "herstel",
  "matig",
  "trainen",
] as const;

export function isMovementDayChoice(value: unknown): value is MovementDayChoice {
  return (
    typeof value === "string" &&
    (MOVEMENT_DAY_CHOICES as readonly string[]).includes(value)
  );
}

/** De keuze telt alleen op de dag dat hij gezet is — daarna kies je opnieuw. */
export function resolveMovementDayChoiceForToday(
  choice: MovementDayChoice | null,
  choiceDate: string | null,
  today: string,
): MovementDayChoice | null {
  if (!choice || !choiceDate || choiceDate !== today) {
    return null;
  }
  return choice;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value);
}

export const TIME_BUCKETS: readonly TimeBucket[] = [
  "ochtend",
  "middag",
  "avond",
] as const;

const LOCAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeLocalTime(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23) {
    return null;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isValidLocalTime(value: string): boolean {
  const normalized = normalizeLocalTime(value);
  return normalized !== null && LOCAL_TIME_PATTERN.test(normalized);
}

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
  return deriveTimeBucketFromHour(hour);
}

export function deriveTimeBucketFromHour(hour: number): TimeBucket {
  if (hour < 12) {
    return "ochtend";
  }
  if (hour < 17) {
    return "middag";
  }
  return "avond";
}

export function deriveTimeBucketFromLocalTime(time: string): TimeBucket {
  const hour = Number(time.split(":")[0]);
  return deriveTimeBucketFromHour(hour);
}

export function deriveDefaultScheduledTime(bucket: TimeBucket): string {
  if (bucket === "ochtend") {
    return "09:00";
  }
  if (bucket === "middag") {
    return "14:00";
  }
  return "19:00";
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

type PrefRowBase = {
  pillar_id: string;
  source: string;
  time_bucket: string | null;
  updated_at: string;
  plan_step_dismissed_date?: string | null;
  plan_steps_hidden?: boolean | null;
  movement_day_choice?: string | null;
  movement_day_choice_date?: string | null;
};

type PrefRow = PrefRowBase & {
  scheduled_time?: string | null;
};

const PREF_SELECT_LEGACY = "pillar_id, source, time_bucket, updated_at" as const;

type PrefColumnFlags = {
  scheduledTime: boolean;
  planStepDismissedDate: boolean;
  planStepsHidden: boolean;
  movementDayChoice: boolean;
};

const FULL_PREF_COLUMNS: PrefColumnFlags = {
  scheduledTime: true,
  planStepDismissedDate: true,
  planStepsHidden: true,
  movementDayChoice: true,
};

function isMissingPrefColumn(
  error: { message?: string } | null,
  column: string,
): boolean {
  const message = error?.message ?? "";
  return message.includes(column) && message.includes("schema cache");
}

function isMissingScheduledTimeColumn(error: { message?: string } | null): boolean {
  return isMissingPrefColumn(error, "scheduled_time");
}

function isMissingPlanStepDismissedColumn(error: { message?: string } | null): boolean {
  return isMissingPrefColumn(error, "plan_step_dismissed_date");
}

function isMissingPlanStepsHiddenColumn(error: { message?: string } | null): boolean {
  return isMissingPrefColumn(error, "plan_steps_hidden");
}

function isMissingMovementDayChoiceColumn(error: { message?: string } | null): boolean {
  return (
    isMissingPrefColumn(error, "movement_day_choice") ||
    isMissingPrefColumn(error, "movement_day_choice_date")
  );
}

function buildPrefSelect(flags: PrefColumnFlags): string {
  const columns = ["pillar_id", "source", "time_bucket"];
  if (flags.scheduledTime) {
    columns.push("scheduled_time");
  }
  if (flags.planStepDismissedDate) {
    columns.push("plan_step_dismissed_date");
  }
  if (flags.planStepsHidden) {
    columns.push("plan_steps_hidden");
  }
  if (flags.movementDayChoice) {
    columns.push("movement_day_choice", "movement_day_choice_date");
  }
  columns.push("updated_at");
  return columns.join(", ");
}

function stripMissingPrefColumn(
  flags: PrefColumnFlags,
  error: { message?: string } | null,
): PrefColumnFlags | null {
  if (isMissingScheduledTimeColumn(error)) {
    return { ...flags, scheduledTime: false };
  }
  if (isMissingPlanStepDismissedColumn(error)) {
    return { ...flags, planStepDismissedDate: false };
  }
  if (isMissingPlanStepsHiddenColumn(error)) {
    return { ...flags, planStepsHidden: false };
  }
  if (isMissingMovementDayChoiceColumn(error)) {
    return { ...flags, movementDayChoice: false };
  }
  return null;
}

function mapPrefRow(row: PrefRow): AccountPriorityPref | null {
  if (!isPinablePillarId(row.pillar_id) || !isPriorityPrefSource(row.source)) {
    return null;
  }
  const timeBucket =
    row.time_bucket && isTimeBucket(row.time_bucket) ? row.time_bucket : null;
  const scheduledTime =
    row.scheduled_time && isValidLocalTime(row.scheduled_time)
      ? row.scheduled_time
      : null;
  return {
    pillarId: row.pillar_id,
    source: row.source,
    timeBucket,
    scheduledTime,
    planStepDismissedDate: row.plan_step_dismissed_date ?? null,
    planStepsHidden: row.plan_steps_hidden ?? false,
    movementDayChoice: isMovementDayChoice(row.movement_day_choice)
      ? row.movement_day_choice
      : null,
    movementDayChoiceDate: row.movement_day_choice_date ?? null,
    updatedAt: row.updated_at,
  };
}

export async function getAccountPriorityPref(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<AccountPriorityPref | null> {
  let flags: PrefColumnFlags = { ...FULL_PREF_COLUMNS };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await admin
      .from("account_priority_pref")
      .select(buildPrefSelect(flags))
      .eq("account_id", accountId)
      .maybeSingle<PrefRow>();

    if (!result.error) {
      if (!result.data) {
        return null;
      }
      return mapPrefRow(result.data);
    }

    const nextFlags = stripMissingPrefColumn(flags, result.error);
    if (!nextFlags) {
      return null;
    }
    flags = nextFlags;
  }

  const legacy = await admin
    .from("account_priority_pref")
    .select(PREF_SELECT_LEGACY)
    .eq("account_id", accountId)
    .maybeSingle<PrefRowBase>();

  if (legacy.error || !legacy.data) {
    return null;
  }
  return mapPrefRow(legacy.data);
}

export async function upsertAccountPriorityPref(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  input: {
    pillarId: PillarId;
    source: PriorityPrefSource;
    timeBucket?: TimeBucket | null;
    scheduledTime?: string | null;
    planStepDismissedDate?: string | null;
    planStepsHidden?: boolean;
    movementDayChoice?: MovementDayChoice | null;
    movementDayChoiceDate?: string | null;
  },
): Promise<AccountPriorityPref> {
  const existing = await getAccountPriorityPref(admin, accountId);

  const scheduledTime =
    input.scheduledTime !== undefined
      ? input.scheduledTime
      : (existing?.scheduledTime ?? null);

  let timeBucket =
    input.timeBucket !== undefined ? input.timeBucket : (existing?.timeBucket ?? null);

  const planStepDismissedDate =
    input.planStepDismissedDate !== undefined
      ? input.planStepDismissedDate
      : (existing?.planStepDismissedDate ?? null);

  const planStepsHidden =
    input.planStepsHidden !== undefined
      ? input.planStepsHidden
      : (existing?.planStepsHidden ?? false);

  const movementDayChoice =
    input.movementDayChoice !== undefined
      ? input.movementDayChoice
      : (existing?.movementDayChoice ?? null);

  const movementDayChoiceDate =
    input.movementDayChoiceDate !== undefined
      ? input.movementDayChoiceDate
      : (existing?.movementDayChoiceDate ?? null);

  if (scheduledTime) {
    timeBucket = deriveTimeBucketFromLocalTime(scheduledTime);
  }

  const corePayload = {
    account_id: accountId,
    organization_id: organizationId,
    pillar_id: input.pillarId,
    source: input.source,
    time_bucket: timeBucket,
    updated_at: new Date().toISOString(),
  };

  let flags: PrefColumnFlags = { ...FULL_PREF_COLUMNS };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const upsertPayload: Record<string, unknown> = { ...corePayload };
    if (flags.scheduledTime) {
      upsertPayload.scheduled_time = scheduledTime;
    }
    if (flags.planStepDismissedDate) {
      upsertPayload.plan_step_dismissed_date = planStepDismissedDate;
    }
    if (flags.planStepsHidden) {
      upsertPayload.plan_steps_hidden = planStepsHidden;
    }
    if (flags.movementDayChoice) {
      upsertPayload.movement_day_choice = movementDayChoice;
      upsertPayload.movement_day_choice_date = movementDayChoiceDate;
    }

    const result = await admin
      .from("account_priority_pref")
      .upsert(upsertPayload, { onConflict: "account_id" })
      .select(buildPrefSelect(flags))
      .single<PrefRow>();

    if (!result.error && result.data) {
      const mapped = mapPrefRow(result.data);
      if (!mapped) {
        throw new Error("Ongeldige focus-voorkeur opgeslagen.");
      }
      return mapped;
    }

    const nextFlags = stripMissingPrefColumn(flags, result.error);
    if (!nextFlags) {
      throw new Error(result.error?.message ?? "Kon focus-voorkeur niet opslaan.");
    }
    flags = nextFlags;
  }

  throw new Error("Kon focus-voorkeur niet opslaan.");
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
    scheduledTime: deriveDefaultScheduledTime(timeBucket),
  });
}

export async function updateAccountScheduledTime(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  pillarId: PillarId,
  source: PriorityPrefSource,
  scheduledTime: string,
): Promise<AccountPriorityPref> {
  return upsertAccountPriorityPref(admin, accountId, organizationId, {
    pillarId,
    source,
    scheduledTime,
  });
}

export async function deleteAccountPriorityPref(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<void> {
  await admin.from("account_priority_pref").delete().eq("account_id", accountId);
}

async function upsertPlanStepDismissedDate(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  input: {
    pillarId: PillarId;
    source: PriorityPrefSource;
    planStepDismissedDate: string | null;
  },
): Promise<AccountPriorityPref> {
  const existing = await getAccountPriorityPref(admin, accountId);
  return upsertAccountPriorityPref(admin, accountId, organizationId, {
    pillarId: existing?.pillarId ?? input.pillarId,
    source: existing?.source ?? input.source,
    timeBucket: existing?.timeBucket ?? null,
    scheduledTime: existing?.scheduledTime ?? null,
    planStepDismissedDate: input.planStepDismissedDate,
  });
}

export async function dismissPlanStepForDate(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  date: string,
  fallback: { pillarId: PillarId; source: PriorityPrefSource },
): Promise<AccountPriorityPref> {
  if (!isIsoDate(date)) {
    throw new Error("Ongeldige datum.");
  }
  return upsertPlanStepDismissedDate(admin, accountId, organizationId, {
    pillarId: fallback.pillarId,
    source: fallback.source,
    planStepDismissedDate: date,
  });
}

export async function restorePlanStep(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  fallback: { pillarId: PillarId; source: PriorityPrefSource },
): Promise<AccountPriorityPref> {
  return upsertPlanStepDismissedDate(admin, accountId, organizationId, {
    pillarId: fallback.pillarId,
    source: fallback.source,
    planStepDismissedDate: null,
  });
}

/**
 * Legt de dagkeuze vast (of wist hem bij choice=null). Behoudt de bestaande
 * focus-voorkeur: dit is een dag-feit, geen wijziging van je prioriteit.
 */
export async function setMovementDayChoice(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  input: {
    choice: MovementDayChoice | null;
    date: string;
    fallback: { pillarId: PillarId; source: PriorityPrefSource };
  },
): Promise<AccountPriorityPref> {
  if (!isIsoDate(input.date)) {
    throw new Error("Ongeldige datum.");
  }
  const existing = await getAccountPriorityPref(admin, accountId);
  return upsertAccountPriorityPref(admin, accountId, organizationId, {
    pillarId: existing?.pillarId ?? input.fallback.pillarId,
    source: existing?.source ?? input.fallback.source,
    timeBucket: existing?.timeBucket ?? null,
    scheduledTime: existing?.scheduledTime ?? null,
    movementDayChoice: input.choice,
    movementDayChoiceDate: input.choice ? input.date : null,
  });
}

export async function setPlanStepsHidden(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  hidden: boolean,
  fallback: { pillarId: PillarId; source: PriorityPrefSource },
): Promise<AccountPriorityPref> {
  const existing = await getAccountPriorityPref(admin, accountId);
  return upsertAccountPriorityPref(admin, accountId, organizationId, {
    pillarId: existing?.pillarId ?? fallback.pillarId,
    source: existing?.source ?? fallback.source,
    timeBucket: existing?.timeBucket ?? null,
    scheduledTime: existing?.scheduledTime ?? null,
    planStepsHidden: hidden,
  });
}
