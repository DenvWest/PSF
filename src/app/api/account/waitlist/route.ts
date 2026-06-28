import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import { emitEvent } from "@/lib/events";

const FEATURES = ["inzichten", "statistieken", "lichaamssamenstelling"] as const;
type Feature = (typeof FEATURES)[number];

function isFeature(value: string): value is Feature {
  return (FEATURES as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    getClientIp(request),
    getRateLimitConfig("intake_session"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
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
  const feature = typeof record.feature === "string" ? record.feature.trim() : "";
  const surface =
    typeof record.surface === "string" ? record.surface.trim().slice(0, 64) : "voortgang";

  if (!isFeature(feature)) {
    return NextResponse.json({ error: "Ongeldige feature." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const { error } = await admin
    .from("premium_waitlist")
    .upsert(
      { account_id: account.id, feature, source: surface },
      { onConflict: "account_id,feature", ignoreDuplicates: true },
    );

  if (error) {
    console.error("[premium-waitlist] insert failed", error);
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }

  void emitEvent({
    eventType: "premium.waitlist_joined",
    email: account.email,
    payload: { feature, surface },
    deliveredTo: ["posthog"],
  });

  return NextResponse.json({ ok: true, joined: true }, { status: 200 });
}
