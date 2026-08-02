import { NextResponse } from "next/server";
import { runNurtureCronJob } from "@/lib/nurture-cron";
import { verifyCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

async function handleAuthorized(): Promise<NextResponse> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY ontbreekt" },
      { status: 503 },
    );
  }

  try {
    const result = await runNurtureCronJob();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/cron/nurture]", err);
    return NextResponse.json(
      { error: "Verwerken van nurture-mails mislukt" },
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
