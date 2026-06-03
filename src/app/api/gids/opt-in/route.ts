import { NextRequest, NextResponse } from "next/server";
import { isGuideThema } from "@/data/gids";
import { getClientIp } from "@/lib/client-ip";
import { emitEvent } from "@/lib/events";
import { sha256Hex } from "@/lib/consent-hashing";
import { guideOptInConsentRow, validateGuideOptIn } from "@/lib/guide-consent";
import { hasActiveIntakeMarketingEmailConsent } from "@/lib/intake-marketing-consent-server";
import {
  INTAKE_SESSION_COOKIE_NAME,
  verifySignedIntakeSessionCookie,
} from "@/lib/intake-session-cookie";
import {
  hasActiveGuideSequence,
  scheduleGuideNurtureSequence,
} from "@/lib/guide-nurture";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/gids/opt-in][security]", { event, ...details });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "gids_opt_in",
    clientIp,
    getRateLimitConfig("gids_opt_in"),
  );

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel verzoeken, probeer het later opnieuw" },
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
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const validated = validateGuideOptIn(body as Record<string, unknown>, isGuideThema);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { email, thema, marketingConsent } = validated.value;

  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuratie fout" },
      { status: 500 },
    );
  }

  const rawCookie = request.cookies.get(INTAKE_SESSION_COOKIE_NAME)?.value;
  const sessionId = verifySignedIntakeSessionCookie(rawCookie);
  const intakeMarketingActive = sessionId
    ? await hasActiveIntakeMarketingEmailConsent(supabase, sessionId)
    : false;

  if (intakeMarketingActive && !marketingConsent) {
    return NextResponse.json(
      { error: "Geef toestemming om de gids en tips per e-mail te ontvangen." },
      { status: 400 },
    );
  }

  const ua = request.headers.get("user-agent") ?? "";
  const ipHash = sha256Hex(clientIp);
  const uaHash = sha256Hex(ua);

  const { error: consentError } = await supabase
    .from("guide_opt_ins")
    .insert(
      guideOptInConsentRow({
        email,
        thema,
        ipHash,
        uaHash,
        marketingConsent,
      }),
    );

  if (consentError) {
    logSecurityEvent("consent_insert_failed", { remoteIp: clientIp });
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  const alreadyActive = await hasActiveGuideSequence(email, thema);
  if (alreadyActive) {
    return NextResponse.json({ success: true });
  }

  try {
    await scheduleGuideNurtureSequence({ email, thema });
  } catch (err) {
    logSecurityEvent("nurture_schedule_failed", {
      remoteIp: clientIp,
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
  }

  void emitEvent({
    eventType: "email.opted_in",
    sessionId,
    email,
    payload: { source: "guide", thema },
    deliveredTo: ["nurture"],
  });

  return NextResponse.json({ success: true });
}
