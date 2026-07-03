import { Resend } from "resend";
import { nurtureCtaButton, nurtureEmailWrap } from "@/lib/emails/shared";
import { emitEvent } from "@/lib/events";
import { hasActiveIntakeMarketingEmailConsent } from "@/lib/intake-marketing-consent-server";
import { buildNurtureUnsubscribeUrl } from "@/lib/nurture-unsubscribe";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { ANON_PROFILE_LABEL } from "@/lib/recovery-token";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

type AccountRow = {
  id: string;
  email: string;
};

type SessionRow = {
  id: string;
  account_id: string;
  created_at: string;
  profile_label: string | null;
};

type RemeasureCandidate = {
  accountId: string;
  email: string;
  baselineSessionId: string;
};

function isValidBaselineSession(row: SessionRow): boolean {
  const profileLabel =
    typeof row.profile_label === "string" ? row.profile_label.trim() : "";
  return profileLabel.length > 0 && profileLabel !== ANON_PROFILE_LABEL;
}

function isRemeasureDue(createdAt: string): boolean {
  const baseline = new Date(createdAt);
  const ts = baseline.getTime();
  if (!Number.isFinite(ts)) {
    return false;
  }
  const due = new Date(ts);
  due.setUTCDate(due.getUTCDate() + 30);
  return due.getTime() <= Date.now();
}

function buildRemeasureEmailHtml(intakeUrl: string, unsubscribeUrl: string): string {
  const bodyInnerRows = `
          <tr>
            <td style="padding:8px 28px 24px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Je eerste meting ligt nu ongeveer een maand achter je. Een hermeting laat zien of je leefstijl-stappen effect hebben — en of je prioriteit verschuift.
              </p>
              <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333333;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Het duurt een paar minuten. Geen diagnose — wel een helderder beeld van waar je staat.
              </p>
              ${nurtureCtaButton(intakeUrl, "Start je hermeting →")}
            </td>
          </tr>`;
  return nurtureEmailWrap(bodyInnerRows, unsubscribeUrl, false);
}

function collectCandidates(
  accounts: AccountRow[],
  sessions: SessionRow[],
): RemeasureCandidate[] {
  const accountById = new Map(accounts.map((row) => [row.id, row]));
  const sessionsByAccount = new Map<string, SessionRow[]>();

  for (const row of sessions) {
    const accountId =
      typeof row.account_id === "string" ? row.account_id.trim() : "";
    if (!accountId || !accountById.has(accountId)) {
      continue;
    }
    const list = sessionsByAccount.get(accountId) ?? [];
    list.push(row);
    sessionsByAccount.set(accountId, list);
  }

  const candidates: RemeasureCandidate[] = [];

  for (const [accountId, accountSessions] of sessionsByAccount) {
    if (accountSessions.length !== 1) {
      continue;
    }

    const baseline = accountSessions[0];
    if (!isValidBaselineSession(baseline)) {
      continue;
    }

    const createdAt =
      typeof baseline.created_at === "string" ? baseline.created_at.trim() : "";
    if (!createdAt || !isRemeasureDue(createdAt)) {
      continue;
    }

    const account = accountById.get(accountId);
    const email = typeof account?.email === "string" ? account.email.trim() : "";
    if (!email) {
      continue;
    }

    candidates.push({
      accountId,
      email,
      baselineSessionId: baseline.id,
    });
  }

  return candidates;
}

export async function runPendingRemeasureReminders(): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
}> {
  const supabase = createSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_CONFIG");
  }

  const { data: accountRows, error: accountsError } = await supabase
    .from("accounts")
    .select("id, email")
    .neq("status", "revoked");

  if (accountsError) {
    throw accountsError;
  }

  const accounts = (accountRows ?? []) as AccountRow[];
  if (accounts.length === 0) {
    return { scanned: 0, sent: 0, skipped: 0 };
  }

  const accountIds = accounts.map((row) => row.id);
  const { data: sessionRows, error: sessionsError } = await supabase
    .from("intake_sessions")
    .select("id, account_id, created_at, profile_label")
    .in("account_id", accountIds)
    .order("created_at", { ascending: true });

  if (sessionsError) {
    throw sessionsError;
  }

  const candidates = collectCandidates(
    accounts,
    (sessionRows ?? []) as SessionRow[],
  );
  if (candidates.length === 0) {
    return { scanned: 0, sent: 0, skipped: 0 };
  }

  const candidateIds = candidates.map((row) => row.accountId);
  const { data: sentRows, error: sentError } = await supabase
    .from("remeasure_reminders")
    .select("account_id")
    .in("account_id", candidateIds);

  if (sentError) {
    throw sentError;
  }

  const alreadySent = new Set(
    (sentRows ?? []).map((row) => String((row as { account_id: string }).account_id)),
  );
  const pending = candidates.filter((row) => !alreadySent.has(row.accountId));
  const scanned = pending.length;

  if (scanned === 0) {
    return { scanned: 0, sent: 0, skipped: 0 };
  }

  const siteUrl = getPublicSiteUrl();
  const intakeUrl = `${siteUrl}/intake?from=hermeting-mail`;
  let sent = 0;
  let skipped = 0;

  for (const candidate of pending) {
    const hasConsent = await hasActiveIntakeMarketingEmailConsent(
      supabase,
      candidate.baselineSessionId,
    );
    if (!hasConsent) {
      console.error(
        "[remeasure-reminder-cron] skipped (no marketing consent):",
        candidate.accountId,
      );
      skipped += 1;
      continue;
    }

    const unsubscribeUrl = buildNurtureUnsubscribeUrl(
      candidate.email,
      candidate.baselineSessionId,
      siteUrl,
    );
    const html = buildRemeasureEmailHtml(intakeUrl, unsubscribeUrl);

    try {
      const { error: sendError } = await getResend().emails.send({
        from: "PerfectSupplement <herinnering@mail.perfectsupplement.nl>",
        to: candidate.email,
        subject: "Tijd voor je hermeting",
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (sendError) {
        console.error("[remeasure-reminder-cron] Resend error:", sendError);
        skipped += 1;
        continue;
      }

      const { error: insertError } = await supabase
        .from("remeasure_reminders")
        .insert({ account_id: candidate.accountId });

      if (insertError) {
        console.error("[remeasure-reminder-cron] Supabase insert error:", insertError);
        skipped += 1;
        continue;
      }

      sent += 1;

      void emitEvent({
        eventType: "remeasure.invited",
        sessionId: candidate.baselineSessionId,
        email: candidate.email,
        payload: { channel: "email", surface: "day30" },
        deliveredTo: ["posthog"],
      });
    } catch (err) {
      console.error(
        "[remeasure-reminder-cron] mail failed:",
        candidate.accountId,
        err,
      );
      skipped += 1;
    }
  }

  return { scanned, sent, skipped };
}
