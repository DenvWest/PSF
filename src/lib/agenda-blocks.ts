import { isAgendaCategoryId } from "@/data/agenda/categories";
import { isValidLocalTime } from "@/lib/account-priority-pref";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  AgendaBlockRecord,
  AgendaBlockSource,
  AgendaBlockStatus,
  CreateAgendaBlockInput,
  UpdateAgendaBlockInput,
} from "@/types/agenda";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TITLE_LENGTH = 120;

type AgendaBlockRow = {
  id: string;
  date: string;
  category_id: string;
  title: string;
  start_time: string;
  end_time: string;
  source: string;
  status: string;
  external_provider: string | null;
  external_ref: string | null;
};

function isAgendaBlockStatus(value: string): value is AgendaBlockStatus {
  return value === "open" || value === "done";
}

function isAgendaBlockSource(value: string): value is AgendaBlockSource {
  return (
    value === "routine" ||
    value === "analysis" ||
    value.startsWith("external:")
  );
}

export function isIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value);
}

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidLocalTime(startTime) || !isValidLocalTime(endTime)) {
    return false;
  }
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  return startH * 60 + startM < endH * 60 + endM;
}

function mapRow(row: AgendaBlockRow): AgendaBlockRecord | null {
  if (
    !isAgendaCategoryId(row.category_id) ||
    !isAgendaBlockStatus(row.status) ||
    !isAgendaBlockSource(row.source)
  ) {
    return null;
  }

  return {
    id: row.id,
    date: row.date,
    categoryId: row.category_id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    source: row.source,
    status: row.status,
    externalProvider: row.external_provider,
    externalRef: row.external_ref,
  };
}

export function validateCreateBlockInput(
  input: CreateAgendaBlockInput,
): string | null {
  if (!isIsoDate(input.date)) {
    return "Ongeldige datum.";
  }
  if (!isAgendaCategoryId(input.categoryId)) {
    return "Ongeldige categorie.";
  }
  const title = input.title.trim();
  if (!title || title.length > MAX_TITLE_LENGTH) {
    return "Ongeldige titel.";
  }
  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return "Ongeldig tijdvenster.";
  }
  return null;
}

export function validateUpdateBlockInput(
  input: UpdateAgendaBlockInput,
): string | null {
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title || title.length > MAX_TITLE_LENGTH) {
      return "Ongeldige titel.";
    }
  }
  if (input.status !== undefined && !isAgendaBlockStatus(input.status)) {
    return "Ongeldige status.";
  }
  if (input.startTime !== undefined && !isValidLocalTime(input.startTime)) {
    return "Ongeldig starttijd.";
  }
  if (input.endTime !== undefined && !isValidLocalTime(input.endTime)) {
    return "Ongeldig eindtijd.";
  }
  if (
    input.startTime !== undefined &&
    input.endTime !== undefined &&
    !isValidTimeRange(input.startTime, input.endTime)
  ) {
    return "Ongeldig tijdvenster.";
  }
  return null;
}

export async function listBlocksForRange(
  admin: SupabaseAdmin,
  accountId: string,
  startDate: string,
  endDate: string,
): Promise<AgendaBlockRecord[]> {
  const { data, error } = await admin
    .from("agenda_blocks")
    .select(
      "id, date, category_id, title, start_time, end_time, source, status, external_provider, external_ref",
    )
    .eq("account_id", accountId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as AgendaBlockRow[])
    .map(mapRow)
    .filter((block): block is AgendaBlockRecord => block !== null);
}

export async function createBlock(
  admin: SupabaseAdmin,
  accountId: string,
  organizationId: string,
  input: CreateAgendaBlockInput,
): Promise<AgendaBlockRecord> {
  const validationError = validateCreateBlockInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const { data, error } = await admin
    .from("agenda_blocks")
    .insert({
      account_id: accountId,
      organization_id: organizationId,
      date: input.date,
      category_id: input.categoryId,
      title: input.title.trim(),
      start_time: input.startTime,
      end_time: input.endTime,
      source: "routine",
      status: "open",
    })
    .select(
      "id, date, category_id, title, start_time, end_time, source, status, external_provider, external_ref",
    )
    .single<AgendaBlockRow>();

  if (error || !data) {
    throw new Error(error?.message ?? "Kon blok niet aanmaken.");
  }

  const mapped = mapRow(data);
  if (!mapped) {
    throw new Error("Ongeldig blok aangemaakt.");
  }
  return mapped;
}

export async function updateBlock(
  admin: SupabaseAdmin,
  accountId: string,
  blockId: string,
  input: UpdateAgendaBlockInput,
): Promise<AgendaBlockRecord | null> {
  const validationError = validateUpdateBlockInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const patch: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) {
    patch.title = input.title.trim();
  }
  if (input.startTime !== undefined) {
    patch.start_time = input.startTime;
  }
  if (input.endTime !== undefined) {
    patch.end_time = input.endTime;
  }
  if (input.status !== undefined) {
    patch.status = input.status;
  }

  const { data, error } = await admin
    .from("agenda_blocks")
    .update(patch)
    .eq("account_id", accountId)
    .eq("id", blockId)
    .select(
      "id, date, category_id, title, start_time, end_time, source, status, external_provider, external_ref",
    )
    .maybeSingle<AgendaBlockRow>();

  if (error || !data) {
    return null;
  }

  return mapRow(data);
}

export async function deleteBlock(
  admin: SupabaseAdmin,
  accountId: string,
  blockId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("agenda_blocks")
    .delete()
    .eq("account_id", accountId)
    .eq("id", blockId)
    .select("id");

  return !error && (data?.length ?? 0) > 0;
}
