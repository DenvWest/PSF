import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveAfCommission, ruleSnapshot } from "@/lib/affiliate/af-commission";
import type { AfCommissionRule } from "@/types/affiliate";

interface ConversionRow {
  id: string;
  affiliate_id: string;
  type: "lead" | "sale";
  revenue_cents: number;
  occurred_at: string;
  status: string;
}

/**
 * Maakt (idempotent) de commissie-accrual voor een conversie. Slaat een bevroren
 * regel-snapshot op zodat geboekt geld immuun is voor latere regelwijzigingen.
 * State volgt de conversie-status (approved-conversie → approved-accrual).
 */
export async function accrueForConversion(
  db: SupabaseClient,
  conversionId: string,
): Promise<{ ok: boolean; accrued: boolean; reason?: string }> {
  const { data: conv } = await db
    .from("af_conversions")
    .select("id, affiliate_id, type, revenue_cents, occurred_at, status")
    .eq("id", conversionId)
    .maybeSingle();
  if (!conv) return { ok: false, accrued: false, reason: "conversie niet gevonden" };
  const conversion = conv as ConversionRow;
  if (conversion.status === "rejected") return { ok: true, accrued: false };

  const { data: existing } = await db
    .from("af_ledger_entries")
    .select("id")
    .eq("conversion_id", conversionId)
    .eq("kind", "accrual")
    .limit(1)
    .maybeSingle();
  if (existing) return { ok: true, accrued: false };

  const { data: rules } = await db
    .from("af_commission_rules")
    .select("*")
    .eq("affiliate_id", conversion.affiliate_id)
    .is("archived_at", null);

  const dateIso = String(conversion.occurred_at).slice(0, 10);
  const resolved = resolveAfCommission(
    (rules ?? []) as AfCommissionRule[],
    conversion.type,
    dateIso,
    conversion.revenue_cents,
  );
  if (!resolved) return { ok: true, accrued: false, reason: "geen commissieafspraak" };

  const { error } = await db.from("af_ledger_entries").insert({
    affiliate_id: conversion.affiliate_id,
    conversion_id: conversionId,
    kind: "accrual",
    amount_cents: resolved.amountCents,
    expected_cents: resolved.amountCents,
    state: conversion.status === "approved" ? "approved" : "pending",
    period: dateIso.slice(0, 7),
    rule_snapshot: ruleSnapshot(resolved.rule),
  });
  if (error) return { ok: false, accrued: false, reason: error.message };
  return { ok: true, accrued: true };
}

/** Zet de accrual van een goedgekeurde conversie op 'approved' (klaar voor uitbetaling). */
export async function approveConversionAccrual(
  db: SupabaseClient,
  conversionId: string,
): Promise<void> {
  await db
    .from("af_ledger_entries")
    .update({ state: "approved" })
    .eq("conversion_id", conversionId)
    .eq("kind", "accrual")
    .eq("state", "pending");
}

/**
 * Tegenboeking bij afkeuring (append-only: de accrual blijft, een reversal heft
 * hem op). Idempotent: geen tweede reversal voor dezelfde accrual.
 */
export async function reverseConversionAccrual(
  db: SupabaseClient,
  conversionId: string,
): Promise<void> {
  const { data: accrual } = await db
    .from("af_ledger_entries")
    .select("id, affiliate_id, amount_cents, period")
    .eq("conversion_id", conversionId)
    .eq("kind", "accrual")
    .maybeSingle();
  if (!accrual) return;

  const { data: already } = await db
    .from("af_ledger_entries")
    .select("id")
    .eq("reverses_entry_id", accrual.id as string)
    .limit(1)
    .maybeSingle();
  if (already) return;

  await db.from("af_ledger_entries").insert({
    affiliate_id: accrual.affiliate_id,
    conversion_id: conversionId,
    kind: "reversal",
    amount_cents: -(accrual.amount_cents as number),
    state: "approved",
    period: accrual.period,
    reverses_entry_id: accrual.id,
    note: "Conversie afgekeurd",
  });
}
