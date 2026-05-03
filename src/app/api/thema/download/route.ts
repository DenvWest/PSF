import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getClientIp } from "@/lib/client-ip";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { absoluteUrl } from "@/lib/public-site-url";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

const THEMA_DOWNLOADS: Record<
  string,
  { pdfPath: string; subject: string; title: string }
> = {
  slaap: {
    pdfPath: "/downloads/slaapgids-perfectsupplement.pdf",
    subject: "Je Slaapgids staat klaar",
    title: "De complete gids voor betere slaap na 40",
  },
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

  const pdfUrl = absoluteUrl(download.pdfPath);

  try {
    const { error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: email,
      subject: download.subject,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
            ${download.title}
          </h1>
          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Bedankt voor je interesse. Hieronder vind je de link om je gids te downloaden.
          </p>
          <a href="${pdfUrl}" style="display: inline-block; background-color: #3C7A56; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Download de gids (PDF) →
          </a>
          <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.5;">
            Je ontvangt deze e-mail omdat je de gids hebt aangevraagd via PerfectSupplement.nl.
            Je kunt je altijd uitschrijven.
          </p>
        </div>
      `,
    });

    if (sendError) {
      logSecurityEvent("resend_failed", { remoteIp: clientIp });
      return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from("thema_downloads")
      .insert({ email, thema });

    if (insertError) {
      logSecurityEvent("db_insert_failed", { remoteIp: clientIp });
      return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    logSecurityEvent("unexpected_error", { remoteIp: clientIp });
    return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
  }
}
