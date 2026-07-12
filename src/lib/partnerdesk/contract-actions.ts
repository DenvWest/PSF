"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import {
  validateCommissionRule,
  validateContract,
  type CommissionRuleInput,
  type ContractInput,
} from "@/lib/partnerdesk/validation";
import type { ActionResult } from "@/lib/partnerdesk/actions";

const BUCKET = "partner-documents";
const ALLOWED_DOC_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function revalidateDossier(slug?: string) {
  revalidatePath("/admin/partners");
  if (slug) revalidatePath(`/admin/partners/${slug}`);
}

function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: string[],
): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {};
  for (const f of fields) {
    if (before[f] !== after[f]) out[f] = [before[f] ?? null, after[f] ?? null];
  }
  return out;
}

// ── Contracten ──────────────────────────────────────────────────────────────

function contractRow(input: ContractInput) {
  return {
    number: input.number.trim(),
    starts_on: input.startsOn,
    ends_on: input.endsOn || null,
    notice_period_days: input.noticePeriodDays,
    cookie_days: input.cookieDays,
    exclusivity: input.exclusivity?.trim() || null,
    approval_terms: input.approvalTerms?.trim() || null,
    auto_renews: input.autoRenews,
    notes: input.notes?.trim() || null,
  };
}

export async function createContractAction(
  input: ContractInput & { partnerId: string; slug?: string },
): Promise<ActionResult> {
  const error = validateContract(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { data, error: insertError } = await db
      .from("pd_contracts")
      .insert({ partner_id: input.partnerId, ...contractRow(input) })
      .select("id, number")
      .single();
    if (insertError) return { ok: false, error: insertError.message };

    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "system",
      kind: "contract_created",
      body: `Contract ${(data as { number: string }).number} toegevoegd`,
      contractId: (data as { id: string }).id,
      metadata: { number: (data as { number: string }).number },
    });
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function updateContractAction(
  input: ContractInput & { contractId: string; partnerId: string; slug?: string },
): Promise<ActionResult> {
  const error = validateContract(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { data: before } = await db
      .from("pd_contracts")
      .select("*")
      .eq("id", input.contractId)
      .maybeSingle();

    const row = contractRow(input);
    const { error: updateError } = await db
      .from("pd_contracts")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", input.contractId);
    if (updateError) return { ok: false, error: updateError.message };

    if (before) {
      const changes = diff(before, row, Object.keys(row));
      if (Object.keys(changes).length > 0) {
        await recordTimelineEvent(db, {
          partnerId: input.partnerId,
          actor: "system",
          kind: "contract_updated",
          body: `Contract ${row.number} gewijzigd`,
          contractId: input.contractId,
          metadata: { diff: changes },
        });
      }
    }
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function archiveContractAction(input: {
  contractId: string;
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_contracts")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", input.contractId);
    if (error) return { ok: false, error: error.message };
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Commissieregels ─────────────────────────────────────────────────────────

function ruleRow(input: CommissionRuleInput) {
  return {
    kind: input.kind,
    rate_percent: input.kind === "cps_percent" ? input.ratePercent : null,
    amount_cents: input.kind === "cps_percent" ? null : input.amountCents,
    scope: input.scope,
    category_id: input.scope === "category" ? input.categoryId : null,
    rule_type: input.ruleType,
    valid_from: input.validFrom || null,
    valid_to: input.validTo || null,
  };
}

export async function createRuleAction(
  input: CommissionRuleInput & {
    contractId: string;
    partnerId: string;
    slug?: string;
  },
): Promise<ActionResult> {
  const error = validateCommissionRule(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { error: insertError } = await db
      .from("pd_commission_rules")
      .insert({ contract_id: input.contractId, ...ruleRow(input) });
    if (insertError) return { ok: false, error: insertError.message };

    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "system",
      kind: "commission_changed",
      body: "Commissieregel toegevoegd",
      contractId: input.contractId,
      metadata: { added: ruleRow(input) },
    });
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function updateRuleAction(
  input: CommissionRuleInput & {
    ruleId: string;
    partnerId: string;
    contractId: string;
    slug?: string;
  },
): Promise<ActionResult> {
  const error = validateCommissionRule(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { data: before } = await db
      .from("pd_commission_rules")
      .select("*")
      .eq("id", input.ruleId)
      .maybeSingle();

    const row = ruleRow(input);
    const { error: updateError } = await db
      .from("pd_commission_rules")
      .update(row)
      .eq("id", input.ruleId);
    if (updateError) return { ok: false, error: updateError.message };

    if (before) {
      const changes = diff(before, row, Object.keys(row));
      if (Object.keys(changes).length > 0) {
        await recordTimelineEvent(db, {
          partnerId: input.partnerId,
          actor: "system",
          kind: "commission_changed",
          body: "Commissieregel gewijzigd",
          contractId: input.contractId,
          metadata: { diff: changes },
        });
      }
    }
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function archiveRuleAction(input: {
  ruleId: string;
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_commission_rules")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", input.ruleId);
    if (error) return { ok: false, error: error.message };
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Staffels ────────────────────────────────────────────────────────────────

export async function addTierAction(input: {
  ruleId: string;
  kind: string;
  thresholdCents: number;
  ratePercent: number | null;
  amountCents: number | null;
  slug?: string;
}): Promise<ActionResult> {
  if (input.thresholdCents < 0) return { ok: false, error: "Drempel kan niet negatief zijn." };
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_commission_tiers").insert({
      commission_rule_id: input.ruleId,
      threshold_cents: input.thresholdCents,
      rate_percent: input.kind === "cps_percent" ? input.ratePercent : null,
      amount_cents: input.kind === "cps_percent" ? null : input.amountCents,
    });
    if (error) return { ok: false, error: error.message };
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function removeTierAction(input: {
  tierId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_commission_tiers").delete().eq("id", input.tierId);
    if (error) return { ok: false, error: error.message };
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Documenten (PDF/materiaal) ──────────────────────────────────────────────

export async function uploadDocumentAction(
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("file");
  const partnerId = String(formData.get("partnerId") ?? "");
  const contractId = (formData.get("contractId") as string) || null;
  const kind = String(formData.get("kind") ?? "contract");
  const slug = (formData.get("slug") as string) || undefined;

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Geen bestand ontvangen." };
  }
  if (!ALLOWED_DOC_MIME.has(file.type)) {
    return { ok: false, error: "Alleen PDF of afbeelding toegestaan." };
  }
  if (!partnerId) return { ok: false, error: "Partner ontbreekt." };

  try {
    const db = getPartnerDeskDb();
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `${partnerId}/${crypto.randomUUID()}.${ext}`;
    const upload = await db.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) return { ok: false, error: upload.error.message };

    const { error: insertError } = await db.from("pd_documents").insert({
      partner_id: partnerId,
      contract_id: contractId,
      kind,
      title: file.name,
      storage_path: path,
      mime_type: file.type,
      file_size: file.size,
      origin: "upload",
    });
    if (insertError) return { ok: false, error: insertError.message };

    await recordTimelineEvent(db, {
      partnerId,
      actor: "system",
      kind: "document_uploaded",
      body: `Document geüpload: ${file.name}`,
      contractId,
      metadata: { title: file.name, kind },
    });
    revalidateDossier(slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/** Kortlevende signed URL om een document te bekijken/downloaden. */
export async function getDocumentUrlAction(input: {
  storagePath: string;
}): Promise<ActionResult<{ url: string }>> {
  try {
    const db = getPartnerDeskDb();
    const { data, error } = await db.storage
      .from(BUCKET)
      .createSignedUrl(input.storagePath, 300);
    if (error || !data) {
      return { ok: false, error: error?.message ?? "Kon geen link maken." };
    }
    return { ok: true, data: { url: data.signedUrl } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function deleteDocumentAction(input: {
  documentId: string;
  storagePath: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    await db.storage.from(BUCKET).remove([input.storagePath]);
    const { error } = await db.from("pd_documents").delete().eq("id", input.documentId);
    if (error) return { ok: false, error: error.message };
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
