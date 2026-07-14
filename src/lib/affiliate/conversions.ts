import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeRef, resolveAffiliateForRef } from "@/lib/affiliate/attribution";
import { accrueForConversion } from "@/lib/affiliate/af-ledger";
import type { AfConversionStatus, AfConversionType } from "@/types/affiliate";

export async function getSourceIdByKind(
  db: SupabaseClient,
  kind: string,
): Promise<string | null> {
  const { data } = await db
    .from("af_sources")
    .select("id")
    .eq("kind", kind)
    .limit(1)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export interface RecordConversionInput {
  sourceId: string;
  affiliateId: string;
  externalId: string;
  type: AfConversionType;
  occurredAt: string;
  revenueCents?: number;
  orderRef?: string | null;
  intakeSessionId?: string | null;
  status?: AfConversionStatus;
}

/**
 * Idempotent (dedupe op source_id + external_id). Her-invoer telt nooit dubbel.
 * Maakt meteen de commissie-accrual (ook idempotent) — het grootboek loopt zo
 * altijd mee met de conversies.
 */
export async function recordConversion(
  db: SupabaseClient,
  input: RecordConversionInput,
): Promise<{ ok: boolean; error?: string; conversionId?: string }> {
  const { error } = await db.from("af_conversions").upsert(
    {
      source_id: input.sourceId,
      affiliate_id: input.affiliateId,
      external_id: input.externalId,
      type: input.type,
      occurred_at: input.occurredAt,
      revenue_cents: input.revenueCents ?? 0,
      order_ref: input.orderRef ?? null,
      intake_session_id: input.intakeSessionId ?? null,
      status: input.status ?? "pending",
    },
    { onConflict: "source_id,external_id", ignoreDuplicates: true },
  );
  if (error) return { ok: false, error: error.message };

  const { data: row } = await db
    .from("af_conversions")
    .select("id")
    .eq("source_id", input.sourceId)
    .eq("external_id", input.externalId)
    .maybeSingle();
  const conversionId = (row?.id as string | undefined) ?? undefined;
  if (conversionId) await accrueForConversion(db, conversionId);

  return { ok: true, conversionId };
}

/**
 * Fail-open lead-attributie bij het aanmaken van een intake-sessie. Gooit NOOIT
 * naar de caller — een attributiefout mag de intake nooit breken.
 */
export async function attributeIntakeLead(
  db: SupabaseClient,
  opts: { sessionId: string; affRef: string | null | undefined; occurredAt: string },
): Promise<void> {
  try {
    const norm = normalizeRef(opts.affRef);
    if (!norm) return;
    const { data } = await db
      .from("af_affiliates")
      .select("id, ref, status, archived_at")
      .eq("ref", norm)
      .maybeSingle();
    const affiliate = resolveAffiliateForRef(norm, data ? [data] : []);
    if (!affiliate) return;
    const sourceId = await getSourceIdByKind(db, "tracking");
    if (!sourceId) return;
    await recordConversion(db, {
      sourceId,
      affiliateId: affiliate.id,
      externalId: `intake:${opts.sessionId}`,
      type: "lead",
      occurredAt: opts.occurredAt,
      intakeSessionId: opts.sessionId,
    });
  } catch (e) {
    console.error("[affiliate] attributeIntakeLead:", e instanceof Error ? e.message : e);
  }
}
