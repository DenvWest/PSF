import { PORTION_DEFINITIONS, type PortionGroup } from "@/data/nutrition/portion-dictionary";
import { DAGBOEK_GROEPEN, DAGBOEK_LABELS } from "@/lib/nutrition-dagboek";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Het dagboek als eetmomenten in plaats van een groepenlijst.
 *
 * ## Waarom de vorm veranderde
 *
 * De eerste versie zette dertien voedselgroepen onder elkaar met een plus en
 * een min. Dat is compleet en onbruikbaar tegelijk: je krijgt dertien rijen op
 * nul te zien, je moet per groep bedenken of hij vandaag voorkwam, en het
 * scherm meldt ondertussen dat twaalf groepen "op geen enkele dag voorkwamen"
 * terwijl je nog aan het invullen bent.
 *
 * Mensen halen hun dag niet per voedselgroep terug maar per moment: *bij het
 * ontbijt yoghurt, 's avonds groente en vis*. Deze module volgt die volgorde.
 *
 * Twee dingen komen er gratis uit:
 *
 * 1. **Eetstructuur.** Hoeveel momenten had je, en welke. Dat is precies wat
 *    `NUT_STRUCT` in de leefstijlcheck bevraagt, en het dagboek kan het
 *    aantonen in plaats van vragen.
 * 2. **Een leeg begin.** Een moment dat je niet invult is niet nul, hij is
 *    afwezig. Dat verschil kende de platte lijst niet — daar was alles nul tot
 *    je iets aanraakte.
 *
 * ## Wat de opslag betreft
 *
 * `account_nutrition_daybook.portions` blijft de bron: één map met porties per
 * groep per dag. De momenten leven in `meals`, een tweede sleutel in dezelfde
 * JSONB-kolom. Daardoor blijft alles wat op `portions` rekent (breedte,
 * variatie, weekendvergelijking, de zelfrapport-brug) werken zonder één
 * regel wijziging — en een dag uit de platte-lijst-tijd blijft leesbaar.
 */

export type EetmomentId = "ontbijt" | "lunch" | "avondeten" | "tussendoor";

export type Eetmoment = {
  id: EetmomentId;
  label: string;
  /** Korte hint onder het moment; leeg waar de naam genoeg zegt. */
  hint?: string;
};

/**
 * Vier momenten, in de volgorde van de dag.
 *
 * "Tussendoor" is bewust één bak en geen reeks losse momenten: wie drie keer
 * iets pakt, telt dat op tot wat hij zich herinnert. Vier bakken per dag zijn
 * in te vullen; acht zijn dat niet.
 */
export const EETMOMENTEN: readonly Eetmoment[] = [
  { id: "ontbijt", label: "Ontbijt" },
  { id: "lunch", label: "Lunch" },
  { id: "avondeten", label: "Avondeten" },
  { id: "tussendoor", label: "Tussendoor", hint: "alles buiten de maaltijden om" },
] as const;

/** Wat er op één moment op tafel stond: porties per voedselgroep. */
export type MomentInhoud = Partial<Record<VoedselgroepId, number>>;

/**
 * De momenten van één dag.
 *
 * Een ontbrekend moment betekent "overgeslagen", niet "niets gegeten" — en dat
 * onderscheid is het halve punt van deze vorm. Wie zijn ontbijt overslaat
 * vertelt daarmee iets over zijn eetstructuur; wie bij het ontbijt niets
 * invulde omdat hij het vergat, vertelt niets.
 */
export type DagMomenten = Partial<Record<EetmomentId, MomentInhoud>>;

export function isEetmomentId(value: string): value is EetmomentId {
  return EETMOMENTEN.some((moment) => moment.id === value);
}

/**
 * Tel de momenten op tot één portie-map per dag.
 *
 * Dit is de brug naar alles wat er al staat: breedte, variatie, de
 * weekendvergelijking en de zelfrapport-brug rekenen allemaal op
 * `DagboekDag.porties`. Die blijft dus de waarheid; de momenten zijn de
 * invoervorm eromheen.
 */
