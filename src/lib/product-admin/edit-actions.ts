"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { EfsaClaimId } from "@/data/approved-claims";
import { productMeetsClaimThreshold } from "@/lib/claim-condition";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import {
  validateActiveInput,
  validateImageInput,
  validateOfferPrice,
  validateSourceInput,
} from "@/lib/product-admin/edit-validation";
import { buildDosering } from "@/lib/supplement-catalog-db/loader";

function revalidateProduct(slug: string) {
  revalidatePath("/admin/producten");
  revalidatePath(`/admin/producten/${slug}`);
  revalidatePath("/supplementen");
  revalidatePath("/beste/[supplement]", "page");
}

function fail(err: unknown): ActionResult {
  return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
}

/**
 * meets_condition is afgeleid van de werkzame stoffen. Na elke wijziging daar
 * opnieuw berekenen, anders blijft een claim "gehaald" staan terwijl de dosis
 * eronder is gezakt.
 */
async function recomputeClaims(db: SupabaseClient, productId: string): Promise<void> {
  const [activesRes, claimsRes] = await Promise.all([
    db
      .from("sup_product_actives")
      .select("product_id, nutrient_key, amount_per_serving, unit, is_elemental")
      .eq("product_id", productId),
    db.from("sup_product_claims").select("efsa_claim_id").eq("product_id", productId),
  ]);
  const actives = (activesRes.data ?? []) as {
    product_id: string;
    nutrient_key: string;
    amount_per_serving: number;
    unit: string;
    is_elemental: boolean;
  }[];
  const claims = (claimsRes.data ?? []) as { efsa_claim_id: string }[];
  if (actives.length === 0 || claims.length === 0) return;

  const dosering = buildDosering(actives);
  await Promise.all(
    claims.map((c) =>
      db
        .from("sup_product_claims")
        .update({ meets_condition: productMeetsClaimThreshold(dosering, c.efsa_claim_id as EfsaClaimId) })
        .eq("product_id", productId)
        .eq("efsa_claim_id", c.efsa_claim_id),
    ),
  );
}

export async function updateActiveAction(input: {
  activeId: string;
  productId: string;
  slug: string;
  amount: number;
  unit: string;
}): Promise<ActionResult> {
  const error = validateActiveInput(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { error: updateError } = await db
      .from("sup_product_actives")
      .update({ amount_per_serving: input.amount, unit: input.unit })
      .eq("id", input.activeId)
      .eq("product_id", input.productId);
    if (updateError) return { ok: false, error: updateError.message };
    await recomputeClaims(db, input.productId);
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function updateImageAction(input: {
  imageId: string;
  productId: string;
  slug: string;
  source: string;
  licenseNote: string;
  alt: string;
}): Promise<ActionResult> {
  const error = validateImageInput(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { error: updateError } = await db
      .from("sup_product_images")
      .update({
        source: input.source,
        license_note: input.licenseNote.trim(),
        alt: input.alt.trim() || null,
        checked_at: new Date().toISOString(),
      })
      .eq("id", input.imageId)
      .eq("product_id", input.productId);
    if (updateError) return { ok: false, error: updateError.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Nieuwe prijs of bevestiging van de bestaande: beide zetten price_checked_at en loggen in de prijshistorie. */
export async function updateOfferPriceAction(input: {
  offerId: string;
  productId: string;
  slug: string;
  priceCents: number | null;
}): Promise<ActionResult> {
  const error = validateOfferPrice(input.priceCents);
  if (error || input.priceCents === null) return { ok: false, error: error ?? "Ongeldige prijs." };
  try {
    const db = getPartnerDeskDb();
    const now = new Date().toISOString();
    const { data, error: updateError } = await db
      .from("sup_offers")
      .update({ price_cents: input.priceCents, price_checked_at: now, updated_at: now })
      .eq("id", input.offerId)
      .eq("product_id", input.productId)
      .select("id");
    if (updateError) return { ok: false, error: updateError.message };
    if (!data || data.length === 0) return { ok: false, error: "Aanbieding niet gevonden." };
    await db
      .from("sup_offer_price_history")
      .insert({ offer_id: input.offerId, price_cents: input.priceCents, observed_at: now });
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function setOfferActiveAction(input: {
  offerId: string;
  productId: string;
  slug: string;
  active: boolean;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_offers")
      .update({ active: input.active, updated_at: new Date().toISOString() })
      .eq("id", input.offerId)
      .eq("product_id", input.productId);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function addSourceAction(input: {
  productId: string;
  slug: string;
  kind: string;
  url: string;
  title: string;
}): Promise<ActionResult> {
  const error = validateSourceInput(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { error: insertError } = await db.from("sup_sources").insert({
      product_id: input.productId,
      kind: input.kind.trim(),
      url: input.url.trim() || null,
      title: input.title.trim() || null,
      checked_at: new Date().toISOString(),
    });
    if (insertError) return { ok: false, error: insertError.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function removeSourceAction(input: {
  sourceId: string;
  productId: string;
  slug: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_sources")
      .delete()
      .eq("id", input.sourceId)
      .eq("product_id", input.productId);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
