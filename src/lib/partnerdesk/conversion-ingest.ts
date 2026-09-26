import type { SupabaseClient } from "@supabase/supabase-js";
import {
  resolveCommissions,
  type ResolutionContract,
  type ResolutionRule,
} from "@/lib/partnerdesk/commission-resolution";
import { computeExpectedCommissionCents, type ConversionType } from "@/lib/partnerdesk/commission-amount";

/**
 * Conversie-inname upstream — zie ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md §C6.
 * Idempotent op (partner_id, external_id): een retry van de partner overschrijft
 * niet, de unique constraint in pd_conversions vangt dat af.
 */

export interface IngestConversionInput {
  partnerId: string;
  contractId: string | null;
  clickToken: string | null;
  externalId: string;
  type: ConversionType;
  occurredAt: string;
  orderRef: string | null;
  revenueCents: number;
  currency: string;
  ingestMethod: "postback" | "import" | "manual";
  raw: Record<string, unknown>;
}

export interface IngestConversionResult {
  ok: boolean;
  duplicate: boolean;
  conversionId: string | null;
  expectedCents: number | null;
  error: string | null;
}

/**
 * Slaat een conversie op + berekent het verwachte commissiebedrag via de
 * bestaande resolutie-motor. Schrijft GEEN ledger-entry — dat gebeurt in een
 * los, expliciet admin-goedkeuringsmoment (pd_conversions.status: pending ->
 * approved), niet automatisch bij binnenkomst. Een postback van een partner is
 * een claim, geen bevestigd feit.
 */
export async function ingestConversion(
  db: SupabaseClient,
  input: IngestConversionInput,
): Promise<IngestConversionResult> {
  const { data: rulesData } = await db
    .from("pd_commission_rules")
    .select("id, contract_id, kind, rate_percent, amount_cents, scope, category_id, rule_type, valid_from, valid_to, created_at, archived_at")
    .eq("contract_id", input.contractId ?? "");

  const { data: contractsData } = await db
    .from("pd_contracts")
    .select("id, number, starts_on, ends_on, archived_at")
    .eq("partner_id", input.partnerId);

  const rules = (rulesData ?? []) as ResolutionRule[];
  const contracts = (contractsData ?? []) as ResolutionContract[];
  const occurredDate = input.occurredAt.slice(0, 10);

  const { groups } = resolveCommissions(rules, contracts, occurredDate);
  const expectedCents = computeExpectedCommissionCents(groups, input.type, input.revenueCents);

  const { data, error } = await db
    .from("pd_conversions")
    .upsert(
      {
        partner_id: input.partnerId,
        contract_id: input.contractId,
        click_token: input.clickToken,
        external_id: input.externalId,
        type: input.type,
        occurred_at: input.occurredAt,
        order_ref: input.orderRef,
        revenue_cents: input.revenueCents,
        commission_cents: expectedCents,
        currency: input.currency,
        status: "pending",
        ingest_method: input.ingestMethod,
        raw: input.raw,
      },
      { onConflict: "partner_id,external_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, duplicate: false, conversionId: null, expectedCents, error: error.message };
  }

  // ignoreDuplicates: bij een bestaande (partner_id, external_id) geeft
  // upsert geen rij terug — dat IS de idempotentiegarantie, geen fout.
  if (!data) {
    return { ok: true, duplicate: true, conversionId: null, expectedCents, error: null };
  }

  return { ok: true, duplicate: false, conversionId: data.id, expectedCents, error: null };
}
