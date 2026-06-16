import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNT_SESSION_COOKIE_NAME,
} from "@/lib/account-session-cookie";
import { getAccountFromCookie } from "@/lib/account-server";
import { deleteIntakeSessionForSession } from "@/lib/intake-consent-revoke";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/turnstile-verify";

type RevokeAction = "withdraw" | "delete";

type SessionIdRow = {
  id: string;
};

function clearAccountCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: ACCOUNT_SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}

function isValidAction(value: unknown): value is RevokeAction {
  return value === "withdraw" || value === "delete";
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "account_revoke",
    clientIp,
    getRateLimitConfig("account_revoke"),
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const action = body && typeof body === "object" ? (body as { action?: unknown }).action : undefined;
  if (!isValidAction(action)) {
    return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
  }

  const { data: sessionRows, error: sessionLookupError } = await admin
    .from("intake_sessions")
    .select("id")
    .eq("account_id", account.id)
    .returns<SessionIdRow[]>();

  if (sessionLookupError) {
    console.error("[api/account/revoke] session lookup error:", sessionLookupError);
    return NextResponse.json(
      { error: "Kon gekoppelde checks niet ophalen." },
      { status: 500 },
    );
  }

  const sessionIds = (sessionRows ?? []).map((row) => row.id);

  if (action === "withdraw") {
    const nowIso = new Date().toISOString();

    if (sessionIds.length > 0) {
      const { error: consentError } = await admin
        .from("consent_records")
        .update({ withdrawn_at: nowIso })
        .eq("consent_type", "account_storage")
        .in("session_id", sessionIds)
        .is("withdrawn_at", null);

      if (consentError) {
        console.error("[api/account/revoke] consent withdraw error:", consentError);
        return NextResponse.json(
          { error: "Kon toestemming niet intrekken." },
          { status: 500 },
        );
      }
    }

    const { error: unlinkError } = await admin
      .from("intake_sessions")
      .update({ account_id: null })
      .eq("account_id", account.id);

    if (unlinkError) {
      console.error("[api/account/revoke] session unlink error:", unlinkError);
      return NextResponse.json(
        { error: "Kon checks niet ontkoppelen." },
        { status: 500 },
      );
    }

    const { error: revokeError } = await admin
      .from("accounts")
      .update({ status: "revoked" })
      .eq("id", account.id);

    if (revokeError) {
      console.error("[api/account/revoke] account revoke error:", revokeError);
      return NextResponse.json(
        { error: "Kon account niet intrekken." },
        { status: 500 },
      );
    }
  } else {
    for (const sessionId of sessionIds) {
      const result = await deleteIntakeSessionForSession(admin, sessionId);
      if (!result.ok) {
        console.error("[api/account/revoke] session delete helper error:", {
          sessionId,
          step: result.step,
          error: result.error,
        });
        return NextResponse.json(
          { error: "Kon gekoppelde checks niet verwijderen." },
          { status: 500 },
        );
      }
    }

    const { error: deleteAccountError } = await admin
      .from("accounts")
      .delete()
      .eq("id", account.id);

    if (deleteAccountError) {
      console.error("[api/account/revoke] account delete error:", deleteAccountError);
      return NextResponse.json(
        { error: "Kon account niet verwijderen." },
        { status: 500 },
      );
    }
  }

  return clearAccountCookie(NextResponse.json({ ok: true }, { status: 200 }));
}
