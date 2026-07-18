import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getCalendarWeekDates, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import {
  isMovementModalityId,
  type MovementModalityId,
} from "@/data/movement/log-modalities";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

export const MAX_SESSION_MINUTES = 600;
export const MAX_NOTE_LENGTH = 280;

export type MovementSessionInput = {
  modalityId: MovementModalityId;
  minutes: number;
  note?: string | null;
};

export type ParsedMovementSession = {
  modalityId: MovementModalityId;
  minutes: number;
  note: string | null;
};

/** Valideert een rauwe log-payload; retourneert null bij ongeldige invoer (geen throw). */
export function parseMovementSessionInput(raw: unknown): ParsedMovementSession | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;

  const modalityId =
    typeof record.modalityId === "string" ? record.modalityId.trim() : "";
  if (!isMovementModalityId(modalityId)) {
    return null;
  }

  const minutes =
    typeof record.minutes === "number" ? Math.round(record.minutes) : NaN;
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > MAX_SESSION_MINUTES) {
    return null;
  }

  let note: string | null = null;
  if (typeof record.note === "string" && record.note.trim()) {
    note = record.note.trim().slice(0, MAX_NOTE_LENGTH);
  }

  return { modalityId, minutes, note };
}

/** Minuten-band voor analytics — nooit de exacte waarde in event-payloads (art. 9-hygiëne). */
export function bandMinutes(minutes: number): string {
  if (minutes <= 15) return "1-15";
  if (minutes <= 30) return "16-30";
  if (minutes <= 60) return "31-60";
  return "60+";
}

export async function insertMovementSession(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  input: MovementSessionInput,
): Promise<void> {
  await admin.from("movement_session_log").insert({
    account_id: accountId,
    organization_id: organizationId,
    log_date: todayInAgendaTimezone(),
    modality_id: input.modalityId,
    minutes: input.minutes,
    source: "self_report",
    note: input.note ?? null,
  });
}

export type MovementWeekSummary = {
  today: string;
  dates: string[];
  minutesByDate: Record<string, number>;
  totalMinutes: number;
  sessionCount: number;
  modalityMix: Partial<Record<MovementModalityId, number>>;
};

type SessionRow = {
  log_date: unknown;
  modality_id: unknown;
  minutes: unknown;
};

/** Week-aggregatie náást de scorelijn: minuten per dag, totaal, sessie-count, modality-mix. */
export async function getMovementWeekSummary(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<MovementWeekSummary> {
  const today = todayInAgendaTimezone();
  const dates = getCalendarWeekDates(today);
  const startDate = dates[0] ?? today;
  const endDate = dates[dates.length - 1] ?? today;

  const { data } = await admin
    .from("movement_session_log")
    .select("log_date, modality_id, minutes")
    .eq("account_id", accountId)
    .gte("log_date", startDate)
    .lte("log_date", endDate);

  const minutesByDate: Record<string, number> = {};
  const modalityMix: Partial<Record<MovementModalityId, number>> = {};
  let totalMinutes = 0;
  let sessionCount = 0;

  for (const row of (data ?? []) as SessionRow[]) {
    if (typeof row.log_date !== "string" || typeof row.minutes !== "number") {
      continue;
    }
    const minutes = row.minutes;
    minutesByDate[row.log_date] = (minutesByDate[row.log_date] ?? 0) + minutes;
    totalMinutes += minutes;
    sessionCount += 1;

    if (typeof row.modality_id === "string" && isMovementModalityId(row.modality_id)) {
      modalityMix[row.modality_id] = (modalityMix[row.modality_id] ?? 0) + minutes;
    }
  }

  return { today, dates, minutesByDate, totalMinutes, sessionCount, modalityMix };
}
