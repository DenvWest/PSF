import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ORG_ID } from "@/config/org";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  bevestigDoel,
  getDoelEvaluatie,
  isGeldigeStartstand,
  isGeldigeStartstandStof,
  legStartstandVast,
} from "@/lib/account-voedingsdoelen";
import { orgScoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Evaluatie van je doel: lezen, de eerste stand per stof vastleggen en "Houden"
 * bevestigen. Besluit: `BESLUIT_DOEL_ZONE_RICHTING_EVALUATIE_2026-10.md` §3.
 */

export async function GET() {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }
  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json({ error: "Database is nog niet geconfigureerd op de server." }, { status: 503 });
  }
  try {
    return NextResponse.json(await getDoelEvaluatie(admin, account.id), { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je doel niet laden." }, { status: 500 });
  }
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
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json({ error: "Database is nog niet geconfigureerd op de server." }, { status: 503 });
  }

  try {
    if (record.actie === "bevestig") {
      return NextResponse.json(await bevestigDoel(admin, account.id), { status: 200 });
    }
    if (record.actie === "startstand") {
      const stof = record.stof;
      if (!isGeldigeStartstandStof(stof) || !isGeldigeStartstand(record)) {
        return NextResponse.json({ error: "Ongeldige stand." }, { status: 400 });
      }
      const datum = new Date().toISOString().slice(0, 10);
      return NextResponse.json(
        await legStartstandVast(admin, account.id, stof, { aandeelPct: record.aandeelPct, dagen: record.dagen }, datum),
        { status: 200 },
      );
    }
    return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Kon je doel niet opslaan." }, { status: 500 });
  }
}
