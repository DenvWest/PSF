import { NextRequest, NextResponse } from "next/server";
import type { PillarId } from "@/data/foundation-pyramid";
import { getThemePillarHref } from "@/lib/intake-primary-pillar";
import type { ThemeSlug } from "@/lib/content/themes";
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

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "intake_session",
    clientIp,
    getRateLimitConfig("intake_session"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Te veel pogingen." }, { status: 429 });
  }

  const themeSlugRaw =
    request.nextUrl.searchParams.get("theme_slug")?.trim() ?? "";
  if (!isThemeSlug(themeSlugRaw)) {
    return NextResponse.json({ error: "Ongeldig thema." }, { status: 400 });
  }

  return NextResponse.json(
    { theme: themeSlugRaw, pillarHref: getThemePillarHref(themeSlugRaw) },
    { status: 200 },
  );
}
