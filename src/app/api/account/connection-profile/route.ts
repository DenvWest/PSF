import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { sha256Hex } from "@/lib/consent-hashing";
import {
  connectionProfileConsentRow,
  hasActiveConnectionProfileConsent,
  withdrawConnectionProfileConsent,
} from "@/lib/connection-profile-consent";
import { resolveProfileContent } from "@/lib/connection-content";
import {
  isProfileUsable,
  resolveProfileHighlights,
} from "@/lib/connection-profile/highlights";
import {
  deleteConnectionProfile,
  loadConnectionProfile,
  normalizeProfileInput,
  saveConnectionProfile,
} from "@/lib/connection-profile/store";
import type { ConnectionProfile } from "@/lib/connection-profile/types";
import { emitEvent } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Connection Profile — zelf opgegeven voorkeuren, art. 6, GEEN gezondheidsdata.
 * Zie BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §7: deze route raakt uitsluitend
 * cprofile_-tabellen (via de store) plus de eigen consent-rij. Nergens
 * intake_sessions, domeinscores of CON_*-antwoorden — ook niet om een sessie op
 * te zoeken, want juist die opzoeking is de koppeling die §7 verbiedt.
 *
 * Validatie zit volledig in normalizeProfileInput(); een tweede laag hier zou
 * uiteenlopen zodra de woordenlijst verandert.
 */

/**
 * De content-resolutie hoort bij het antwoord en niet bij de client: het scherm
 * mag na opslaan geen tweede ronde nodig hebben om zijn opbrengst te tonen, en
 * de inzichten-catalogus hoort niet in de dashboard-bundle.
 */
function contentFor(profile: ConnectionProfile | null) {
  if (!profile || !isProfileUsable(profile)) {
    return [];
  }
  return resolveProfileContent(resolveProfileHighlights(profile).contentPillars);
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

  const consentGranted = await hasActiveConnectionProfileConsent(admin, account.id);
  const profile = consentGranted ? await loadConnectionProfile(account.id) : null;

  return NextResponse.json(
    { profile, consentGranted, content: contentFor(profile) },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "intake_session",
    clientIp,
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
  const input = record.profile;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Ongeldige payload." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  // Toestemming wordt één keer vastgelegd, niet bij elke bewerking: één
  // grant-rij en één withdrawn_at maken de audittrail leesbaar. Wie later
  // bijwerkt, valt onder dezelfde toestemming tot hij die intrekt.
  const consentGranted = await hasActiveConnectionProfileConsent(admin, account.id);

  if (!consentGranted) {
    if (record.consent !== true) {
      return NextResponse.json({ error: "Toestemming is vereist." }, { status: 400 });
    }

    const { error: consentError } = await admin
      .from("consent_records")
      .insert(
        connectionProfileConsentRow({
          accountId: account.id,
          organizationId: account.organization_id,
          ipHash: sha256Hex(clientIp),
          uaHash: sha256Hex(request.headers.get("user-agent") ?? ""),
        }),
      );

    if (consentError) {
      console.error("[api/account/connection-profile] consent insert error:", consentError);
      return NextResponse.json(
        { error: "Kon toestemming niet vastleggen. Probeer het opnieuw." },
        { status: 500 },
      );
    }
  }

  const profile = await saveConnectionProfile(
    account.id,
    normalizeProfileInput(input as Partial<ConnectionProfile>),
  );

  if (!profile) {
    return NextResponse.json({ error: "Kon je keuzes niet opslaan." }, { status: 500 });
  }

  // Server-side geëmit zodat de teller niet van de client afhangt. Alleen
  // aantallen en ja/nee — nooit de gekozen tags en nooit het notitieveld (§4).
  void emitEvent({
    eventType: "cprofile.completed",
    email: account.email,
    organizationId: account.organization_id,
    payload: {
      n_interest: profile.interests.length,
      n_brengen: profile.brengen.length,
      n_ontdekken: profile.ontdekken.length,
      n_doet: profile.doet.length,
      has_area: profile.areaPc2 !== null,
      has_age_band: profile.ageBand !== null,
      has_note: profile.note !== null,
      is_update: consentGranted,
    },
    deliveredTo: ["posthog"],
  });

  return NextResponse.json(
    { ok: true, profile, content: contentFor(profile) },
    { status: 200 },
  );
}

/**
 * Intrekken van `connection_profile_storage`: toestemming vervalt én het profiel
 * verdwijnt. Staat los van de leefstijlcheck — die blijft ongemoeid.
 */
export async function DELETE(request: NextRequest) {
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

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const removed = await deleteConnectionProfile(account.id);
  if (!removed) {
    return NextResponse.json({ error: "Kon je keuzes niet verwijderen." }, { status: 500 });
  }

  await withdrawConnectionProfileConsent(admin, account.id);

  return NextResponse.json({ ok: true }, { status: 200 });
}
