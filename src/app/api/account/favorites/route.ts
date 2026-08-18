import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  deleteAccountFavorite,
  isAccountFavoriteDomain,
  isAccountFavoriteKind,
  isAccountFavoriteSource,
  listAccountFavorites,
  upsertAccountFavorite,
  type AccountFavoriteItem,
} from "@/lib/account-favorites";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

function parseFavoriteBody(body: unknown): AccountFavoriteItem | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const id = typeof record.item_id === "string" ? record.item_id.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const kindRaw = typeof record.kind === "string" ? record.kind.trim() : "";

  if (!id || id.length > 128 || !title || title.length > 256 || !isAccountFavoriteKind(kindRaw)) {
    return null;
  }

  const item: AccountFavoriteItem = { id, title, kind: kindRaw };

  const domainRaw = typeof record.domain === "string" ? record.domain.trim() : "";
  if (domainRaw && isAccountFavoriteDomain(domainRaw)) {
    item.domain = domainRaw;
  }

  const sourceRaw = typeof record.source === "string" ? record.source.trim() : "";
  if (sourceRaw && isAccountFavoriteSource(sourceRaw)) {
    item.source = sourceRaw;
  }

  return item;
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

  try {
    const items = await listAccountFavorites(admin, account.id);
    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon favorieten niet laden." }, { status: 500 });
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

  const item = parseFavoriteBody(body);
  if (!item) {
    return NextResponse.json({ error: "Ongeldige favoriet." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    await upsertAccountFavorite(admin, account.id, item);
    return NextResponse.json({ ok: true, item }, { status: 200 });
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
  const itemId = (params.get("item_id") ?? "").trim();
  if (!itemId || itemId.length > 128) {
    return NextResponse.json({ error: "Ongeldige favoriet." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    await deleteAccountFavorite(admin, account.id, itemId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Kon favoriet niet verwijderen." }, { status: 500 });
  }
}
