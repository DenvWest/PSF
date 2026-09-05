import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import type {
  NutritionFactRow,
  NutritionLadderReport,
  NutritionRowExemption,
} from "@/lib/nutrition-ladder";
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
 * balkvorm) en `SituatieVoedingLaag`. Drie keer dezelfde vorm, elk met eigen
 * inleidende zinnen ertussen — samen leest dat als een essay waar een overzicht
 * hoort te staan.
 *
 * De klacht was niet dat de balk verkeerd is, maar dat er drie stapels van
 * waren. Dit bestand legt de rijen van laag 1 en laag 2 op één rijmodel, zodat
 * er één tabel gerenderd kan worden waarin de balk een *kolom* is in plaats van
 * een blok. Laag 4 (je situatie) blijft een eigen component: die beantwoordt
 * een andere vraag ("volstaat dit gegeven je gewicht en training") en heeft
 * geen categorie-as, dus hij past niet in deze rijen.
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
export type StatusRijSoort = "groep" | "kwaliteit";

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
): StatusRij[] {
  const groepen = categorieKaarten(factRows, report).map(uitKaart);
  const kwaliteit = kwaliteitsRijen(factRows);

  return [...groepen, ...kwaliteit].sort(
    (a, b) => STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status],
  );
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