export function portiesUitMomenten(momenten: DagMomenten): Partial<Record<VoedselgroepId, number>> {
  const totaal: Partial<Record<VoedselgroepId, number>> = {};

  for (const moment of EETMOMENTEN) {
    const inhoud = momenten[moment.id];
    if (!inhoud) continue;
    for (const groep of DAGBOEK_GROEPEN) {
      const aantal = inhoud[groep];
      if (typeof aantal !== "number" || aantal <= 0) continue;
      totaal[groep] = (totaal[groep] ?? 0) + aantal;
    }
  }

  return totaal;
}

/** Welke momenten daadwerkelijk iets bevatten. */
export function ingevuldeMomenten(momenten: DagMomenten): EetmomentId[] {
  return EETMOMENTEN.filter((moment) => {
    const inhoud = momenten[moment.id];
    if (!inhoud) return false;
    return Object.values(inhoud).some((aantal) => (aantal ?? 0) > 0);
  }).map((moment) => moment.id);
}

/**
 * De eetstructuur van een dag, in één regel.
 *
 * Geen oordeel over het aantal momenten: er is geen richtlijn die zegt dat
 * drie beter is dan twee, en intermittent fasten is een keuze en geen tekort.
 * Wat er staat is wat je invulde.
 */
export function structuurRegel(momenten: DagMomenten): string | null {
  const ingevuld = ingevuldeMomenten(momenten);
  if (ingevuld.length === 0) {
    return null;
  }

  const maaltijden = ingevuld.filter((id) => id !== "tussendoor");
  const heeftTussendoor = ingevuld.includes("tussendoor");

  const namen = maaltijden.map(
    (id) => EETMOMENTEN.find((moment) => moment.id === id)?.label.toLowerCase() ?? id,
  );

  if (namen.length === 0) {
    return "Alleen tussendoor gegeten op deze dag.";
  }

  const lijst =
    namen.length === 1
      ? namen[0]
      : `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;

  return heeftTussendoor
    ? `${namen.length === 1 ? "Eén maaltijd" : `${namen.length} maaltijden`} (${lijst}), plus tussendoor.`
    : `${namen.length === 1 ? "Eén maaltijd" : `${namen.length} maaltijden`}: ${lijst}.`;
}

/**
 * Welke portiegroep uit het woordenboek hoort bij een dagboekgroep.
 *
 * Alleen voor de gram-hint bij het invullen — niet voor een berekening. De
 * groepen zonder portiemaat (zetmeel, oliën, dranken, snacks) staan er
 * bewust niet in: een verzonnen portie zou hier schijnnauwkeurigheid
 * toevoegen, precies wat `PORTION_DEFINITIONS.other` al weigert.
 */
const GRAM_HINT_GROEP: Partial<Record<VoedselgroepId, PortionGroup>> = {
  groente: "vegetables",
  fruit: "fruit",
  peulvruchten: "legumes",
  noten: "nuts",
  granen: "wholegrain",
  vis: "oilyFish",
  vlees: "leanMeat",
  eieren: "egg",
  zuivel: "dairy",
};

/**
 * Wat één portie van deze groep ongeveer is, in gewone taal.
 *
 * **Dit is een invoerhulp, geen meting.** Het staat naast het invoerveld zodat
 * je weet wát je telt — "1 portie groente" is voor niemand hetzelfde zonder
 * maat. Het systeem rekent er niets mee: de gram-lock uit
 * `nutrition-contribution.ts` staat onverkort, en zolang 32 van de 79 rijen in
 * `food-sources.ts` op `verified: false` staan, zou een dagtotaal in grammen
 * een inname-claim zijn op cijfers die niet zijn nagekeken.
 *
 * De bron staat in `PORTION_DEFINITIONS[...].sourceNote` en hoort mee bij
 * weergave — het zijn Voedingscentrum-indicaties, geen eigen getallen.
 */
export function portieHint(groep: VoedselgroepId): { label: string; bron: string } | null {
  const portionGroup = GRAM_HINT_GROEP[groep];
  if (!portionGroup) {
    return null;
  }
  const definitie = PORTION_DEFINITIONS[portionGroup];
  const grams = definitie.gramsPerPortion;
  if (grams === null) {
    return null;
  }

  const maat =
    typeof grams === "number" ? `${grams} g` : `${grams.min}–${grams.max} g`;

  // Zuivel wordt vaker gedronken dan gegeten; ml leest daar natuurlijker.
  const eenheid = groep === "zuivel" ? maat.replace(" g", " ml") : maat;

  return {
    label: `${definitie.labelNl} ≈ ${eenheid}`,
    bron: definitie.sourceNote,
  };
}

/** Label voor een dagboekgroep — één bron met de platte lijst. */
export function groepLabelVoorMoment(groep: VoedselgroepId): string {
  return DAGBOEK_LABELS[groep] ?? groep;
}

/**
 * Welke groepen bied je bij welk moment als eerste aan?
 *
 * Puur een volgorde-hint voor de invoer: bij het ontbijt staat zuivel boven
 * vis, 's avonds andersom. Geen enkele groep is uitgesloten bij een moment —
 * wie 's ochtends vis eet moet dat gewoon kunnen invullen, en een lijst die
 * dat verbiedt maakt van een dagboek een formulier met een mening.
 */
export const MOMENT_VOORKEUR: Record<EetmomentId, readonly VoedselgroepId[]> = {
  ontbijt: ["zuivel", "granen", "fruit", "eieren", "noten"],
  lunch: ["granen", "groente", "zuivel", "eieren", "vlees"],
  avondeten: ["groente", "zetmeel", "vlees", "vis", "peulvruchten"],
  tussendoor: ["fruit", "noten", "zuivel", "suiker", "dranken"],
};

/**
 * De groepen voor één moment: voorkeur eerst, daarna de rest.
 *
 * Alle dertien blijven bereikbaar; alleen de volgorde verschilt. Zo is de
 * lijst bij elk moment kort te scannen zonder dat er iets ontbreekt.
 */
export function groepenVoorMoment(moment: EetmomentId): VoedselgroepId[] {
  const voorkeur = MOMENT_VOORKEUR[moment];
  const rest = DAGBOEK_GROEPEN.filter((groep) => !voorkeur.includes(groep));
  return [...voorkeur, ...rest];
}

/**
 * Water in milliliters — de enige maat die hier wél in eenheden mag.
 *
 * Waarom water de uitzondering is op de gram-lock: de drie redenen die
 * grammen blokkeren gelden geen van drieën. Er is geen bron-onzekerheid (water
 * is water), geen `verified: false`-probleem in `food-sources.ts`, en geen
 * biobeschikbaarheidsvraag zoals fytaat bij magnesium. Een glas is een glas.
 *
 * Wat er nog steeds niet mag: dit als "je haalt je dagbehoefte" presenteren.
 * De 1,5–2 liter-vuistregel is geen richtlijn met een harde onderbouwing, en
 * de behoefte hangt van beweging, weer en voeding af. Dus: registreren mag,
 * er een cijfer tegenaan leggen niet.
 */
export const WATER_GLAS_ML = 250;

/** Grens waarboven een invoer eerder een typefout dan een dag is. */
export const WATER_MAX_ML = 6000;

export function normaliseerWaterMl(waarde: unknown): number | null {
  if (typeof waarde !== "number" || !Number.isFinite(waarde) || waarde < 0) {
    return null;
  }
  return Math.min(Math.round(waarde), WATER_MAX_ML);
}

/**
 * Water in glazen, voor de weergave.
 *
 * Mensen drinken glazen, geen milliliters. De invoer accepteert allebei; dit
 * vertaalt terug zodat het getal herkenbaar blijft.
 */
export function waterInGlazen(ml: number): number {
  return Math.round((ml / WATER_GLAS_ML) * 10) / 10;
}

/**
 * Eén regel over je water.
 *
 * Geen norm, geen "je haalt het niet": wat je registreerde, in de eenheid
 * waarin je het dronk.
 */
export function waterRegel(ml: number | null): string | null {
  if (ml === null || ml <= 0) {
    return null;
  }
  const glazen = waterInGlazen(ml);
  const liter = (ml / 1000).toFixed(1).replace(".", ",");
  return `${liter} liter water — ongeveer ${glazen} ${glazen === 1 ? "glas" : "glazen"}.`;
}
