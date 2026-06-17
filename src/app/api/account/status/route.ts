import { NextResponse } from "next/server";
import { getAccountFromCookie } from "@/lib/account-server";

export async function GET() {
  const account = await getAccountFromCookie();
  return NextResponse.json(
    {
      loggedIn: Boolean(account),
    },
    { status: 200 },
  );
}
