import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import type {
  PartnerListRow,
  PdCategory,
  PdCommissionRule,
  PdCommissionTier,
  PdContact,
  PdContract,
  PdDocument,
  PdLabel,
  PdNetwork,
  PdPartner,
  PdTask,
  PdTimelineEvent,
} from "@/types/partnerdesk";

export async function listNetworks(): Promise<PdNetwork[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_networks")
    .select("*")
    .order("name");
  if (error) throw new Error(`pd_networks: ${error.message}`);
  return (data ?? []) as PdNetwork[];
}

export async function listCategories(): Promise<PdCategory[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_categories")
    .select("*")
    .order("name");
  if (error) throw new Error(`pd_categories: ${error.message}`);
  return (data ?? []) as PdCategory[];
}

/** Partners voor de lijst, met afgeleide netwerk-/categorienaam, labels en signaalcount. */
export async function listPartners(): Promise<PartnerListRow[]> {
  const db = getPartnerDeskDb();

  const [partnersRes, networksRes, categoriesRes, labelLinksRes, labelsRes, signalsRes] =
    await Promise.all([
      db.from("pd_partners").select("*").is("archived_at", null).order("name"),
      db.from("pd_networks").select("id, name"),
      db.from("pd_categories").select("id, name"),
      db.from("pd_partner_labels").select("partner_id, label_id"),
      db.from("pd_labels").select("*"),
      db.from("pd_signals").select("partner_id").eq("status", "open"),
    ]);

  if (partnersRes.error) throw new Error(`pd_partners: ${partnersRes.error.message}`);

  const partners = (partnersRes.data ?? []) as PdPartner[];
  const networkName = new Map(
    (networksRes.data ?? []).map((n) => [n.id as string, n.name as string]),
  );
  const categoryName = new Map(
    (categoriesRes.data ?? []).map((c) => [c.id as string, c.name as string]),
  );
  const labelsById = new Map(
    ((labelsRes.data ?? []) as PdLabel[]).map((l) => [l.id, l]),
  );
  const labelsByPartner = new Map<string, PdLabel[]>();
  for (const link of labelLinksRes.data ?? []) {
    const label = labelsById.get(link.label_id as string);
    if (!label) continue;
    const list = labelsByPartner.get(link.partner_id as string) ?? [];
    list.push(label);
    labelsByPartner.set(link.partner_id as string, list);
  }
  const signalCount = new Map<string, number>();
  for (const row of signalsRes.data ?? []) {
    const pid = row.partner_id as string | null;
    if (!pid) continue;
    signalCount.set(pid, (signalCount.get(pid) ?? 0) + 1);
  }

  return partners.map((partner) => ({
    partner,
    networkName: networkName.get(partner.network_id) ?? "—",
    categoryName: partner.category_id
      ? categoryName.get(partner.category_id) ?? null
      : null,
    labels: labelsByPartner.get(partner.id) ?? [],
    openSignalCount: signalCount.get(partner.id) ?? 0,
  }));
}

export async function getPartnerContacts(partnerId: string): Promise<PdContact[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_contacts")
    .select("*")
    .eq("partner_id", partnerId)
    .is("archived_at", null)
    .order("is_primary", { ascending: false })
    .order("name");
  if (error) throw new Error(`pd_contacts: ${error.message}`);
  return (data ?? []) as PdContact[];
}

export async function getPartnerTimeline(
  partnerId: string,
  limit = 50,
): Promise<PdTimelineEvent[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_timeline_events")
    .select("*")
    .eq("partner_id", partnerId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`pd_timeline_events: ${error.message}`);
  return (data ?? []) as PdTimelineEvent[];
}

export async function getPartnerTasks(partnerId: string): Promise<PdTask[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_tasks")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("status", "open")
    .order("due_on", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`pd_tasks: ${error.message}`);
  return (data ?? []) as PdTask[];
}

export interface PartnerOpenCounts {
  openTasks: number;
  openSignals: number;
}

