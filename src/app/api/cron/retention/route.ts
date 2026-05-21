import { NextResponse } from "next/server";
import { runRetentionCronJob } from "@/lib/intake-retention";
import { verifyCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

async function handleAuthorized(): Promise<NextResponse> {
  try {
    const result = await runRetentionCronJob();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/cron/retention]", err);
    return NextResponse.json(
      { error: "Retention-cleanup mislukt" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = verifyCronRequest(request);
  if (!auth.authorized) {
    const status = auth.error === "CRON_SECRET ontbreekt" ? 503 : 401;
    return NextResponse.json({ error: auth.error }, { status });
  }
  return handleAuthorized();
}

export async function GET(request: Request) {
  const auth = verifyCronRequest(request);
  if (!auth.authorized) {
    const status = auth.error === "CRON_SECRET ontbreekt" ? 503 : 401;
    return NextResponse.json({ error: auth.error }, { status });
  }
  return handleAuthorized();
}
