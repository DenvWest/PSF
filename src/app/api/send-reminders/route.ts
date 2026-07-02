import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { runPendingIntakeReminders } from "@/lib/intake-reminder-cron";
import { runPendingNurtureEmails } from "@/lib/nurture-cron";

export const dynamic = "force-dynamic";

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
