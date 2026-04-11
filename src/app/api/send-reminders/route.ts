import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getReminderEmailHtml } from "@/lib/email-templates/reminder";

const resend = new Resend(process.env.RESEND_API_KEY);

type IntakeReminderRow = {
  id: string;
  email: string;
};

function getCronSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;
  if (!url || !key || url.includes("<")) {
    return null;
  }
  return createClient(url, key);
}

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
  if (getBearerToken(request) === secret) return true;
  const url = new URL(request.url);
  const q = url.searchParams.get("secret")?.trim() ?? "";
  return q === secret;
}

async function runSendReminders(): Promise<{ sent: number; errors: number }> {
  const supabase = getCronSupabase();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const nowIso = new Date().toISOString();

  const { data: rows, error: fetchError } = await supabase
    .from("intake_reminders")
    .select("id,email")
    .lte("reminder_date", nowIso)
    .eq("sent", false);

  if (fetchError) {
    throw fetchError;
  }

  const list = (rows ?? []) as IntakeReminderRow[];
  let sent = 0;
  let errors = 0;
  const html = getReminderEmailHtml();

  for (const row of list) {
    if (!row.id || typeof row.email !== "string" || !row.email.trim()) {
      errors += 1;
      continue;
    }

    const { error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: row.email.trim(),
      subject: "Tijd voor je voortgangscheck",
      html,
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
    return NextResponse.json(result);
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
