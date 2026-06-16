import { NextRequest, NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "account_claim",
    clientIp,
    getRateLimitConfig("account_claim"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
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

  const { data, error } = await admin.rpc("count_claimable_intake_sessions", {
    p_account_id: account.id,
  });

  if (error) {
    console.error("[api/account/claim-sessions][GET] rpc error:", error);
    return NextResponse.json(
      { error: "Kon eerdere checks niet ophalen." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { count: typeof data === "number" ? data : 0 },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "account_claim",
    clientIp,
    getRateLimitConfig("account_claim"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
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

  const { data, error } = await admin.rpc("claim_intake_sessions_for_account", {
    p_account_id: account.id,
  });

  if (error) {
    console.error("[api/account/claim-sessions][POST] rpc error:", error);
    return NextResponse.json(
      { error: "Kon eerdere checks niet koppelen." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { linked: typeof data === "number" ? data : 0 },
    { status: 200 },
  );
}
