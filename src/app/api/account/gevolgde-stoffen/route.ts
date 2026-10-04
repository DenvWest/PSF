import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ORG_ID } from "@/config/org";
import {
  getGevolgdeStoffen,
  GevolgdeStoffenNietBeschikbaar,
  isVolgbaarVeld,
  schoonGevolgdeStoffen,
  setGevolgdeStoffen,
} from "@/lib/account-gevolgde-stoffen";
import { getAccountFromCookie } from "@/lib/account-server";
import { orgScoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

function geenDatabase() {
  return NextResponse.json(
    { error: "Database is nog niet geconfigureerd op de server." },
    { status: 503 },
  );
}

export async function GET() {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) return geenDatabase();

  try {
    return NextResponse.json({ stoffen: await getGevolgdeStoffen(admin, account.id) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon je gevolgde stoffen niet laden." }, { status: 500 });
  }
}

/** Vervangt de hele lijst: `{ stoffen: ["fiberG", "calciumMg"] }`. */
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

  const ruw = body && typeof body === "object" ? (body as { stoffen?: unknown }).stoffen : undefined;
  if (!Array.isArray(ruw) || !ruw.every(isVolgbaarVeld)) {
    return NextResponse.json({ error: "Onbekende stof in de lijst." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) return geenDatabase();

  const stoffen = schoonGevolgdeStoffen(ruw);
  try {
    await setGevolgdeStoffen(admin, account.id, stoffen);
    return NextResponse.json({ stoffen }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof GevolgdeStoffenNietBeschikbaar) {
      return NextResponse.json(
        { error: "Stoffen volgen kan nog niet: de database wordt bijgewerkt." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Kon je gevolgde stoffen niet opslaan." }, { status: 500 });
  }
}
