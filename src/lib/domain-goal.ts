import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { InterventionPillarId } from "@/lib/domain-role";
import type { MovementAnchor } from "@/lib/movement-prefs";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

export type DomainGoalDomain = InterventionPillarId;

export type SituationId =
  | "inslapen"
  | "doorslapen"
  | "uitgerust_wakker"
  | "vast_ritme"
  | "avond_afbouwen"
  | "middag_doorkomen"
  | "trap_lopen"
  | "tillen_dragen"
  | "lang_volhouden"
  | "sport_meedoen"
  | "opstaan_bukken"
  | "weer_beginnen"
  | "avond_stoppen"
  | "stevig_eten"
  | "regelmaat"
  | "zelf_koken"
  | "dip_voorkomen"
  | "alcohol_terug"
  | "hoofd_uitzetten"
  | "werk_loslaten"
  | "pauze_nemen"
  | "korte_lont"
  | "drukte_opvangen"
  | "lijf_ontspannen"
  | "contact_onderhouden"
  | "echt_gesprek"
  | "partner_tijd"
  | "aanwezig_zijn"
  | "alleen_zijn"
  | "opnieuw_opbouwen"
  | "anders";

export type SituationOption = {
  id: SituationId;
  label: string;
};

export const DOMAIN_GOAL_SITUATIONS: Record<
  DomainGoalDomain,
  readonly SituationOption[]
> = {
  slaap: [
    { id: "inslapen", label: "Binnen een half uur in slaap vallen" },
    { id: "doorslapen", label: "De nacht doorkomen zonder lang wakker te liggen" },
    { id: "uitgerust_wakker", label: "Uitgerust wakker worden, zonder snooze" },
    { id: "vast_ritme", label: "Op vaste tijden naar bed en eruit, ook in het weekend" },
    { id: "avond_afbouwen", label: "De avond afbouwen zonder scherm of glas als slaapmiddel" },
    { id: "middag_doorkomen", label: "De middag doorkomen zonder in te storten" },
    { id: "anders", label: "Anders — zelf invullen" },
  ],
  beweging: [
    { id: "trap_lopen", label: "Twee trappen op zonder buiten adem te zijn" },
    { id: "tillen_dragen", label: "Boodschappen in één keer naar boven dragen" },
    { id: "lang_volhouden", label: "Een dag lopen of staan volhouden zonder rugklachten" },
    { id: "sport_meedoen", label: "Meedoen met een partij of tocht zonder af te haken" },
    { id: "opstaan_bukken", label: "Vanaf de grond opstaan zonder me op te trekken" },
    { id: "weer_beginnen", label: "Weer op gang komen na een lange stilstand" },
    { id: "anders", label: "Anders — zelf invullen" },
  ],
  voeding: [
    { id: "avond_stoppen", label: "Na het avondeten stoppen met eten" },
    { id: "stevig_eten", label: "Elke maaltijd iets stevigs binnenkrijgen" },
    { id: "regelmaat", label: "Drie keer per dag eten in plaats van doorgrazen" },
    { id: "zelf_koken", label: "Doordeweeks zelf koken volhouden" },
    { id: "dip_voorkomen", label: "De middag doorkomen zonder in te zakken" },
    { id: "alcohol_terug", label: "Doordeweekse glazen terugbrengen" },
    { id: "anders", label: "Anders — zelf invullen" },
  ],
  stress: [
    { id: "hoofd_uitzetten", label: "'s Avonds mijn hoofd uit kunnen zetten" },
    { id: "werk_loslaten", label: "Na werktijd niet meer in de mail zitten" },
    { id: "pauze_nemen", label: "Overdag een echte pauze nemen" },
    { id: "korte_lont", label: "Minder snel geïrriteerd zijn thuis" },
    { id: "drukte_opvangen", label: "Een drukke week doorkomen zonder in te storten" },
    { id: "lijf_ontspannen", label: "Tot rust komen zonder dat mijn lijf gespannen blijft" },
    { id: "anders", label: "Anders — zelf invullen" },
  ],
  verbinding: [
    { id: "contact_onderhouden", label: "Vrienden zien zonder dat het van hen moet komen" },
    { id: "echt_gesprek", label: "Met iemand praten over wat er echt speelt" },
    { id: "partner_tijd", label: "Tijd met mijn partner die niet over logistiek gaat" },
    { id: "aanwezig_zijn", label: "Aanwezig zijn bij mijn kinderen, zonder telefoon" },
    { id: "alleen_zijn", label: "Alleen kunnen zijn zonder me eenzaam te voelen" },
    { id: "opnieuw_opbouwen", label: "Iets nieuws opbouwen na een verhuizing of scheiding" },
    { id: "anders", label: "Anders — zelf invullen" },
  ],
};

