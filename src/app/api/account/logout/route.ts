import { NextResponse } from "next/server";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account-session-cookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: ACCOUNT_SESSION_COOKIE_NAME, value: "", path: "/", maxAge: 0 });
  return res;
}
