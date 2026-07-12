import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import type {
  PartnerListRow,
  PdCategory,
  PdLabel,
  PdNetwork,
  PdPartner,
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
