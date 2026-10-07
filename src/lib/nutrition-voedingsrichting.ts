import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De richting van je voeding (`NUT_DOEL`), gevraagd als herkenning: "Waar
 * loop je het meest tegenaan?" (ik-vorm, niet als formulierdoel). Staat in Je
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

export const VOEDINGSRICHTINGEN = ["energie", "gewicht", "spier", "structuur", "weet_niet", "klachten"] as const;

export type Voedingsrichting = (typeof VOEDINGSRICHTINGEN)[number];

type Richting = {
  /** De optie in de herkenningsvraag "Waar loop je het meest tegenaan?" (ik-vorm). */
  label: string;
  /** Kort, voor de waarde rechts in Je doelen. */
  kort: string;
  /** Wat de keuze in Je patroon doet. */
  uitleg: string;
  /** Kernstoffen die naar boven gaan, in deze volgorde. Leeg = neutrale volgorde. */
  eerst: readonly NutrientId[];
  /** Waarom die stoffen bovenaan staan; null bij een neutrale volgorde. */
  waarom: string | null;
};

export const RICHTINGEN: Record<Voedingsrichting, Richting> = {
  energie: {
    label: "Ik zak 's middags in, ben vaak moe",
    kort: "Vaak moe",
    uitleg: "Magnesium komt bovenaan in Je patroon",
    eerst: ["magnesium"],
    waarom: "Magnesium staat bovenaan: het draagt bij tot de vermindering van vermoeidheid (EU-claim).",
  },
  gewicht: {
    label: "Ik wil afvallen, zonder spier te verliezen",
    kort: "Afvallen",
    uitleg: "Eiwit komt bovenaan in Je patroon",
    eerst: ["protein"],
    waarom: "Eiwit staat bovenaan: het draagt bij tot het behoud van spiermassa, ook als je afvalt (EU-claim).",
  },
  spier: {
    label: "Ik merk dat ik minder sterk word",
    kort: "Sterk blijven",
    uitleg: "Eiwit en vitamine D komen bovenaan in Je patroon",
    eerst: ["protein", "vitamin_d"],
    waarom: "Eiwit en vitamine D staan bovenaan: ze dragen bij tot het behoud van spiermassa en de normale spierfunctie (EU-claims).",
  },
  structuur: {
    label: "Ik heb weinig structuur in mijn eten",
    kort: "Meer structuur",
    uitleg: "Je patroon wijst je naar je maaltijdverdeling",
    eerst: [],
    waarom:
      "Voor structuur: Per maaltijd laat zien welke maaltijd wat levert, en bij Je doelen → Eetpatroon zet je welke maaltijden je meestal eet.",
  },
  weet_niet: {
    label: "Ik weet niet meer wat gezond is",
    kort: "Overzicht krijgen",
    uitleg: "De volgorde blijft neutraal: eerst wat het verst onder de norm zit",
    eerst: [],
    waarom: null,
  },
  klachten: {
    label: "Ik heb klachten (buik, darmen, …)",
    kort: "Klachten",
    uitleg: "We verwijzen je door; de volgorde blijft neutraal",
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
