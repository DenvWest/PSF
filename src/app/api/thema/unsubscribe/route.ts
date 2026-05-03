import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getPublicSiteUrl } from "@/lib/public-site-url";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const thema = request.nextUrl.searchParams.get("thema");

  if (!email || !thema) {
    return NextResponse.redirect(`${getPublicSiteUrl()}/`);
  }

  const supabase = createSupabaseAdmin();
  if (supabase) {
    await supabase
      .from("thema_nurture")
      .update({ status: "unsubscribed" })
      .eq("email", email)
      .eq("thema", thema)
      .eq("status", "pending");
  }

  return NextResponse.redirect(`${getPublicSiteUrl()}/?unsubscribed=true`);
}
