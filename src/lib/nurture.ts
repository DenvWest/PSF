import { Resend } from "resend";
import { emitEvent } from "@/lib/events";
import { getNurtureEmailContent } from "@/lib/email-templates/nurture";
import { slugFromComparisonPath } from "@/lib/resolve-nurture-cta";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import { buildIntakeRecoveryUrlForSession } from "@/lib/recovery-token";
import { buildNurtureAttributionToken } from "@/lib/nurture-attribution-token";
import { cancelPendingGuideSequences } from "@/lib/guide-nurture";
import { emailHasActiveAccount } from "@/lib/account-server";
import { resolveNurtureDashboardUrl } from "@/lib/nurture-dashboard-url";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { RULES_VERSION, type DomainScores } from "@/lib/intake-engine";

const MAIN_NURTURE_SOURCE = "intake" as const;
const SEQUENCE_DAYS = [0, 3, 7, 14, 21, 30] as const;

export async function hasActiveMainNurture(email: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("nurture_emails")
    .select("id")
    .eq("email", email)
    .eq("source", MAIN_NURTURE_SOURCE)
    .in("status", ["pending", "sent"])
    .limit(1);

  if (error) {
    console.error("[nurture] active main check:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

interface NurtureScheduleInput {
  sessionId: string;
  email: string;
  profileLabel: string;
  primaryDomain: string;
  domainScores: DomainScores;
  urgencyLevel: string;
  firstName: string | null;
}

export async function scheduleNurtureSequence(input: NurtureScheduleInput) {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    console.error("scheduleNurtureSequence: Supabase admin not configured");
    throw new Error("SUPABASE_CONFIG");
  }

  await cancelPendingGuideSequences(input.email);

  const now = new Date();

  const laterDays = SEQUENCE_DAYS.filter((d) => d > 0);
  const pendingRows = laterDays.map((day) => ({
    source: MAIN_NURTURE_SOURCE,
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
    first_name: input.firstName,
    status: "pending" as const,
    variant: null,
  }));

  const domainScoresRecord: Record<string, number> = {
    ...input.domainScores,
  };

  const recoveryUrl = await buildIntakeRecoveryUrlForSession(input.sessionId);
  const hasAccount = await emailHasActiveAccount(supabase, input.email);
  const dashboardUrl = resolveNurtureDashboardUrl(hasAccount);

  const nurtureToken = buildNurtureAttributionToken({
    sessionId: input.sessionId,
    sequenceDay: 0,
    profileLabel: input.profileLabel,
    variant: null,
  });

  const { subject, html, resolvedCta } = getNurtureEmailContent(
    {
      sequenceDay: 0,
      profileLabel: input.profileLabel,
      primaryDomain: input.primaryDomain,
      domainScores: domainScoresRecord,
      urgencyLevel: input.urgencyLevel,
      firstName: input.firstName,
    },
    {
      recipientEmail: input.email,
      sessionId: input.sessionId,
      recoveryUrl,
      dashboardUrl,
      nurtureToken: nurtureToken || null,
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
    source: MAIN_NURTURE_SOURCE,
    session_id: input.sessionId,
    email: input.email,
    sequence_day: 0,
    scheduled_at: now.toISOString(),
    profile_label: input.profileLabel,
    primary_domain: input.primaryDomain,
    domain_scores: input.domainScores,
    urgency_level: input.urgencyLevel,
    first_name: input.firstName,
    status: resendId ? ("sent" as const) : ("failed" as const),
    sent_at: resendId ? now.toISOString() : null,
    resend_id: resendId ?? null,
    error_message: resendId ? null : day0ErrorMessage,
    variant: null,
  };

  const { error } = await supabase
    .from("nurture_emails")
    .insert([day0Row, ...pendingRows]);

  if (error) {
    console.error("Failed to schedule nurture sequence:", error);
    throw error;
  }

  if (resendId) {
    const ctaSlug =
      resolvedCta.kind === "supplement"
        ? (slugFromComparisonPath(resolvedCta.url) ?? null)
        : null;
    void emitEvent({
      eventType: "nurture.email_sent",
      sessionId: input.sessionId,
      email: input.email,
      payload: {
        sequence_day: 0,
        profile_label: input.profileLabel,
        primary_domain: input.primaryDomain,
        status: "sent",
        cta_kind: resolvedCta.kind,
        cta_slug: ctaSlug,
        candidate_rank: resolvedCta.candidateRank,
        variant: null,
        rules_version: RULES_VERSION,
      },
      deliveredTo: ["n8n_webhook"],
    });
  }

  if (pendingRows.length > 0) {
    void emitEvent({
      eventType: "nurture.scheduled",
      sessionId: input.sessionId,
      email: input.email,
      payload: {
        primary_domain: input.primaryDomain,
        profile_label: input.profileLabel,
        urgency_level: input.urgencyLevel,
        scheduled_count: pendingRows.length,
        sequence_days: pendingRows.map((row) => row.sequence_day),
        rules_version: RULES_VERSION,
      },
      deliveredTo: ["n8n_webhook"],
    });
  }

  return 1 + pendingRows.length;
}

export async function scheduleMainNurtureIfInactive(
  input: NurtureScheduleInput,
): Promise<"scheduled" | "skipped_active"> {
  if (await hasActiveMainNurture(input.email)) {
    return "skipped_active";
  }
  await scheduleNurtureSequence(input);
  return "scheduled";
}
