import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  SUPPLEMENT_SLUGS,
  getSupplementComparisonData,
} from "@/data/supplements";

export type CountRow = { key: string; count: number };
export type TrendRow = { date: string; count: number };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getAdminClient() {
  const admin = createSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase admin client not configured");
  }
  return admin;
}

function resolveOrgId(organizationId?: string): string {
  return organizationId ?? getDefaultOrganizationId();
}

function labelOrFallback(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function toDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toISOString().slice(0, 10);
}

function aggregateCounts<T>(
  rows: T[],
  keyFn: (row: T) => string,
): CountRow[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyFn(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function last30DayKeys(): string[] {
  const keys: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export async function getClicksPerPage(
  organizationId?: string,
): Promise<CountRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("affiliate_clicks")
    .select("pagina, timestamp")
    .eq("organization_id", orgId);

  if (error) {
    console.error("[affiliate-analytics] getClicksPerPage:", error);
    throw error;
  }

  return aggregateCounts(data ?? [], (row) =>
    labelOrFallback(row.pagina, "Onbekend"),
  );
}

export async function getClicksPerSubId(
  organizationId?: string,
): Promise<CountRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("affiliate_clicks")
    .select("product_id, timestamp")
    .eq("organization_id", orgId);

  if (error) {
    console.error("[affiliate-analytics] getClicksPerSubId:", error);
    throw error;
  }

  return aggregateCounts(data ?? [], (row) =>
    labelOrFallback(row.product_id, "Onbekend"),
  );
}

export async function getClicksPerCategory(
  organizationId?: string,
): Promise<CountRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("affiliate_clicks")
    .select("categorie, timestamp")
    .eq("organization_id", orgId);

  if (error) {
    console.error("[affiliate-analytics] getClicksPerCategory:", error);
    throw error;
  }

  return aggregateCounts(data ?? [], (row) =>
    labelOrFallback(row.categorie, "Onbekend"),
  );
}

export async function getClickTrend(
  organizationId?: string,
): Promise<TrendRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

  const { data, error } = await admin
    .from("affiliate_clicks")
    .select("timestamp")
    .eq("organization_id", orgId)
    .gte("timestamp", thirtyDaysAgo);

  if (error) {
    console.error("[affiliate-analytics] getClickTrend:", error);
    throw error;
  }

  const dayKeys = last30DayKeys();
  const counts = new Map<string, number>(dayKeys.map((date) => [date, 0]));

  for (const row of data ?? []) {
    if (typeof row.timestamp !== "string") {
      continue;
    }
    const day = toDayKey(row.timestamp);
    if (day && counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  return dayKeys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

/**
 * Conversie-readout per /beste/*-stof (vakantieweek A2). Vaste rijvolgorde
 * over alle SUPPLEMENT_SLUGS — ook een stof met 0 klikken in de periode
 * krijgt een rij, want tijdens een distributie-push is het ontbreken van
 * een klik het signaal, niet een lege rij.
 *
 * Groepeert op `categorie` (niet `pagina`): sinds de A1-fix draagt elke
 * /beste/*-klik zijn eigen stof-categorie (zie ENTITY_MODEL.md). Klikken
 * van vóór die fix vallen nog onder de oude generieke "vergelijking"-
 * waarde — dit leest dus vooruit vanaf nu, niet met terugwerkende kracht.
 */
export async function getClicksPerBesteCategory(
  days: number,
  organizationId?: string,
): Promise<CountRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("affiliate_clicks")
    .select("categorie, timestamp")
    .eq("organization_id", orgId)
    .gte("timestamp", cutoff);

  if (error) {
    console.error("[affiliate-analytics] getClicksPerBesteCategory:", error);
    throw error;
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (typeof row.categorie !== "string" || row.categorie.length === 0) {
      continue;
    }
    counts.set(row.categorie, (counts.get(row.categorie) ?? 0) + 1);
  }

  return SUPPLEMENT_SLUGS.map((slug) => {
    const category = getSupplementComparisonData(slug)?.category ?? slug;
    return { key: category, count: counts.get(category) ?? 0 };
  });
}

export async function getIntakeByReferralSource(
  organizationId?: string,
): Promise<CountRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("intake_sessions")
    .select("referral_source")
    .eq("organization_id", orgId);

  if (error) {
    console.error("[affiliate-analytics] getIntakeByReferralSource:", error);
    throw error;
  }

  return aggregateCounts(data ?? [], (row) =>
    labelOrFallback(row.referral_source, "direct/unknown"),
  );
}
