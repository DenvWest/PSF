import { NextRequest, NextResponse } from "next/server";
import { unscoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { maakDumpZipBron } from "@/lib/sm-products-dump";
import { ODBL_URL } from "@/lib/supermarkt-bron";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Publieke download van `sm_products` (Open Food Facts-gegevens, ODbL) als zip met
 * CSV, LICENTIE.txt en LEESMIJ.txt. Dit is de aparte, bewuste handeling uit ODbL
 * §4.6: de zoekroute geeft nooit de tabel als geheel terug, deze route doet dat wel
 * en alleen hier. De zip komt uit een cache die hooguit één keer per uur de ~60
 * databasequery's doet, ongeacht het aantal downloads. Uitleg, wijzigingen ten
 * opzichte van de bron en de licentie staan op /bronnen.
 */

export const dynamic = "force-dynamic";

let haalDumpZip: ReturnType<typeof maakDumpZipBron> | null = null;

export async function GET(request: NextRequest) {
  const rateLimit = await consumeRateLimitForIp(
    "bronnen_dump",
    getClientIp(request),
    getRateLimitConfig("bronnen_dump"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel downloads. Probeer het later opnieuw." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const admin = unscoped();
  if (!admin) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  haalDumpZip ??= maakDumpZipBron(admin);
  let zip: Buffer;
  try {
    zip = await haalDumpZip();
  } catch (fout) {
    console.error("[api/bronnen/open-food-facts] dump bouwen mislukt:", fout);
    return NextResponse.json(
      { error: "De download is tijdelijk niet beschikbaar. Probeer het later opnieuw." },
      { status: 503, headers: { "Retry-After": "300" } },
    );
  }

  return new NextResponse(new Uint8Array(zip), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="perfectsupplement-open-food-facts.zip"',
      "Content-Length": String(zip.length),
      "Cache-Control": "no-store",
      Link: `<${ODBL_URL}>; rel="license"`,
    },
  });
}
