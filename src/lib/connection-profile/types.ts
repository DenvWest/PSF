import type {
  ActivityId,
  AgeBandId,
  AvailabilityId,
  ConnectionFormId,
  TopicId,
  TravelRadiusId,
  VisibilityId,
} from "@/data/connection/vocabulary";

/**
 * Zie docs/design/BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §2.
 * Uitsluitend user-declared data (klasse A). Klasse B (gedragsafleiding) wordt
 * in v1 niet gebouwd; klasse C (gezondheidsdata) hoort hier nooit.
 */

/** De zes multi-select rollen. Eén tabel, één discriminator. */
export type ConnectionTagKind =
  | "interest"
  | "brengen"
  | "ontdekken"
  | "doet"
  | "vorm"
  | "beschikbaarheid";

export type ConnectionProfile = {
  /** Onderwerpen waar aandacht naar uitgaat — stuurt content. */
  interests: TopicId[];
  /** Waar iemand een ander mee kan helpen — de ene helft van de doorsnede. */
  brengen: TopicId[];
  /** Waar iemand beter in wil worden — de andere helft. */
  ontdekken: TopicId[];
  /** Wat iemand al met enige regelmaat doet. */
  doet: ActivityId[];
  /** Hoe contact er het liefst uitziet. */
  vorm: ConnectionFormId[];
  /** Vier grove tijdblokken. */
  beschikbaarheid: AvailabilityId[];
  /** Eerste twee cijfers van de postcode, of null. */
  areaPc2: string | null;
  travelRadius: TravelRadiusId | null;
  /** Null betekent "zeg ik liever niet" — er wordt dan niets opgeslagen. */
  ageBand: Exclude<AgeBandId, "zeg_ik_liever_niet"> | null;
  visibility: VisibilityId;
  /** Max 140 tekens, niet matchbaar, alleen voor de gebruiker zelf. */
  note: string | null;
  completedAt: string | null;
};

export const EMPTY_CONNECTION_PROFILE: ConnectionProfile = {
  interests: [],
  brengen: [],
  ontdekken: [],
  doet: [],
  vorm: [],
  beschikbaarheid: [],
  areaPc2: null,
  travelRadius: null,
  ageBand: null,
  visibility: "prive",
  note: null,
  completedAt: null,
};

/** Welke profielrol in welke `kind`-waarde landt. */
export const TAG_KIND_BY_FIELD = {
  interests: "interest",
  brengen: "brengen",
  ontdekken: "ontdekken",
  doet: "doet",
  vorm: "vorm",
  beschikbaarheid: "beschikbaarheid",
} as const satisfies Record<string, ConnectionTagKind>;
