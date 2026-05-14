import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/client-ip";
import { getPublicSiteUrl } from "@/lib/public-site-url";
import { decodeThemaUnsubscribeToken } from "@/lib/nurture-unsubscribe";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

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

async function handleThemaUnsubscribe(
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

  const parsed = decodeThemaUnsubscribeToken(token);
  if (!parsed) {
    return htmlPage(
      "Ongeldige link",
      "De uitschrijflink is ongeldig of verlopen.",
      400,
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return htmlPage(
      "Niet beschikbaar",
      "De server kan dit verzoek nu niet verwerken. Probeer het later opnieuw.",
      503,
    );
  }

  const { error } = await admin
    .from("thema_nurture")
    .update({ status: "unsubscribed" })
    .eq("email", parsed.email)
    .eq("thema", parsed.thema)
    .eq("status", "pending");

  if (error) {
    return htmlPage(
      "Er ging iets mis",
      "Kon je uitschrijving niet opslaan. Stuur ons een mail als dit blijft gebeuren.",
      500,
    );
  }

  return htmlPage(
    "Je bent uitgeschreven",
    `Je ontvangt geen verdere e-mails over het thema "${parsed.thema}" op dit adres.`,
    200,
  );
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "thema_unsubscribe",
    clientIp,
    getRateLimitConfig("thema_unsubscribe"),
  );

  if (!rateLimit.allowed) {
    return htmlPage(
      "Te veel verzoeken",
      "Probeer het over enkele minuten opnieuw.",
      429,
    );
  }

  const token = request.nextUrl.searchParams.get("token");
  return handleThemaUnsubscribe(token);
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "thema_unsubscribe",
    clientIp,
    getRateLimitConfig("thema_unsubscribe"),
  );

  if (!rateLimit.allowed) {
    return htmlPage(
      "Te veel verzoeken",
      "Probeer het over enkele minuten opnieuw.",
      429,
    );
  }

  const qs = request.nextUrl.searchParams.get("token");
  if (qs?.trim()) {
    return handleThemaUnsubscribe(qs);
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

  return handleThemaUnsubscribe(token);
}
