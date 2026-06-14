/**
 * Her-log-uitnodiging ~14 dagen na de eerste voedingscheck.
 * Volume-gated operationeel pad — geen nieuwe capture-mechaniek.
 */

import { Resend } from "resend";
import { emitEvent } from "@/lib/events";
import { hasActiveIntakeMarketingEmailConsent } from "@/lib/intake-marketing-consent-server";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import {
  ANON_PROFILE_LABEL,
  createRecoveryToken,
  buildRecoveryUrl,
} from "@/lib/recovery-token";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const REL0G_SOURCE = "nutrition_relog";
const DAYS_AFTER_FIRST_LOG = 14;

function relogRecoveryUrl(rawToken: string): string {
  const base = buildRecoveryUrl(rawToken);
  return `${base}&dest=voeding`;
}

function buildRelogEmailHtml(
  firstName: string | null,
  relogUrl: string,
  unsubscribeUrl: string,
): string {
  const greeting = firstName ? `Hoi ${firstName},` : "Hoi,";
  return `
    <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1a1a1a;">
      <p>${greeting}</p>
      <p>
        Twee weken geleden deed je de voedingscheck. Log opnieuw in één minuut —
        dan zie je of je eiwit, groente en vette vis de goede kant op bewogen.
      </p>
      <p>
        Eerst de basis uit voeding; supplementen zijn aanvulling, geen vervanging.
      </p>
      <p style="margin: 24px 0;">
        <a href="${relogUrl}" style="display:inline-block;padding:12px 20px;background:#5c6b4a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Log je voeding opnieuw →
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">
        <a href="${unsubscribeUrl}">Uitschrijven</a>
      </p>
    </div>
  `;
}

export async function runNutritionRelogInvites(): Promise<{
  sent: number;
  errors: number;
}> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const cutoff = new Date(
    Date.now() - DAYS_AFTER_FIRST_LOG * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: logs, error: logsError } = await supabase
    .from("intake_intake_log")
    .select("session_id, logged_at")
    .lte("logged_at", cutoff)
    .order("logged_at", { ascending: true });

  if (logsError) {
    console.error("[nutrition-relog] fetch logs:", logsError);
    throw logsError;
  }

  const sessionCounts = new Map<string, number>();
  for (const row of logs ?? []) {
    const sid = String(row.session_id);
    sessionCounts.set(sid, (sessionCounts.get(sid) ?? 0) + 1);
  }

  const candidates = [...sessionCounts.entries()]
    .filter(([, count]) => count === 1)
    .map(([sessionId]) => sessionId);

  if (candidates.length === 0) {
    return { sent: 0, errors: 0 };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = getPublicSiteUrl();
  let sent = 0;
  let errors = 0;

  for (const sessionId of candidates) {
    const { data: existing } = await supabase
      .from("nurture_emails")
      .select("id")
      .eq("session_id", sessionId)
      .eq("source", REL0G_SOURCE)
      .limit(1);

    if (existing?.length) {
      continue;
    }

    const { data: session, error: sessionError } = await supabase
      .from("intake_sessions")
      .select("marketing_email, first_name, profile_label")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      errors += 1;
      continue;
    }

    const profileLabel =
      typeof session.profile_label === "string"
        ? session.profile_label.trim()
        : "";
    if (!profileLabel || profileLabel === ANON_PROFILE_LABEL) {
      continue;
    }

    const email =
      typeof session.marketing_email === "string"
        ? session.marketing_email.trim()
        : "";
    if (!email) {
      continue;
    }

    const hasConsent = await hasActiveIntakeMarketingEmailConsent(
      supabase,
      sessionId,
    );
    if (!hasConsent) {
      continue;
    }

    const rawToken = await createRecoveryToken(sessionId);
    if (!rawToken) {
      errors += 1;
      continue;
    }

    const relogUrl = relogRecoveryUrl(rawToken);
    const unsubscribeUrl = buildNurtureUnsubscribeUrl(
      email,
      sessionId,
      siteUrl,
    );
    const firstName =
      typeof session.first_name === "string" && session.first_name.trim()
        ? session.first_name.trim()
        : null;

    const subject = "Twee weken later: log je voeding opnieuw (1 min)";
    const html = buildRelogEmailHtml(firstName, relogUrl, unsubscribeUrl);

    const now = new Date();
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: email,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (sendError) {
      console.error("[nutrition-relog] send failed:", sendError);
      errors += 1;
      await supabase.from("nurture_emails").insert({
        source: REL0G_SOURCE,
        session_id: sessionId,
        email,
        sequence_day: DAYS_AFTER_FIRST_LOG,
        scheduled_at: now.toISOString(),
        profile_label: profileLabel,
        primary_domain: "nutrition",
        status: "failed",
        sent_at: null,
        resend_id: null,
        error_message:
          typeof sendError === "object" &&
          sendError !== null &&
          "message" in sendError
            ? String((sendError as { message?: unknown }).message)
            : "Resend send failed",
        variant: null,
      });
      continue;
    }

    await supabase.from("nurture_emails").insert({
      source: REL0G_SOURCE,
      session_id: sessionId,
      email,
      sequence_day: DAYS_AFTER_FIRST_LOG,
      scheduled_at: now.toISOString(),
      profile_label: profileLabel,
      primary_domain: "nutrition",
      status: "sent",
      sent_at: now.toISOString(),
      resend_id: sendData?.id ?? null,
      error_message: null,
      variant: null,
    });

    void emitEvent({
      eventType: "intake.cta_to_nutrition_log",
      sessionId,
      email,
      payload: {
        channel: "nutrition_relog_email",
        sequence_day: DAYS_AFTER_FIRST_LOG,
      },
      deliveredTo: ["n8n_webhook"],
    });

    sent += 1;
  }

  return { sent, errors };
}
