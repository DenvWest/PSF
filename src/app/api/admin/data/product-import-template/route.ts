import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE_NAME, isValidAdminSessionCookie } from "@/lib/admin-auth";
import { IMPORT_TEMPLATE } from "@/lib/product-admin/import";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!isValidAdminSessionCookie(token)) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  return new NextResponse(`﻿${IMPORT_TEMPLATE}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="product-import-sjabloon.csv"',
    },
  });
}
