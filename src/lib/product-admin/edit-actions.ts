"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { existsSync } from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { EfsaClaimId } from "@/data/approved-claims";
import { productMeetsClaimThreshold } from "@/lib/claim-condition";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { NUTRIENT_KEYS, isSelectableClaim } from "@/lib/product-admin/catalog-options";
import { validateScoreInputs, type StoredScoreInputs } from "@/lib/product-admin/score-inputs";
import { buildProductSlug } from "@/lib/product-admin/slug";
import { PRODUCT_SCORE_INPUTS } from "@/data/supplement-hub/score-inputs";
import type { SupplementCategory } from "@/types/supplement";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import {
  validateActiveInput,
  validateCertificationKey,
  normalizeImagePath,
  validateImageInput,
  validateImagePath,
  validateNewActive,
  validateNewOffer,
  validateNewProduct,
  validateOfferPrice,
  validateSourceInput,
} from "@/lib/product-admin/edit-validation";
import { buildDosering } from "@/lib/supplement-catalog-db/loader";
import { publishedEditBlock, type PublishedEdit } from "@/lib/product-admin/gate-regression";
import { getProductDossierById } from "@/lib/product-admin/queries";
import { todayIso } from "@/lib/partnerdesk/dates";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";

function revalidateProduct(slug: string) {
  revalidatePath("/admin/producten");
  revalidatePath(`/admin/producten/${slug}`);
  revalidatePath("/supplementen");
  revalidatePath("/beste/[supplement]", "page");
}

function fail(err: unknown): ActionResult {
  return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
}

/** Houdt het prijssignaal in PartnerDesk vers na een prijs- of aanbiedingswijziging; mislukken breekt de actie niet. */
async function refreshPriceSignals(db: SupabaseClient, productId: string): Promise<void> {
  try {
    const { data } = await db.from("sup_offers").select("sup_retailers(pd_partner_id)").eq("product_id", productId);
    type Row = { sup_retailers: { pd_partner_id: string | null } | { pd_partner_id: string | null }[] | null };
    const ids = new Set<string>();
    for (const row of (data ?? []) as unknown as Row[]) {
      const r = Array.isArray(row.sup_retailers) ? row.sup_retailers[0] : row.sup_retailers;
      if (r?.pd_partner_id) ids.add(r.pd_partner_id);
    }
    await Promise.all([...ids].map((id) => recomputeSignalsForPartner(db, id)));
  } catch {
    // het dagelijkse signaalsync vangt het alsnog op
  }
}

