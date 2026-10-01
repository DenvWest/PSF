import { NextResponse } from "next/server";
import { unscoped } from "@/lib/db/scoped";

export const dynamic = "force-dynamic";

/**
 * Health-endpoint voor een externe uptime-monitor (audit N10,
 * docs/plan/AUDIT_ARCHITECTUUR_SCHAAL_B2B_2026-09.md C10: geen
 * health-endpoint, geen uptime-monitor in de repo). Geen auth — een
 * uptime-monitor moet dit anoniem kunnen bereiken; geeft bewust geen
 * interne details terug (geen tabelnamen, geen foutboodschap-detail)
 * om geen reconnaissance-informatie te lekken.
 */
export async function GET() {
  const db = unscoped();
  if (!db) {
    return NextResponse.json(
      { status: "error", database: "not_configured" },
      { status: 503 },
    );
  }

  const { error } = await db
    .from("organizations")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (error) {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
