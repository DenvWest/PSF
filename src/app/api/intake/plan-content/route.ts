import { NextRequest, NextResponse } from "next/server";
import type { DomainScores } from "@/lib/intake-engine";
import {
  getDeficiencySignals,
  getProfileLabel,
} from "@/lib/intake-engine";
import { getPlanContent } from "@/lib/content/plan-content";
import type { ThemeSlug } from "@/lib/content/themes";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const PLAN_THEMES = ["sleep", "stress", "nutrition", "movement"] as const;

function isThemeSlug(value: string): value is ThemeSlug {
  return (PLAN_THEMES as readonly string[]).includes(value);
}

function isDomainScores(value: unknown): value is DomainScores {
  if (!value || typeof value !== "object") {
    return false;
  }
  const scores = value as Record<string, unknown>;
  const keys = [
    "sleep_score",
    "stress_score",
    "energy_score",
    "nutrition_score",
    "movement_score",
    "recovery_score",
  ] as const;
  return keys.every(
    (key) => typeof scores[key] === "number" && Number.isFinite(scores[key]),
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const { themeSlug, scores, answers } = body as {
    themeSlug?: string;
    scores?: unknown;
    answers?: unknown;
  };

  if (!themeSlug || !isThemeSlug(themeSlug)) {
    return NextResponse.json({ error: "Ongeldig thema." }, { status: 400 });
  }

  if (!isDomainScores(scores)) {
    return NextResponse.json({ error: "Ongeldige scores." }, { status: 400 });
  }

  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Ongeldige antwoorden." }, { status: 400 });
  }

  const answerRecord = answers as Record<string, number>;
  const profileLabel = getProfileLabel(scores);
  const deficiencySignals = getDeficiencySignals(answerRecord);

  const plan = await getPlanContent(
    themeSlug,
    scores,
    deficiencySignals,
    profileLabel,
    answerRecord,
  );

  return NextResponse.json(plan);
}
