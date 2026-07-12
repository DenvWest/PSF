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
