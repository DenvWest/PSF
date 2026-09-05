/**
 * De man/vrouw-as over alle contentoppervlakken (bibliotheek, kennisbank,
 * gidsen). Bewust een *lens*, geen hard filter: in een gerichte staat schuift
 * passende content naar boven en zakt de andere fysiologie naar onderen, maar
 * verdwijnt niets. Zo blijft elk artikel bereikbaar en ontstaat er geen dunne
 * doorway-variant per geslacht.
 */

export type AudienceTag = "mannen" | "vrouwen";

export type ContentAudience = "alle" | AudienceTag;

export const AUDIENCE_OPTIONS: ReadonlyArray<{
  key: ContentAudience;
  label: string;
  /** Korte variant voor de chip op mobiel. */
  short: string;
}> = [
  { key: "alle", label: "Iedereen", short: "Iedereen" },
  { key: "mannen", label: "Mannen 30+", short: "Mannen" },
  { key: "vrouwen", label: "Vrouwen 30+", short: "Vrouwen" },
];

/** URL-parameter; deelt de naam met /gidsen zodat de keuze overdraagbaar is. */
export const AUDIENCE_PARAM = "publiek";

export function resolveContentAudience(value: string | undefined): ContentAudience {
  const match = AUDIENCE_OPTIONS.find((option) => option.key === value);
  return match?.key ?? "alle";
}

export type AudienceBand = "voor-jou" | "algemeen" | "andere-fysiologie";

/**
 * 0 = expliciet voor deze lezer geschreven, 1 = geldt voor beide,
 * 2 = geschreven vanuit de andere fysiologie.
 */
export function audienceBand(
  tag: AudienceTag | undefined,
  active: ContentAudience,
): AudienceBand {
  if (active === "alle" || !tag) return "algemeen";
  return tag === active ? "voor-jou" : "andere-fysiologie";
}

export const AUDIENCE_BAND_ORDER: Record<AudienceBand, number> = {
  "voor-jou": 0,
  algemeen: 1,
  "andere-fysiologie": 2,
};

export function audienceTagLabel(tag: AudienceTag): string {
  return tag === "mannen" ? "Voor mannen" : "Voor vrouwen";
}
