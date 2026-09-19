import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  deleteDagboekFavoriet,
  isDagboekFavorietBron,
  listDagboekFavorieten,
  upsertDagboekFavoriet,
  type DagboekFavoriet,
} from "@/lib/account-dagboek-favorieten";
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

function parseFavorietBody(body: unknown): DagboekFavoriet | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const bronRaw = typeof record.bron === "string" ? record.bron.trim() : "";
  const key = typeof record.key === "string" ? record.key.trim() : "";

  if (!isDagboekFavorietBron(bronRaw) || !key || key.length > 128) {
    return null;
  }

  return { bron: bronRaw, key };
}

export async function GET() {
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

  try {
    const items = await listDagboekFavorieten(admin, account.id);
    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon dagboek-favorieten niet laden." }, { status: 500 });
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

  const favoriet = parseFavorietBody(body);
  if (!favoriet) {
    return NextResponse.json({ error: "Ongeldige favoriet." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    await upsertDagboekFavoriet(admin, account.id, favoriet);
    return NextResponse.json({ ok: true, item: favoriet }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon favoriet niet opslaan." }, { status: 500 });
  }
}

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

  const params = new URL(request.url).searchParams;
  const bronRaw = (params.get("bron") ?? "").trim();
  const key = (params.get("key") ?? "").trim();

  if (!isDagboekFavorietBron(bronRaw) || !key || key.length > 128) {
    return NextResponse.json({ error: "Ongeldige favoriet." }, { status: 400 });
  }

  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    await deleteDagboekFavoriet(admin, account.id, bronRaw, key);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon favoriet niet verwijderen." }, { status: 500 });
  }
}
