import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  getThemaNurtureTemplate,
  type ThemaNurtureDay,
} from "@/lib/email-templates/thema-nurture";
import { getPublicSiteUrl } from "@/lib/public-site-url";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

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

async function handleAuthorized(): Promise<NextResponse> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY ontbreekt" },
      { status: 503 },
    );
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const now = new Date().toISOString();

  const { data: pendingEmails, error } = await supabase
    .from("thema_nurture")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "DB query failed" }, { status: 500 });
  }

  const list = pendingEmails ?? [];
  if (list.length === 0) {
    return NextResponse.json({ sent: 0, errors: 0 });
  }

  let sent = 0;
  let errors = 0;

  for (const mail of list) {
    const template = getThemaNurtureTemplate(
      mail.thema,
      mail.sequence_day as ThemaNurtureDay,
    );

    if (!template) {
      await supabase
        .from("thema_nurture")
        .update({ status: "failed", error_message: "Template niet gevonden" })
        .eq("id", mail.id);
      errors += 1;
      continue;
    }

    const siteUrl = getPublicSiteUrl();
    const unsubscribeUrl = `${siteUrl}/api/thema/unsubscribe?email=${encodeURIComponent(mail.email)}&thema=${encodeURIComponent(mail.thema)}`;

    try {
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
        to: mail.email,
        subject: template.subject,
        html: template.html(unsubscribeUrl),
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendError) throw new Error("Resend failed");

      await supabase
        .from("thema_nurture")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          resend_id: sendData?.id ?? null,
        })
        .eq("id", mail.id);

      sent += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await supabase
        .from("thema_nurture")
        .update({ status: "failed", error_message: msg })
        .eq("id", mail.id);
      errors += 1;
    }
  }

  return NextResponse.json({ sent, errors });
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

  try {
    return await handleAuthorized();
  } catch (err) {
    console.error("[api/cron/thema-nurture]", err);
    return NextResponse.json(
      { error: "Verwerken van thema nurture-mails mislukt" },
      { status: 500 },
    );
  }
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

  try {
    return await handleAuthorized();
  } catch (err) {
    console.error("[api/cron/thema-nurture]", err);
    return NextResponse.json(
      { error: "Verwerken van thema nurture-mails mislukt" },
      { status: 500 },
    );
  }
}
