"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb, slugify } from "@/lib/partnerdesk/db";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import {
  isEditablePartnerField,
  validatePartnerFieldValue,
  validatePartnerName,
} from "@/lib/partnerdesk/validation";
import type { PdPartner } from "@/types/partnerdesk";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

/** Vindt een vrije slug op basis van de naam; botsing krijgt -2, -3, … */
async function findFreeSlug(
  db: ReturnType<typeof getPartnerDeskDb>,
  name: string,
): Promise<string> {
  const base = slugify(name) || "partner";
  const { data, error } = await db
    .from("pd_partners")
    .select("slug")
    .like("slug", `${base}%`);
  if (error) throw new Error(`pd_partners slug-check: ${error.message}`);
  const taken = new Set((data ?? []).map((r) => r.slug as string));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export async function createPartnerAction(input: {
  name: string;
  networkId: string;
}): Promise<ActionResult<{ slug: string }>> {
  const nameError = validatePartnerName(input.name);
  if (nameError) return { ok: false, error: nameError };
  if (!input.networkId) return { ok: false, error: "Kies een netwerk." };

  try {
    const db = getPartnerDeskDb();
    const slug = await findFreeSlug(db, input.name);
    const { data, error } = await db
      .from("pd_partners")
      .insert({
        name: input.name.trim(),
        network_id: input.networkId,
        slug,
      })
      .select("*")
      .single();
    if (error) return { ok: false, error: error.message };

    const partner = data as PdPartner;
    await recordTimelineEvent(db, {
      partnerId: partner.id,
      actor: "system",
      kind: "partner_created",
    });
    await recomputeSignalsForPartner(db, partner.id);

    revalidatePath("/admin/partners");
    return { ok: true, data: { slug } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/** Nullbare tekstvelden: lege invoer wordt null in plaats van "". */
const NULLABLE_ON_EMPTY = new Set([
  "category_id",
  "website",
  "login_url",
  "login_username",
  "account_manager",
  "description",
]);

export async function updatePartnerFieldAction(input: {
  partnerId: string;
  field: string;
  value: string;
}): Promise<ActionResult> {
  const { partnerId, field } = input;
  if (!isEditablePartnerField(field)) {
    return { ok: false, error: "Dit veld is niet bewerkbaar." };
  }
  const value = input.value.trim();
  const fieldError = validatePartnerFieldValue(field, value);
  if (fieldError) return { ok: false, error: fieldError };
  if (field === "network_id" && !value) {
    return { ok: false, error: "Netwerk is verplicht." };
  }

  const nextValue = value === "" && NULLABLE_ON_EMPTY.has(field) ? null : value;

  try {
    const db = getPartnerDeskDb();

    // Statuswijziging als systeem-event vastleggen (met oud→nieuw voor de diff).
    let previousStatus: string | null = null;
    if (field === "status") {
      const { data } = await db
        .from("pd_partners")
        .select("status")
        .eq("id", partnerId)
        .maybeSingle();
      previousStatus = (data?.status as string | null) ?? null;
    }

    const { error } = await db
      .from("pd_partners")
      .update({ [field]: nextValue, updated_at: new Date().toISOString() })
      .eq("id", partnerId);
    if (error) return { ok: false, error: error.message };

    if (field === "status" && previousStatus && previousStatus !== nextValue) {
      await recordTimelineEvent(db, {
        partnerId,
        actor: "system",
        kind: "partner_status_changed",
        metadata: { from: previousStatus, to: nextValue },
      });
    }

    await recomputeSignalsForPartner(db, partnerId);
    revalidatePath("/admin/partners");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

function revalidatePartner(slug?: string) {
  revalidatePath("/admin/partners");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/admin/partners/${slug}`);
}

// ── Labels aan een partner ──────────────────────────────────────────────────

export async function addPartnerLabelAction(input: {
  partnerId: string;
  labelId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_partner_labels")
      .upsert(
        { partner_id: input.partnerId, label_id: input.labelId },
        { onConflict: "partner_id,label_id", ignoreDuplicates: true },
      );
    if (error) return { ok: false, error: error.message };
    revalidatePartner(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function removePartnerLabelAction(input: {
  partnerId: string;
  labelId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_partner_labels")
      .delete()
      .eq("partner_id", input.partnerId)
      .eq("label_id", input.labelId);
    if (error) return { ok: false, error: error.message };
    revalidatePartner(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Archiveren / herstellen ─────────────────────────────────────────────────

export async function archivePartnerAction(input: {
  partnerId: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_partners")
      .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", input.partnerId);
    if (error) return { ok: false, error: error.message };

    // BR-25: open taken vervallen, signalen resolven (via recompute), event.
    await db
      .from("pd_tasks")
      .update({ status: "dismissed" })
      .eq("partner_id", input.partnerId)
      .eq("status", "open");
    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "system",
      kind: "partner_archived",
    });
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidatePartner();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function restorePartnerAction(input: {
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_partners")
      .update({ archived_at: null, updated_at: new Date().toISOString() })
      .eq("id", input.partnerId);
    if (error) return { ok: false, error: error.message };
    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "system",
      kind: "partner_restored",
    });
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidatePartner(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

// ── Logo ────────────────────────────────────────────────────────────────────

const LOGO_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export async function uploadPartnerLogoAction(
  formData: FormData,
): Promise<ActionResult> {
  const file = formData.get("file");
  const partnerId = String(formData.get("partnerId") ?? "");
  const slug = (formData.get("slug") as string) || undefined;
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Geen bestand ontvangen." };
  }
  if (!LOGO_MIME.has(file.type)) {
    return { ok: false, error: "Alleen PNG, JPG, WEBP of SVG." };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: "Logo mag maximaal 2 MB zijn." };
  }
  try {
    const db = getPartnerDeskDb();
    const { data: partner } = await db
      .from("pd_partners")
      .select("logo_path")
      .eq("id", partnerId)
      .maybeSingle();

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
    const path = `${partnerId}/logo-${crypto.randomUUID()}.${ext}`;
    const up = await db.storage
      .from("partner-documents")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) return { ok: false, error: up.error.message };

    const { error } = await db
      .from("pd_partners")
      .update({ logo_path: path, updated_at: new Date().toISOString() })
      .eq("id", partnerId);
    if (error) return { ok: false, error: error.message };

    const oldPath = (partner?.logo_path as string | null) ?? null;
    if (oldPath) await db.storage.from("partner-documents").remove([oldPath]);

    revalidatePartner(slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function removePartnerLogoAction(input: {
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { data: partner } = await db
      .from("pd_partners")
      .select("logo_path")
      .eq("id", input.partnerId)
      .maybeSingle();
    const path = (partner?.logo_path as string | null) ?? null;
    if (path) await db.storage.from("partner-documents").remove([path]);
    const { error } = await db
      .from("pd_partners")
      .update({ logo_path: null, updated_at: new Date().toISOString() })
      .eq("id", input.partnerId);
    if (error) return { ok: false, error: error.message };
    revalidatePartner(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
