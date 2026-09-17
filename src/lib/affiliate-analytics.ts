import { SUPPLEMENT_SLUGS } from "@/data/supplements";
import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

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

export type ComparisonFunnelRow = {
  slug: string;
  path: string;
  views: number;
  clicks: number;
  /** null zolang er geen weergaves zijn — 0/0 is geen 0%. */
  ctr: number | null;
};

/**
 * De conversie-readout per vergelijkingspagina: weergaves (domain_events),
 * affiliate-klikken (affiliate_clicks) en de verhouding ertussen. Alle zeven
 * pagina's staan er altijd in, ook op nul — een ontbrekende regel zou "geen
 * verkeer" verbergen achter "geen data".
 *
 * Geteld met `count: exact, head: true` en niet door rijen op te tellen:
 * PostgREST levert standaard maximaal 1000 rijen, en een afgekapte noemer maakt
 * de CTR stilzwijgend te hoog zodra er echt verkeer komt.
 */
export async function getComparisonFunnel(
  organizationId?: string,
): Promise<ComparisonFunnelRow[]> {
  const orgId = resolveOrgId(organizationId);
  const admin = getAdminClient();

  async function countViews(slug: string): Promise<number> {
    const { count, error } = await admin
      .from("domain_events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("event_type", "comparison.page_viewed")
      .eq("payload->>slug", slug);

    if (error) {
      console.error("[affiliate-analytics] getComparisonFunnel views:", error);
      throw error;
    }
    return count ?? 0;
  }

  async function countClicks(slug: string): Promise<number> {
    const { count, error } = await admin
      .from("affiliate_clicks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("pagina", `/beste/${slug}`);

    if (error) {
      console.error("[affiliate-analytics] getComparisonFunnel clicks:", error);
      throw error;
    }
    return count ?? 0;
  }

  const rows = await Promise.all(
    SUPPLEMENT_SLUGS.map(async (slug) => {
      const [views, clicks] = await Promise.all([
        countViews(slug),
        countClicks(slug),
      ]);
      return {
        slug,
        path: `/beste/${slug}`,
        views,
        clicks,
        ctr: views > 0 ? clicks / views : null,
      };
    }),
  );

  return rows.sort(
    (a, b) =>
      b.views - a.views || b.clicks - a.clicks || a.slug.localeCompare(b.slug),
  );
}
