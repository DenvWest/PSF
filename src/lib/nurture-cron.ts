import { Resend } from "resend";
import { getNurtureEmailContent } from "@/lib/email-templates/nurture";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

type NurtureEmailRow = {
  id: string;
  email: string;
  sequence_day: number;
  profile_label: string | null;
  primary_domain: string | null;
  domain_scores: unknown;
  session_id: string | null;
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

    const profileLabel =
      typeof mail.profile_label === "string" && mail.profile_label.trim()
        ? mail.profile_label.trim()
        : "jouw profiel";
    const primaryDomain =
      typeof mail.primary_domain === "string" && mail.primary_domain.trim()
        ? mail.primary_domain.trim()
        : "sleep";

    try {
      const { subject, html } = getNurtureEmailContent(
        {
          sequenceDay: mail.sequence_day,
          profileLabel,
          primaryDomain,
          domainScores: parseDomainScores(mail.domain_scores),
        },
        {
          recipientEmail: email,
          sessionId: mail.session_id,
        },
      );

      const { data: sendData, error: sendError } = await resend.emails.send({
        from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
        to: email,
        subject,
        html,
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
