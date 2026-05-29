import { NextRequest, NextResponse } from "next/server";
import type { PillarId } from "@/data/foundation-pyramid";
import { getFocusContent, type ThemeSlug } from "@/lib/content/themes";
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

  try {
    const content = await getFocusContent(themeSlugRaw);
    return NextResponse.json(content, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Focus kon niet worden geladen." },
      { status: 503 },
    );
  }
}
