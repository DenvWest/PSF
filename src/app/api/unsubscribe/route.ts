import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/client-ip";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";
import {
  decodeGuideUnsubscribeToken,
  decodeNurtureUnsubscribeToken,
  decodeThemaUnsubscribeToken,
  EMAIL_REGEX,
  MAX_EMAIL_LENGTH,
} from "@/lib/nurture-unsubscribe";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { guideSourceForThema, isGuideThema } from "@/data/gids";
import type { GuideThema } from "@/types/guide-opt-in";

function normalizeEmail(raw: string | null): string | null {
  if (raw === null) {
    return null;
  }
  const e = raw.replace(/\s+/g, " ").trim().toLowerCase();
  if (!e || e.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(e)) {
    return null;
  }
  return e;
}

function htmlPage(title: string, body: string, status: number): NextResponse {
  const home = getPublicSiteUrl();
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.5; }
    h1 { font-size: 1.35rem; font-weight: 600; }
    p { margin: 0.75rem 0; color: #444; }
    a { color: #1a1a1a; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${body}</p>
  <p><a href="${home}">Naar PerfectSupplement</a></p>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function cancelPendingIntakeNurture(
  email: string,
  sessionId: string,
): Promise<{ ok: true; cancelled: number } | { ok: false; error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, error: "config" };
  }

  let query = admin
    .from("nurture_emails")
    .update({ status: "cancelled" })
    .eq("email", email)
    .eq("status", "pending")
    .or("source.eq.intake,source.is.null");

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query.select("id");

  if (error) {
    console.error("[api/unsubscribe] intake nurture cancel:", error);
    return { ok: false, error: "db" };
  }

  return { ok: true, cancelled: data?.length ?? 0 };
}

async function cancelPendingGuideNurture(
  email: string,
  thema: GuideThema,
): Promise<{ ok: true; cancelled: number } | { ok: false; error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, error: "config" };
  }

  const source = guideSourceForThema(thema);
  const { data, error } = await admin
    .from("nurture_emails")
    .update({ status: "cancelled" })
    .eq("email", email)
    .eq("thema", thema)
    .eq("source", source)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error("[api/unsubscribe] guide nurture cancel:", error);
    return { ok: false, error: "db" };
  }

  return { ok: true, cancelled: data?.length ?? 0 };
}

async function handleIntakeUnsubscribe(
  tokenRaw: string | null,
): Promise<NextResponse> {
  const token = tokenRaw?.trim() ?? "";
  if (!token) {
    return htmlPage(
      "Ongeldige link",
      "De uitschrijflink is ongeldig of ontbreekt.",
      400,
    );
  }

  const parsed = decodeNurtureUnsubscribeToken(token);
  if (!parsed) {
    return htmlPage(
      "Ongeldige link",
      "De uitschrijflink is ongeldig of verlopen.",
      400,
    );
  }

  const result = await cancelPendingIntakeNurture(parsed.email, parsed.sessionId);
  if (!result.ok) {
    if (result.error === "config") {
      return htmlPage(
        "Niet beschikbaar",
        "De server kan dit verzoek nu niet verwerken. Probeer het later opnieuw.",
        503,
      );
    }
    return htmlPage(
      "Er ging iets mis",
      "Kon je uitschrijving niet opslaan. Stuur ons een mail als dit blijft gebeuren.",
      500,
    );
  }

  return htmlPage(
    "Je bent uitgeschreven",
    INTAKE_DELIVERABLE.unsubscribeMessage,
    200,
  );
}

async function handleGuideUnsubscribe(
  tokenRaw: string | null,
): Promise<NextResponse> {
  const token = tokenRaw?.trim() ?? "";
  if (!token) {
    return htmlPage(
      "Ongeldige link",
      "De uitschrijflink is ongeldig of ontbreekt.",
      400,
    );
  }

  const parsed = decodeGuideUnsubscribeToken(token);
  if (!parsed || !isGuideThema(parsed.thema)) {
    return htmlPage(
      "Ongeldige link",
      "De uitschrijflink is ongeldig of verlopen.",
      400,
    );
  }

  const result = await cancelPendingGuideNurture(
    parsed.email,
    parsed.thema as GuideThema,
  );
  if (!result.ok) {
    if (result.error === "config") {
      return htmlPage(
        "Niet beschikbaar",
        "De server kan dit verzoek nu niet verwerken. Probeer het later opnieuw.",
        503,
      );
    }
    return htmlPage(
      "Er ging iets mis",
      "Kon je uitschrijving niet opslaan. Stuur ons een mail als dit blijft gebeuren.",
      500,
    );
  }

  return htmlPage(
    "Je bent uitgeschreven",
    "Je ontvangt geen verdere gids-e-mails voor dit thema. Geplande berichten zijn geannuleerd.",
    200,
  );
}

