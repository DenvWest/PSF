import type { SupabaseClient } from "@supabase/supabase-js";
import type { PillarId } from "@/types/dashboard";

export type AccountFavoriteKind = "activiteit" | "supplement" | "dienst";
export type AccountFavoriteSource = "aanbevolen" | "mijn_keuze";

export type AccountFavoriteRow = {
  id: string;
  account_id: string;
  item_id: string;
  title: string;
  kind: AccountFavoriteKind;
  domain: string | null;
  source: AccountFavoriteSource | null;
  created_at: string;
};

export type AccountFavoriteItem = {
  id: string;
  title: string;
  kind: AccountFavoriteKind;
  domain?: PillarId;
  source?: AccountFavoriteSource;
};

const VALID_KINDS = new Set<AccountFavoriteKind>(["activiteit", "supplement", "dienst"]);
const VALID_SOURCES = new Set<AccountFavoriteSource>(["aanbevolen", "mijn_keuze"]);
const VALID_DOMAINS = new Set<PillarId>([
  "slaap",
  "beweging",
  "voeding",
  "stress",
  "verbinding",
]);

export function isAccountFavoriteKind(value: string): value is AccountFavoriteKind {
  return VALID_KINDS.has(value as AccountFavoriteKind);
}

export function isAccountFavoriteSource(value: string): value is AccountFavoriteSource {
  return VALID_SOURCES.has(value as AccountFavoriteSource);
}

export function isAccountFavoriteDomain(value: string): value is PillarId {
  return VALID_DOMAINS.has(value as PillarId);
}

export function rowToFavoriteItem(row: AccountFavoriteRow): AccountFavoriteItem {
  return {
    id: row.item_id,
    title: row.title,
    kind: row.kind,
    ...(row.domain && isAccountFavoriteDomain(row.domain) ? { domain: row.domain } : {}),
    ...(row.source ? { source: row.source } : {}),
  };
}

export async function listAccountFavorites(
  admin: SupabaseClient,
  accountId: string,
): Promise<AccountFavoriteItem[]> {
  const { data, error } = await admin
    .from("account_favorites")
    .select("id,account_id,item_id,title,kind,domain,source,created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw new Error(error?.message ?? "Kon favorieten niet laden.");
  }

  return (data as AccountFavoriteRow[]).map(rowToFavoriteItem);
}

export async function upsertAccountFavorite(
  admin: SupabaseClient,
  accountId: string,
  item: AccountFavoriteItem,
): Promise<void> {
  const { error } = await admin.from("account_favorites").upsert(
    {
      account_id: accountId,
      item_id: item.id,
      title: item.title,
      kind: item.kind,
      domain: item.domain ?? null,
      source: item.source ?? null,
    },
    { onConflict: "account_id,item_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAccountFavorite(
  admin: SupabaseClient,
  accountId: string,
  itemId: string,
): Promise<void> {
  const { error } = await admin
    .from("account_favorites")
    .delete()
    .eq("account_id", accountId)
    .eq("item_id", itemId);

  if (error) {
    throw new Error(error.message);
  }
}
