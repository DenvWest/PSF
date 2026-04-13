import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, INTAKE_AGE_RANGE_OPTIONS } from "@/data/intake-questions";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import type { AdminDashboardPayload } from "@/lib/admin-dashboard-types";
import type { DomainScores } from "@/lib/intake-engine";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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

  const orgId = getDefaultOrganizationId();

  const [sessionsRes, remindersRes, feedbackRes] = await Promise.all([
    admin
      .from("intake_sessions")
      .select(
        "created_at, age_range, profile_label, domain_scores, urgency_level, marketing_email",
      )
      .eq("organization_id", orgId),
    admin
      .from("intake_reminders")
      .select("email, sent")
      .eq("organization_id", orgId),
    admin
      .from("intake_feedback")
      .select("rating, comment, created_at")
      .eq("organization_id", orgId)
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
  };

  return NextResponse.json(payload);
}
