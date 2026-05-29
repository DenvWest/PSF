import { NextRequest, NextResponse } from "next/server";
import type { ThemeSlug } from "@/lib/content/themes";
import {
  answerEvidenceQuestion,
  normalizeEvidenceQuestion,
  normalizeThemeDomainLabel,
} from "@/lib/evidence-rag";
import { emitEvent } from "@/lib/events";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "evidence_chat",
    clientIp,
    getRateLimitConfig("evidence_chat"),
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
  const question = normalizeEvidenceQuestion(record.message);
  if (!question) {
    return NextResponse.json(
      { error: "Stel een vraag van 3–500 tekens." },
      { status: 400 },
    );
  }

  const themeSlugRaw =
    typeof record.theme_slug === "string" ? record.theme_slug.trim() : "";
  const themeSlug = themeSlugRaw
    ? (normalizeThemeDomainLabel(themeSlugRaw) as ThemeSlug | null)
    : null;

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);

  const result = await answerEvidenceQuestion(question, {
    themeSlug: themeSlug as ThemeSlug | null,
  });

  void emitEvent({
    eventType: "evidence.chat_queried",
    sessionId,
    payload: {
      in_scope: result.inScope,
      theme_slug: themeSlug,
      citation_count: result.citations.length,
    },
    deliveredTo: ["posthog"],
  });

  return NextResponse.json(
    {
      inScope: result.inScope,
      answer: result.answer,
      citations: result.citations,
      disclaimer: result.disclaimer,
    },
    { status: 200 },
  );
}
