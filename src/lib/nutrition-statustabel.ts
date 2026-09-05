import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import type {
  NutritionFactRow,
  NutritionLadderReport,
  NutritionRowExemption,
} from "@/lib/nutrition-ladder";
import type { NutrientSufficiency } from "@/lib/nutrition-sufficiency";
import {
  categorieKaarten,
  type CategorieKaart,
  type VoedselgroepId,
} from "@/lib/nutrition-voedselgroepen";

/**
 * Eén tabel voor de hele voedingsstatus.
 *
 * ## Waarom dit bestand bestaat
 *
 * De knop *Voedingsstatus* draagt drie ladderlagen (1, 2 en 4) en die werden
 * gerenderd door drie losse componenten onder elkaar: `VoedingsbasisOverzicht`
 * (zeven meetbanen), `VoedingskwaliteitLaag` (nog twee secties met dezelfde
 * balkvorm) en de situatielaag. Drie keer dezelfde vorm, elk met eigen
 * inleidende zinnen ertussen — samen leest dat als een essay waar een overzicht
 * hoort te staan.
 *
 * De klacht was niet dat de balk verkeerd is, maar dat er drie stapels van
 * waren. Dit bestand legt de rijen van laag 1, laag 2 én laag 4 op één
 * rijmodel, zodat er één tabel gerenderd kan worden waarin de balk een *kolom*
 * is in plaats van een blok.
 *
 * ## Waarom laag 4 er sinds 5 sep bij hoort
 *
 * Laag 4 ("volstaat dit voor jou?") stond als eigen component onder de tabel,
 * met per stof een kaart, een bandregel, een contextregel en een uitklapbaar
 * bronnenblok met NEVO-porties. Dat is dezelfde vraag in een andere vorm — waar
 * sta je ten opzichte van een lat — maar dan drie keer zo hoog per rij. En de
 * bronnenblokken ("waar komt magnesium vandaan") horen bij *aanvullen*: dat is
 * de knop waar je eten en supplement naast elkaar legt, niet de knop waar je
 * afleest hoe je ervoor staat.
 *
 * Wat blijft is de status zelf: per stof of hij volstaat, met de check-band als
 * antwoordtekst. Dat is één rij in dezelfde vijf kolommen.
 *
 * ## Wat hier níét gebeurt
 *
 * Geen tweede beoordeling. Elke rij erft zijn `status`, zijn antwoordtekst en
 * zijn richtlijn ongewijzigd van de bron — `categorieKaarten` voor de
 * voedselgroepen, de feitenrij zelf voor de kwaliteitsvragen. Als deze tabel
 * iets anders zou zeggen dan de check, is dat een bug en geen weergavekeuze.
 *
 * Ook geen optelling tot één kwaliteitscijfer: de check vraagt niet wélke
 * groente je eet, dus een samengesteld cijfer zou verzonnen zijn. Dezelfde
 * invariant die in `VoedingskwaliteitLaag` stond, en die hier blijft gelden.
 */

/** Op welke as een rij ligt — de header-knoppen filteren hierop. */
export type StatusRijSoort = "groep" | "kwaliteit" | "stof";

export type StatusRij = {
  /** Uniek binnen de tabel; voedselgroep-id of feitenrij-key. */
  id: string;
  soort: StatusRijSoort;
  label: string;
  /** Wat jij antwoordde, in de bewoording van de check. */
  jij: string;
  /** De richtlijn, of null als er geen is. */
  richtlijn: string | null;
  status: LadderEvidenceStatus;
  /** Waarom er geen richtlijn is; null als er wél een is. */
  exemption: NutritionRowExemption | null;
  /**
   * Waar je antwoord op zijn eigen schaal staat, 0–1 — de vulling van de
   * balkkolom. Null waar de check geen enkele positie kent; de kolom toont dan
   * alleen de statuskleur, want een verzonnen positie zou de enige echte
   * meetwaarde op dit scherm onbetrouwbaar maken.
   */
  schaalPositie: number | null;
  /** Klapt deze rij open naar zijn bronnen? Alleen voedselgroepen doen dat. */
  categorieId: VoedselgroepId | null;
};

/**
 * De groepskoppen boven de rijen.
 *
 * De tabel zet ruimte bovenaan *binnen* een groep, niet over de hele tabel
 * heen: een voedselgroep en een stof beantwoorden dezelfde vraag op een andere
 * as ("wat ligt er op je bord" tegenover "wat komt er binnen"), en die door
 * elkaar sorteren maakt van de tabel een ranglijst zonder onderwerp.
 */
export const SOORT_KOP: Record<StatusRijSoort, string> = {
  groep: "Op je bord",
  kwaliteit: "Wat je mindert",
  stof: "Volstaat dit voor jou",
};

/** De leesvolgorde van de groepen: bord, minderen, stoffen. */
export const SOORT_VOLGORDE: readonly StatusRijSoort[] = [
  "groep",
  "kwaliteit",
  "stof",
];

/** De filterknoppen in de tabelheader, met hun telling. */
export type StatusFilter = {
  id: "alles" | LadderEvidenceStatus;
  label: string;
  aantal: number;
};

/** Ruimte eerst — dat is waar dit overzicht voor bestaat. */
const STATUS_VOLGORDE: Record<LadderEvidenceStatus, number> = {
  below: 0,
  near: 1,
  meets: 2,
  own: 3,
};

/**
 * De rijen die de kwaliteitsvragen leveren.
 *
 * Alleen laag 2 (suiker, bewerkingsgraad). De bronrijen die
 * `VoedingskwaliteitLaag` er als tweede sectie bij zette — plantbasis, visbron,
 * eiwitbronnen — staan in deze tabel al als voedselgroep. Ze een tweede keer
 * opnemen zou letterlijk dezelfde meting twee rijen geven, en dat is precies de
 * herhaling waar dit overzicht vanaf moest.
 */
