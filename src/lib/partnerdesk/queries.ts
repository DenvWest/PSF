import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { daysUntil } from "@/lib/partnerdesk/contract-status";
import { todayIso } from "@/lib/partnerdesk/dates";
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
  PdSignal,
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

export async function listLabels(): Promise<PdLabel[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db.from("pd_labels").select("*").order("name");
  if (error) throw new Error(`pd_labels: ${error.message}`);
  return (data ?? []) as PdLabel[];
}

export async function getPartnerLabels(partnerId: string): Promise<PdLabel[]> {
  const db = getPartnerDeskDb();
  const { data: links } = await db
    .from("pd_partner_labels")
    .select("label_id")
    .eq("partner_id", partnerId);
  const ids = (links ?? []).map((l) => l.label_id as string);
  if (ids.length === 0) return [];
  const { data } = await db.from("pd_labels").select("*").in("id", ids);
  return (data ?? []) as PdLabel[];
}

/** Kortlevende signed URL voor één storage-pad (bijv. partnerlogo). */
export async function signStoragePath(
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const db = getPartnerDeskDb();
  const { data } = await db.storage
    .from("partner-documents")
    .createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

/** Kortlevende signed URLs voor afbeelding-documenten (banners/logo's/screenshots). */
export async function signImageDocuments(
  documents: PdDocument[],
): Promise<Map<string, string>> {
  const imageDocs = documents.filter((d) =>
    ["banner", "logo", "screenshot"].includes(d.kind),
  );
  const urls = new Map<string, string>();
  if (imageDocs.length === 0) return urls;
  const db = getPartnerDeskDb();
  await Promise.all(
    imageDocs.map(async (d) => {
      const { data } = await db.storage
        .from("partner-documents")
        .createSignedUrl(d.storage_path, 300);
      if (data?.signedUrl) urls.set(d.id, data.signedUrl);
    }),
  );
  return urls;
}

/** Partners voor de lijst, met afgeleide netwerk-/categorienaam, labels en signaalcount. */
export async function listPartners(archived = false): Promise<PartnerListRow[]> {
  const db = getPartnerDeskDb();

  const partnerQuery = db.from("pd_partners").select("*").order("name");
  const filtered = archived
    ? partnerQuery.not("archived_at", "is", null)
    : partnerQuery.is("archived_at", null);

  const [partnersRes, networksRes, categoriesRes, labelLinksRes, labelsRes, signalsRes] =
    await Promise.all([
      filtered,
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
      .select("*, pd_commission_rules(*, pd_commission_tiers(*))")
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

  // Regels en staffels komen genest mee in één round-trip; hier platgeslagen naar
  // de vlakke arrays die de UI verwacht. Gearchiveerde regels vallen weg.
  type RuleRow = PdCommissionRule & { pd_commission_tiers?: PdCommissionTier[] };
  type ContractRow = PdContract & { pd_commission_rules?: RuleRow[] };

  const contracts: PdContract[] = [];
  const rules: PdCommissionRule[] = [];
  const tiers: PdCommissionTier[] = [];

  for (const row of (contractsRes.data ?? []) as ContractRow[]) {
    const { pd_commission_rules, ...contract } = row;
    contracts.push(contract);
    for (const ruleRow of pd_commission_rules ?? []) {
      const { pd_commission_tiers, ...rule } = ruleRow;
      if (rule.archived_at) continue;
      rules.push(rule);
      for (const tier of pd_commission_tiers ?? []) tiers.push(tier);
    }
  }

  // Volgorde gelijk aan de oude geketende queries: regels nieuwste eerst, staffels oplopend.
  rules.sort((a, b) => b.created_at.localeCompare(a.created_at));
  tiers.sort((a, b) => a.threshold_cents - b.threshold_cents);

  return {
    contracts,
    rules,
    tiers,
    documents: (documentsRes.data ?? []) as PdDocument[],
  };
}

export interface SignalWithPartner {
  signal: PdSignal;
  partnerName: string | null;
  partnerSlug: string | null;
}

/** Open signalen over partners heen, voor het Vandaag-dashboard. */
export async function listOpenSignals(): Promise<SignalWithPartner[]> {
  const db = getPartnerDeskDb();
  const [signalsRes, partnersRes] = await Promise.all([
    db
      .from("pd_signals")
      .select("*")
      .eq("status", "open")
      .order("severity", { ascending: true }) // 'amber' < 'red' alfabetisch; herordend in UI
      .order("created_at", { ascending: true }),
    db.from("pd_partners").select("id, name, slug"),
  ]);
  if (signalsRes.error) throw new Error(`pd_signals: ${signalsRes.error.message}`);
  const partnerById = new Map(
    (partnersRes.data ?? []).map((p) => [
      p.id as string,
      { name: p.name as string, slug: p.slug as string },
    ]),
  );
  return ((signalsRes.data ?? []) as PdSignal[]).map((signal) => {
    const p = signal.partner_id ? partnerById.get(signal.partner_id) : undefined;
    return { signal, partnerName: p?.name ?? null, partnerSlug: p?.slug ?? null };
  });
}

export interface ExpiryEvent {
  date: string;
  kind: "end" | "cancel";
  contractNumber: string;
  partnerName: string;
  partnerSlug: string;
  daysLeft: number;
}

/** Contract-eindes en opzegdeadlines binnen N dagen, voor de verloopkalender. */
export async function listUpcomingExpiries(withinDays = 90): Promise<ExpiryEvent[]> {
  const db = getPartnerDeskDb();
  const today = todayIso();
  const [contractsRes, partnersRes] = await Promise.all([
    db.from("pd_contracts").select("*").is("archived_at", null),
    db.from("pd_partners").select("id, name, slug"),
  ]);
  const partnerById = new Map(
    (partnersRes.data ?? []).map((p) => [
      p.id as string,
      { name: p.name as string, slug: p.slug as string },
    ]),
  );
  const events: ExpiryEvent[] = [];
  for (const c of (contractsRes.data ?? []) as PdContract[]) {
    const p = partnerById.get(c.partner_id);
    if (!p) continue;
    for (const [date, kind] of [
      [c.ends_on, "end"] as const,
      [c.cancel_by, "cancel"] as const,
    ]) {
      const days = daysUntil(date, today);
      if (date && days !== null && days >= 0 && days <= withinDays) {
        events.push({
          date,
          kind,
          contractNumber: c.number,
          partnerName: p.name,
          partnerSlug: p.slug,
          daysLeft: days,
        });
      }
    }
  }
  return events.sort((a, b) => a.daysLeft - b.daysLeft);
}

export async function listRecentPartners(limit = 5): Promise<PdPartner[]> {
  const db = getPartnerDeskDb();
  const { data, error } = await db
    .from("pd_partners")
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`pd_partners: ${error.message}`);
  return (data ?? []) as PdPartner[];
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
