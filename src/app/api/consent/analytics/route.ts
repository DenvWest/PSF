import { NextResponse } from "next/server";
import {
  applyAnalyticsConsentCookie,
  applyAnalyticsConsentStateCookie,
} from "@/lib/analytics-consent";
import { emitEvent } from "@/lib/events";

const ALLOWED_SOURCES = new Set(["banner", "footer", "settings"]);

export async function POST(request: Request) {
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
  if (typeof record.granted !== "boolean") {
    return NextResponse.json({ error: "Ongeldige keuze." }, { status: 400 });
  }

  const granted = record.granted;
  const source =
    typeof record.source === "string" && ALLOWED_SOURCES.has(record.source)
      ? record.source
      : "banner";

  const res = NextResponse.json({ ok: true }, { status: 200 });
  applyAnalyticsConsentCookie(res, granted);
  applyAnalyticsConsentStateCookie(res, granted);

  void emitEvent({
    eventType: "consent.analytics_set",
    payload: { granted, source },
    deliveredTo: [],
  });

  return res;
}