export const CUSTOM_SITUATION_ID = "anders" as const satisfies SituationId;

export const OWN_WORDS_MAX_LENGTH = 80;

export function isCustomSituation(id: SituationId): boolean {
  return id === CUSTOM_SITUATION_ID;
}

export function isDomainGoalDomain(value: string): value is DomainGoalDomain {
  return Object.prototype.hasOwnProperty.call(DOMAIN_GOAL_SITUATIONS, value);
}

export function isSituationId(
  domain: DomainGoalDomain,
  value: string,
): value is SituationId {
  return DOMAIN_GOAL_SITUATIONS[domain].some((option) => option.id === value);
}

export function isValidOwnWords(value: string): boolean {
  return value.length <= OWN_WORDS_MAX_LENGTH;
}

export function isValidGoalScore(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 10
  );
}

export function getSituationLabel(
  domain: DomainGoalDomain,
  situationId: SituationId,
): string {
  return (
    DOMAIN_GOAL_SITUATIONS[domain].find((option) => option.id === situationId)
      ?.label ?? situationId
  );
}

/**
 * §11.3 (open punt 3): het anker is het motief, de situatie het wat — geen
 * tweede ankersysteem, alleen ordening. Bekend anker → passende situaties
 * bovenaan, alle zes blijven kiesbaar. Alleen relevant voor beweging.
 */
const MOVEMENT_ANCHOR_SITUATION_ORDER: Record<MovementAnchor, SituationId[]> = {
  zelfstandigheid: [
    "opstaan_bukken",
    "tillen_dragen",
    "trap_lopen",
    "lang_volhouden",
    "weer_beginnen",
    "sport_meedoen",
  ],
  meedoen: [
    "sport_meedoen",
    "lang_volhouden",
    "trap_lopen",
    "weer_beginnen",
    "tillen_dragen",
    "opstaan_bukken",
  ],
  energie: [
    "trap_lopen",
    "lang_volhouden",
    "weer_beginnen",
    "sport_meedoen",
    "tillen_dragen",
    "opstaan_bukken",
  ],
  kracht: [
    "tillen_dragen",
    "opstaan_bukken",
    "trap_lopen",
    "lang_volhouden",
    "sport_meedoen",
    "weer_beginnen",
  ],
};

export function orderSituationsForAnchor(
  domain: DomainGoalDomain,
  anchor: MovementAnchor | null,
): readonly SituationOption[] {
  const situations = DOMAIN_GOAL_SITUATIONS[domain];
  const presets = situations.filter((option) => option.id !== CUSTOM_SITUATION_ID);
  const custom = situations.find((option) => option.id === CUSTOM_SITUATION_ID);

  if (domain !== "beweging" || !anchor) {
    return custom ? [...presets, custom] : presets;
  }

  const order = MOVEMENT_ANCHOR_SITUATION_ORDER[anchor];
  const orderedPresets = [...presets].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
  );
  return custom ? [...orderedPresets, custom] : orderedPresets;
}

export type GoalMode = "verwerven" | "behouden" | "herpakken";

/** "Stabiel hoog" op de 0-10-schaal — bij 8+ gaat de activiteit vrijwel vanzelf (§4: 10 = gaat vanzelf). */
const STABLE_HIGH_THRESHOLD = 8;

export function deriveGoalMode(
  currentScore: number,
  previousScore: number | null,
): GoalMode {
  if (previousScore == null) {
    return "verwerven";
  }
  if (currentScore < previousScore) {
    return "herpakken";
  }
  if (currentScore >= STABLE_HIGH_THRESHOLD) {
    return "behouden";
  }
  return "verwerven";
}

