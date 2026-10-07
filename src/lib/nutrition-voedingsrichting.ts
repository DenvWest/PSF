import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De richting van je voeding (`NUT_DOEL`): waar je naartoe wilt. Staat in Je
 * doelen boven het concrete doel uit de check (ijkpunt 0–10, `domain-goal`).
 * Besluit: `BESLUIT_VOEDINGSRICHTING_2026-10.md`.
 *
 * ## Kadert, meet niet
 *
 * De richting kiest de **volgorde** van de kernstoffen in Patroon en de zin
 * die uitlegt waarom. Hij verandert nooit de meting, de norm of wat als
 * "gehaald" telt (`ROADMAP_LEEFSTIJLCHECK_NAAR_DASHBOARD_VOEDING.md` §10.1):
 * anders krijgt iemand met "gewicht omlaag" een ander oordeel bij hetzelfde
 * eetpatroon, en is het geen meting meer.
 *
 * ## Waarom deze stoffen eerst
 *
 * Alleen waar een goedgekeurde EU-claim (Verordening 432/2012) de koppeling
 * draagt: eiwit "draagt bij tot het behoud van spiermassa", vitamine D "tot de
 * instandhouding van de normale spierfunctie", magnesium "tot de vermindering
 * van vermoeidheid en moeheid". Geen claim, geen voorrang.
 *
 * ## Klachten
 *
 * "Klachten verminderen" is de doorverwijs-uitgang: het dashboard beoordeelt
 * geen klachten, de volgorde blijft neutraal en de copy zegt waarom.
 */

export const VOEDINGSRICHTINGEN = ["energie", "gewicht", "spier", "gezonder", "klachten", "weet_niet"] as const;

export type Voedingsrichting = (typeof VOEDINGSRICHTINGEN)[number];

type Richting = {
  label: string;
  uitleg: string;
  /** Kernstoffen die naar boven gaan, in deze volgorde. Leeg = neutrale volgorde. */
  eerst: readonly NutrientId[];
  /** Waarom die stoffen bovenaan staan; null bij een neutrale volgorde. */
  waarom: string | null;
};

export const RICHTINGEN: Record<Voedingsrichting, Richting> = {
  energie: {
    label: "Energie overdag",
    uitleg: "Minder inzakken in de middag",
    eerst: ["magnesium"],
    waarom: "Magnesium staat bovenaan: het draagt bij tot de vermindering van vermoeidheid (EU-claim).",
  },
  gewicht: {
    label: "Gewicht omlaag",
    uitleg: "Afvallen zonder spier te verliezen",
    eerst: ["protein"],
    waarom: "Eiwit staat bovenaan: het draagt bij tot het behoud van spiermassa, ook als je afvalt (EU-claim).",
  },
  spier: {
    label: "Spier en kracht behouden",
    uitleg: "Sterk blijven, ook met de jaren",
    eerst: ["protein", "vitamin_d"],
    waarom: "Eiwit en vitamine D staan bovenaan: ze dragen bij tot het behoud van spiermassa en de normale spierfunctie (EU-claims).",
  },
  gezonder: {
    label: "Algemeen gezonder",
    uitleg: "Geen specifiek doel, wel beter eten",
    eerst: [],
    waarom: null,
  },
  klachten: {
    label: "Klachten verminderen",
    uitleg: "Er speelt iets waar je last van hebt",
    eerst: [],
    waarom: null,
  },
  weet_niet: {
    label: "Weet ik nog niet",
    uitleg: "Prima: dan blijft de volgorde neutraal",
    eerst: [],
    waarom: null,
  },
};

export const KLACHTEN_DOORVERWIJZING =
  "Dit dashboard beoordeelt geen klachten. Bespreek ze met je huisarts of een diëtist; hier blijft de volgorde neutraal.";

export function isVoedingsrichting(value: unknown): value is Voedingsrichting {
  return typeof value === "string" && (VOEDINGSRICHTINGEN as readonly string[]).includes(value);
}

/**
 * Zet de stoffen die bij je richting horen bovenaan, de rest in de bestaande
 * volgorde. Verandert niets aan de rijen zelf.
 */
export function ordenVoorRichting<T>(
  rijen: readonly T[],
  stofVan: (rij: T) => string,
  richting: Voedingsrichting | null,
): T[] {
  const eerst = richting ? RICHTINGEN[richting].eerst : [];
  if (eerst.length === 0) return [...rijen];
  const rang = (rij: T) => {
    const index = (eerst as readonly string[]).indexOf(stofVan(rij));
    return index === -1 ? eerst.length : index;
  };
  return rijen
    .map((rij, index) => ({ rij, index }))
    .sort((a, b) => rang(a.rij) - rang(b.rij) || a.index - b.index)
    .map(({ rij }) => rij);
}

/** De zin boven de stoffen in Patroon: waarom deze volgorde, of de doorverwijzing. */
export function richtingZin(richting: Voedingsrichting | null): string | null {
  if (richting === "klachten") return KLACHTEN_DOORVERWIJZING;
  return richting ? RICHTINGEN[richting].waarom : null;
}