export async function getPartnerOpenCounts(
  partnerId: string,
): Promise<PartnerOpenCounts> {
  const db = getPartnerDeskDb();
  const [tasksRes, signalsRes] = await Promise.all([
    db
      .from("pd_tasks")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("status", "open"),
    db
      .from("pd_signals")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("status", "open"),
  ]);
  return {
    openTasks: tasksRes.count ?? 0,
    openSignals: signalsRes.count ?? 0,
  };
}

export interface TaskWithPartner {
  task: PdTask;
  partnerName: string | null;
  partnerSlug: string | null;
}

/** Alle open taken over partners heen, voor /admin/taken. */
export async function listOpenTasks(): Promise<TaskWithPartner[]> {
  const db = getPartnerDeskDb();
  const [tasksRes, partnersRes] = await Promise.all([
    db
      .from("pd_tasks")
      .select("*")
      .eq("status", "open")
      .order("due_on", { ascending: true, nullsFirst: false }),
    db.from("pd_partners").select("id, name, slug"),
  ]);
  if (tasksRes.error) throw new Error(`pd_tasks: ${tasksRes.error.message}`);
  const partnerById = new Map(
    (partnersRes.data ?? []).map((p) => [
      p.id as string,
      { name: p.name as string, slug: p.slug as string },
    ]),
  );
  return ((tasksRes.data ?? []) as PdTask[]).map((task) => {
    const p = task.partner_id ? partnerById.get(task.partner_id) : undefined;
    return {
      task,
      partnerName: p?.name ?? null,
      partnerSlug: p?.slug ?? null,
    };
  });
}

export interface PartnerCommercials {
  contracts: PdContract[];
  rules: PdCommissionRule[];
  tiers: PdCommissionTier[];
  documents: PdDocument[];
}

/** Contracten, commissieregels, staffels en documenten van één partner. */
export async function getPartnerCommercials(
  partnerId: string,
): Promise<PartnerCommercials> {
  const db = getPartnerDeskDb();

  const [contractsRes, documentsRes] = await Promise.all([
    db
      .from("pd_contracts")
      .select("*")
      .eq("partner_id", partnerId)
      .is("archived_at", null)
      .order("starts_on", { ascending: false }),
    db
      .from("pd_documents")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false }),
  ]);
  if (contractsRes.error) throw new Error(`pd_contracts: ${contractsRes.error.message}`);

  const contracts = (contractsRes.data ?? []) as PdContract[];
  const contractIds = contracts.map((c) => c.id);

  let rules: PdCommissionRule[] = [];
  let tiers: PdCommissionTier[] = [];
  if (contractIds.length > 0) {
    const rulesRes = await db
      .from("pd_commission_rules")
      .select("*")
      .in("contract_id", contractIds)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (rulesRes.error) throw new Error(`pd_commission_rules: ${rulesRes.error.message}`);
    rules = (rulesRes.data ?? []) as PdCommissionRule[];

    const ruleIds = rules.map((r) => r.id);
    if (ruleIds.length > 0) {
      const tiersRes = await db
        .from("pd_commission_tiers")
        .select("*")
        .in("commission_rule_id", ruleIds)
        .order("threshold_cents", { ascending: true });
      if (tiersRes.error) throw new Error(`pd_commission_tiers: ${tiersRes.error.message}`);
      tiers = (tiersRes.data ?? []) as PdCommissionTier[];
    }
  }

  return {
    contracts,
    rules,
    tiers,
    documents: (documentsRes.data ?? []) as PdDocument[],
  };
}

export interface PartnerDossier {
  partner: PdPartner;
  network: PdNetwork | null;
  category: PdCategory | null;
  networks: PdNetwork[];
  categories: PdCategory[];
}

export async function getPartnerBySlug(
  slug: string,
): Promise<PartnerDossier | null> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_partners")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`pd_partners: ${error.message}`);
  if (!data) return null;

  const partner = data as PdPartner;
  const [networks, categories] = await Promise.all([
    listNetworks(),
    listCategories(),
  ]);

  return {
    partner,
    network: networks.find((n) => n.id === partner.network_id) ?? null,
    category: partner.category_id
      ? categories.find((c) => c.id === partner.category_id) ?? null
      : null,
    networks,
    categories,
  };
}
