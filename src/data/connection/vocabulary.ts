/**
 * Woordenlijst voor het Connection Profile.
 * Bron: docs/design/BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §3.
 *
 * Eén onderwerplijst met DRIE rollen (interesse / brengen / ontdekken). Dat is
 * wat de latere match een doorsnede maakt in plaats van een taalprobleem:
 * brengen(A) ∩ ontdekken(B). Splits deze lijst niet per rol.
 *
 * Bewust grofmazig — fijnere tags maken de doorsnede leger, en dat is precies
 * wat je bij lage aantallen niet wilt.
 *
 * Deze data staat in code en niet in de database: git is de audit, tsc is de
 * validatie, en er is geen seed-script. Zelfde keuze als bij de aanbieders.
 */

export type TopicId =
  | "beweging_sport"
  | "buiten_natuur"
  | "koken_voeding"
  | "klussen_techniek"
  | "tuin_groen"
  | "muziek"
  | "kunst_cultuur"
  | "lezen_schrijven"
  | "fotografie"
  | "ondernemen_werk"
  | "geld_financien"
  | "technologie_ai"
  | "wetenschap"
  | "duurzaamheid"
  | "geschiedenis"
  | "reizen"
  | "auto_motor"
  | "spel_kaarten"
  | "vrijwilligerswerk"
  | "gezondheid_leefstijl";

export type TopicOption = {
  id: TopicId;
  label: string;
};

/**
 * LET OP bij `gezondheid_leefstijl`: dit is een zelfgekozen ONDERWERPVOORKEUR,
 * geen gezondheidsgegeven. Het mag nergens als gezondheidssignaal worden
 * gelezen, niet meewegen in een score en niets afleiden over de persoon.
 */
export const CONNECTION_TOPICS: readonly TopicOption[] = [
  { id: "beweging_sport", label: "Bewegen & sport" },
  { id: "buiten_natuur", label: "Buiten & natuur" },
  { id: "koken_voeding", label: "Koken & eten" },
  { id: "klussen_techniek", label: "Klussen & techniek" },
  { id: "tuin_groen", label: "Tuin & groen" },
  { id: "muziek", label: "Muziek" },
  { id: "kunst_cultuur", label: "Kunst & cultuur" },
  { id: "lezen_schrijven", label: "Lezen & schrijven" },
  { id: "fotografie", label: "Fotografie" },
  { id: "ondernemen_werk", label: "Ondernemen & werk" },
  { id: "geld_financien", label: "Geld & financiën" },
  { id: "technologie_ai", label: "Technologie & AI" },
  { id: "wetenschap", label: "Wetenschap" },
  { id: "duurzaamheid", label: "Duurzaamheid" },
  { id: "geschiedenis", label: "Geschiedenis" },
  { id: "reizen", label: "Reizen" },
  { id: "auto_motor", label: "Auto & motor" },
  { id: "spel_kaarten", label: "Spel & kaarten" },
  { id: "vrijwilligerswerk", label: "Vrijwilligerswerk" },
  { id: "gezondheid_leefstijl", label: "Gezondheid & leefstijl" },
];

/**
 * Wat iemand al met enige regelmaat doet. Aparte lijst: dit gaat over
 * activiteiten met een ritme, niet over onderwerpen. `niets_vasts` is geen
 * restcategorie maar een bruikbaar antwoord — het routeert naar "begin iets"
 * in plaats van naar "vraag iemand erbij".
 */
export type ActivityId =
  | "wandelen"
  | "fietsen"
  | "hardlopen"
  | "sportschool"
  | "teamsport"
  | "zwemmen"
  | "klussen_sleutelen"
  | "tuinieren"
  | "koken"
  | "muziek_maken"
  | "vrijwilligerswerk"
  | "vereniging_club"
  | "niets_vasts";

export type ActivityOption = {
  id: ActivityId;
  label: string;
  /** Onderwerp waar deze activiteit bij aansluit; stuurt de opbrengst. */
  topic: TopicId | null;
};

export const CONNECTION_ACTIVITIES: readonly ActivityOption[] = [
  { id: "wandelen", label: "Wandelen", topic: "buiten_natuur" },
  { id: "fietsen", label: "Fietsen", topic: "buiten_natuur" },
  { id: "hardlopen", label: "Hardlopen", topic: "beweging_sport" },
  { id: "sportschool", label: "Sportschool", topic: "beweging_sport" },
  { id: "teamsport", label: "Teamsport", topic: "beweging_sport" },
  { id: "zwemmen", label: "Zwemmen", topic: "beweging_sport" },
  { id: "klussen_sleutelen", label: "Klussen of sleutelen", topic: "klussen_techniek" },
  { id: "tuinieren", label: "Tuinieren", topic: "tuin_groen" },
  { id: "koken", label: "Koken", topic: "koken_voeding" },
  { id: "muziek_maken", label: "Muziek maken", topic: "muziek" },
  { id: "vrijwilligerswerk", label: "Vrijwilligerswerk", topic: "vrijwilligerswerk" },
  { id: "vereniging_club", label: "Vereniging of club", topic: null },
  { id: "niets_vasts", label: "Niets met een vast ritme", topic: null },
];

