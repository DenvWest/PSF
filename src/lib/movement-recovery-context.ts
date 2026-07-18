import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type MovementRecoveryContext = {
  rcvFeel: number | null;
};

export async function loadMovementRecoveryContext(
  sessionId: string,
): Promise<MovementRecoveryContext> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { rcvFeel: null };
  }

  const { data } = await admin
    .from("intake_domain_checkin")
    .select("raw_inputs, created_at")
    .eq("session_id", sessionId)
    .eq("domain_key", "movement_score")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const raw = data?.raw_inputs;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { rcvFeel: null };
  }

  const rcvFeel = (raw as Record<string, unknown>).RCV_FEEL;
  if (typeof rcvFeel !== "number" || !Number.isInteger(rcvFeel) || rcvFeel < 1 || rcvFeel > 5) {
    return { rcvFeel: null };
  }

  return { rcvFeel };
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
    const rcvFeel = (raw as Record<string, unknown>).RCV_FEEL;
    if (typeof rcvFeel !== "number" || !Number.isInteger(rcvFeel) || rcvFeel < 1 || rcvFeel > 5) {
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