function kwaliteitsRijen(rijen: readonly NutritionFactRow[]): StatusRij[] {
  return rijen
    .filter((rij) => rij.layer === 2)
    .map((rij) => ({
      id: rij.key,
      soort: "kwaliteit" as const,
      label: rij.label,
      jij: rij.answerLabel,
      richtlijn: rij.benchmarkLabel ?? null,
      status: rij.status ?? "own",
      exemption: rij.exemption ?? null,
      schaalPositie: null,
      categorieId: null,
    }));
}

function uitKaart(kaart: CategorieKaart): StatusRij {
  return {
    id: kaart.id,
    soort: "groep",
    label: kaart.label,
    jij: kaart.jij,
    richtlijn: kaart.aanbevolen,
    status: kaart.status,
    exemption: kaart.exemption,
    schaalPositie: kaart.schaalPositie,
    categorieId: kaart.id,
  };
}

/**
 * De rijen die de sufficiency-laag levert — één per stof.
 *
 * `jij` draagt de check-band en niet een hoeveelheid: de check meet frequentie,
 * geen milligrammen, en dat mag deze kolom niet suggereren. De richtlijn-kolom
 * draagt het oordeel ("volstaat waarschijnlijk"), want dát is waar de band aan
 * getoetst wordt.
 *
 * De schaalpositie is de bandpositie, niet een dekkingsgetal: dezelfde drie
 * banden als de rest van de tabel, zodat de balk overal hetzelfde betekent.
 */
const BAND_POSITIE = { below: 0.28, around: 0.6, meets: 0.88 } as const;

const BAND_ANTWOORD = {
  below: "Onder de band",
  around: "Rond de band",
  meets: "Op de band",
} as const;

const OUTCOME_STATUS: Record<
  NutrientSufficiency["outcome"],
  LadderEvidenceStatus
> = {
  insufficient: "below",
  uncertain: "near",
  sufficient: "meets",
};

const OUTCOME_OORDEEL: Record<NutrientSufficiency["outcome"], string> = {
  insufficient: "Waarschijnlijk niet genoeg",
  uncertain: "Onzeker — meer context nodig",
  sufficient: "Volstaat waarschijnlijk",
};

function stofRijen(
  nutrients: readonly NutrientSufficiency[],
): StatusRij[] {
  return nutrients.map((stof) => ({
    id: `stof-${stof.nutrient}`,
    soort: "stof" as const,
    label: stof.label,
    jij: BAND_ANTWOORD[stof.band],
    richtlijn: OUTCOME_OORDEEL[stof.outcome],
    status: OUTCOME_STATUS[stof.outcome],
    exemption: null,
    schaalPositie: BAND_POSITIE[stof.band],
    categorieId: null,
  }));
}

/**
 * Alle rijen van de statustabel, ruimte bovenaan.
 *
 * De sortering is stabiel binnen een status, dus de bordvolgorde uit
 * `VOEDSELGROEPEN` blijft staan waar de status gelijk is. Voedselgroepen komen
 * vóór kwaliteitsvragen bij gelijke status: die eerste gaan over wat er op je
 * bord ligt, de tweede over wat je mindert — en dat is de volgorde waarin de
 * check ze stelt.
 */
export function bouwStatusRijen(
  factRows: readonly NutritionFactRow[],
  report: NutritionLadderReport | null,
  nutrients: readonly NutrientSufficiency[] = [],
): StatusRij[] {
  const groepen = categorieKaarten(factRows, report).map(uitKaart);
  const kwaliteit = kwaliteitsRijen(factRows);
  const stoffen = stofRijen(nutrients);

  // Binnen elke groep ruimte eerst; de groepen zelf houden hun leesvolgorde.
  const opRuimte = (rijen: StatusRij[]) =>
    [...rijen].sort((a, b) => STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status]);

  return [...opRuimte(groepen), ...opRuimte(kwaliteit), ...opRuimte(stoffen)];
}

const FILTER_LABEL: Record<LadderEvidenceStatus, string> = {
  below: "Ruimte",
  near: "Bijna",
  meets: "Op orde",
  own: "Eigen ijkpunt",
};

/**
 * De filterknoppen, met alleen de statussen die deze check daadwerkelijk
 * opleverde.
 *
 * Een knop tonen die nul rijen filtert is een dode knop, en die kost op 375px
 * precies zoveel ruimte als een werkende — dezelfde regel als
 * `beschikbareGroepen` in `nutrition-voedselgroepen.ts`.
 */
export function bouwStatusFilters(rijen: readonly StatusRij[]): StatusFilter[] {
  const volgorde: LadderEvidenceStatus[] = ["below", "near", "meets", "own"];
  const filters: StatusFilter[] = [
    { id: "alles", label: "Alles", aantal: rijen.length },
  ];

  for (const status of volgorde) {
    const aantal = rijen.filter((rij) => rij.status === status).length;
    if (aantal > 0) {
      filters.push({ id: status, label: FILTER_LABEL[status], aantal });
    }
  }

  // Eén statusknop naast "Alles" filtert niets weg: hij toont dezelfde rijen
  // met een extra klik ervoor. Dan liever geen knoppenrij.
  return filters.length > 2 ? filters : [];
}

export function filterStatusRijen(
  rijen: readonly StatusRij[],
  filter: StatusFilter["id"],
): StatusRij[] {
  return filter === "alles"
    ? [...rijen]
    : rijen.filter((rij) => rij.status === filter);
}
