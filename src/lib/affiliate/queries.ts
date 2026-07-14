import { getAffiliateDb } from "@/lib/affiliate/db";
import type {
  AffiliateListRow,
  AfAffiliate,
  AfCommissionRule,
  AfLink,
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
