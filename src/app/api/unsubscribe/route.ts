import { NextRequest, NextResponse } from "next/server";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { decodeNurtureUnsubscribeToken } from "@/lib/nurture-unsubscribe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

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

async function cancelPendingNurtureForEmail(email: string): Promise<{
  ok: true;
  cancelled: number;
} | { ok: false; error: string }> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, error: "config" };
  }

  const { data, error } = await admin
    .from("nurture_emails")
    .update({ status: "cancelled" })
    .eq("email", email)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error("[api/unsubscribe] nurture cancel:", error);
    return { ok: false, error: "db" };
  }

  return { ok: true, cancelled: data?.length ?? 0 };
}

async function handleNurtureUnsubscribe(
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

  const result = await cancelPendingNurtureForEmail(parsed.email);
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
    "Je ontvangt geen verdere nurture-e-mails op dit adres. Geplande berichten in deze reeks zijn geannuleerd.",
    200,
  );
}

/** Legacy: herinneringsmails (intake_reminders) via ?email= */
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
    "Je ontvangt geen verdere nurture- of herinneringsmails op dit adres via ons automatische systeem.",
    200,
  );
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const token = url.searchParams.get("token");

  if (token !== null && token.trim() !== "") {
    return handleNurtureUnsubscribe(token);
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

/**
 * RFC 8058 one-click unsubscribe (o.a. Gmail): POST naar dezelfde URL als in List-Unsubscribe,
 * body `List-Unsubscribe=One-Click` (token zit meestal in de querystring van die URL).
 */
export async function POST(request: NextRequest) {
  const qs = request.nextUrl.searchParams.get("token");
  if (qs?.trim()) {
    return handleNurtureUnsubscribe(qs);
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

  return handleNurtureUnsubscribe(token);
}
