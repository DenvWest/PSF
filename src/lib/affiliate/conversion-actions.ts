"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAffiliateDb } from "@/lib/affiliate/db";
import { getSourceIdByKind, recordConversion } from "@/lib/affiliate/conversions";
import {
  accrueForConversion,
  approveConversionAccrual,
  reverseConversionAccrual,
} from "@/lib/affiliate/af-ledger";
import type { ActionResult } from "@/lib/affiliate/actions";
import type { AfConversionType } from "@/types/affiliate";

function revalidate(ref?: string) {
  if (ref) revalidatePath(`/admin/programma/${ref}`);
}

function toCents(euro: string): number {
  const n = Number(euro.trim().replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Handmatige conversie-invoer (Dennis kent 'm → status 'approved'). */
export async function recordManualConversionAction(input: {
  affiliateId: string;
  ref: string;
  type: AfConversionType;
  occurredOn: string;
  revenueEur: string;
  orderRef: string;
}): Promise<ActionResult> {
  if (!input.occurredOn) return { ok: false, error: "Datum is verplicht." };
  try {
    const db = getAffiliateDb();
    const sourceId = await getSourceIdByKind(db, "manual");
    if (!sourceId) return { ok: false, error: "Bron 'manual' ontbreekt." };
    const orderRef = input.orderRef.trim() || null;
    const result = await recordConversion(db, {
      sourceId,
      affiliateId: input.affiliateId,
      externalId: orderRef ?? `manual:${randomUUID()}`,
      type: input.type,
      occurredAt: `${input.occurredOn}T12:00:00.000Z`,
      revenueCents: input.type === "sale" ? toCents(input.revenueEur) : 0,
      orderRef,
      status: "approved",
    });
    if (!result.ok) return { ok: false, error: result.error ?? "Er ging iets mis." };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/**
 * CSV-import. Formaat per regel: external_id,type,occurred_on,revenue_eur,order_ref
 * (kopregel optioneel). Idempotent op external_id → her-import telt niet dubbel.
 */
export async function importConversionsCsvAction(input: {
  affiliateId: string;
  ref: string;
  csv: string;
}): Promise<ActionResult<{ imported: number; skipped: number }>> {
  try {
    const db = getAffiliateDb();
    const sourceId = await getSourceIdByKind(db, "csv");
    if (!sourceId) return { ok: false, error: "Bron 'csv' ontbreekt." };

    const lines = input.csv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.toLowerCase().startsWith("external_id"));

    let imported = 0;
    let skipped = 0;
    for (const line of lines) {
      const [externalId, type, occurredOn, revenueEur, orderRef] = line
        .split(",")
        .map((c) => c.trim());
      if (!externalId || (type !== "lead" && type !== "sale") || !occurredOn) {
        skipped += 1;
        continue;
      }
      const result = await recordConversion(db, {
        sourceId,
        affiliateId: input.affiliateId,
        externalId,
        type,
        occurredAt: `${occurredOn}T12:00:00.000Z`,
        revenueCents: type === "sale" ? toCents(revenueEur ?? "0") : 0,
        orderRef: orderRef || null,
        status: "pending",
      });
      if (result.ok) imported += 1;
      else skipped += 1;
    }
    revalidate(input.ref);
    return { ok: true, data: { imported, skipped } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/** Keurt een conversie goed of af; drijft de accrual/reversal in het grootboek. */
export async function setConversionStatusAction(input: {
  conversionId: string;
  status: "approved" | "rejected";
  ref: string;
}): Promise<ActionResult> {
  try {
    const db = getAffiliateDb();
    const { error } = await db
      .from("af_conversions")
      .update({ status: input.status })
      .eq("id", input.conversionId);
    if (error) return { ok: false, error: error.message };

    if (input.status === "approved") {
      await accrueForConversion(db, input.conversionId); // maakt accrual als die ontbreekt
      await approveConversionAccrual(db, input.conversionId);
    } else {
      await reverseConversionAccrual(db, input.conversionId);
    }
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
