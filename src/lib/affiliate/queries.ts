import { getAffiliateDb } from "@/lib/affiliate/db";
import type {
  AffiliateListRow,
  AfAffiliate,
  AfCommissionRule,
  AfConversion,
  AfLedgerEntry,
  AfLink,
  AfPayout,
} from "@/types/affiliate";

/** Affiliates voor de lijst, met afgeleide regel-/linkcount. */
export async function listAffiliates(archived = false): Promise<AffiliateListRow[]> {
  const db = getAffiliateDb();
  const base = db.from("af_affiliates").select("*").order("display_name");
  const filtered = archived
    ? base.not("archived_at", "is", null)
    : base.is("archived_at", null);

  const [affiliatesRes, rulesRes, linksRes] = await Promise.all([
    filtered,
    db.from("af_commission_rules").select("affiliate_id").is("archived_at", null),
    db.from("af_links").select("affiliate_id"),
  ]);
  if (affiliatesRes.error) throw new Error(`af_affiliates: ${affiliatesRes.error.message}`);

  const ruleCount = new Map<string, number>();
  for (const r of rulesRes.data ?? []) {
    const id = r.affiliate_id as string;
    ruleCount.set(id, (ruleCount.get(id) ?? 0) + 1);
  }
  const linkCount = new Map<string, number>();
  for (const l of linksRes.data ?? []) {
    const id = l.affiliate_id as string;
    linkCount.set(id, (linkCount.get(id) ?? 0) + 1);
  }

  return ((affiliatesRes.data ?? []) as AfAffiliate[]).map((affiliate) => ({
    affiliate,
    ruleCount: ruleCount.get(affiliate.id) ?? 0,
    linkCount: linkCount.get(affiliate.id) ?? 0,
  }));
}

export interface AffiliateDossier {
  affiliate: AfAffiliate;
  rules: AfCommissionRule[];
  links: AfLink[];
}

export async function getAffiliateByRef(ref: string): Promise<AffiliateDossier | null> {
  const db = getAffiliateDb();
  const { data, error } = await db
    .from("af_affiliates")
    .select("*")
    .eq("ref", ref)
    .maybeSingle();
  if (error) throw new Error(`af_affiliates: ${error.message}`);
  if (!data) return null;
  const affiliate = data as AfAffiliate;

  const [rulesRes, linksRes] = await Promise.all([
    db
      .from("af_commission_rules")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    db
      .from("af_links")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    affiliate,
    rules: (rulesRes.data ?? []) as AfCommissionRule[],
    links: (linksRes.data ?? []) as AfLink[],
  };
}

export async function getAffiliateConversions(
  affiliateId: string,
  limit = 100,
): Promise<AfConversion[]> {
  const db = getAffiliateDb();
  const { data, error } = await db
    .from("af_conversions")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`af_conversions: ${error.message}`);
  return (data ?? []) as AfConversion[];
}

export interface AffiliateLedger {
  entries: AfLedgerEntry[];
  outstandingCents: number; // pending + approved (nog verschuldigd)
  approvedCents: number; // klaar voor uitbetaling
  paidCents: number;
}

export async function getAffiliateLedger(affiliateId: string): Promise<AffiliateLedger> {
  const db = getAffiliateDb();
  const { data, error } = await db
    .from("af_ledger_entries")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("posted_at", { ascending: false });
  if (error) throw new Error(`af_ledger_entries: ${error.message}`);
  const entries = (data ?? []) as AfLedgerEntry[];

  let outstandingCents = 0;
  let approvedCents = 0;
  let paidCents = 0;
  for (const e of entries) {
    if (e.state === "pending" || e.state === "approved") outstandingCents += e.amount_cents;
    if (e.state === "approved") approvedCents += e.amount_cents;
    if (e.state === "paid") paidCents += e.amount_cents;
  }
  return { entries, outstandingCents, approvedCents, paidCents };
}

export async function getAffiliatePayouts(affiliateId: string): Promise<AfPayout[]> {
  const db = getAffiliateDb();
  const { data, error } = await db
    .from("af_payouts")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`af_payouts: ${error.message}`);
  return (data ?? []) as AfPayout[];
}