export type DomainGoal = {
  id: string;
  domain: DomainGoalDomain;
  situationId: SituationId;
  ownWords: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DomainGoalScore = {
  score: number;
  scoredAt: string;
};

export type DomainGoalWithScores = DomainGoal & {
  scores: DomainGoalScore[];
};

function mapGoalRow(row: Record<string, unknown>): DomainGoal {
  return {
    id: row.id as string,
    domain: row.domain as DomainGoalDomain,
    situationId: row.situation_id as SituationId,
    ownWords: (row.own_words as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getActiveDomainGoal(
  admin: SupabaseAdmin,
  accountId: string,
  domain: DomainGoalDomain,
): Promise<DomainGoal | null> {
  const { data, error } = await admin
    .from("domain_goal")
    .select("id,domain,situation_id,own_words,created_at,updated_at")
    .eq("account_id", accountId)
    .eq("domain", domain)
    .is("retired_at", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGoalRow(data);
}

export async function getActiveDomainGoals(
  admin: SupabaseAdmin,
  accountId: string,
): Promise<DomainGoalWithScores[]> {
  const { data: goals, error: goalsError } = await admin
    .from("domain_goal")
    .select("id,domain,situation_id,own_words,created_at,updated_at")
    .eq("account_id", accountId)
    .is("retired_at", null);

  if (goalsError || !goals || goals.length === 0) {
    return [];
  }

  const goalIds = goals.map((goal) => goal.id as string);
  const { data: scores } = await admin
    .from("domain_goal_score")
    .select("goal_id,score,scored_at")
    .in("goal_id", goalIds)
    .order("scored_at", { ascending: true });

  const scoresByGoal = new Map<string, DomainGoalScore[]>();
  for (const row of scores ?? []) {
    const goalId = row.goal_id as string;
    const list = scoresByGoal.get(goalId) ?? [];
    list.push({ score: row.score as number, scoredAt: row.scored_at as string });
    scoresByGoal.set(goalId, list);
  }

  return goals.map((goal) => ({
    ...mapGoalRow(goal),
    scores: scoresByGoal.get(goal.id as string) ?? [],
  }));
}

export async function getLatestDomainGoalScore(
  admin: SupabaseAdmin,
  goalId: string,
): Promise<number | null> {
  const { data, error } = await admin
    .from("domain_goal_score")
    .select("score")
    .eq("goal_id", goalId)
    .order("scored_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data.score as number;
}

export async function setDomainGoal(
  admin: SupabaseAdmin,
  params: {
    accountId: string;
    organizationId: string;
    domain: DomainGoalDomain;
    situationId: SituationId;
    ownWords: string | null;
    initialScore: number;
    sessionId: string | null;
  },
): Promise<{ goalId: string }> {
  await admin
    .from("domain_goal")
    .update({ retired_at: new Date().toISOString() })
    .eq("account_id", params.accountId)
    .eq("domain", params.domain)
    .is("retired_at", null);

  const { data: inserted, error } = await admin
    .from("domain_goal")
    .insert({
      account_id: params.accountId,
      organization_id: params.organizationId,
      domain: params.domain,
      situation_id: params.situationId,
      own_words: params.ownWords,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    throw new Error("Kon doel niet opslaan.");
  }

  const goalId = inserted.id as string;

  const { error: scoreError } = await admin.from("domain_goal_score").insert({
    goal_id: goalId,
    account_id: params.accountId,
    organization_id: params.organizationId,
    session_id: params.sessionId,
    score: params.initialScore,
  });

  if (scoreError) {
    throw new Error("Kon startscore niet opslaan.");
  }

  return { goalId };
}

export async function recordDomainGoalScore(
  admin: SupabaseAdmin,
  params: {
    goalId: string;
    accountId: string;
    organizationId: string;
    sessionId: string | null;
    score: number;
  },
): Promise<void> {
  const { error } = await admin.from("domain_goal_score").insert({
    goal_id: params.goalId,
    account_id: params.accountId,
    organization_id: params.organizationId,
    session_id: params.sessionId,
    score: params.score,
  });

  if (error) {
    throw new Error("Kon ijkpunt niet opslaan.");
  }
}