async function blockedByGate(db: SupabaseClient, productId: string, edit: PublishedEdit): Promise<string | null> {
  const dossier = await getProductDossierById(db, productId);
  return dossier ? publishedEditBlock(dossier, edit, todayIso()) : null;
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
  if (claims.length === 0) return;
  if (actives.length === 0) {
    await db.from("sup_product_claims").update({ meets_condition: false }).eq("product_id", productId);
    return;
  }

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
  await requireAdmin();
  const error = validateActiveInput(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const blocked = await blockedByGate(db, input.productId, { kind: "updateActive", activeId: input.activeId, amount: input.amount, unit: input.unit });
    if (blocked) return { ok: false, error: blocked };
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
  await requireAdmin();
  const error = validateImageInput(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const blocked = await blockedByGate(db, input.productId, { kind: "updateImage", imageId: input.imageId, source: input.source, licenseNote: input.licenseNote });
    if (blocked) return { ok: false, error: blocked };
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
  await requireAdmin();
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
    await refreshPriceSignals(db, input.productId);
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
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const blocked = await blockedByGate(db, input.productId, { kind: "setOfferActive", offerId: input.offerId, active: input.active });
    if (blocked) return { ok: false, error: blocked };
    const { error } = await db
      .from("sup_offers")
      .update({ active: input.active, updated_at: new Date().toISOString() })
      .eq("id", input.offerId)
      .eq("product_id", input.productId);
    if (error) return { ok: false, error: error.message };
    await refreshPriceSignals(db, input.productId);
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
  await requireAdmin();
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
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const blocked = await blockedByGate(db, input.productId, { kind: "removeSource", sourceId: input.sourceId });
    if (blocked) return { ok: false, error: blocked };
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

export async function createProductAction(input: {
  name: string;
  brandId: string;
  categoryId: string;
  variant: string;
  form: string;
}): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const error = validateNewProduct(input);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const [brandRes, categoryRes] = await Promise.all([
      db.from("sup_brands").select("name, slug").eq("id", input.brandId).maybeSingle(),
      db.from("sup_categories").select("id").eq("id", input.categoryId).maybeSingle(),
    ]);
    if (!brandRes.data) return { ok: false, error: "Merk niet gevonden." };
    if (!categoryRes.data) return { ok: false, error: "Categorie niet gevonden." };

    const brand = brandRes.data as { name: string; slug: string };
    const [takenRes, orderRes] = await Promise.all([
      db.from("sup_products").select("slug").like("slug", `${brand.slug}%`),
      db
        .from("sup_products")
        .select("display_order")
        .eq("category_id", input.categoryId)
        .order("display_order", { ascending: false })
        .limit(1),
    ]);
    const taken = new Set(((takenRes.data ?? []) as { slug: string }[]).map((r) => r.slug));
    const slug = buildProductSlug(brand.name, input.name, taken);
    const nextOrder = ((orderRes.data?.[0] as { display_order: number } | undefined)?.display_order ?? 0) + 1;

    const { error: insertError } = await db.from("sup_products").insert({
      slug,
      brand_id: input.brandId,
      category_id: input.categoryId,
      name: input.name.trim(),
      variant: input.variant.trim() || null,
      form: input.form.trim() || null,
      status: "draft",
      display_order: nextOrder,
    });
    if (insertError) return { ok: false, error: insertError.message };
    revalidatePath("/admin/producten");
    return { ok: true, data: { slug } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function addActiveAction(input: {
  productId: string;
  slug: string;
  nutrientKey: string;
  formKey: string;
  amount: number;
  unit: string;
  isElemental: boolean;
}): Promise<ActionResult> {
  await requireAdmin();
  const error = validateNewActive({ ...input, allowedKeys: NUTRIENT_KEYS });
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { error: insertError } = await db.from("sup_product_actives").insert({
      product_id: input.productId,
      nutrient_key: input.nutrientKey,
      form_key: input.formKey.trim() || null,
      amount_per_serving: input.amount,
      unit: input.unit,
      is_elemental: input.isElemental,
    });
    if (insertError) return { ok: false, error: insertError.message };
    await recomputeClaims(db, input.productId);
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function removeActiveAction(input: {
  activeId: string;
  productId: string;
  slug: string;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const blocked = await blockedByGate(db, input.productId, { kind: "removeActive", activeId: input.activeId });
    if (blocked) return { ok: false, error: blocked };
    const { error } = await db
      .from("sup_product_actives")
      .delete()
      .eq("id", input.activeId)
      .eq("product_id", input.productId);
    if (error) return { ok: false, error: error.message };
    await recomputeClaims(db, input.productId);
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function linkClaimAction(input: {
  productId: string;
  slug: string;
  claimId: string;
}): Promise<ActionResult> {
  await requireAdmin();
  if (!isSelectableClaim(input.claimId)) return { ok: false, error: "Alleen goedgekeurde claims zijn te koppelen." };
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_product_claims")
      .upsert(
        { product_id: input.productId, efsa_claim_id: input.claimId, meets_condition: false },
        { onConflict: "product_id,efsa_claim_id" },
      );
    if (error) return { ok: false, error: error.message };
    await recomputeClaims(db, input.productId);
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function unlinkClaimAction(input: {
  productId: string;
  slug: string;
  claimId: string;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_product_claims")
      .delete()
      .eq("product_id", input.productId)
      .eq("efsa_claim_id", input.claimId);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function addImageAction(input: {
  productId: string;
  slug: string;
  path: string;
  source: string;
  licenseNote: string;
  alt: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const imagePath = normalizeImagePath(input.path);
  const pathError = validateImagePath(imagePath);
  if (pathError) return { ok: false, error: pathError };
  const error = validateImageInput(input);
  if (error) return { ok: false, error };
  if (!existsSync(path.join(process.cwd(), "public", imagePath))) {
    return { ok: false, error: "Dit bestand staat niet in public/images/producten/ op de server." };
  }
  try {
    const db = getPartnerDeskDb();
    const { count } = await db
      .from("sup_product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", input.productId);
    const { error: insertError } = await db.from("sup_product_images").insert({
      product_id: input.productId,
      path: imagePath,
      alt: input.alt.trim() || null,
      position: count ?? 0,
      source: input.source,
      license_note: input.licenseNote.trim(),
      checked_at: new Date().toISOString(),
    });
    if (insertError) return { ok: false, error: insertError.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function removeImageAction(input: {
  imageId: string;
  productId: string;
  slug: string;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const blocked = await blockedByGate(db, input.productId, { kind: "removeImage", imageId: input.imageId });
    if (blocked) return { ok: false, error: blocked };
    const { error } = await db
      .from("sup_product_images")
      .delete()
      .eq("id", input.imageId)
      .eq("product_id", input.productId);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function addOfferAction(input: {
  productId: string;
  slug: string;
  retailerId: string;
  priceCents: number | null;
  affiliateUrl: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const error = validateNewOffer(input);
  if (error || input.priceCents === null) return { ok: false, error: error ?? "Ongeldige prijs." };
  try {
    const db = getPartnerDeskDb();
    const now = new Date().toISOString();
    const { data, error: insertError } = await db
      .from("sup_offers")
      .insert({
        product_id: input.productId,
        retailer_id: input.retailerId,
        price_cents: input.priceCents,
        affiliate_url: input.affiliateUrl.trim() || null,
        price_checked_at: now,
        source: "manual",
        active: true,
      })
      .select("id")
      .single();
    if (insertError) {
      return {
        ok: false,
        error: insertError.code === "23505" ? "Er is al een aanbieding van deze retailer voor dit product." : insertError.message,
      };
    }
    await db
      .from("sup_offer_price_history")
      .insert({ offer_id: (data as { id: string }).id, price_cents: input.priceCents, observed_at: now });
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function addCertificationAction(input: {
  productId: string;
  slug: string;
  key: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const key = input.key.trim();
  const error = validateCertificationKey(key);
  if (error) return { ok: false, error };
  try {
    const db = getPartnerDeskDb();
    const { error: upsertError } = await db
      .from("sup_product_certifications")
      .upsert({ product_id: input.productId, certification_key: key }, { onConflict: "product_id,certification_key" });
    if (upsertError) return { ok: false, error: upsertError.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function removeCertificationAction(input: {
  productId: string;
  slug: string;
  key: string;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("sup_product_certifications")
      .delete()
      .eq("product_id", input.productId)
      .eq("certification_key", input.key);
    if (error) return { ok: false, error: error.message };
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function saveScoreInputsAction(input: {
  productId: string;
  slug: string;
  inputs: StoredScoreInputs;
}): Promise<ActionResult> {
  await requireAdmin();
  try {
    const db = getPartnerDeskDb();
    const { data, error: readError } = await db
      .from("sup_products")
      .select("sup_categories(slug)")
      .eq("id", input.productId)
      .maybeSingle();
    if (readError || !data) return { ok: false, error: readError?.message ?? "Product niet gevonden." };
    const rel = (data as unknown as { sup_categories: { slug: string } | { slug: string }[] | null }).sup_categories;
    const categorySlug = (Array.isArray(rel) ? rel[0]?.slug : rel?.slug) ?? "";
    if (!(categorySlug in PRODUCT_SCORE_INPUTS)) {
      return { ok: false, error: "Deze categorie heeft nog geen scoremodel." };
    }
    const cleaned: StoredScoreInputs = {
      formKey: input.inputs.formKey,
      label: input.inputs.label,
      certificeringen: input.inputs.certificeringen.map((c) => c.trim()).filter((c) => c !== ""),
      kwaliteitsmarkers: input.inputs.kwaliteitsmarkers,
      dosisOnzekerReden: input.inputs.dosisOnzekerReden?.trim() || null,
    };
    const error = validateScoreInputs(categorySlug as SupplementCategory, cleaned);
    if (error) return { ok: false, error };

    const { error: updateError } = await db
      .from("sup_products")
      .update({ score_inputs: cleaned, updated_at: new Date().toISOString() })
      .eq("id", input.productId);
    if (updateError) {
      return {
        ok: false,
        error:
          updateError.code === "42703"
            ? "De kolom score_inputs bestaat nog niet: draai eerst de migratie (zie supabase/migrations/OPENSTAAND.md)."
            : updateError.message,
      };
    }
    revalidateProduct(input.slug);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
