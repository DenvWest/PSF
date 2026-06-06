import { NextResponse } from "next/server";
import { runPendingIntakeReminders } from "@/lib/intake-reminder-cron";
import { runPendingNurtureEmails } from "@/lib/nurture-cron";

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";
  const trimmed = authHeader.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return getBearerToken(request) === secret;
}

async function handleAuthorized(): Promise<NextResponse> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "RESEND_API_KEY ontbreekt" },
      { status: 503 },
    );
  }

  try {
    const reminders = await runPendingIntakeReminders();
    const nurture = await runPendingNurtureEmails();
    return NextResponse.json({ ...reminders, nurture });
  } catch (err) {
    console.error("[api/send-reminders]", err);
    return NextResponse.json(
      { error: "Verwerken van herinneringen mislukt" },
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
  if (!authorize(request)) {
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
  if (!authorize(request)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }
  return handleAuthorized();
}
