import type { OrgScopedClient } from "@/lib/db/scoped";
import type { SupermarktPortieLog } from "@/lib/nutrition-supermarkt-items";

/**
 * Opslag voor {@link SupermarktPortieLog} — losse portie-logs van
 * supermarktproducten (Laag A), los van `account_nutrition_daybook`.
 *
 * Zelfde architectuurpatroon als `account-dagboek-favorieten.ts`: eigen
 * tabel, geen upsert-sleutel op productniveau (in tegenstelling tot
 * favorieten mag hetzelfde product hier meerdere keren per dag voorkomen),
 * dus insert/select/delete op `id`.
 */

export async function listSupermarktPortieLogs(
  supabase: OrgScopedClient,
  accountId: string,
  entryDate: string,
): Promise<SupermarktPortieLog[]> {
  const { data, error } = await supabase
    .from("account_supermarkt_portie_logs")
    .select("id,moment,prod_id,grams,created_at")
    .eq("account_id", accountId)
    .eq("entry_date", entryDate)
    .order("created_at", { ascending: true });

  if (error || !Array.isArray(data)) {
    throw new Error(error?.message ?? "Kon supermarkt-portie-logs niet laden.");
  }

  return data.map((raw) => {
    const row = raw as unknown as Record<string, unknown>;
    return {
      id: String(row.id),
      moment: String(row.moment),
      prodId: String(row.prod_id),
      grams: Number(row.grams),
      createdAt: String(row.created_at),
    };
  });
}

/**
 * Alle porties tussen twee datums (inclusief), per datum gegroepeerd. Voor
 * de vensters in Je patroon: één verzoek voor dertig dagen in plaats van
 * dertig losse.
 */
export async function listSupermarktPortieLogsInPeriode(
  supabase: OrgScopedClient,
  accountId: string,
  van: string,
  tot: string,
): Promise<Map<string, SupermarktPortieLog[]>> {
  const { data, error } = await supabase
    .from("account_supermarkt_portie_logs")
    .select("id,entry_date,moment,prod_id,grams,created_at")
    .eq("account_id", accountId)
    .gte("entry_date", van)
    .lte("entry_date", tot)
    .order("created_at", { ascending: true });

  if (error || !Array.isArray(data)) {
    throw new Error(error?.message ?? "Kon supermarkt-portie-logs niet laden.");
  }

  const perDag = new Map<string, SupermarktPortieLog[]>();
  for (const raw of data) {
    const row = raw as unknown as Record<string, unknown>;
    const datum = String(row.entry_date);
    const lijst = perDag.get(datum) ?? [];
    lijst.push({
      id: String(row.id),
      moment: String(row.moment),
      prodId: String(row.prod_id),
      grams: Number(row.grams),
      createdAt: String(row.created_at),
    });
    perDag.set(datum, lijst);
  }
  return perDag;
}

export async function insertSupermarktPortieLog(
  supabase: OrgScopedClient,
  accountId: string,
  entryDate: string,
  log: { moment: string; prodId: string; grams: number },
): Promise<SupermarktPortieLog> {
  const { data, error } = await supabase
    .from("account_supermarkt_portie_logs")
    .insert({
      account_id: accountId,
      entry_date: entryDate,
      moment: log.moment,
      prod_id: log.prodId,
      grams: log.grams,
    })
    .select("id,moment,prod_id,grams,created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kon portie niet opslaan.");
  }

  const row = data as unknown as Record<string, unknown>;
  return {
    id: String(row.id),
    moment: String(row.moment),
    prodId: String(row.prod_id),
    grams: Number(row.grams),
    createdAt: String(row.created_at),
  };
}

export async function deleteSupermarktPortieLog(
  supabase: OrgScopedClient,
  accountId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("account_supermarkt_portie_logs")
    .delete()
    .eq("account_id", accountId)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
