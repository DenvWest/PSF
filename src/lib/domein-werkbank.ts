import type { LadderEvidenceRow } from "@/lib/domain-ladder-readout";
import {
  getLeefstijlLadder,
  type LeefstijlLadderLayer,
  type LeefstijlLayerState,
} from "@/lib/leefstijl-ladder";
import type { PillarId } from "@/types/dashboard";

/**
 * De werkbank — het domeinscherm als keuzekolom + werkvlak, naar het model van
 * de supplementencatalogus.
 *
 * **Wat hier verandert ten opzichte van de ladder-als-accordeon.** Tot nu was
 * elke prioriteit een uitklapbare rij, en hing de volledige inhoud van die
 * prioriteit *binnenin* die rij. Op voeding betekende dat: een tabel met
 * doordrukpanelen, geperst in een accordeon, in een middenzone van ~744px. De
 * inhoud was niet te groot — hij stond op de verkeerde plek. Een accordeon is
 * een samenvatting die je even opendoet, geen werkblad waar je in leest.
 *
 * De catalogus op /supplementen loste hetzelfde probleem al op: keuzes links,
 * de rijen rechts, en de onderbouwing achter één knop in de kolom. Deze module
 * legt diezelfde verdeling vast voor een domein: de zes prioriteiten worden de
 * keuzekolom, de gekozen prioriteit krijgt het hele werkvlak.
 *
 * **Waarom dat meer is dan een verhuizing.** Een accordeon kan maar één ding
 * zeggen over een prioriteit: open of dicht. Een keuzekolom kan er vier dingen
 * over zeggen — de staat uit de check, hoeveel feiten eronder hangen, of het
 * je grootste winst is, en of je er nu naar kijkt. Dat is precies de
 * informatie waarop je zou kiezen welke prioriteit je opent, en die was in de
 * oude vorm alleen zichtbaar ná het openklappen.
 */

/** Waarop de keuzekolom gesorteerd staat. */
export type WerkbankSortering = "prioriteit" | "ruimte" | "gemeten";

export const WERKBANK_SORTERING_LABELS: Record<WerkbankSortering, string> = {
  prioriteit: "Op prioriteit",
  ruimte: "Meeste ruimte eerst",
  gemeten: "Meest gemeten eerst",
};

/**
 * Eén prioriteit zoals de keuzekolom hem toont.
 *
 * `feiten` is bewust een telling en geen lijst: de kolom zegt hoevéél er onder
 * een prioriteit hangt zodat je weet of het de moeite is hem te openen, en het
 * werkvlak zegt wát er hangt. Zou de kolom de feiten zelf tonen, dan is het
 * geen kolom meer maar een tweede werkvlak.
 */
export type WerkbankPrioriteit = {
  id: number;
  naam: string;
  samenvatting: string;
  /** De staat uit de check, of null waar het domein er geen levert. */
  staat: LeefstijlLayerState | null;
  /** Hoeveel feitenrijen de check onder deze prioriteit hangt. */
  feiten: number;
  /** Is dit de laag waar de check de grootste winst ziet? */
  isWinst: boolean;
};

/**
 * De volgorde waarin staten "ruimte" uitdrukken.
 *
 * `winst` eerst — dat is waar de check zegt dat de meeste te halen valt.
 * `wacht` laatst: dat is niet "geen ruimte" maar "nog niet aan de beurt", en
 * die twee mogen niet door elkaar lopen. Een lege staat (`null`) gaat naar
 * achteren omdat we er niets over kunnen zeggen, niet omdat het goed staat.
 */
const RUIMTE_VOLGORDE: Record<LeefstijlLayerState, number> = {
  winst: 0,
  watch: 1,
  ok: 2,
  wacht: 3,
};

function ruimteRang(staat: LeefstijlLayerState | null): number {
  return staat == null ? 4 : RUIMTE_VOLGORDE[staat];
}

/**
 * De prioriteiten van een domein als rijen voor de keuzekolom.
 *
 * Ongesorteerd in ladder-volgorde; `sorteerPrioriteiten` legt daar een
 * leesvolgorde overheen. Die splitsing houdt de bron (de ladder) los van de
 * weergave (wat de gebruiker koos), zodat "op prioriteit" altijd terug kan
 * naar precies de volgorde die de ladder bedoelde.
 */
