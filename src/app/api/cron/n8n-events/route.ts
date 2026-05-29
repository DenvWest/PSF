import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { runPendingN8nDomainEvents } from "@/lib/n8n-webhook";

export const dynamic = "force-dynamic";

async function handleAuthorized(): Promise<NextResponse> {
  if (!process.env.N8N_WEBHOOK_URL?.trim()) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_URL ontbreekt" },
      { status: 503 },
    );
  }

  try {
    const result = await runPendingN8nDomainEvents();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/cron/n8n-events]", err);
    return NextResponse.json(
      { error: "Doorsturen van domain_events mislukt" },
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