/** Hoe iemand contact het liefst ziet. Stuurt de vórm van een voorstel. */
export type ConnectionFormId =
  | "een_op_een"
  | "kleine_groep"
  | "grotere_groep"
  | "samen_doen"
  | "samen_leren"
  | "kennis_delen"
  | "lokaal_ontmoeten"
  | "online"
  | "maakt_niet_uit";

export type ConnectionFormOption = {
  id: ConnectionFormId;
  label: string;
  /** Prioriteitsvlak waar deze vorm het sterkst bij aansluit (P1-P6). */
  layer: 1 | 2 | 3 | 4 | 5 | 6 | null;
};

export const CONNECTION_FORMS: readonly ConnectionFormOption[] = [
  { id: "een_op_een", label: "Eén-op-één", layer: 4 },
  { id: "kleine_groep", label: "Kleine groep", layer: 3 },
  { id: "grotere_groep", label: "Grotere groep", layer: 3 },
  { id: "samen_doen", label: "Samen iets doen", layer: 3 },
  { id: "samen_leren", label: "Samen leren", layer: 3 },
  { id: "kennis_delen", label: "Kennis delen", layer: 5 },
  { id: "lokaal_ontmoeten", label: "Lokaal ontmoeten", layer: 1 },
  { id: "online", label: "Online", layer: 1 },
  { id: "maakt_niet_uit", label: "Maakt me niet uit", layer: null },
];

/**
 * Vier grove blokken. Een uurroostertje is v3-precisie op v1-data en verlaagt
 * de invulkans zonder dat we er iets mee doen.
 */
export type AvailabilityId =
  | "doordeweeks_overdag"
  | "doordeweeks_avond"
  | "zaterdag"
  | "zondag";

export type AvailabilityOption = {
  id: AvailabilityId;
  label: string;
};

export const CONNECTION_AVAILABILITY: readonly AvailabilityOption[] = [
  { id: "doordeweeks_overdag", label: "Doordeweeks overdag" },
  { id: "doordeweeks_avond", label: "Doordeweekse avond" },
  { id: "zaterdag", label: "Zaterdag" },
  { id: "zondag", label: "Zondag" },
];

/** Eigen keuze in plaats van onze aanname. "Alleen online" is gelijkwaardig. */
export type TravelRadiusId =
  | "tot_5km"
  | "tot_15km"
  | "tot_30km"
  | "heel_nl"
  | "alleen_online";

export const CONNECTION_TRAVEL_RADIUS: readonly { id: TravelRadiusId; label: string }[] = [
  { id: "tot_5km", label: "Tot ongeveer 5 km" },
  { id: "tot_15km", label: "Tot ongeveer 15 km" },
  { id: "tot_30km", label: "Tot ongeveer 30 km" },
  { id: "heel_nl", label: "Afstand maakt me niet uit" },
  { id: "alleen_online", label: "Liever online" },
];

/**
 * Band, nooit een geboortedatum. `zeg_ik_liever_niet` hoort erbij en moet er in
 * de UI hetzelfde uitzien als de rest — het is de zichtbare vorm van
 * dataminimalisatie.
 */
export type AgeBandId = "35_44" | "45_54" | "55_64" | "65_plus" | "zeg_ik_liever_niet";

export const CONNECTION_AGE_BANDS: readonly { id: AgeBandId; label: string }[] = [
  { id: "35_44", label: "35 – 44" },
  { id: "45_54", label: "45 – 54" },
  { id: "55_64", label: "55 – 64" },
  { id: "65_plus", label: "65 of ouder" },
  { id: "zeg_ik_liever_niet", label: "Zeg ik liever niet" },
];

/**
 * v1 kent alleen `prive`. De kolom bestaat zodat het model klopt; de keuze
 * bestaat niet, omdat er niets is om zichtbaar voor te zijn. Een schakelaar
 * zonder tegenpartij is een belofte.
 */
export type VisibilityId = "prive";

export const CONNECTION_DEFAULT_VISIBILITY: VisibilityId = "prive";

/** Maximale lengte van het optionele vrije-tekstveld (§4 — niet matchbaar). */
export const CONNECTION_NOTE_MAX_LENGTH = 140;

const TOPIC_IDS = new Set<string>(CONNECTION_TOPICS.map((topic) => topic.id));
const ACTIVITY_IDS = new Set<string>(CONNECTION_ACTIVITIES.map((activity) => activity.id));
const FORM_IDS = new Set<string>(CONNECTION_FORMS.map((form) => form.id));
const AVAILABILITY_IDS = new Set<string>(
  CONNECTION_AVAILABILITY.map((slot) => slot.id),
);

export function isTopicId(value: string): value is TopicId {
  return TOPIC_IDS.has(value);
}

export function isActivityId(value: string): value is ActivityId {
  return ACTIVITY_IDS.has(value);
}

export function isConnectionFormId(value: string): value is ConnectionFormId {
  return FORM_IDS.has(value);
}

export function isAvailabilityId(value: string): value is AvailabilityId {
  return AVAILABILITY_IDS.has(value);
}

export function topicLabel(id: TopicId): string {
  return CONNECTION_TOPICS.find((topic) => topic.id === id)?.label ?? id;
}

export function activityLabel(id: ActivityId): string {
  return CONNECTION_ACTIVITIES.find((activity) => activity.id === id)?.label ?? id;
}
