import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { email, thema } = await request.json();

    if (!email || !email.includes("@") || !thema) {
      return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
    }

    const { error } = await supabase
      .from("thema_downloads")
      .insert({ email, thema });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
    }

    // TODO: Resend integratie toevoegen om de PDF daadwerkelijk te mailen

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
