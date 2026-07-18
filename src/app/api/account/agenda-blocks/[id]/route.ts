import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { deleteBlock, updateBlock } from "@/lib/agenda-blocks";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { emitEvent } from "@/lib/events";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { getClientIp } from "@/lib/turnstile-verify";
import type { AgendaBlockStatus } from "@/types/agenda";

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

function isAgendaBlockStatus(value: string): value is AgendaBlockStatus {
  return value === "open" || value === "done";
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Ongeldig blok." }, { status: 400 });
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
  const patch: {
    title?: string;
    startTime?: string;
    endTime?: string;
    status?: AgendaBlockStatus;
  } = {};

  if (typeof record.title === "string") {
    patch.title = record.title.trim();
  }
  if (typeof record.startTime === "string") {
    patch.startTime = record.startTime.trim();
  }
  if (typeof record.endTime === "string") {
    patch.endTime = record.endTime.trim();
  }
  if (typeof record.status === "string" && isAgendaBlockStatus(record.status)) {
    patch.status = record.status;
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const block = await updateBlock(admin, account.id, id, patch);
    if (!block) {
      return NextResponse.json({ error: "Blok niet gevonden." }, { status: 404 });
    }

    if (patch.status !== undefined) {
      void emitEvent({
        eventType: "agenda.block_toggled",
        email: account.email ?? undefined,
        organizationId: account.organization_id,
        payload: {
          category_id: block.categoryId,
          source: block.source,
          done: block.status === "done",
        },
      });
    }

    return NextResponse.json({ ok: true, block }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kon blok niet bijwerken.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Ongeldig blok." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  const deleted = await deleteBlock(admin, account.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Blok niet gevonden." }, { status: 404 });
  }

  void emitEvent({
    eventType: "agenda.block_deleted",
    email: account.email ?? undefined,
    organizationId: account.organization_id,
    payload: {
      block_id: id,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
