import { NextResponse } from "next/server";
import { runPendingNurtureEmails } from "@/lib/nurture-cron";

export const dynamic = "force-dynamic";

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";
  const trimmed = authHeader.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

function authorizePost(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return getBearerToken(request) === secret;
}

function authorizeGet(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  if (getBearerToken(request) === secret) return true;
  const url = new URL(request.url);
  const q = url.searchParams.get("secret")?.trim() ?? "";
  return q === secret;
}

async function handleAuthorized(): Promise<NextResponse> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY ontbreekt" },
      { status: 503 },
    );
  }

  try {
    const nurture = await runPendingNurtureEmails();
    return NextResponse.json(nurture);
  } catch (err) {
    console.error("[api/cron/nurture]", err);
    return NextResponse.json(
      { error: "Verwerken van nurture-mails mislukt" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET ontbreekt" },
      { status: 503 },
    );
  }
  if (!authorizePost(request)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  return handleAuthorized();
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET ontbreekt" },
      { status: 503 },
    );
  }
  if (!authorizeGet(request)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  return handleAuthorized();
}
