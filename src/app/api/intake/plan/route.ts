import { NextRequest, NextResponse } from "next/server";
import type { PillarId } from "@/data/foundation-pyramid";
import { getPlanContent } from "@/lib/content/plan-content";
import type { ThemeSlug } from "@/lib/content/themes";
import {
  calcDomainScores,
  getDeficiencySignals,
  getProfileLabel,
} from "@/lib/intake-engine";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const VALID_THEME_SLUGS = new Set<PillarId>([
  "stress",
  "sleep",
  "nutrition",
  "movement",
  "connection",
]);

function isThemeSlug(value: string): value is ThemeSlug {
  return VALID_THEME_SLUGS.has(value as PillarId);
}

function normalizeAnswers(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const answers: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      answers[key] = value;
    }
  }

  return answers;
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
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
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
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const themeSlugRaw =
    typeof record.theme_slug === "string" ? record.theme_slug.trim() : "";

  if (!isThemeSlug(themeSlugRaw)) {
    return NextResponse.json({ error: "Ongeldig thema." }, { status: 400 });
  }

  const answers = normalizeAnswers(record.answers);
  if (answers === null) {
    return NextResponse.json({ error: "Ongeldige antwoorden." }, { status: 400 });
  }

  const scores = calcDomainScores(answers);
  const deficiencySignals = getDeficiencySignals(answers);
  const profileLabel = getProfileLabel(scores);

  try {
    const content = await getPlanContent(
      themeSlugRaw,
      scores,
      deficiencySignals,
      profileLabel,
      answers,
    );
    return NextResponse.json(content, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Plan kon niet worden geladen." },
      { status: 503 },
    );
  }
}
