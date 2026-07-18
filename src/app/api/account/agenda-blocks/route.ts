import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import {
  createBlock,
  isIsoDate,
  listBlocksForRange,
} from "@/lib/agenda-blocks";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { emitEvent } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import type { CreateAgendaBlockInput } from "@/types/agenda";
import { isAgendaCategoryId } from "@/data/agenda/categories";

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function GET(request: NextRequest) {
  const account = await getAccountFromCookie();
  if (!account) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const startDate = (params.get("startDate") ?? "").trim();
  const endDate = (params.get("endDate") ?? "").trim();

  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    return NextResponse.json({ error: "Ongeldige datumbereik." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const blocks = await listBlocksForRange(admin, account.id, startDate, endDate);
  return NextResponse.json({ blocks }, { status: 200 });
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
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const date = typeof record.date === "string" ? record.date.trim() : "";
  const categoryId =
    typeof record.categoryId === "string" ? record.categoryId.trim() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const startTime =
    typeof record.startTime === "string" ? record.startTime.trim() : "";
  const endTime = typeof record.endTime === "string" ? record.endTime.trim() : "";

  if (!isAgendaCategoryId(categoryId)) {
    return NextResponse.json({ error: "Ongeldige categorie." }, { status: 400 });
  }

  const input: CreateAgendaBlockInput = {
    date,
    categoryId,
    title,
    startTime,
    endTime,
  };

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const block = await createBlock(admin, account.id, account.organization_id, input);

    void emitEvent({
      eventType: "agenda.block_created",
      email: account.email ?? undefined,
      organizationId: account.organization_id,
      payload: {
        category_id: block.categoryId,
        source: block.source,
      },
    });

    return NextResponse.json({ ok: true, block }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kon blok niet aanmaken.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
