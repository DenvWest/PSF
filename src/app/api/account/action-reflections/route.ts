import { NextRequest, NextResponse } from "next/server";
import {
  isReflectionAnswer,
  listReflectedBlockIds,
  listReflectionAnswers,
  upsertActionReflection,
} from "@/lib/account-action-reflections";
import { getAccountFromCookie } from "@/lib/account-server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { DEFAULT_ORG_ID } from "@/config/org";
import { orgScoped } from "@/lib/db/scoped";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Terugblikken op geplande momenten: welke blokken zijn al beantwoord, en wat
 * was het antwoord.
 *
 * GET levert twee dingen omdat het scherm ze allebei nodig heeft en ze uit
 * dezelfde tabel komen: `answeredBlockIds` bepaalt of de vraag nog gesteld
 * wordt, `answers` voedt de reeks-regel in de tijdlaag.
 */

const VALID_DOMAINS = new Set(["slaap", "beweging", "voeding", "stress", "verbinding"]);

function parseBody(body: unknown): { blockId: string; domain: string; answer: string } | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const blockId = typeof record.block_id === "string" ? record.block_id.trim() : "";
  const domain = typeof record.domain === "string" ? record.domain.trim() : "";
  const answer = typeof record.answer === "string" ? record.answer.trim() : "";

  if (!blockId || blockId.length > 64 || !VALID_DOMAINS.has(domain) || !isReflectionAnswer(answer)) {
    return null;
  }
  return { blockId, domain, answer };
}

export async function GET(request: NextRequest) {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const domainParam = request.nextUrl.searchParams.get("domain") ?? "voeding";
  const domain = VALID_DOMAINS.has(domainParam) ? domainParam : "voeding";

  try {
    const [answeredBlockIds, answers] = await Promise.all([
      listReflectedBlockIds(admin, account.id),
      listReflectionAnswers(admin, account.id, domain),
    ]);
    return NextResponse.json({ answeredBlockIds, answers }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon terugblikken niet laden." }, { status: 500 });
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

  const parsed = parseBody(body);
  if (!parsed || !isReflectionAnswer(parsed.answer)) {
    return NextResponse.json({ error: "Ongeldige terugblik." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const ok = await upsertActionReflection(admin, account.id, {
    blockId: parsed.blockId,
    domain: parsed.domain,
    answer: parsed.answer,
  });

  if (!ok) {
    return NextResponse.json({ error: "Kon terugblik niet opslaan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
