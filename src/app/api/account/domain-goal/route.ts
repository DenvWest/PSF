import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { loadAccountDashboardData } from "@/lib/account-dashboard";
import {
  deriveGoalMode,
  getActiveDomainGoal,
  getActiveDomainGoals,
  getLatestDomainGoalScore,
  getSituationLabel,
  isCustomSituation,
  isDomainGoalDomain,
  isSituationId,
  isValidGoalScore,
  isValidOwnWords,
  recordDomainGoalScore,
  setDomainGoal,
  type DomainGoalDomain,
} from "@/lib/domain-goal";
import { emitEvent } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Eigen ijkpunt (PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md, slice A): kwalitatief
 * doel per domein + append-only 0-10-ijkpuntreeks. Aparte as náást
 * domain_scores — raakt de engine-score, de ring en de vitaliteit niet.
 */

type GoalEntryPoint = "check" | "domeinrij";

function isGoalEntryPoint(value: unknown): value is GoalEntryPoint {
  return value === "check" || value === "domeinrij";
}

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function GET() {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const goals = await getActiveDomainGoals(admin, account.id);

  return NextResponse.json(
    {
      goals: goals.map((goal) => {
        const latest = goal.scores[goal.scores.length - 1] ?? null;
        const previous = goal.scores[goal.scores.length - 2] ?? null;
        return {
          domain: goal.domain,
          situationId: goal.situationId,
          situationLabel: getSituationLabel(goal.domain, goal.situationId),
          ownWords: goal.ownWords,
          scores: goal.scores,
          mode: latest ? deriveGoalMode(latest.score, previous?.score ?? null) : null,
        };
      }),
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    getClientIp(request),
    getRateLimitConfig("intake_session"),
  );
  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const action = typeof record.action === "string" ? record.action.trim() : "";
  const domainRaw = typeof record.domain === "string" ? record.domain.trim() : "";
  const entryPoint = record.entryPoint;

  if (!isDomainGoalDomain(domainRaw)) {
    return NextResponse.json({ error: "Ongeldig domein." }, { status: 400 });
  }
  if (!isGoalEntryPoint(entryPoint)) {
    return NextResponse.json({ error: "Ongeldig entry_point." }, { status: 400 });
  }

  const domain: DomainGoalDomain = domainRaw;

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const dashboardData = await loadAccountDashboardData(account.id);
  const sessionId = dashboardData.sessionId ?? null;
  const cycleDay = dashboardData.cycleEvidence?.cycleDay ?? null;

  if (action === "set") {
    const situationIdRaw =
      typeof record.situationId === "string" ? record.situationId.trim() : "";
    if (!isSituationId(domain, situationIdRaw)) {
      return NextResponse.json({ error: "Ongeldige situatie." }, { status: 400 });
    }

    const ownWordsRaw =
      typeof record.ownWords === "string" ? record.ownWords.trim() : "";
    if (isCustomSituation(situationIdRaw)) {
      if (!ownWordsRaw) {
        return NextResponse.json(
          { error: "Schrijf je doel zelf op." },
          { status: 400 },
        );
      }
    }
    if (ownWordsRaw && !isValidOwnWords(ownWordsRaw)) {
      return NextResponse.json({ error: "Eigen woorden te lang." }, { status: 400 });
    }

    const initialScore = record.initialScore;
    if (!isValidGoalScore(initialScore)) {
      return NextResponse.json({ error: "Ongeldige score." }, { status: 400 });
    }

    const { goalId } = await setDomainGoal(admin, {
      accountId: account.id,
      organizationId: account.organization_id,
      domain,
      situationId: situationIdRaw,
      ownWords: ownWordsRaw || null,
      initialScore,
      sessionId,
    });

    void emitEvent({
      eventType: "goal.benchmark_set",
      sessionId: sessionId ?? undefined,
      organizationId: account.organization_id,
      payload: {
        domain,
        situation_id: situationIdRaw,
        has_own_words: Boolean(ownWordsRaw),
        initial_score: initialScore,
        entry_point: entryPoint,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        goalId,
        domain,
        situationId: situationIdRaw,
        situationLabel: getSituationLabel(domain, situationIdRaw),
        ownWords: ownWordsRaw || null,
      },
      { status: 200 },
    );
  }

  if (action === "rescore") {
    const score = record.score;
    if (!isValidGoalScore(score)) {
      return NextResponse.json({ error: "Ongeldige score." }, { status: 400 });
    }

    const goal = await getActiveDomainGoal(admin, account.id, domain);
    if (!goal) {
      return NextResponse.json(
        { error: "Geen actief doel voor dit domein." },
        { status: 404 },
      );
    }

    const previousScore = await getLatestDomainGoalScore(admin, goal.id);

    await recordDomainGoalScore(admin, {
      goalId: goal.id,
      accountId: account.id,
      organizationId: account.organization_id,
      sessionId,
      score,
    });

    void emitEvent({
      eventType: "goal.benchmark_rescored",
      sessionId: sessionId ?? undefined,
      organizationId: account.organization_id,
      payload: {
        domain,
        situation_id: goal.situationId,
        score,
        previous_score: previousScore,
        cycle_day: cycleDay,
        entry_point: entryPoint,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        domain,
        score,
        previousScore,
        mode: deriveGoalMode(score, previousScore),
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
}
