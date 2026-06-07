import { Resend } from "resend";
import { getNurtureEmailContent } from "@/lib/email-templates/nurture";
import { emitEvent } from "@/lib/events";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import type { DomainScores } from "@/lib/intake-engine";
import { getPrimaryTheme } from "@/lib/primary-theme";
import {
  buildIntakeFallbackUrl,
  buildIntakeRecoveryUrlForSession,
} from "@/lib/recovery-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicSiteUrl } from "@/lib/public-site-url";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

type ReminderRow = {
  id: string;
  email: string;
  session_id: string | null;
};

type SessionRow = {
  id: string;
  profile_label: string | null;
  domain_scores: unknown;
  urgency_level: string | null;
  answers: unknown;
};

function parseDomainScores(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    }
  }
  return out;
}

function parseAnswers(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function isDomainScores(value: unknown): value is DomainScores {
  if (!value || typeof value !== "object") {
    return false;
  }
  const keys: (keyof DomainScores)[] = [
    "sleep_score",
    "energy_score",
    "stress_score",
    "nutrition_score",
    "movement_score",
    "recovery_score",
  ];
  const record = value as Record<string, unknown>;
  return keys.every(
    (key) => typeof record[key] === "number" && Number.isFinite(record[key]),
  );
}

function resolvePrimaryDomain(
  session: SessionRow | null,
): string {
  if (!session) {
    return "sleep";
  }

  const answers = parseAnswers(session.answers);
  const scores = isDomainScores(session.domain_scores)
    ? session.domain_scores
    : null;

  if (scores && answers) {
    return getPrimaryTheme(scores, answers);
  }

  return "sleep";
}

/**
 * Verstuurt openstaande `intake_reminders` (alleen `day30` / `30d`).
 * De nurture-sequentie loopt via `nurture_emails` + `runPendingNurtureEmails`.
 */
export async function runPendingIntakeReminders(): Promise<{
  sent: number;
  errors: number;
}> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const nowIso = new Date().toISOString();
  const { data: reminderRows, error: fetchError } = await supabase
    .from("intake_reminders")
    .select("id, email, session_id")
    .in("reminder_type", ["day30", "30d"])
    .lte("reminder_date", nowIso)
    .eq("sent", false);

  if (fetchError) {
    throw fetchError;
  }

  const list = (reminderRows ?? []) as ReminderRow[];
  if (list.length === 0) {
    return { sent: 0, errors: 0 };
  }

  const sessionIds = [
    ...new Set(
      list
        .map((row) => row.session_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  const sessionById = new Map<string, SessionRow>();
  if (sessionIds.length > 0) {
    const { data: sessionRows, error: sessionError } = await supabase
      .from("intake_sessions")
      .select("id, profile_label, domain_scores, urgency_level, answers")
      .in("id", sessionIds);

    if (sessionError) {
      throw sessionError;
    }

    for (const row of (sessionRows ?? []) as SessionRow[]) {
      sessionById.set(row.id, row);
    }
  }

  const siteUrl = getPublicSiteUrl();
  let sent = 0;
  let errors = 0;

  for (const row of list) {
    const email = typeof row.email === "string" ? row.email.trim() : "";
    if (!email) {
      errors += 1;
      continue;
    }

    const session = row.session_id ? sessionById.get(row.session_id) ?? null : null;
    const profileLabel =
      typeof session?.profile_label === "string" && session.profile_label.trim()
        ? session.profile_label.trim()
        : "jouw profiel";
    const urgencyLevel =
      typeof session?.urgency_level === "string" && session.urgency_level.trim()
        ? session.urgency_level.trim()
        : "moderate";
    const domainScores = parseDomainScores(session?.domain_scores);
    const primaryDomain = resolvePrimaryDomain(session);
    const recoveryUrl = row.session_id
      ? await buildIntakeRecoveryUrlForSession(row.session_id)
      : buildIntakeFallbackUrl();
    const listUnsubscribeUrl = buildNurtureUnsubscribeUrl(
      email,
      row.session_id,
      siteUrl,
    );

    const { subject, html } = getNurtureEmailContent(
      {
        sequenceDay: 30,
        profileLabel,
        primaryDomain,
        domainScores,
        urgencyLevel,
      },
      {
        recipientEmail: email,
        sessionId: row.session_id,
        recoveryUrl,
      },
    );

    try {
      const { error: sendError } = await getResend().emails.send({
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
        console.error("[intake-reminder-cron] Resend error:", sendError);
        errors += 1;
        continue;
      }

      const { error: updateError } = await supabase
        .from("intake_reminders")
        .update({ sent: true })
        .eq("id", row.id);

      if (updateError) {
        console.error("[intake-reminder-cron] Supabase update error:", updateError);
        errors += 1;
        continue;
      }

      sent += 1;

      void emitEvent({
        eventType: "remeasure.invited",
        sessionId: row.session_id,
        email,
        payload: {
          days_since_intake: 30,
        },
        deliveredTo: ["n8n_webhook"],
      });
    } catch (err) {
      console.error("[intake-reminder-cron] mail failed:", row.id, err);
      errors += 1;
    }
  }

  return { sent, errors };
}
