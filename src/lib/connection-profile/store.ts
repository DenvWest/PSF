import {
  CONNECTION_NOTE_MAX_LENGTH,
  isActivityId,
  isAvailabilityId,
  isConnectionFormId,
  isTopicId,
} from "@/data/connection/vocabulary";
import {
  EMPTY_CONNECTION_PROFILE,
  TAG_KIND_BY_FIELD,
  type ConnectionProfile,
  type ConnectionTagKind,
} from "@/lib/connection-profile/types";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Opslag van het Connection Profile. Service-role only, RLS deny-all.
 *
 * Deze module raakt uitsluitend cprofile_-tabellen. Zie de firewall-test in
 * __tests__/firewall.test.ts — die faalt als hier ooit een andere tabel of een
 * gezondheidsveld binnenkomt.
 */

type TagRow = { kind: string; tag_id: string };

const PC2_PATTERN = /^[1-9][0-9]$/;

const TRAVEL_RADIUS_VALUES = new Set([
  "tot_5km",
  "tot_15km",
  "tot_30km",
  "heel_nl",
  "alleen_online",
]);

const AGE_BAND_VALUES = new Set(["35_44", "45_54", "55_64", "65_plus"]);

/** Alleen bekende tags overleven. Onbekende waarden worden stil genegeerd. */
function filterTags(kind: ConnectionTagKind, values: string[]): string[] {
  const guard =
    kind === "doet"
      ? isActivityId
      : kind === "vorm"
        ? isConnectionFormId
        : kind === "beschikbaarheid"
          ? isAvailabilityId
          : isTopicId;

  return [...new Set(values.filter((value) => guard(value)))];
}

function tagsOf(rows: TagRow[], kind: ConnectionTagKind): string[] {
  return rows.filter((row) => row.kind === kind).map((row) => row.tag_id);
}

/**
 * Normaliseert onbetrouwbare invoer naar een geldig profiel. Alles wat niet in
 * de woordenlijst staat verdwijnt hier, zodat de database nooit een tag krijgt
 * die de code niet kent.
 */
export function normalizeProfileInput(input: Partial<ConnectionProfile>): ConnectionProfile {
  const areaPc2 =
    typeof input.areaPc2 === "string" && PC2_PATTERN.test(input.areaPc2.trim())
      ? input.areaPc2.trim()
      : null;

  const travelRadius =
    input.travelRadius && TRAVEL_RADIUS_VALUES.has(input.travelRadius)
      ? input.travelRadius
      : null;

  const ageBand = input.ageBand && AGE_BAND_VALUES.has(input.ageBand) ? input.ageBand : null;

  const note =
    typeof input.note === "string" && input.note.trim().length > 0
      ? input.note.trim().slice(0, CONNECTION_NOTE_MAX_LENGTH)
      : null;

  return {
    ...EMPTY_CONNECTION_PROFILE,
    interests: filterTags("interest", input.interests ?? []) as ConnectionProfile["interests"],
    brengen: filterTags("brengen", input.brengen ?? []) as ConnectionProfile["brengen"],
    ontdekken: filterTags("ontdekken", input.ontdekken ?? []) as ConnectionProfile["ontdekken"],
    doet: filterTags("doet", input.doet ?? []) as ConnectionProfile["doet"],
    vorm: filterTags("vorm", input.vorm ?? []) as ConnectionProfile["vorm"],
    beschikbaarheid: filterTags(
      "beschikbaarheid",
      input.beschikbaarheid ?? [],
    ) as ConnectionProfile["beschikbaarheid"],
    areaPc2,
    travelRadius,
    ageBand,
    visibility: "prive",
    note,
    completedAt: input.completedAt ?? null,
  };
}

export async function loadConnectionProfile(
  accountId: string,
): Promise<ConnectionProfile | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("cprofile_profile")
    .select("id, area_pc2, travel_radius, age_band, visibility, note, completed_at")
    .eq("account_id", accountId)
    .maybeSingle();

  if (!profile) return null;

  const { data: tagRows } = await supabase
    .from("cprofile_tag")
    .select("kind, tag_id")
    .eq("profile_id", profile.id);

  const rows: TagRow[] = tagRows ?? [];

  return normalizeProfileInput({
    interests: tagsOf(rows, "interest") as ConnectionProfile["interests"],
    brengen: tagsOf(rows, "brengen") as ConnectionProfile["brengen"],
    ontdekken: tagsOf(rows, "ontdekken") as ConnectionProfile["ontdekken"],
    doet: tagsOf(rows, "doet") as ConnectionProfile["doet"],
    vorm: tagsOf(rows, "vorm") as ConnectionProfile["vorm"],
    beschikbaarheid: tagsOf(rows, "beschikbaarheid") as ConnectionProfile["beschikbaarheid"],
    areaPc2: profile.area_pc2,
    travelRadius: profile.travel_radius,
    ageBand: profile.age_band,
    note: profile.note,
    completedAt: profile.completed_at,
  });
}

/**
 * Schrijft het volledige profiel weg. Tags worden vervangen, niet samengevoegd:
 * een deselectie moet ook echt verdwijnen.
 */
export async function saveConnectionProfile(
  accountId: string,
  input: Partial<ConnectionProfile>,
): Promise<ConnectionProfile | null> {
  const supabase = createSupabaseAdmin();
  if (!supabase) return null;

  const profile = normalizeProfileInput(input);
  const now = new Date().toISOString();

  const { data: saved, error } = await supabase
    .from("cprofile_profile")
    .upsert(
      {
        account_id: accountId,
        area_pc2: profile.areaPc2,
        travel_radius: profile.travelRadius,
        age_band: profile.ageBand,
        visibility: profile.visibility,
        note: profile.note,
        completed_at: profile.completedAt ?? now,
        updated_at: now,
      },
      { onConflict: "account_id" },
    )
    .select("id")
    .maybeSingle();

  if (error || !saved) return null;

  const rows = (Object.keys(TAG_KIND_BY_FIELD) as (keyof typeof TAG_KIND_BY_FIELD)[]).flatMap(
    (field) =>
      (profile[field] as string[]).map((tagId) => ({
        profile_id: saved.id,
        kind: TAG_KIND_BY_FIELD[field],
        tag_id: tagId,
      })),
  );

  await supabase.from("cprofile_tag").delete().eq("profile_id", saved.id);

  if (rows.length > 0) {
    await supabase.from("cprofile_tag").insert(rows);
  }

  return { ...profile, completedAt: profile.completedAt ?? now };
}
