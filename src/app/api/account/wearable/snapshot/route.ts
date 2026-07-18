import { NextResponse } from "next/server";

/**
 * Wearable snapshot ingest — DISABLED until DPIA addendum + explicit consent (fase 2).
 * Client-side Health Connect / Apple Health aggregation lands here later.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Wearable-koppeling is nog niet beschikbaar. DPIA en aparte toestemming zijn vereist.",
      code: "wearable_not_enabled",
    },
    { status: 503 },
  );
}
