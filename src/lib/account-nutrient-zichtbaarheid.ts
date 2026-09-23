import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { OrgScopedClient } from "@/lib/db/scoped";
import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";

export function isNutrientId(value: string): value is NutrientId {
  return (NUTRIENT_ORDER as readonly string[]).includes(value);
}

/**
 * De uitgezette stoffen voor dit account. Ontbreekt een stof in de set, dan
 * is hij aan — zie het docblok in de migratie voor waarom alleen "uit"
 * wordt opgeslagen.
 */
export async function listVerborgenNutrients(
  supabase: OrgScopedClient,
  accountId: string,
): Promise<Set<NutrientId>> {
  const { data, error } = await supabase
    .from("account_nutrient_zichtbaarheid")
    .select("nutrient")
    .eq("account_id", accountId);

  if (error || !Array.isArray(data)) {
    throw new Error(error?.message ?? "Kon nutriënt-voorkeuren niet laden.");
  }

  return new Set(
    data
      .map((raw) => String((raw as unknown as Record<string, unknown>).nutrient))
      .filter(isNutrientId),
  );
}

export async function setNutrientZichtbaarheid(
  supabase: OrgScopedClient,
  accountId: string,
  nutrient: NutrientId,
  zichtbaar: boolean,
): Promise<void> {
  if (zichtbaar) {
    const { error } = await supabase
      .from("account_nutrient_zichtbaarheid")
      .delete()
      .eq("account_id", accountId)
      .eq("nutrient", nutrient);

    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("account_nutrient_zichtbaarheid").upsert(
    {
      account_id: accountId,
      nutrient,
      zichtbaar: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id,nutrient" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
