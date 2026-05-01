import { Resend } from "resend";
import { getNurtureEmailContent } from "@/lib/email-templates/nurture";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import type { DomainScores } from "@/lib/intake-engine";

const SEQUENCE_DAYS = [0, 3, 7, 14, 21, 30] as const;

interface NurtureScheduleInput {
  sessionId: string;
  email: string;
  profileLabel: string;
  primaryDomain: string;
  domainScores: DomainScores;
  urgencyLevel: string;
}

export async function scheduleNurtureSequence(input: NurtureScheduleInput) {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    console.error("scheduleNurtureSequence: Supabase admin not configured");
    throw new Error("SUPABASE_CONFIG");
  }

  const now = new Date();

  const laterDays = SEQUENCE_DAYS.filter((d) => d > 0);
  const pendingRows = laterDays.map((day) => ({
    session_id: input.sessionId,
    email: input.email,
    sequence_day: day,
    scheduled_at: new Date(
      now.getTime() + day * 24 * 60 * 60 * 1000,
    ).toISOString(),
    profile_label: input.profileLabel,
    primary_domain: input.primaryDomain,
    domain_scores: input.domainScores,
    urgency_level: input.urgencyLevel,
    status: "pending" as const,
  }));

  const domainScoresRecord: Record<string, number> = {
    ...input.domainScores,
  };

  const { subject, html } = getNurtureEmailContent(
    {
      sequenceDay: 0,
      profileLabel: input.profileLabel,
      primaryDomain: input.primaryDomain,
      domainScores: domainScoresRecord,
      urgencyLevel: input.urgencyLevel,
    },
    {
      recipientEmail: input.email,
      sessionId: input.sessionId,
    },
  );

  const listUnsubscribeUrl = buildNurtureUnsubscribeUrl(
    input.email,
    input.sessionId,
    getPublicSiteUrl(),
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  let resendId: string | undefined;
  let day0ErrorMessage: string | null = null;

  try {
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
      to: input.email,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${listUnsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (sendError) {
      console.error("Failed to send day-0 nurture email:", sendError);
      day0ErrorMessage =
        typeof sendError === "object" &&
        sendError !== null &&
        "message" in sendError
          ? String((sendError as { message?: unknown }).message)
          : "Resend send failed";
    } else {
      resendId = sendData?.id;
    }
  } catch (err) {
    console.error("Failed to send day-0 nurture email:", err);
    day0ErrorMessage =
      err instanceof Error ? err.message : "Unknown error";
  }

  const day0Row = {
    session_id: input.sessionId,
    email: input.email,
    sequence_day: 0,
    scheduled_at: now.toISOString(),
    profile_label: input.profileLabel,
    primary_domain: input.primaryDomain,
    domain_scores: input.domainScores,
    urgency_level: input.urgencyLevel,
    status: resendId ? ("sent" as const) : ("failed" as const),
    sent_at: resendId ? now.toISOString() : null,
    resend_id: resendId ?? null,
    error_message: resendId ? null : day0ErrorMessage,
  };

  const { error } = await supabase
    .from("nurture_emails")
    .insert([day0Row, ...pendingRows]);

  if (error) {
    console.error("Failed to schedule nurture sequence:", error);
    throw error;
  }

  return 1 + pendingRows.length;
}
