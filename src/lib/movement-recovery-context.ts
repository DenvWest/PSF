import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type MovementRecoveryContext = {
  rcvFeel: number | null;
  rcvFeelAt: string | null;
};

export function parseRcvFeelFromRawInputs(raw: unknown): number | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const value = (raw as Record<string, unknown>).RCV_FEEL;
  if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) {
      return parsed;
    }
  }
  return null;
}

export type MovementCheckinRcvRow = {
  raw_inputs?: unknown;
  created_at: string;
};

export function pickLatestMovementRcvFeel(
  rows: readonly MovementCheckinRcvRow[],
): { rcvFeel: number; rcvFeelAt: string } | null {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const row = sorted[index];
    const rcvFeel = parseRcvFeelFromRawInputs(row.raw_inputs);
    if (rcvFeel != null && typeof row.created_at === "string") {
      return { rcvFeel, rcvFeelAt: row.created_at };
    }
  }

  return null;
}

export async function loadMovementRecoveryContext(
  sessionId: string,
): Promise<MovementRecoveryContext> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { rcvFeel: null, rcvFeelAt: null };
  }

  const { data } = await admin
    .from("intake_domain_checkin")
    .select("raw_inputs, created_at")
    .eq("session_id", sessionId)
    .eq("domain_key", "movement_score")
    .order("created_at", { ascending: false })
    .limit(20);

  const picked = pickLatestMovementRcvFeel(
    (data ?? []).flatMap((row) =>
      typeof row.created_at === "string"
        ? [{ created_at: row.created_at, raw_inputs: row.raw_inputs }]
        : [],
    ),
  );
  if (!picked) {
    return { rcvFeel: null, rcvFeelAt: null };
  }

  return { rcvFeel: picked.rcvFeel, rcvFeelAt: picked.rcvFeelAt };
}

export type MovementRecoveryTrendPoint = {
  date: string;
  value: number;
};

export async function loadMovementRecoveryTrend(
  sessionIds: string[],
): Promise<MovementRecoveryTrendPoint[]> {
  const admin = createSupabaseAdmin();
  if (!admin || sessionIds.length === 0) {
    return [];
  }

  const { data } = await admin
    .from("intake_domain_checkin")
    .select("session_id, raw_inputs, created_at")
    .in("session_id", sessionIds)
    .eq("domain_key", "movement_score")
    .order("created_at", { ascending: true });

  const points: MovementRecoveryTrendPoint[] = [];

  for (const row of data ?? []) {
    const raw = row.raw_inputs;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      continue;
    }
    const rcvFeel = parseRcvFeelFromRawInputs(raw);
    if (rcvFeel == null) {
      continue;
    }
    if (typeof row.created_at !== "string") {
      continue;
    }
    points.push({
      date: row.created_at.slice(0, 10),
      value: rcvFeel,
    });
  }

  return points.slice(-8);
}
