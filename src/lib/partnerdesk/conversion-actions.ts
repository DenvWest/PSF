"use server";

import { revalidatePath } from "next/cache";
import { ingestConversion } from "@/lib/partnerdesk/conversion-ingest";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { buildReviewOutcome } from "@/lib/partnerdesk/revenue";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import type { ConversionType } from "@/lib/partnerdesk/commission-amount";
import type { PdConversion } from "@/types/partnerdesk";

function revalidateDossier(slug?: string) {
  if (slug) revalidatePath(`/admin/partners/${slug}`);
}

export interface ManualConversionInput {
  partnerId: string;
  slug?: string;
  type: ConversionType;
  occurredOn: string;
  revenueCents: number;
  orderRef: string | null;
  externalId: string | null;
}

export async function addManualConversionAction(
  input: ManualConversionInput,
): Promise<ActionResult> {
  if (input.type !== "lead" && input.type !== "sale") {
    return { ok: false, error: "Type moet lead of sale zijn." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.occurredOn)) {
    return { ok: false, error: "Datum is verplicht." };
  }
  if (!Number.isInteger(input.revenueCents) || input.revenueCents < 0) {
    return { ok: false, error: "Orderbedrag moet 0 of hoger zijn." };
  }
  try {
    const db = getPartnerDeskDb();
    const { data: contractRows } = await db
      .from("pd_contracts")
      .select("id")
      .eq("partner_id", input.partnerId)
      .is("archived_at", null)
      .order("starts_on", { ascending: false })
      .limit(1);

    const result = await ingestConversion(db, {
      partnerId: input.partnerId,
      contractId: contractRows?.[0]?.id ?? null,
      clickToken: null,
      externalId: input.externalId?.trim() || `manual-${crypto.randomUUID()}`,
      type: input.type,
      occurredAt: `${input.occurredOn}T12:00:00.000Z`,
      orderRef: input.orderRef?.trim() || null,
      revenueCents: input.revenueCents,
      currency: "EUR",
      ingestMethod: "manual",
      raw: { entered_by: "admin" },
    });
    if (!result.ok) return { ok: false, error: result.error ?? "Opslaan mislukt." };
    if (result.duplicate) return { ok: false, error: "Deze externe ID bestaat al voor deze partner." };

    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "user",
      kind: "conversion_added",
      body: `Conversie handmatig ingevoerd (${input.type})`,
      metadata: { conversion_id: result.conversionId, type: input.type, revenue_cents: input.revenueCents },
    });
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function reviewConversionAction(input: {
  conversionId: string;
  slug?: string;
  decision: "approve" | "reject";
  receivedCents?: number | null;
}): Promise<ActionResult> {
  if (
    input.receivedCents != null &&
    (!Number.isInteger(input.receivedCents) || input.receivedCents < 0)
  ) {
    return { ok: false, error: "Ontvangen bedrag moet 0 of hoger zijn." };
  }
  try {
    const db = getPartnerDeskDb();
    const { data, error } = await db
      .from("pd_conversions")
      .select("id, partner_id, type, occurred_at, revenue_cents, commission_cents, status")
      .eq("id", input.conversionId)
      .maybeSingle();
    if (error || !data) return { ok: false, error: error?.message ?? "Conversie niet gevonden." };
    const conversion = data as Pick<
      PdConversion,
      "id" | "partner_id" | "type" | "occurred_at" | "revenue_cents" | "commission_cents" | "status"
    >;
    if (conversion.status !== "pending") {
      return { ok: false, error: "Deze conversie is al beoordeeld." };
    }

    const outcome = buildReviewOutcome(conversion, input.decision, input.receivedCents ?? null);

    const { data: claimed, error: claimError } = await db
      .from("pd_conversions")
      .update({ status: outcome.conversionStatus })
      .eq("id", conversion.id)
      .eq("status", "pending")
      .select("id");
    if (claimError) return { ok: false, error: claimError.message };
    if (!claimed || claimed.length === 0) {
      return { ok: false, error: "Deze conversie is al beoordeeld." };
    }

    const { error: ledgerError } = await db.from("pd_ledger_entries").insert({
      partner_id: conversion.partner_id,
      conversion_id: conversion.id,
      ...outcome.ledger,
    });
    if (ledgerError) {
      await db.from("pd_conversions").update({ status: "pending" }).eq("id", conversion.id);
      return { ok: false, error: ledgerError.message };
    }

    await recordTimelineEvent(db, {
      partnerId: conversion.partner_id,
      actor: "user",
      kind: input.decision === "approve" ? "conversion_approved" : "conversion_rejected",
      body: input.decision === "approve" ? "Conversie goedgekeurd" : "Conversie afgekeurd",
      metadata: {
        conversion_id: conversion.id,
        amount_cents: outcome.ledger.amount_cents,
        expected_cents: outcome.ledger.expected_cents,
      },
    });
    await recomputeSignalsForPartner(db, conversion.partner_id);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/** Alleen handmatig ingevoerde, nog onbeoordeelde conversies (bijv. testrijen) zijn te verwijderen. */
export async function deleteManualConversionAction(input: {
  conversionId: string;
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { data, error } = await db
      .from("pd_conversions")
      .delete()
      .eq("id", input.conversionId)
      .eq("partner_id", input.partnerId)
      .eq("ingest_method", "manual")
      .eq("status", "pending")
      .select("id");
    if (error) return { ok: false, error: error.message };
    if (!data || data.length === 0) {
      return { ok: false, error: "Alleen handmatige, onbeoordeelde conversies zijn te verwijderen." };
    }
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
