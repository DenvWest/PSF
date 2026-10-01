"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { getPartnerDeskDb, slugify } from "@/lib/partnerdesk/db";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import {
  isEditableRetailerField,
  validateNewRetailer,
  validateRetailerField,
} from "@/lib/product-admin/retailer-validation";

function revalidateRetailers() {
  revalidatePath("/admin/retailers");
  revalidatePath("/admin/producten");
}

function fail(err: unknown): ActionResult {
  return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
}

export async function updateRetailerFieldAction(input: {
  retailerId: string;
  field: string;
  value: string;
}): Promise<ActionResult> {
  await requireAdmin();
  if (!isEditableRetailerField(input.field)) return { ok: false, error: "Dit veld is niet bewerkbaar." };
  const value = input.value.trim();
  const fieldError = validateRetailerField(input.field, value);
  if (fieldError) return { ok: false, error: fieldError };
  try {
    const db = getPartnerDeskDb();
    if (input.field === "pd_partner_id" && value !== "") {
      const { data } = await db.from("pd_partners").select("id").eq("id", value).is("archived_at", null).maybeSingle();
      if (!data) return { ok: false, error: "Partner niet gevonden." };
    }
    const { error } = await db
      .from("sup_retailers")
      .update({ [input.field]: value === "" ? null : value })
      .eq("id", input.retailerId);
    if (error) return { ok: false, error: error.message };
    revalidateRetailers();
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function setRetailerActiveAction(input: { retailerId: string; active: boolean }): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("sup_retailers").update({ active: input.active }).eq("id", input.retailerId);
    if (error) return { ok: false, error: error.message };
    revalidateRetailers();
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function createRetailerAction(input: {
  name: string;
  relationship: string;
  pdPartnerId: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const error = validateNewRetailer(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const base = slugify(input.name) || "retailer";
    const { data, error: slugError } = await db.from("sup_retailers").select("slug").like("slug", `${base}%`);
    if (slugError) return { ok: false, error: slugError.message };
    const taken = new Set((data ?? []).map((r) => r.slug as string));
    let slug = base;
    for (let i = 2; taken.has(slug); i += 1) slug = `${base}-${i}`;

    const { error: insertError } = await db.from("sup_retailers").insert({
      slug,
      name: input.name.trim(),
      relationship: input.relationship,
      pd_partner_id: input.pdPartnerId || null,
      active: true,
    });
    if (insertError) return { ok: false, error: insertError.message };
    revalidateRetailers();
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
