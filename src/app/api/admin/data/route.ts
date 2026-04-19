import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, INTAKE_AGE_RANGE_OPTIONS } from "@/data/intake-questions";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import type {
  AdminDashboardPayload,
  AdminNurtureSection,
} from "@/lib/admin-dashboard-types";
import { anonymizeEmailForAdmin } from "@/lib/nurture-unsubscribe";
import type { DomainScores } from "@/lib/intake-engine";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const NURTURE_SEQUENCE_DAYS = [0, 3, 7, 14, 21, 30] as const;

async function loadNurtureSection(
  admin: SupabaseClient,
): Promise<AdminNurtureSection | null> {
  const statusList = ["pending", "sent", "failed", "cancelled"] as const;
  const countResults = await Promise.all(
    statusList.map((status) =>
      admin
        .from("nurture_emails")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  );

  for (const r of countResults) {
    if (r.error) {
      console.error("[api/admin/data] nurture count:", r.error);
      return null;
    }
  }

  const stats = {
    pending: countResults[0]?.count ?? 0,
    sent: countResults[1]?.count ?? 0,
    failed: countResults[2]?.count ?? 0,
    cancelled: countResults[3]?.count ?? 0,
  };

  const { data: recentRaw, error: recentErr } = await admin
    .from("nurture_emails")
    .select("email, sequence_day, status, scheduled_at")
    .order("scheduled_at", { ascending: false })
    .limit(30);

  if (recentErr) {
    console.error("[api/admin/data] nurture recent:", recentErr);
    return null;
  }

  const recent = (recentRaw ?? []).map((row) => ({
    emailMasked:
      typeof row.email === "string"
        ? anonymizeEmailForAdmin(row.email)
        : "—",
    sequenceDay: typeof row.sequence_day === "number" ? row.sequence_day : 0,
    status: typeof row.status === "string" ? row.status : "—",
    scheduledAt:
      typeof row.scheduled_at === "string" ? row.scheduled_at : "",
  }));

  const { data: sentRows, error: sentErr } = await admin
    .from("nurture_emails")
    .select("sequence_day")
    .eq("status", "sent");

  if (sentErr) {
    console.error("[api/admin/data] nurture sent seq:", sentErr);
    return null;
  }

  const sentBySeq = new Map<number, number>();
  for (const row of sentRows ?? []) {
    const d = row.sequence_day;
    if (typeof d === "number" && Number.isFinite(d)) {
      sentBySeq.set(d, (sentBySeq.get(d) ?? 0) + 1);
    }
  }

  const sequenceSent = NURTURE_SEQUENCE_DAYS.map((d) => ({
    sequenceDay: d,
    sent: sentBySeq.get(d) ?? 0,
  }));

  const { data: day30Rows, error: d30Err } = await admin
    .from("nurture_emails")
    .select("email, sent_at")
    .eq("sequence_day", 30)
    .eq("status", "sent")
    .not("sent_at", "is", null);

  if (d30Err) {
    console.error("[api/admin/data] nurture day30:", d30Err);
    return null;
  }

  const { data: sessionRows, error: sessErr } = await admin
    .from("intake_sessions")
    .select("marketing_email, created_at")
    .not("marketing_email", "is", null);

  if (sessErr) {
    console.error("[api/admin/data] nurture sessions join:", sessErr);
    return null;
  }

  const sessionsByEmail = new Map<string, Date[]>();
  for (const row of sessionRows ?? []) {
    const em =
      typeof row.marketing_email === "string"
        ? row.marketing_email.trim().toLowerCase()
        : "";
    if (!em) continue;
    const created =
      typeof row.created_at === "string" ? new Date(row.created_at) : null;
    if (!created || Number.isNaN(created.getTime())) continue;
    const list = sessionsByEmail.get(em) ?? [];
    list.push(created);
    sessionsByEmail.set(em, list);
  }

  let repeatIntakeAfterMail = 0;
  const d30List = day30Rows ?? [];
  for (const row of d30List) {
    const em =
      typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
    const sentAt =
      typeof row.sent_at === "string" ? new Date(row.sent_at) : null;
    if (!em || !sentAt || Number.isNaN(sentAt.getTime())) {
      continue;
    }
    const times = sessionsByEmail.get(em);
    if (!times?.length) continue;
    if (times.some((t) => t.getTime() > sentAt.getTime())) {
      repeatIntakeAfterMail += 1;
    }
  }

  const day30Sent = d30List.length;
  const conversionRate =
    day30Sent > 0 ? repeatIntakeAfterMail / day30Sent : null;

  return {
    stats,
    recent,
    sequenceSent,
    day30Conversion: {
      day30Sent,
      repeatIntakeAfterMail,
      conversionRate,
    },
  };
}

const DOMAIN_KEYS: readonly (keyof DomainScores)[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
] as const;

function isDomainScores(value: unknown): value is DomainScores {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return DOMAIN_KEYS.every(
    (k) => typeof o[k] === "number" && Number.isFinite(o[k] as number),
  );
}

function totalScoreFromDomains(ds: DomainScores | null): number | null {
  if (!ds || !isDomainScores(ds)) {
    return null;
  }
  return DOMAIN_KEYS.reduce((acc, k) => acc + ds[k], 0);
}

function startOfDayMs(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const [sessionsRes, remindersRes, feedbackRes] = await Promise.all([
    admin
      .from("intake_sessions")
      .select(
        "created_at, age_range, profile_label, domain_scores, urgency_level, marketing_email",
      ),
    admin.from("intake_reminders").select("email, sent"),
    admin
      .from("intake_feedback")
      .select("rating, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (sessionsRes.error) {
    console.error("[api/admin/data] sessions:", sessionsRes.error);
    return NextResponse.json(
      { error: "Kon sessies niet laden." },
      { status: 500 },
    );
  }
  if (remindersRes.error) {
    console.error("[api/admin/data] reminders:", remindersRes.error);
    return NextResponse.json(
      { error: "Kon reminders niet laden." },
      { status: 500 },
    );
  }
  if (feedbackRes.error) {
    console.error("[api/admin/data] feedback:", feedbackRes.error);
    return NextResponse.json(
      { error: "Kon feedback niet laden." },
      { status: 500 },
    );
  }

  const sessions = sessionsRes.data ?? [];
  const reminders = remindersRes.data ?? [];

  const now = new Date();
  const todayStart = startOfDayMs(now);
  const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = todayStart - 14 * 24 * 60 * 60 * 1000;

  let thisRollingWeek = 0;
  let prevRollingWeek = 0;
  const profileCounts = new Map<string, number>();
  const domainSums: Record<keyof DomainScores, number> = {
    sleep_score: 0,
    energy_score: 0,
    stress_score: 0,
    nutrition_score: 0,
    movement_score: 0,
    recovery_score: 0,
  };
  let domainAvgDenominator = 0;
  const ageCounts = new Map<string, number>(
    INTAKE_AGE_RANGE_OPTIONS.map((r) => [r, 0]),
  );
  let totalScoreSum = 0;
  let totalScoreCount = 0;

  for (const row of sessions) {
    const createdRaw = row.created_at;
    if (typeof createdRaw === "string") {
      const t = new Date(createdRaw).getTime();
      if (t >= weekAgo) {
        thisRollingWeek += 1;
      } else if (t >= twoWeeksAgo && t < weekAgo) {
        prevRollingWeek += 1;
      }
    }

    const profile =
      typeof row.profile_label === "string" && row.profile_label.trim() !== ""
        ? row.profile_label.trim()
        : "Onbekend";
    profileCounts.set(profile, (profileCounts.get(profile) ?? 0) + 1);

    const ds = row.domain_scores;
    if (isDomainScores(ds)) {
      domainAvgDenominator += 1;
      for (const k of DOMAIN_KEYS) {
        domainSums[k] += ds[k];
      }
      const ts = totalScoreFromDomains(ds);
      if (ts != null) {
        totalScoreSum += ts;
        totalScoreCount += 1;
      }
    }

    const ar = row.age_range;
    if (typeof ar === "string" && ageCounts.has(ar)) {
      ageCounts.set(ar, (ageCounts.get(ar) ?? 0) + 1);
    }
  }

  const emailSet = new Set<string>();
  for (const row of sessions) {
    const m = row.marketing_email;
    if (typeof m === "string" && m.trim() !== "") {
      emailSet.add(m.trim().toLowerCase());
    }
  }
  for (const row of reminders) {
    const e = row.email;
    if (typeof e === "string" && e.trim() !== "") {
      emailSet.add(e.trim().toLowerCase());
    }
  }

  let remindersSent = 0;
  for (const row of reminders) {
    if (row.sent === true) {
      remindersSent += 1;
    }
  }

  const profileDistribution = [...profileCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const domainAverages = DOMAIN_KEYS.map((k, idx) => {
    const cat = CATEGORIES[idx]!;
    const avg =
      domainAvgDenominator > 0 ? domainSums[k] / domainAvgDenominator : 0;
    return {
      id: cat.id,
      label: cat.label,
      average: Math.round(avg * 10) / 10,
      color: cat.color,
    };
  });

  const ageDistribution = INTAKE_AGE_RANGE_OPTIONS.map((range) => ({
    range,
    count: ageCounts.get(range) ?? 0,
  }));

  const sortedSessions = [...sessions].sort((a, b) => {
    const ta =
      typeof a.created_at === "string" ? new Date(a.created_at).getTime() : 0;
    const tb =
      typeof b.created_at === "string" ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  const recentSessions = sortedSessions.slice(0, 20).map((row) => ({
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
    ageRange: typeof row.age_range === "string" ? row.age_range : null,
    profileLabel:
      typeof row.profile_label === "string" ? row.profile_label : null,
    totalScore: isDomainScores(row.domain_scores)
      ? totalScoreFromDomains(row.domain_scores)
      : null,
    urgency: typeof row.urgency_level === "string" ? row.urgency_level : null,
  }));

  const recentFeedback = (feedbackRes.data ?? []).map((row) => ({
    rating: typeof row.rating === "string" ? row.rating : "",
    comment: typeof row.comment === "string" ? row.comment : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
  }));

  const nurture = await loadNurtureSection(admin);

  const payload: AdminDashboardPayload = {
    stats: {
      totalSessions: sessions.length,
      sessionsWeekDelta: thisRollingWeek - prevRollingWeek,
      uniqueEmails: emailSet.size,
      remindersSent,
      avgTotalScore:
        totalScoreCount > 0
          ? Math.round((totalScoreSum / totalScoreCount) * 10) / 10
          : null,
    },
    profileDistribution,
    domainAverages,
    ageDistribution,
    recentFeedback,
    recentSessions,
    nurture,
  };

  return NextResponse.json(payload);
}
