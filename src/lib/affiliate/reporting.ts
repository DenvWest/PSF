import { getAffiliateDb } from "@/lib/affiliate/db";
import type { AfAffiliate } from "@/types/affiliate";

export interface AffiliateReportRow {
  affiliate: Pick<AfAffiliate, "id" | "ref" | "display_name">;
  clicks: number;
  leads: number;
  sales: number;
  revenueCents: number;
  commissionCents: number;
  conversionPct: number | null; // sales / leads
  epcCents: number | null; // commissie per klik
}

export interface AffiliateReport {
  from: string;
  to: string;
  rows: AffiliateReportRow[];
}

/**
 * Rapportage per affiliate over een datumbereik (op occurred_at). Live berekend
 * uit conversies + grootboek — makkelijker te reconciliëren dan rollups op
 * MVP-schaal; rollups (af_daily_rollups) volgen in fase 3B bij groter volume.
 */
export async function getProgramReport(
  fromIso: string,
  toIso: string,
): Promise<AffiliateReport> {
  const db = getAffiliateDb();

  const [affiliatesRes, conversionsRes, clicksRes] = await Promise.all([
    db.from("af_affiliates").select("id, ref, display_name").is("archived_at", null),
    db
      .from("af_conversions")
      .select("id, affiliate_id, type, revenue_cents, status")
      .neq("status", "rejected")
      .gte("occurred_at", `${fromIso}T00:00:00.000Z`)
      .lte("occurred_at", `${toIso}T23:59:59.999Z`),
    db
      .from("af_clicks")
      .select("affiliate_id")
      .gte("occurred_at", `${fromIso}T00:00:00.000Z`)
      .lte("occurred_at", `${toIso}T23:59:59.999Z`),
  ]);

  const clicksByAffiliate = new Map<string, number>();
  for (const c of (clicksRes.data ?? []) as { affiliate_id: string }[]) {
    clicksByAffiliate.set(c.affiliate_id, (clicksByAffiliate.get(c.affiliate_id) ?? 0) + 1);
  }

  const affiliates = (affiliatesRes.data ?? []) as AffiliateReportRow["affiliate"][];
  const conversions = (conversionsRes.data ?? []) as {
    id: string;
    affiliate_id: string;
    type: "lead" | "sale";
    revenue_cents: number;
  }[];

  // Commissie = grootboek (accrual + reversal) van de conversies in het bereik.
  const conversionIds = conversions.map((c) => c.id);
  const commissionByAffiliate = new Map<string, number>();
  if (conversionIds.length > 0) {
    const { data: entries } = await db
      .from("af_ledger_entries")
      .select("affiliate_id, amount_cents, kind, state, conversion_id")
      .in("conversion_id", conversionIds)
      .neq("state", "rejected");
    for (const e of entries ?? []) {
      if (e.kind !== "accrual" && e.kind !== "reversal" && e.kind !== "adjustment") continue;
      const id = e.affiliate_id as string;
      commissionByAffiliate.set(id, (commissionByAffiliate.get(id) ?? 0) + (e.amount_cents as number));
    }
  }

  const agg = new Map<string, { leads: number; sales: number; revenue: number }>();
  for (const c of conversions) {
    const a = agg.get(c.affiliate_id) ?? { leads: 0, sales: 0, revenue: 0 };
    if (c.type === "lead") a.leads += 1;
    else {
      a.sales += 1;
      a.revenue += c.revenue_cents;
    }
    agg.set(c.affiliate_id, a);
  }

  const rows: AffiliateReportRow[] = affiliates
    .map((affiliate) => {
      const a = agg.get(affiliate.id) ?? { leads: 0, sales: 0, revenue: 0 };
      const clicks = clicksByAffiliate.get(affiliate.id) ?? 0;
      const commissionCents = commissionByAffiliate.get(affiliate.id) ?? 0;
      return {
        affiliate,
        clicks,
        leads: a.leads,
        sales: a.sales,
        revenueCents: a.revenue,
        commissionCents,
        conversionPct: a.leads > 0 ? Math.round((a.sales / a.leads) * 100) : null,
        epcCents: clicks > 0 ? Math.round(commissionCents / clicks) : null,
      };
    })
    .sort((x, y) => y.commissionCents - x.commissionCents);

  return { from: fromIso, to: toIso, rows };
}
