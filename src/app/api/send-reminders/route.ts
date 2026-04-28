import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildNurtureEmail,
  type ReminderRowWithSession,
} from "@/lib/nurture-email-dispatch";
import { runPendingNurtureEmails } from "@/lib/nurture-cron";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

type ReminderFetchRow = {
  id: string;
  email: string;
  reminder_type: string;
  session_id: string | null;
};

type SessionFetchRow = {
  id: string;
  profile_label: string | null;
  domain_scores: unknown;
  urgency_level: string | null;
  answers: unknown;
  symptom_profile: unknown;
};

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";
  const trimmed = authHeader.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

function authorizePost(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return getBearerToken(request) === secret;
}

function authorizeGet(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return getBearerToken(request) === secret;
}

async function runSendReminders(): Promise<{ sent: number; errors: number }> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const nowIso = new Date().toISOString();

  const { data: reminderRows, error: fetchError } = await supabase
    .from("intake_reminders")
    .select("id,email,reminder_type,session_id")
    .eq("reminder_type", "day30")
    .lte("reminder_date", nowIso)
    .eq("sent", false);

  if (fetchError) {
    throw fetchError;
  }

  const list = (reminderRows ?? []) as ReminderFetchRow[];
  const sessionIds = [
    ...new Set(
      list
        .map((r) => r.session_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  let sessionById = new Map<string, SessionFetchRow>();
  if (sessionIds.length > 0) {
    const { data: sessionRows, error: sessionErr } = await supabase
      .from("intake_sessions")
      .select(
        "id, profile_label, domain_scores, urgency_level, answers, symptom_profile",
      )
      .in("id", sessionIds);

    if (sessionErr) {
      throw sessionErr;
    }

    sessionById = new Map(
      ((sessionRows ?? []) as SessionFetchRow[]).map((s) => [s.id, s]),
    );
  }

  let sent = 0;
  let errors = 0;

  for (const row of list) {
    if (!row.id || typeof row.email !== "string" || !row.email.trim()) {
      errors += 1;
      continue;
    }

    const session = row.session_id
      ? sessionById.get(row.session_id) ?? null
      : null;

    const withSession: ReminderRowWithSession = {
      id: row.id,
      email: row.email,
      reminder_type: row.reminder_type,
      intake_sessions: session,
    };

    const built = buildNurtureEmail(withSession);
    if (!built) {
      errors += 1;
      continue;
    }

    const { error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: row.email.trim(),
      subject: built.subject,
      html: built.html,
    });

    if (sendError) {
      console.error("[api/send-reminders] Resend error:", sendError);
      errors += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("intake_reminders")
      .update({ sent: true })
      .eq("id", row.id);

    if (updateError) {
      console.error("[api/send-reminders] Supabase update error:", updateError);
      errors += 1;
      continue;
    }

    sent += 1;
  }

  return { sent, errors };
}

async function handleAuthorized(): Promise<NextResponse> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY ontbreekt" },
      { status: 503 },
    );
  }

  try {
    const result = await runSendReminders();
    const nurture = await runPendingNurtureEmails();
    return NextResponse.json({ ...result, nurture });
  } catch (err) {
    console.error("[api/send-reminders]", err);
    return NextResponse.json(
      { error: "Verwerken van herinneringen mislukt" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET ontbreekt" },
      { status: 503 },
    );
  }
  if (!authorizePost(request)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  return handleAuthorized();
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET ontbreekt" },
      { status: 503 },
    );
  }
  if (!authorizeGet(request)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  return handleAuthorized();
}
