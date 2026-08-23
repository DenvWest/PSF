import { isCadenceLadderAction } from "@/lib/leefstijl-ladder";
import { isLadderMomentDomain } from "@/lib/ladder-moments";
import type { PillarId } from "@/types/dashboard";

/**
 * Wat je met een gratis optie kunt dóén.
 *
 * De ladder levert zinnen; deze laag bepaalt welke handelingen er per zin
 * naast staan. Dat scheelt: tot nu toe hadden twee knoppen hun plek hard in
 * `MovementFreeActionsTile` staan, dus een derde handeling — of een optie die
 * er maar één verdient — betekende het scherm verbouwen.
 *
 * Drie zijn gebouwd:
 * - `keuze`       → `account_favorites`, via FavoriteSaveButton.
 * - `herinnering` → tijdstip + aan/uit-melding op een al bewaarde keuze, via
 *   FavoriteReminderControl. Zelfde `account_favorites`-rij als `keuze` — dus
 *   pas zichtbaar zodra de actie al bewaard is (het component zelf gate't dit
 *   op `isSaved`, niet deze functie). Voorbereidend: verstuurt zelf nog geen
 *   melding, dat volgt met een eigen verzendkanaal.
 * - `moment`      → `agenda_blocks`, via LadderMomentButton.
 *
 * De rest staat er als naam, niet als knop. Ze horen hier omdat dit de enige
 * plek is waar ze aangezet hoeven te worden: een nieuwe koppeling is een
 * regel in {@link resolveLadderAffordances} plus één renderer in
 * `LadderActionRow`, niet een verbouwing van het domeinscherm.
 * - `timer`  → een aftelling op je telefoon. Vraagt een client-side timer plus
 *   een afvinkpad terug naar dezelfde bron als `moment`.
 * - `meting` → uitlezing van een wearable (stappen, staan, hartslag). Vraagt
 *   eerst de provider-poort uit §15 van het beweegbesluit — één DPA per
 *   provider — en blijft tot die er is bewust onzichtbaar.
 * - `dienst` → wat geld kost. Loopt vandaag via de deur naar het schap, waar
 *   het oordeel en de prijs staan; een handeling per actie zou aanbod op een
 *   doe-surface zetten (lock 1 / N4).
 *
 * n8n hangt hier niet als handeling onder. Automatisering leest mee via de
 * events die elke handeling zelf al stuurt (`ladder_moment_gepland` en
 * verwanten, straks ook `dashboard_favorieten_herinnering_ingesteld`) — de
 * koppeling is het event-contract, geen knop erbij.
 */
export type LadderAffordanceId = "keuze" | "herinnering" | "moment" | "timer" | "meting" | "dienst";

/** Wat vandaag echt iets doet. De rest rendert niets tot hij gebouwd is. */
export const BUILT_LADDER_AFFORDANCES: readonly LadderAffordanceId[] = [
  "keuze",
  "herinnering",
  "moment",
];

export type LadderAffordanceContext = {
  domain: PillarId;
  layerId: number;
  /** De actietekst zelf — tegelijk de titel van het agenda-blok. */
  action: string;
};

/**
 * Welke handelingen deze optie krijgt, in de volgorde waarin ze staan.
 *
 * `moment` (agenda_blocks) hangt aan het domein: energie en herstel zijn
 * readouts zonder agenda-categorie, dus daar valt niets in te plannen.
 * Binnen een domein dat wél kan plannen valt `moment` bij een cadans-actie
 * ({@link isCadenceLadderAction}) alsnog af: "elk werkuur even staan" heeft
 * geen los tijdstip om op te plannen, en verschijnt in plaats daarvan als
 * doorlopend item op Mijn Dag (`AgendaRhythmPanel`).
 *
 * `keuze` en `herinnering` staan hier los van — die gelden voor elke actie,
 * ook een cadans-actie of een readout-domein, want een tijdvenster+interval
 * is precies het model dat cadans wél dekt. Of `herinnering` echt zichtbaar
 * wordt, beslist het component zelf (pas ná bewaren), niet deze functie.
 *
 * Zodra een optie een eigen afhandeling verdient — een timer op een
 * ademoefening, een wearable-uitlezing op stappen — beslist deze functie dat
 * per actie.
 */
export function resolveLadderAffordances(
  context: LadderAffordanceContext,
): readonly LadderAffordanceId[] {
  if (!isLadderMomentDomain(context.domain) || isCadenceLadderAction(context.action)) {
    return ["keuze", "herinnering"];
  }
  return BUILT_LADDER_AFFORDANCES;
}
