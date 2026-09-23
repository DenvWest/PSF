import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  isNutrientId,
  listVerborgenNutrients,
  setNutrientZichtbaarheid,
} from "@/lib/account-nutrient-zichtbaarheid";
import { DEFAULT_ORG_ID } from "@/config/org";
import { orgScoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";

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

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json({ verborgen: [] }, { status: 200 });
  }

  try {
    const verborgen = await listVerborgenNutrients(admin, account.id);
    return NextResponse.json({ verborgen: Array.from(verborgen) }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon nutriënt-voorkeuren niet laden." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const nutrientRaw = typeof record.nutrient === "string" ? record.nutrient.trim() : "";
  const zichtbaar = record.zichtbaar === true;

  if (!isNutrientId(nutrientRaw)) {
    return NextResponse.json({ error: "Ongeldige voedingsstof." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    await setNutrientZichtbaarheid(admin, account.id, nutrientRaw, zichtbaar);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon voorkeur niet opslaan." }, { status: 500 });
  }
}
