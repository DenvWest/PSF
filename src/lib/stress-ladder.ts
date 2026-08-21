import type { StressBand } from "@/data/stress-checkin";
import type { StressPriorityId } from "@/data/stress/lifestyle-priorities";

export type StressLayerState = "winst" | "ok" | "watch" | "wacht";

/**
 * Spiegel van `sleep-ladder.ts`, gespecificeerd in
 * `stress-piramide-prebuild-v1-2026-08.html` (T1c, § RESOLVER). STR_REFL,
 * STR_AWARE en STR_BLOCK werden opgeslagen en nergens gelezen (DODE VELDEN in
 * dezelfde prebuild) — hier krijgen ze hun baan: ze bepalen de VOLGORDE van
 * je prioriteiten, nooit je cijfer. Alleen STR_FREQ en STR_RCV raken de score
 * (stress-delta.ts).
 */
export type StressCheckReport = {
  STR_FREQ?: number;
  STR_RCV?: number;
  STR_AUTO?: number;
  STR_REFL?: number;
  STR_AWARE?: number;
  STR_BLOCK?: number;
  STR_CHARGE?: number;
};

/**
 * Welke prioriteit nu de winst-laag is. Cascade, bovenste treffer wint:
 *
 * · P1 — grens. Dagelijkse spanning, of een blokkade die over tijd of
 *   schuldgevoel gaat: dat los je niet op met een techniek.
 * · P2 — techniek. Geen invloed op de opbouw, pas achteraf doorhebben, of
 *   expliciet "ik weet niet wat helpt".
 * · P3 — herstel. Stapelt op, of keuzes worden uitgesteld onder druk.
 * · P4 — nacht. Dag staat, voorraad blijft leeg.
 * · P5 wordt nooit winst: voeding is bij stress ondersteunend, geen
 *   eerstvolgende stap (domain-product-stance: lifestyle_first).
 */
export function resolveStressFocusLayer(report: StressCheckReport): StressPriorityId {
  const { STR_FREQ, STR_BLOCK, STR_AUTO, STR_AWARE, STR_RCV, STR_REFL, STR_CHARGE } = report;

  if (STR_FREQ != null && STR_FREQ <= 2 && (STR_BLOCK === 2 || STR_BLOCK === 3)) return 1;
  if (STR_FREQ === 1) return 1;
  if ((STR_AUTO != null && STR_AUTO <= 2) || (STR_AWARE != null && STR_AWARE <= 2) || STR_BLOCK === 1)
    return 2;
  if ((STR_RCV != null && STR_RCV <= 2) || (STR_REFL != null && STR_REFL <= 2)) return 3;
  if (STR_CHARGE != null && STR_CHARGE <= 2) return 4;
  return 6;
}

function bandFor(value: number | undefined): StressBand | null {
  if (typeof value !== "number") return null;
  if (value >= 4) return "sterk";
  if (value === 3) return "redelijk";
  return "aandacht";
}

/** P5 en P6 hebben geen checkveld — ze zijn een deur/meetmoment, geen band. */
function layerBand(layer: StressPriorityId, report: StressCheckReport): StressBand | null {
  switch (layer) {
    case 1:
      return bandFor(report.STR_FREQ);
    case 2:
      return bandFor(report.STR_AUTO);
    case 3:
      return bandFor(report.STR_RCV);
    case 4:
      return bandFor(report.STR_CHARGE);
    default:
      return null;
  }
}

export function resolveStressLayerStates(
  report: StressCheckReport,
): Record<StressPriorityId, StressLayerState> {
  const focus = resolveStressFocusLayer(report);
  const states = {} as Record<StressPriorityId, StressLayerState>;

  for (let id = 1 as StressPriorityId; id <= 6; id = (id + 1) as StressPriorityId) {
    if (id === focus) {
      states[id] = "winst";
      continue;
    }
    if (id === 5) {
      // Voeding-koppeling is een deur, geen gemeten laag: hij komt in beeld
      // zodra de dag staat (focus op P4), niet op basis van een eigen band.
      states[id] = focus >= 4 ? "watch" : "wacht";
      continue;
    }
    if (id === 6) {
      states[id] = focus >= 3 ? "watch" : "wacht";
      continue;
    }
    const band = layerBand(id, report);
    if (band === "sterk") {
      states[id] = "ok";
      continue;
    }
    if (band === "redelijk") {
      states[id] = "watch";
      continue;
    }
    // Aandacht of ongemeten, maar niet de winst-laag. Boven de focus telt hij
    // nog mee; eronder wacht hij tot de laag erboven staat.
    states[id] = id < focus ? "watch" : "wacht";
  }

  return states;
}

/**
 * Eén regel per gesloten prioriteit: waarom die kan wachten. Generiek, niet
 * scenario-afhankelijk — de prebuild schrijft per demo-staat een eigen zin,
 * maar die zijn contextueel (bijv. "je eindtijd staat"). Deze bank is de
 * altijd-geldige onderbouwing per laag, dezelfde vorm als `WHY_WAIT` in
 * movement-ladder.ts en sleep-ladder.ts.
 */
const WHY_WAIT: Partial<Record<StressPriorityId, string>> = {
  2: "Een vaste reset heeft pas zin als je omslagmoment na werk staat.",
  3: "Herstelmomenten hangen aan een dag die nu geen vast eindpunt kent.",
  4: "Nog geen aanwijzing dat je avond je nacht raakt — de slaap-check komt in beeld zodra dat verandert.",
  5: "Voeding ondersteunt herstel, maar komt pas in beeld als je nacht gemeten is en je voorraad leeg blijft.",
  6: "Eerst iets veranderen, dan pas meten wat het deed.",
};

export function stressLayerWhyWait(
  layer: StressPriorityId,
  focus: StressPriorityId | null,
): string | null {
  if (focus == null) return null;
  if (layer <= focus) return null;
  return WHY_WAIT[layer] ?? "Deze prioriteit kan wachten tot de laag erboven staat.";
}
