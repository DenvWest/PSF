"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { imagesNeedingLicense, validateBulkLicense, type BulkImageRow } from "@/lib/product-admin/bulk-license";

export type BulkLicenseResult =
  | { ok: true; products: number; images: number; applied: boolean }
  | { ok: false; error: string };

/**
 * Vult bron en licentie-notitie in bij alle afbeeldingen zonder notitie van de
 * producten die bij een winkel een aanbieding hebben. Met dryRun wordt alleen
 * geteld. Overschrijft nooit een bestaande notitie.
 */
export async function bulkFillImageLicenseAction(input: {
  retailerId: string;
  source: string;
  licenseNote: string;
  dryRun: boolean;
}): Promise<BulkLicenseResult> {
  await requireAdmin();
  const error = validateBulkLicense(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const offers = await db.from("sup_offers").select("product_id").eq("retailer_id", input.retailerId);
    if (offers.error) return { ok: false, error: offers.error.message };
    const productIds = [...new Set((offers.data ?? []).map((o: { product_id: string }) => o.product_id))];
    if (productIds.length === 0) return { ok: true, products: 0, images: 0, applied: false };

    const images = await db.from("sup_product_images").select("id, product_id, source, license_note").in("product_id", productIds);
    if (images.error) return { ok: false, error: images.error.message };
    const todo = imagesNeedingLicense((images.data ?? []) as (BulkImageRow & { product_id: string })[]);
    const products = new Set(todo.map((i) => i.product_id)).size;

    if (input.dryRun || todo.length === 0) return { ok: true, products, images: todo.length, applied: false };

    const { error: updateError } = await db
      .from("sup_product_images")
      .update({
        source: input.source,
        license_note: input.licenseNote.trim(),
        checked_at: new Date().toISOString(),
      })
      .in(
        "id",
        todo.map((i) => i.id),
      );
    if (updateError) return { ok: false, error: updateError.message };
    revalidatePath("/admin/producten");
    return { ok: true, products, images: todo.length, applied: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
