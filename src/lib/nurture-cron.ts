import { Resend } from "resend";
import { getGuideNurtureEmailContent } from "@/lib/email-templates/guide-nurture";
import { getNurtureEmailContent } from "@/lib/email-templates/nurture";
import {
  buildGuideUnsubscribeUrl,
  buildNurtureUnsubscribeUrl,
} from "@/lib/nurture-unsubscribe";
import {
  ANON_PROFILE_LABEL,
  buildIntakeFallbackUrl,
  buildIntakeRecoveryUrlForSession,
} from "@/lib/recovery-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import type { GuideThema } from "@/types/guide-opt-in";
import { isGuideThema } from "@/data/gids";

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

type NurtureEmailRow = {
  id: string;
  email: string;
  sequence_day: number;
  profile_label: string | null;
  primary_domain: string | null;
  domain_scores: unknown;
  session_id: string | null;
  urgency_level: string | null;
  first_name: string | null;
  source: string | null;
  thema: string | null;
};

function parseDomainScores(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = v;
    }
  }
  return out;
}

function isGuideSource(source: string | null): boolean {
  return typeof source === "string" && source.startsWith("guide_");
}

export async function runPendingNurtureEmails(): Promise<{
  sent: number;
  errors: number;
}> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const now = new Date().toISOString();

  const { data: pendingEmails, error } = await supabase
    .from("nurture_emails")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[nurture-cron] fetch nurture_emails:", error);
    throw error;
  }

  const list = (pendingEmails ?? []) as NurtureEmailRow[];
  if (list.length === 0) {
    return { sent: 0, errors: 0 };
  }

  let sent = 0;
  let errors = 0;
  const siteUrl = getPublicSiteUrl();

  for (const mail of list) {
    const email = typeof mail.email === "string" ? mail.email.trim() : "";
    if (!email) {
      errors += 1;
      await supabase
        .from("nurture_emails")
        .update({
          status: "failed",
          error_message: "Ontbrekend e-mailadres",
        })
        .eq("id", mail.id);
      continue;
    }

    const source =
      typeof mail.source === "string" && mail.source.trim()
        ? mail.source.trim()
        : "intake";

    try {
      let subject: string;
      let html: string;
      let listUnsubscribeUrl: string;

      if (isGuideSource(source)) {
        const themaRaw =
          typeof mail.thema === "string" ? mail.thema.trim().toLowerCase() : "";
        if (!isGuideThema(themaRaw)) {
          throw new Error("Onbekend gids-thema");
        }
        const thema = themaRaw as GuideThema;
        listUnsubscribeUrl = buildGuideUnsubscribeUrl(email, thema, siteUrl);
        const content = getGuideNurtureEmailContent(
          thema,
          mail.sequence_day,
          listUnsubscribeUrl,
        );
        if (!content) {
          throw new Error("Gids-template niet gevonden");
        }
        subject = content.subject;
        html = content.html;
      } else {
        if (mail.session_id) {
          const { data: sessionRow, error: sessionError } = await supabase
            .from("intake_sessions")
            .select("profile_label")
            .eq("id", mail.session_id)
            .maybeSingle();

          if (sessionError) {
            throw sessionError;
          }

          const profileLabel =
            typeof sessionRow?.profile_label === "string"
              ? sessionRow.profile_label.trim()
              : "";
          if (!profileLabel || profileLabel === ANON_PROFILE_LABEL) {
            await supabase
              .from("nurture_emails")
              .update({
                status: "cancelled",
                error_message: "Sessie ingetrokken of geanonimiseerd",
              })
              .eq("id", mail.id);
            continue;
          }
        }

        const profileLabel =
          typeof mail.profile_label === "string" && mail.profile_label.trim()
            ? mail.profile_label.trim()
            : "jouw profiel";
        const firstName =
          typeof mail.first_name === "string" && mail.first_name.trim()
            ? mail.first_name.trim()
            : null;
        const primaryDomain =
          typeof mail.primary_domain === "string" && mail.primary_domain.trim()
            ? mail.primary_domain.trim()
            : "sleep";
        const urgencyLevel =
          typeof mail.urgency_level === "string" && mail.urgency_level.trim()
            ? mail.urgency_level.trim()
            : "moderate";

        const recoveryUrl = mail.session_id
          ? await buildIntakeRecoveryUrlForSession(mail.session_id)
          : buildIntakeFallbackUrl();

        const intakeContent = getNurtureEmailContent(
          {
            sequenceDay: mail.sequence_day,
            profileLabel,
            primaryDomain,
            domainScores: parseDomainScores(mail.domain_scores),
            urgencyLevel,
            firstName,
          },
          {
            recipientEmail: email,
            sessionId: mail.session_id,
            recoveryUrl,
          },
        );
        subject = intakeContent.subject;
        html = intakeContent.html;
        listUnsubscribeUrl = buildNurtureUnsubscribeUrl(
          email,
          mail.session_id,
          siteUrl,
        );
      }

      const { data: sendData, error: sendError } = await getResend().emails.send({
        from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
        to: email,
        subject,
        html,
        headers: {
          "List-Unsubscribe": `<${listUnsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendError) {
        console.error("[nurture-cron] Resend error:", sendError);
        throw new Error(
          typeof sendError === "object" && sendError !== null && "message" in sendError
            ? String((sendError as { message?: unknown }).message)
            : "Resend send failed",
        );
      }

      const { error: updateError } = await supabase
        .from("nurture_emails")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          resend_id: sendData?.id ?? null,
          error_message: null,
        })
        .eq("id", mail.id);

      if (updateError) {
        console.error("[nurture-cron] Supabase update (sent):", updateError);
        errors += 1;
        continue;
      }

      sent += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[nurture-cron] mail failed:", mail.id, msg);
      const { error: failUpdate } = await supabase
        .from("nurture_emails")
        .update({
          status: "failed",
          error_message: msg,
        })
        .eq("id", mail.id);
      if (failUpdate) {
        console.error("[nurture-cron] Supabase update (failed):", failUpdate);
      }
      errors += 1;
    }
  }

  return { sent, errors };
}
