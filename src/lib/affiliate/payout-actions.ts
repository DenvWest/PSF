"use server";

import { revalidatePath } from "next/cache";
import { getAffiliateDb } from "@/lib/affiliate/db";
import { todayIso } from "@/lib/partnerdesk/dates";
import type { ActionResult } from "@/lib/affiliate/actions";

function revalidate(ref?: string) {
  if (ref) revalidatePath(`/admin/programma/${ref}`);
}

/**
 * Stelt een uitbetaalbatch samen uit het goedgekeurde, nog niet uitbetaalde
 * saldo. Ledger-regels die al in een payout zitten worden overgeslagen.
 */
export async function createPayoutAction(input: {
  affiliateId: string;
  ref: string;
}): Promise<ActionResult> {
  try {
    const db = getAffiliateDb();
    const [approvedRes, itemsRes, affiliateRes] = await Promise.all([
      db
        .from("af_ledger_entries")
        .select("id, amount_cents")
        .eq("affiliate_id", input.affiliateId)
        .eq("state", "approved"),
      db.from("af_payout_items").select("ledger_entry_id"),
      db
        .from("af_affiliates")
        .select("payout_threshold_cents")
        .eq("id", input.affiliateId)
        .maybeSingle(),
    ]);
    const used = new Set((itemsRes.data ?? []).map((i) => i.ledger_entry_id as string));
    const entries = (approvedRes.data ?? []).filter((e) => !used.has(e.id as string));
    if (entries.length === 0) return { ok: false, error: "Geen goedgekeurd saldo om uit te betalen." };

    const total = entries.reduce((s, e) => s + (e.amount_cents as number), 0);
    if (total <= 0) return { ok: false, error: "Saldo is niet positief." };

    const threshold = (affiliateRes.data?.payout_threshold_cents as number | undefined) ?? 0;
    if (total < threshold) {
      return {
        ok: false,
        error: `Saldo (${(total / 100).toFixed(2).replace(".", ",")}) ligt onder de uitbetaaldrempel (${(threshold / 100).toFixed(2).replace(".", ",")}).`,
      };
    }

    const { data: payout, error } = await db
      .from("af_payouts")
      .insert({ affiliate_id: input.affiliateId, period: todayIso().slice(0, 7), total_cents: total, status: "draft" })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    const items = entries.map((e) => ({ payout_id: (payout as { id: string }).id, ledger_entry_id: e.id as string }));
    const { error: itemsError } = await db.from("af_payout_items").insert(items);
    if (itemsError) return { ok: false, error: itemsError.message };

    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/** Markeert een payout als betaald: ledger → paid + outbox-rij voor de boekhouding. */
export async function markPayoutPaidAction(input: {
  payoutId: string;
  ref: string;
}): Promise<ActionResult> {
  try {
    const db = getAffiliateDb();
    const { data: payout } = await db
      .from("af_payouts")
      .select("id, affiliate_id, period, total_cents, status")
      .eq("id", input.payoutId)
      .maybeSingle();
    if (!payout) return { ok: false, error: "Payout niet gevonden." };
    if (payout.status === "paid") return { ok: false, error: "Al uitbetaald." };

    const { data: items } = await db
      .from("af_payout_items")
      .select("ledger_entry_id")
      .eq("payout_id", input.payoutId);
    const ledgerIds = (items ?? []).map((i) => i.ledger_entry_id as string);
    if (ledgerIds.length > 0) {
      await db.from("af_ledger_entries").update({ state: "paid" }).in("id", ledgerIds);
    }

    await db
      .from("af_payouts")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", input.payoutId);

    const { data: affiliate } = await db
      .from("af_affiliates")
      .select("display_name")
      .eq("id", payout.affiliate_id as string)
      .maybeSingle();

    await db.from("af_financial_events").insert({
      kind: "payout",
      period: payout.period,
      gross_cents: payout.total_cents,
      counterparty: (affiliate?.display_name as string | undefined) ?? null,
      state: "new",
      payload: { payout_id: input.payoutId },
    });

    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
