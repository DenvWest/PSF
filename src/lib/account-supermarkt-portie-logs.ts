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