export function bouwWerkbankPrioriteiten({
  domain,
  layerStates,
  evidenceByLayer,
  focusLayer,
}: {
  domain: PillarId;
  layerStates?: Partial<Record<number, LeefstijlLayerState>>;
  evidenceByLayer?: Partial<Record<number, readonly LadderEvidenceRow[]>>;
  focusLayer?: number | null;
}): WerkbankPrioriteit[] {
  const ladder = getLeefstijlLadder(domain);
  if (!ladder) {
    return [];
  }
  return ladder.layers.map((laag: LeefstijlLadderLayer) => ({
    id: laag.id,
    naam: laag.name,
    samenvatting: laag.summary,
    staat: layerStates?.[laag.id] ?? null,
    feiten: evidenceByLayer?.[laag.id]?.length ?? 0,
    isWinst: focusLayer != null && focusLayer === laag.id,
  }));
}

/**
 * De keuzekolom in de gevraagde leesvolgorde.
 *
 * Alle drie de sorteringen zijn stabiel op de ladder-volgorde: bij gelijke
 * ruimte of gelijk aantal feiten blijft P1 boven P2 staan. Zonder die
 * stabiliteit verspringt de kolom tussen renders, en een kolom die van volgorde
 * wisselt terwijl je hem leest is erger dan een kolom zonder sortering.
 */
export function sorteerPrioriteiten(
  prioriteiten: readonly WerkbankPrioriteit[],
  sortering: WerkbankSortering,
): WerkbankPrioriteit[] {
  const rijen = [...prioriteiten];
  if (sortering === "ruimte") {
    return rijen.sort((a, b) => ruimteRang(a.staat) - ruimteRang(b.staat) || a.id - b.id);
  }
  if (sortering === "gemeten") {
    return rijen.sort((a, b) => b.feiten - a.feiten || a.id - b.id);
  }
  return rijen.sort((a, b) => a.id - b.id);
}

/**
 * Welke prioriteit het werkvlak opent bij binnenkomst.
 *
 * De volgorde van voorkeur: een expliciete keuze uit de URL (iemand kwam hier
 * via een deeplink en verwacht die laag), dan de winst-laag uit de check, dan
 * de eerste prioriteit. Nooit "geen" — een leeg werkvlak naast een gevulde
 * kolom leest als een fout, terwijl er altijd iets te tonen is.
 */
export function kiesStartPrioriteit({
  urlLayer,
  focusLayer,
  prioriteiten,
}: {
  urlLayer?: number | null;
  focusLayer?: number | null;
  prioriteiten: readonly WerkbankPrioriteit[];
}): number | null {
  const bestaat = (id: number | null | undefined): id is number =>
    id != null && prioriteiten.some((rij) => rij.id === id);
  if (bestaat(urlLayer)) {
    return urlLayer;
  }
  if (bestaat(focusLayer)) {
    return focusLayer;
  }
  return prioriteiten[0]?.id ?? null;
}

/**
 * De regel onder de kolomkop: hoeveel prioriteiten er zijn en hoeveel de check
 * beoordeelde.
 *
 * Waarom dat tweede getal erbij staat: bij voeding beoordeelt de check alle
 * zes, bij slaap en stress maar een deel. Zonder die telling lijkt een kolom
 * met vier grijze rijen op een kapotte pagina, terwijl het gewoon betekent dat
 * de check daar (nog) niets over zegt.
 */
export function kolomBronregel(prioriteiten: readonly WerkbankPrioriteit[]): string {
  const beoordeeld = prioriteiten.filter((rij) => rij.staat != null).length;
  if (beoordeeld === 0) {
    return `${prioriteiten.length} prioriteiten · je check beoordeelt er nog geen`;
  }
  if (beoordeeld === prioriteiten.length) {
    return `${prioriteiten.length} prioriteiten · allemaal beoordeeld door je check`;
  }
  return `${prioriteiten.length} prioriteiten · ${beoordeeld} beoordeeld door je check`;
}
