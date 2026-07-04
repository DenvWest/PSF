import { NextRequest, NextResponse } from "next/server";
import {
  applyAnalyticsConsentCookie,
  applyAnalyticsConsentMetaCookie,
  applyAnalyticsConsentStateCookie,
} from "@/lib/analytics-consent";
import {
  bannerMarketingConsentRow,
  bannerStatisticsConsentRow,
  type BannerCookieConsentSource,
} from "@/lib/banner-analytics-consent";
import { sha256Hex } from "@/lib/consent-hashing";
import { getClientIp } from "@/lib/client-ip";
import { emitEvent } from "@/lib/events";
import {
  applyMarketingConsentCookie,
  applyMarketingConsentStateCookie,
} from "@/lib/marketing-consent";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_SOURCES = new Set(["banner", "footer", "settings"]);

type ParsedConsentBody =
  | {
      ok: true;
      statistics: boolean;
      marketing: boolean;
      source: BannerCookieConsentSource;
    }
  | { ok: false };

function parseConsentBody(body: Record<string, unknown>): ParsedConsentBody {
  const source =
    typeof body.source === "string" && ALLOWED_SOURCES.has(body.source)
      ? (body.source as BannerCookieConsentSource)
      : "banner";

  if (typeof body.statistics === "boolean" && typeof body.marketing === "boolean") {
    return { ok: true, statistics: body.statistics, marketing: body.marketing, source };
  }

  if (typeof body.granted === "boolean") {
    return {
      ok: true,
      statistics: body.granted,
      marketing: false,
      source,
    };
  }

  return { ok: false };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const parsed = parseConsentBody(body as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Ongeldige keuze." }, { status: 400 });
  }

  const { statistics, marketing, source } = parsed;

  const clientIp = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "";
  const ipHash = sha256Hex(clientIp);
  const uaHash = sha256Hex(ua);

  const consentRows = [
    bannerStatisticsConsentRow({ granted: statistics, source, ipHash, uaHash }),
    bannerMarketingConsentRow({ granted: marketing, source, ipHash, uaHash }),
  ];

  const admin = createSupabaseAdmin();
  let consentRecordId: string | null = null;
  let grantedAt: string | null = null;

  if (admin) {
    const { data, error } = await admin
      .from("consent_records")
      .insert(consentRows)
      .select("id, granted_at")
      .limit(1);

    if (error) {
      console.error("[api/consent/analytics] consent insert error:", error);
    } else if (data?.[0]?.id) {
      consentRecordId = data[0].id;
      grantedAt =
        typeof data[0].granted_at === "string"
          ? data[0].granted_at
          : new Date().toISOString();
    }
  }

  const res = NextResponse.json(
    {
      ok: true,
      consentRecordId,
      grantedAt,
      statistics,
      marketing,
    },
    { status: 200 },
  );

  applyAnalyticsConsentCookie(res, statistics);
  applyAnalyticsConsentStateCookie(res, statistics);
  applyMarketingConsentCookie(res, marketing);
  applyMarketingConsentStateCookie(res, marketing);

  if (consentRecordId && grantedAt) {
    applyAnalyticsConsentMetaCookie(res, {
      id: consentRecordId,
      grantedAt,
    });
  }

  void emitEvent({
    eventType: "consent.analytics_set",
    payload: { granted: statistics, marketing, source, consentRecordId },
    deliveredTo: [],
  });

  return res;
}
