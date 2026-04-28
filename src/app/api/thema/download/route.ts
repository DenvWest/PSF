import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/client-ip";
import { consumeRateLimitForIp } from "@/lib/rate-limit";
import { getRateLimitConfig } from "@/lib/rate-limit-config";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimitForIp(
    "thema_download",
    clientIp,
    getRateLimitConfig("thema_download"),
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Te veel verzoeken, probeer het later opnieuw" },
      { status: 429 },
    );
  }

  const supabase = createSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuratie fout" },
      { status: 500 },
    );
  }

  try {
    const body: unknown = await request.json();
    const email =
      body &&
      typeof body === "object" &&
      typeof (body as { email?: unknown }).email === "string"
        ? (body as { email: string }).email.trim()
        : "";
    const thema =
      body &&
      typeof body === "object" &&
      typeof (body as { thema?: unknown }).thema === "string"
        ? (body as { thema: string }).thema.trim()
        : "";

    if (!email || !emailRegex.test(email) || !thema) {
      return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
    }

    const { error } = await supabase
      .from("thema_downloads")
      .insert({ email, thema });

    if (error) {
      return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
