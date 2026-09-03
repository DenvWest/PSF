import type { OrgScopedClient } from "@/lib/db/scoped";
import type { ReflectieAntwoord } from "@/lib/nutrition-reflectie";

/**
 * Opslag van terugblikken op geplande agendamomenten.
 *
 * Eén rij per (account, blok): de vraag wordt per moment één keer gesteld en
 * één keer beantwoord. Een tweede antwoord op hetzelfde blok overschrijft het
 * eerste in plaats van een reeks te maken — je herinnering aan gisteren wordt
 * niet beter door hem twee keer op te schrijven.
 *
 * Wat hier bewust niet gebeurt: dit raakt geen enkele score. De terugblik is
 * zelfrapportage over één actie; de voedingsscore komt uit de check. Zie de
 * migratie voor dezelfde regel op databaseniveau (geen score-kolom, geen
 * relatie naar intake_log).
 */

export type ActionReflectionRow = {
  id: string;
  account_id: string;
  block_id: string;
  domain: string;
  answer: ReflectieAntwoord;
  created_at: string;
};

const VALID_ANSWERS = new Set<ReflectieAntwoord>(["gelukt", "deels", "niet"]);

export function isReflectionAnswer(value: string): value is ReflectieAntwoord {
  return VALID_ANSWERS.has(value as ReflectieAntwoord);
}

/**
 * De blok-ids waar dit account al op terugkeek.
 *
 * Alleen ids, geen antwoorden: de vraag "moet ik dit nog vragen" heeft aan een
 * set genoeg, en het scheelt een payload die met elke week groeit.
 */
export async function listReflectedBlockIds(
  supabase: OrgScopedClient,
  accountId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("account_action_reflections")
    .select("block_id")
    .eq("account_id", accountId);

  if (error || !Array.isArray(data)) {
    return [];
  }
  return data.map((row) => String((row as unknown as Record<string, unknown>).block_id));
}

/** De antwoorden zelf, nieuwste eerst — voor de reeks-regel in de tijdlaag. */
export async function listReflectionAnswers(
  supabase: OrgScopedClient,
  accountId: string,
  domain: string,
  limit = 20,
): Promise<ReflectieAntwoord[]> {
  const { data, error } = await supabase
    .from("account_action_reflections")
    .select("answer")
    .eq("account_id", accountId)
    .eq("domain", domain)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) {
    return [];
  }
  return data
    .map((row) => String((row as unknown as Record<string, unknown>).answer))
    .filter((answer): answer is ReflectieAntwoord => isReflectionAnswer(answer));
}

export async function upsertActionReflection(
  supabase: OrgScopedClient,
  accountId: string,
  input: { blockId: string; domain: string; answer: ReflectieAntwoord },
): Promise<boolean> {
  const { error } = await supabase.from("account_action_reflections").upsert(
    {
      account_id: accountId,
      block_id: input.blockId,
      domain: input.domain,
      answer: input.answer,
    },
    { onConflict: "account_id,block_id" },
  );

  return !error;
}
