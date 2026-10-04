import { NextRequest, NextResponse } from "next/server";
import { unscoped } from "@/lib/db/scoped";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { dumpRegels } from "@/lib/sm-products-dump";
import { ODBL_URL } from "@/lib/supermarkt-bron";
import { getClientIp } from "@/lib/turnstile-verify";

/**
 * Publieke download van `sm_products` (Open Food Facts-gegevens, ODbL) als CSV.
 * Dit is de aparte, bewuste handeling uit ODbL §4.6: de zoekroute geeft nooit de
 * tabel als geheel terug, deze route doet dat wel en alleen hier. Uitleg, wijzigingen
 * ten opzichte van de bron en de licentie staan op /bronnen.
 */

export const dynamic = "force-dynamic";

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

  const encoder = new TextEncoder();
  const regels = dumpRegels(admin);
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const volgende = await regels.next();
        if (volgende.done) controller.close();
        else controller.enqueue(encoder.encode(volgende.value));
      } catch (fout) {
        controller.error(fout);
      }
    },
    async cancel() {
      await regels.return(undefined);
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="perfectsupplement-open-food-facts.csv"',
      "Cache-Control": "no-store",
      Link: `<${ODBL_URL}>; rel="license"`,
    },
  });
}
