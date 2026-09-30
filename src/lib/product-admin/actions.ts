"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import { gateFailures } from "@/lib/product-admin/publish-gate";
import { getProductDossierById, type ProductStatus } from "@/lib/product-admin/queries";
import { isEditableProductField, validateProductField } from "@/lib/product-admin/validation";

function revalidateProduct(slug: string) {
  revalidatePath("/admin/producten");
  revalidatePath(`/admin/producten/${slug}`);
  revalidatePath("/supplementen");
  revalidatePath("/beste/[supplement]", "page");
}

export async function updateProductFieldAction(input: {
  productId: string;
  slug?: string;
  field: string;
  value: string;
}): Promise<ActionResult> {
  if (!isEditableProductField(input.field)) {
    return { ok: false, error: "Dit veld is niet bewerkbaar." };
  }
  const value = input.value.trim();
  const fieldError = validateProductField(input.field, value);
  if (fieldError) return { ok: false, error: fieldError };

  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_products")
      .update({ [input.field]: value === "" ? null : value, updated_at: new Date().toISOString() })
      .eq("id", input.productId);
    if (error) return { ok: false, error: error.message };
    if (input.slug) revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function markProductCheckedAction(input: {
  productId: string;
  slug: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_products")
      .update({ data_checked_at: new Date().toISOString() })
      .eq("id", input.productId);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

const STATUSES: ProductStatus[] = ["draft", "published", "archived"];

/**
 * Statuswijziging. Naar 'published' alleen als de publiceerpoort volledig slaagt;
 * de poort wordt hier server-side opnieuw uit de database berekend, nooit uit
 * wat de browser meestuurt.
 */
export async function setProductStatusAction(input: {
  productId: string;
  slug: string;
  status: ProductStatus;
}): Promise<ActionResult> {
  if (!STATUSES.includes(input.status)) return { ok: false, error: "Onbekende status." };
  try {
    const db = getPartnerDeskDb();
    if (input.status === "published") {
      const dossier = await getProductDossierById(db, input.productId);
      if (!dossier) return { ok: false, error: "Product niet gevonden." };
      const failures = gateFailures(dossier.gate);
      if (failures.length > 0) {
        return {
          ok: false,
          error: `Publiceren geblokkeerd: ${failures.map((f) => f.label).join("; ")}.`,
        };
      }
    }
    const now = new Date().toISOString();
    const { error } = await db
      .from("sup_products")
      .update({
        status: input.status,
        updated_at: now,
        published_at: input.status === "published" ? now : undefined,
        archived_at: input.status === "archived" ? now : null,
      })
      .eq("id", input.productId);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
