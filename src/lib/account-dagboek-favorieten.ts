import type { OrgScopedClient } from "@/lib/db/scoped";
import type { DagboekItemBron } from "@/lib/nutrition-dagboek-items";

export type DagboekFavoriet = {
  bron: DagboekItemBron;
  key: string;
};

export function isDagboekFavorietBron(value: string): value is DagboekItemBron {
  return value === "voeding" || value === "supplement";
}

export async function listDagboekFavorieten(
  supabase: OrgScopedClient,
  accountId: string,
): Promise<DagboekFavoriet[]> {
  const { data, error } = await supabase
    .from("account_dagboek_favorieten")
    .select("bron,key")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error || !Array.isArray(data)) {
    throw new Error(error?.message ?? "Kon dagboek-favorieten niet laden.");
  }

  return data.map((raw) => {
    const row = raw as unknown as Record<string, unknown>;
    const bron = row.bron === "supplement" ? "supplement" : "voeding";
    return { bron, key: String(row.key) };
  });
}

export async function upsertDagboekFavoriet(
  supabase: OrgScopedClient,
  accountId: string,
  favoriet: DagboekFavoriet,
): Promise<void> {
  const { error } = await supabase.from("account_dagboek_favorieten").upsert(
    {
      account_id: accountId,
      bron: favoriet.bron,
      key: favoriet.key,
    },
    { onConflict: "account_id,bron,key" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteDagboekFavoriet(
  supabase: OrgScopedClient,
  accountId: string,
  bron: DagboekItemBron,
  key: string,
): Promise<void> {
  const { error } = await supabase
    .from("account_dagboek_favorieten")
    .delete()
    .eq("account_id", accountId)
    .eq("bron", bron)
    .eq("key", key);

  if (error) {
    throw new Error(error.message);
  }
}
