import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getClientIp } from "@/lib/client-ip";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import {
  getThemaNurtureTemplate,
  hasThemaNurtureSequence,
} from "@/lib/email-templates/thema-nurture";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Thema’s met downloadflow; dag-1 body komt uit getThemaNurtureTemplate(thema, 1). */
const THEMA_DOWNLOADS: Record<string, true> = {
  slaap: true,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/thema/download][security]", { event, ...details });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "thema_download",
    clientIp,
    getRateLimitConfig("thema_download"),
  );

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel verzoeken, probeer het later opnieuw" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const email =
    typeof record.email === "string" ? record.email.trim() : "";
  const thema =
    typeof record.thema === "string" ? record.thema.trim() : "";

  if (!email) {
    return NextResponse.json(
      { error: "Ongeldig e-mailadres" },
      { status: 400 },
    );
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Ongeldig e-mailadres" },
      { status: 400 },
    );
  }

  const download = THEMA_DOWNLOADS[thema];
  if (!download) {
    return NextResponse.json(
      { error: thema ? "Onbekend thema" : "Ongeldig verzoek" },
      { status: 400 },
    );
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuratie fout" },
      { status: 500 },
    );
  }

  const template = getThemaNurtureTemplate(thema, 1);
  if (!template) {
    return NextResponse.json(
      { error: "E-mailtemplate niet gevonden" },
      { status: 500 },
    );
  }

  const siteUrl = getPublicSiteUrl();
  const unsubscribeUrl = `${siteUrl}/api/thema/unsubscribe?email=${encodeURIComponent(email)}&thema=${encodeURIComponent(thema)}`;
  const emailHtml = template.html(unsubscribeUrl);

  try {
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: email,
      subject: template.subject,
      html: emailHtml,
    });

    if (sendError) {
      logSecurityEvent("resend_failed", { remoteIp: clientIp });
      return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
    }

    const resendId = sendData?.id ?? null;

    const { error: insertError } = await supabase
      .from("thema_downloads")
      .insert({ email, thema });

    if (insertError) {
      logSecurityEvent("db_insert_failed", { remoteIp: clientIp });
      return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
    }

    if (hasThemaNurtureSequence(thema)) {
      const { data: existing } = await supabase
        .from("thema_nurture")
        .select("id")
        .eq("email", email)
        .eq("thema", thema)
        .limit(1);

      if (!existing?.length) {
        const NURTURE_DAYS = [3, 7] as const;
        const now = new Date();
        const nurturePending = NURTURE_DAYS.map((day) => ({
          email,
          thema,
          sequence_day: day,
          scheduled_at: new Date(
            now.getTime() + day * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "pending" as const,
        }));

        const day1Row = {
          email,
          thema,
          sequence_day: 1,
          scheduled_at: now.toISOString(),
          status: "sent" as const,
          sent_at: now.toISOString(),
          resend_id: resendId,
        };

        const { error: nurtureInsertError } = await supabase
          .from("thema_nurture")
          .insert([day1Row, ...nurturePending]);

        if (nurtureInsertError) {
          logSecurityEvent("thema_nurture_insert_failed", {
            remoteIp: clientIp,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    logSecurityEvent("unexpected_error", { remoteIp: clientIp });
    return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
  }
}
