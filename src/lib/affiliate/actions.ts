"use server";

import { revalidatePath } from "next/cache";
import { getAffiliateDb, refFromName } from "@/lib/affiliate/db";
import {
  validateAffiliate,
  validateAffiliateName,
  validateAfRule,
  type AffiliateInput,
  type AfRuleInput,
} from "@/lib/affiliate/validation";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

function revalidate(ref?: string) {
  revalidatePath("/admin/programma");
  if (ref) revalidatePath(`/admin/programma/${ref}`);
}

async function findFreeRef(
  db: ReturnType<typeof getAffiliateDb>,
  name: string,
): Promise<string> {
  const base = refFromName(name) || "affiliate";
  const { data, error } = await db
    .from("af_affiliates")
    .select("ref")
    .like("ref", `${base}%`);
  if (error) throw new Error(`af_affiliates ref-check: ${error.message}`);
  const taken = new Set((data ?? []).map((r) => r.ref as string));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export async function createAffiliateAction(input: {
  displayName: string;
  email: string;
}): Promise<ActionResult<{ ref: string }>> {
  const nameError = validateAffiliateName(input.displayName);
  if (nameError) return { ok: false, error: nameError };
  try {
    const db = getAffiliateDb();
    const ref = await findFreeRef(db, input.displayName);
    const { error } = await db.from("af_affiliates").insert({
      ref,
      display_name: input.displayName.trim(),
      email: input.email.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidate(ref);
    return { ok: true, data: { ref } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function updateAffiliateAction(
  input: AffiliateInput & { affiliateId: string; ref?: string },
): Promise<ActionResult> {
  const error = validateAffiliate(input);
  if (error) return { ok: false, error };
  try {
    const db = getAffiliateDb();
    const { error: updateError } = await db
      .from("af_affiliates")
      .update({
        display_name: input.displayName.trim(),
        company: input.company?.trim() || null,
        email: input.email?.trim() || null,
        status: input.status,
        notes: input.notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.affiliateId);
    if (updateError) return { ok: false, error: updateError.message };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function archiveAffiliateAction(input: {
  affiliateId: string;
}): Promise<ActionResult> {
  try {
    const db = getAffiliateDb();
    const { error } = await db
      .from("af_affiliates")
      .update({ archived_at: new Date().toISOString(), status: "ended" })
      .eq("id", input.affiliateId);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Commissieregels ─────────────────────────────────────────────────────────

function ruleRow(input: AfRuleInput) {
  return {
    applies_to: input.appliesTo,
    value_type: input.valueType,
    rate_percent: input.valueType === "percent" ? input.ratePercent : null,
    amount_cents: input.valueType === "fixed" ? input.amountCents : null,
    rule_type: input.ruleType,
    valid_from: input.validFrom || null,
    valid_to: input.validTo || null,
  };
}

export async function createAfRuleAction(
  input: AfRuleInput & { affiliateId: string; ref?: string },
): Promise<ActionResult> {
  const error = validateAfRule(input);
  if (error) return { ok: false, error };
  try {
    const db = getAffiliateDb();
    const { error: insertError } = await db
      .from("af_commission_rules")
      .insert({ affiliate_id: input.affiliateId, ...ruleRow(input) });
    if (insertError) return { ok: false, error: insertError.message };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function updateAfRuleAction(
  input: AfRuleInput & { ruleId: string; ref?: string },
): Promise<ActionResult> {
  const error = validateAfRule(input);
  if (error) return { ok: false, error };
  try {
    const db = getAffiliateDb();
    const { error: updateError } = await db
      .from("af_commission_rules")
      .update(ruleRow(input))
      .eq("id", input.ruleId);
    if (updateError) return { ok: false, error: updateError.message };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function archiveAfRuleAction(input: {
  ruleId: string;
  ref?: string;
}): Promise<ActionResult> {
  try {
    const db = getAffiliateDb();
    const { error } = await db
      .from("af_commission_rules")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", input.ruleId);
    if (error) return { ok: false, error: error.message };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Links ───────────────────────────────────────────────────────────────────

export async function createAfLinkAction(input: {
  affiliateId: string;
  affiliateRef: string;
  targetUrl: string;
  campaign: string;
  ref?: string;
}): Promise<ActionResult> {
  const target = input.targetUrl.trim();
  if (!target) return { ok: false, error: "Doel-URL is verplicht." };
  try {
    const db = getAffiliateDb();
    const { error } = await db.from("af_links").insert({
      affiliate_id: input.affiliateId,
      ref: input.affiliateRef,
      target_url: target,
      campaign: input.campaign.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function deleteAfLinkAction(input: {
  linkId: string;
  ref?: string;
}): Promise<ActionResult> {
  try {
    const db = getAffiliateDb();
    const { error } = await db.from("af_links").delete().eq("id", input.linkId);
    if (error) return { ok: false, error: error.message };
    revalidate(input.ref);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
