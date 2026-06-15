import { NextResponse } from "next/server";
import { withPartnerApi } from "@/lib/api-middleware";
import { createIntakeStrategy, type IntakeAnswers } from "@/lib/intake-strategy";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = withPartnerApi(request);
  if (!auth.authorized) {
    return auth.response;
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    const rateLimit = await consumeRateLimit(
      `partner_intake:${apiKey}`,
      getRateLimitConfig("partner_intake"),
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

  let body: IntakeAnswers;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.answers || typeof body.answers !== "object") {
    return NextResponse.json(
      { error: "answers object required" },
      { status: 400 },
    );
  }

  const strategy = createIntakeStrategy("form");
  const results = strategy.computeResults({
    answers: body.answers,
    symptoms: body.symptoms ?? [],
    ageRange: body.ageRange,
  });

  return NextResponse.json({
    scores: results.scores,
    urgency: results.urgency,
    profile: results.profile,
    advice: results.advice,
    signals: results.signals,
    orgId: auth.orgId,
  });
}
