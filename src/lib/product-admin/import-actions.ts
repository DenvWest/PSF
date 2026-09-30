"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getPartnerDeskDb, slugify } from "@/lib/partnerdesk/db";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import {
  parseCsv,
  planImport,
  summarizePlan,
  type ImportContext,
  type NamedRef,
  type PlannedRow,
} from "@/lib/product-admin/import";
import { buildProductSlug } from "@/lib/product-admin/slug";

export interface ImportPreview {
  summary: ReturnType<typeof summarizePlan>;
  rows: PlannedRow[];
}

export interface ImportCommitResult {
  created: number;
  skipped: number;
  newBrands: number;
  failures: string[];
}

async function loadContext(db: SupabaseClient, allowNewBrands: boolean): Promise<ImportContext> {
  const [brands, categories, retailers, slugs] = await Promise.all([
    db.from("sup_brands").select("id, name, slug"),
    db.from("sup_categories").select("id, name, slug"),
    db.from("sup_retailers").select("id, name, slug").eq("active", true),
    db.from("sup_products").select("slug"),
  ]);
  for (const res of [brands, categories, retailers, slugs]) {
    if (res.error) throw new Error(res.error.message);
  }
  return {
    brands: (brands.data ?? []) as NamedRef[],
    categories: (categories.data ?? []) as NamedRef[],
    retailers: (retailers.data ?? []) as NamedRef[],
    existingSlugs: new Set(((slugs.data ?? []) as { slug: string }[]).map((r) => r.slug)),
    allowNewBrands,
  };
}

function fail(err: unknown): ActionResult<never> {
  return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
}

export async function previewImportAction(input: {
  csv: string;
  allowNewBrands: boolean;
}): Promise<ActionResult<ImportPreview>> {
  const parsed = parseCsv(input.csv);
  if (parsed.error) return { ok: false, error: parsed.error };
  try {
    const db = getPartnerDeskDb();
    const rows = planImport(parsed.rows, await loadContext(db, input.allowNewBrands));
    return { ok: true, data: { summary: summarizePlan(rows), rows } };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Importeert alleen regels die bij de preview 'ok' waren, opnieuw gevalideerd op de server.
 * Alles komt binnen als concept; publiceren blijft achter de publiceerpoort. Niet transactioneel:
 * een mislukte regel wordt gemeld en de rest gaat door.
 */
export async function commitImportAction(input: {
  csv: string;
  allowNewBrands: boolean;
}): Promise<ActionResult<ImportCommitResult>> {
  const parsed = parseCsv(input.csv);
  if (parsed.error) return { ok: false, error: parsed.error };
  try {
    const db = getPartnerDeskDb();
    const plan = planImport(parsed.rows, await loadContext(db, input.allowNewBrands));
    const result: ImportCommitResult = { created: 0, skipped: 0, newBrands: 0, failures: [] };

    const brandIds = new Map<string, string>();
    const nextOrder = new Map<string, number>();
    const takenSlugs = new Set<string>();

    for (const row of plan) {
      if (row.status !== "ok" || !row.categoryId) {
        result.skipped += 1;
        continue;
      }
      try {
        let brandId = row.brandId ?? brandIds.get(row.brandName.toLowerCase()) ?? null;
        if (!brandId) {
          const base = slugify(row.brandName) || "merk";
          const { data: existing } = await db.from("sup_brands").select("slug").like("slug", `${base}%`);
          const taken = new Set(((existing ?? []) as { slug: string }[]).map((r) => r.slug));
          let brandSlug = base;
          for (let i = 2; taken.has(brandSlug); i += 1) brandSlug = `${base}-${i}`;
          const { data: created, error } = await db
            .from("sup_brands")
            .insert({ slug: brandSlug, name: row.brandName })
            .select("id")
            .single();
          if (error || !created) throw new Error(error?.message ?? "Merk aanmaken mislukt.");
          brandId = (created as { id: string }).id;
          brandIds.set(row.brandName.toLowerCase(), brandId);
          result.newBrands += 1;
        }

        const brandSlug = slugify(row.brandName);
        const { data: slugRows } = await db.from("sup_products").select("slug").like("slug", `${brandSlug}%`);
        const taken = new Set([...((slugRows ?? []) as { slug: string }[]).map((r) => r.slug), ...takenSlugs]);
        const slug = buildProductSlug(row.brandName, row.name, taken);
        takenSlugs.add(slug);

        if (!nextOrder.has(row.categoryId)) {
          const { data: last } = await db
            .from("sup_products")
            .select("display_order")
            .eq("category_id", row.categoryId)
            .order("display_order", { ascending: false })
            .limit(1);
          nextOrder.set(row.categoryId, ((last?.[0] as { display_order: number } | undefined)?.display_order ?? 0) + 1);
        }
        const displayOrder = nextOrder.get(row.categoryId) ?? 1;
        nextOrder.set(row.categoryId, displayOrder + 1);

        const { data: product, error: productError } = await db
          .from("sup_products")
          .insert({
            slug,
            brand_id: brandId,
            category_id: row.categoryId,
            name: row.name,
            variant: row.variant || null,
            form: row.form || null,
            product_url: row.productUrl || null,
            status: "draft",
            display_order: displayOrder,
          })
          .select("id")
          .single();
        if (productError || !product) throw new Error(productError?.message ?? "Product aanmaken mislukt.");

        if (row.offer) {
          const now = new Date().toISOString();
          const { data: offer, error: offerError } = await db
            .from("sup_offers")
            .insert({
              product_id: (product as { id: string }).id,
              retailer_id: row.offer.retailerId,
              price_cents: row.offer.priceCents,
              affiliate_url: row.offer.affiliateUrl,
              price_checked_at: now,
              source: "manual",
              active: true,
            })
            .select("id")
            .single();
          if (offerError || !offer) throw new Error(`Product is aangemaakt maar de aanbieding niet: ${offerError?.message}`);
          await db
            .from("sup_offer_price_history")
            .insert({ offer_id: (offer as { id: string }).id, price_cents: row.offer.priceCents, observed_at: now });
        }
        result.created += 1;
      } catch (err) {
        result.failures.push(`Regel ${row.line} (${row.name}): ${err instanceof Error ? err.message : "onbekende fout"}`);
      }
    }

    revalidatePath("/admin/producten");
    revalidatePath("/admin/merken");
    return { ok: true, data: result };
  } catch (err) {
    return fail(err);
  }
}
