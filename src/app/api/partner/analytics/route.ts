import { NextResponse } from "next/server";
import { withPartnerApi } from "@/lib/api-middleware";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = withPartnerApi(request);
  if (!auth.authorized) {
    return auth.response;
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    const rateLimit = await consumeRateLimit(
      `partner_analytics:${apiKey}`,
      getRateLimitConfig("partner_analytics"),
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const orgId = auth.orgId;
  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID required" },
      { status: 400 },
    );
  }

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [sessionsResult, clicksResult] = await Promise.all([
    supabase
      .from("intake_sessions")
      .select("id, created_at, profile_label, urgency_level", { count: "exact" })
      .eq("organization_id", orgId)
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("affiliate_clicks")
      .select("id, created_at, supplement", { count: "exact" })
      .eq("organization_id", orgId)
      .gte("created_at", thirtyDaysAgo),
  ]);

  const sessions = sessionsResult.data ?? [];
  const clicks = clicksResult.data ?? [];

  const profileDistribution: Record<string, number> = {};
  for (const s of sessions) {
    const label = s.profile_label ?? "unknown";
    profileDistribution[label] = (profileDistribution[label] ?? 0) + 1;
  }

  return NextResponse.json({
    period: "last_30_days",
    orgId,
    intakeSessions: {
      total: sessionsResult.count ?? sessions.length,
      profileDistribution,
    },
    affiliateClicks: {
      total: clicksResult.count ?? clicks.length,
    },
  });
}
