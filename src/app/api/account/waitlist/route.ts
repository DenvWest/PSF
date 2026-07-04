import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { sha256Hex } from "@/lib/consent-hashing";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { emitEvent } from "@/lib/events";
import { getDefaultOrganizationId } from "@/lib/organization";
import { premiumLaunchEmailConsentRow } from "@/lib/premium-launch-consent";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

const LEGACY_FEATURES = [
  "inzichten",
  "statistieken",
  "lichaamssamenstelling",
  "voeding-coach",
  "beweging-coach",
  "stress-coach",
  "slaap-coach",
  "verbinding-coach",
] as const;

const STORED_FEATURE = "premium-coaching" as const;

const PRICE_INDICATIONS = ["lt_10", "10_20", "20_35", "gt_35", "unknown"] as const;
type PriceIndication = (typeof PRICE_INDICATIONS)[number];

type LegacyFeature = (typeof LEGACY_FEATURES)[number];

function isLegacyFeature(value: string): value is LegacyFeature {
  return (LEGACY_FEATURES as readonly string[]).includes(value);
}

function isPriceIndication(value: string): value is PriceIndication {
  return (PRICE_INDICATIONS as readonly string[]).includes(value);
}

function isAcceptedFeature(value: string): boolean {
  return value === STORED_FEATURE || isLegacyFeature(value);
}

async function getLatestSessionIdForAccount(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  accountId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("intake_sessions")
    .select("id")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[premium-waitlist] session lookup failed", error);
    return null;
  }

  return typeof data?.id === "string" ? data.id : null;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    clientIp,
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
  const featureRaw = typeof record.feature === "string" ? record.feature.trim() : "";
  const surface =
    typeof record.surface === "string" ? record.surface.trim().slice(0, 64) : "voortgang";
  const priceIndicationRaw =
    typeof record.priceIndication === "string" ? record.priceIndication.trim() : "";
  const launchEmailOptIn = record.launchEmailOptIn === true;

  if (!isAcceptedFeature(featureRaw)) {
    return NextResponse.json({ error: "Ongeldige feature." }, { status: 400 });
  }

  let priceIndication: PriceIndication | null = null;
  if (priceIndicationRaw) {
    if (!isPriceIndication(priceIndicationRaw)) {
      return NextResponse.json({ error: "Ongeldige prijsindicatie." }, { status: 400 });
    }
    priceIndication = priceIndicationRaw;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const upsertPayload: {
    account_id: string;
    feature: typeof STORED_FEATURE;
    source: string;
    price_indication?: PriceIndication | null;
  } = {
    account_id: account.id,
    feature: STORED_FEATURE,
    source: surface,
  };

  if (priceIndication) {
    upsertPayload.price_indication = priceIndication;
  }

  const { error } = await admin
    .from("premium_waitlist")
    .upsert(upsertPayload, {
      onConflict: "account_id,feature",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("[premium-waitlist] insert failed", error);
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }

  if (launchEmailOptIn) {
    const sessionId = await getLatestSessionIdForAccount(admin, account.id);
    const ua = request.headers.get("user-agent") ?? "";
    const consentRow = premiumLaunchEmailConsentRow({
      sessionId,
      organizationId: getDefaultOrganizationId(),
      ipHash: sha256Hex(clientIp),
      uaHash: sha256Hex(ua),
    });

    const { error: consentError } = await admin.from("consent_records").insert(consentRow);
    if (consentError) {
      console.error("[premium-waitlist] consent insert error:", consentError);
      return NextResponse.json(
        { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
        { status: 500 },
      );
    }
  }

  void emitEvent({
    eventType: "premium.waitlist_joined",
    email: account.email,
    organizationId: account.organization_id,
    payload: {
      feature: STORED_FEATURE,
      surface,
      price_band: priceIndication,
    },
    deliveredTo: ["posthog"],
  });

  if (priceIndication) {
    void emitEvent({
      eventType: "premium.price_indicated",
      email: account.email,
      organizationId: account.organization_id,
      payload: {
        feature: STORED_FEATURE,
        surface,
        price_band: priceIndication,
      },
      deliveredTo: ["posthog"],
    });
  }

  return NextResponse.json({ ok: true, joined: true }, { status: 200 });
}