/** Legacy thema-token uit oude thema_nurture-mails */
async function handleLegacyThemaUnsubscribe(
  tokenRaw: string | null,
): Promise<NextResponse> {
  const token = tokenRaw?.trim() ?? "";
  const parsed = decodeThemaUnsubscribeToken(token);
  if (!parsed || !isGuideThema(parsed.thema)) {
    return htmlPage(
      "Ongeldige link",
      "De uitschrijflink is ongeldig of verlopen.",
      400,
    );
  }

  const result = await cancelPendingGuideNurture(
    parsed.email,
    parsed.thema as GuideThema,
  );
  if (!result.ok) {
    if (result.error === "config") {
      return htmlPage(
        "Niet beschikbaar",
        "De server kan dit verzoek nu niet verwerken. Probeer het later opnieuw.",
        503,
      );
    }
    return htmlPage(
      "Er ging iets mis",
      "Kon je uitschrijving niet opslaan. Stuur ons een mail als dit blijft gebeuren.",
      500,
    );
  }

  return htmlPage(
    "Je bent uitgeschreven",
    "Je ontvangt geen verdere gids-e-mails voor dit thema. Geplande berichten zijn geannuleerd.",
    200,
  );
}

async function handleReminderUnsubscribe(email: string): Promise<NextResponse> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return htmlPage(
      "Niet beschikbaar",
      "De server kan dit verzoek nu niet verwerken. Probeer het later opnieuw.",
      503,
    );
  }

  const { error } = await admin
    .from("intake_reminders")
    .update({ sent: true })
    .eq("email", email)
    .eq("sent", false);

  if (error) {
    console.error("[api/unsubscribe] reminders:", error);
    return htmlPage(
      "Er ging iets mis",
      "Kon je uitschrijving niet opslaan. Stuur ons een mail als dit blijft gebeuren.",
      500,
    );
  }

  return htmlPage(
    "Je bent uitgeschreven",
    "Je ontvangt geen verdere herinneringsmails op dit adres via ons automatische systeem.",
    200,
  );
}

function resolveTokenHandler(token: string): "guide" | "intake" | "thema_legacy" | null {
  const parsedGuide = decodeGuideUnsubscribeToken(token);
  if (parsedGuide) return "guide";

  const parsedThema = decodeThemaUnsubscribeToken(token);
  if (parsedThema) return "thema_legacy";

  const parsedIntake = decodeNurtureUnsubscribeToken(token);
  if (parsedIntake) return "intake";

  return null;
}

async function dispatchTokenUnsubscribe(token: string): Promise<NextResponse> {
  const kind = resolveTokenHandler(token);
  if (kind === "guide") {
    return handleGuideUnsubscribe(token);
  }
  if (kind === "thema_legacy") {
    return handleLegacyThemaUnsubscribe(token);
  }
  if (kind === "intake") {
    return handleIntakeUnsubscribe(token);
  }
  return htmlPage(
    "Ongeldige link",
    "De uitschrijflink is ongeldig of verlopen.",
    400,
  );
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimitForIp(
    "unsubscribe",
    clientIp,
    getRateLimitConfig("unsubscribe"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = request.nextUrl;
  const token = url.searchParams.get("token");

  if (token !== null && token.trim() !== "") {
    return dispatchTokenUnsubscribe(token);
  }

  const email = normalizeEmail(url.searchParams.get("email"));
  if (!email) {
    return htmlPage(
      "Ongeldige link",
      "De link is ongeldig of ontbreekt. Gebruik de knop in je e-mail, of neem contact op.",
      400,
    );
  }

  return handleReminderUnsubscribe(email);
}

export async function POST(request: NextRequest) {
  const qs = request.nextUrl.searchParams.get("token");
  if (qs?.trim()) {
    return dispatchTokenUnsubscribe(qs);
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return htmlPage(
      "Ongeldige aanvraag",
      "De uitschrijving kon niet worden verwerkt.",
      400,
    );
  }

  const params = new URLSearchParams(raw);
  const token = params.get("token");

  if (!token?.trim()) {
    return htmlPage(
      "Ongeldige aanvraag",
      "De uitschrijving kon niet worden verwerkt (ontbrekende token).",
      400,
    );
  }

  return dispatchTokenUnsubscribe(token);
}
