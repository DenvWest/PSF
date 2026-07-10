import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TOKEN_COOKIE_NAME,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";
import {
  getClickTrend,
  getClicksPerCategory,
  getClicksPerPage,
  getClicksPerSubId,
  getIntakeByReferralSource,
  type CountRow,
  type TrendRow,
} from "@/lib/affiliate-analytics";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export type AdminAffiliatePayload = {
  totalClicks: number;
  totalClicks30d: number;
  clicksPerPage: CountRow[];
  clicksPerSubId: CountRow[];
  clicksPerCategory: CountRow[];
  clickTrend: TrendRow[];
  intakeByReferralSource: CountRow[];
};

function sumCounts(rows: CountRow[]): number {
  return rows.reduce((acc, row) => acc + row.count, 0);
}

function sumTrendCounts(rows: TrendRow[]): number {
  return rows.reduce((acc, row) => acc + row.count, 0);
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const rateLimit = await consumeRateLimit(
    `admin_affiliate:${token}`,
    getRateLimitConfig("admin_data"),
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  if (!createSupabaseAdmin()) {
    return NextResponse.json(
      { error: "Database is nog niet geconfigureerd op de server." },
      { status: 503 },
    );
  }

  try {
    const [
      clicksPerPage,
      clicksPerSubId,
      clicksPerCategory,
      clickTrend,
      intakeByReferralSource,
    ] = await Promise.all([
      getClicksPerPage(),
      getClicksPerSubId(),
      getClicksPerCategory(),
      getClickTrend(),
      getIntakeByReferralSource(),
    ]);

    const payload: AdminAffiliatePayload = {
      totalClicks: sumCounts(clicksPerPage),
      totalClicks30d: sumTrendCounts(clickTrend),
      clicksPerPage,
      clicksPerSubId,
      clicksPerCategory,
      clickTrend,
      intakeByReferralSource,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Kon affiliate-data niet laden." },
      { status: 500 },
    );
  }
}
