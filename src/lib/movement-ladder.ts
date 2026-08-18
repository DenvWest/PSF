import type { MovementBand, MovementFocusKey } from "@/data/movement-checkin";
import type { MovementPriorityId } from "@/data/movement/lifestyle-priorities";
import type { MovementSelfReport } from "@/lib/movement-assessment";

export type MovementLayerState = "winst" | "ok" | "watch" | "wacht";

/**
 * De beweegladder krijgt zijn staat uit dezelfde bron als de readout.
 *
 * Dit is de kern van lock 4 (BESLUIT_BEWEGING_V36 §I1). Tot nu toe droeg de
 * ladder op beweging geen staat: `MOVEMENT_PRIORITY_LAYERS` liet PRIO_STATE
 * bewust weg omdat er geen engine was die per prioriteit winst/ok/watch/wacht
 * berekende. Readout en ladder konden niet uiteenlopen omdat de ladder niets
 * beweerde — dat is geen SSOT maar een leeg vak.
 *
 * De oplossing is niet een tweede regel naast de readout, want dan ontstaat
 * precies de tegenspraak die lock 4 verbiedt. De winst-prioriteit wordt
 * daarom AFGELEID uit de focusdimensie die `buildMovementConclusion` al
 * kiest. Zeggen readout en ladder ooit iets anders, dan is dat een bug in
 * één functie — niet een verschil van mening tussen twee.
 */

/**
 * Focusdimensie → prioriteit. Elke koppeling staat in de bron-copy, niet in
 * een aanname:
 *
 * · `zitten`       → P1, letterlijk "Zitten onderbreken" in de subtitel.
 * · `mobiliteit`   → P1. De prebuild geeft P1 als resultaat "Je zit minder
 *                    stil en je lijf blijft losser" — soepel blijven woont
 *                    daar, niet in een eigen laag.
 * · `kracht`       → P2, "Spierbehoud" in de subtitel.
 * · `conditie`     → P2, "basisconditie" staat in de naam.
 * · `intensiteit`  → P2. De aerobe richtlijn kent één norm met twee valuta's
 *                    (zie MOVEMENT_FACT_ROW_ORDER: `aeroob` vat cardio en
 *                    intensief samen). Ze apart laden zou één gat als twee
 *                    prioriteiten tonen.
 * · `consistentie` → P3, "Progressief opbouwen" begint per definitie pas als
 *                    je het volhoudt.
 *
 * P4 tot en met P6 staan hier bewust niet in. Voor specifiek sporten bestaat
 * geen gemeten gat (je kiest een sport, we meten hem niet), P5 is marginale
 * winst bovenop een basis die staat, en P6 is gegate achter de voedingscheck
 * én de hertest. Geen van drieën kan dus ooit de winst-prioriteit zijn.
 */
const FOCUS_TO_PRIORITY: Record<MovementFocusKey, MovementPriorityId> = {
  zitten: 1,
  mobiliteit: 1,
  kracht: 2,
  conditie: 2,
  intensiteit: 2,
  consistentie: 3,
};

/** Dezelfde drempels als `assessMovement`: 1-2 aandacht, 3 redelijk, 4-5 sterk. */
function bandFor(value: number | undefined): MovementBand | null {
  if (typeof value !== "number") return null;
  if (value <= 2) return "aandacht";
  if (value === 3) return "redelijk";
  return "sterk";
}

/** De zwakste van een set — één open onderdeel maakt de hele prioriteit open. */
function worstBand(bands: (MovementBand | null)[]): MovementBand | null {
  const known = bands.filter((b): b is MovementBand => b != null);
  if (known.length === 0) return null;
  if (known.some((b) => b === "aandacht")) return "aandacht";
  if (known.some((b) => b === "redelijk")) return "redelijk";
  return "sterk";
}

function layerBand(layer: MovementPriorityId, report: MovementSelfReport): MovementBand | null {
  switch (layer) {
    case 1:
      return worstBand([bandFor(report.MOV2_SIT), bandFor(report.MOV2_MOB)]);
    case 2:
      return worstBand([
        bandFor(report.MOV2_STR),
        bandFor(report.MOV2_CARD),
        bandFor(report.MOV2_VIG),
      ]);
    case 3:
      return bandFor(report.MOV2_CONSIST);
    default:
      // P4-P6 hebben geen check-veld. Geen meting is geen oordeel.
      return null;
  }
}

/**
 * Welke prioriteit de winst-laag is. `focusDimension` komt uit
 * `buildMovementConclusion` en is dus dezelfde waarde die de readout-kop
 * draagt. Null betekent: alles staat er goed voor — dan is er geen
 * winst-prioriteit, en dat mag ook zo op het scherm staan.
 */
export function resolveMovementFocusPriority(
  focusDimension: MovementFocusKey | null,
): MovementPriorityId | null {
  return focusDimension ? FOCUS_TO_PRIORITY[focusDimension] : null;
}

export function resolveMovementLayerStates(
  report: MovementSelfReport,
  focusDimension: MovementFocusKey | null,
): Record<MovementPriorityId, MovementLayerState> {
  const focus = resolveMovementFocusPriority(focusDimension);
  const states = {} as Record<MovementPriorityId, MovementLayerState>;

  for (let id = 1 as MovementPriorityId; id <= 6; id = (id + 1) as MovementPriorityId) {
    if (id === focus) {
      states[id] = "winst";
      continue;
    }
    const band = layerBand(id, report);
    if (band === null) {
      states[id] = "wacht";
      continue;
    }
    if (band === "sterk") {
      states[id] = "ok";
      continue;
    }
    if (band === "redelijk") {
      states[id] = "watch";
      continue;
    }
    // Aandacht, maar niet de winst-laag. Boven de focus telt hij nog mee;
    // eronder kan hij wachten tot de laag erboven staat.
    states[id] = focus != null && id < focus ? "watch" : "wacht";
  }

  return states;
}

/**
 * Eén regel per gesloten prioriteit: waarom die kan wachten. Woordelijk uit
 * `beweging-keuze-consumentenbond-prebuild-v3.6` WHY_WAIT, voor de lagen waar
 * die regel niet aan de focus hangt. P1 en P2 hebben daar een tekst die alleen
 * klopt als kracht de winst is; die valt hier terug op de generieke regel.
 *
 * Alleen lagen ónder de focus krijgen een regel — wat boven je winst-laag
 * staat wacht niet, dat telt mee.
 */
const WHY_WAIT: Partial<Record<MovementPriorityId, string>> = {
  3: "Opbouwen begint pas als je krachtdagen vier weken staan.",
  4: "Een sport kiezen mag altijd. Hij duidt je plan, hij verandert het niet.",
  5: "Marginale winst — pas bovenop een basis die acht weken staat.",
  6: "Eerst je voedingscheck en je hertest, dan pas aanvullen.",
};

export function movementLayerWhyWait(
  layer: MovementPriorityId,
  focus: MovementPriorityId | null,
): string | null {
  if (focus == null) return null;
  if (layer <= focus) return null;
  return WHY_WAIT[layer] ?? "Deze prioriteit kan wachten tot de laag erboven staat.";
}

export const MOVEMENT_LAYER_STATE_LABEL: Record<MovementLayerState, string> = {
  winst: "Grootste winst",
  ok: "Op orde",
  watch: "Houd in de gaten",
  wacht: "Nog niet nu",
};
