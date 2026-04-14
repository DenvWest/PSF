import { NextRequest, NextResponse } from "next/server";
import { getPublicSiteUrl } from "@/lib/public-site-url";
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

export async function GET(request: NextRequest) {
  const email = normalizeEmail(request.nextUrl.searchParams.get("email"));
  if (!email) {
    return htmlPage(
      "Ongeldige link",
      "Het e-mailadres in deze link is ongeldig of ontbreekt.",
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
    .from("intake_reminders")
    .update({ sent: true })
    .eq("email", email)
    .eq("sent", false);

  if (error) {
    console.error("[api/unsubscribe]", error);
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
