import {
  CONNECTION_PRIORITY_LAYERS,
  CONNECTION_SAFETY_NET_LINE,
} from "@/data/connection/lifestyle-priorities";
import { MOVEMENT_PRIORITY_LAYERS } from "@/data/movement/lifestyle-priorities";
import { NUTRITION_PRIORITY_LAYERS } from "@/data/nutrition/lifestyle-pyramid";
import { SLEEP_PRIORITY_LAYERS } from "@/data/sleep/lifestyle-priorities";
import { STRESS_PRIORITY_LAYERS } from "@/data/stress/lifestyle-priorities";
import type { PillarId } from "@/types/dashboard";

/**
 * De vijf leefstijlladders op één plek.
 *
 * De laagdata zelf blijft per domein in `src/data/` staan — dat is de
 * woordelijke overname uit de prebuilds en die bron verplaatst niet. Wat hier
 * bij komt is het gedeelde omheen: welk domein een ladder heeft, met welke
 * intro, en hoe een gekozen actie zijn laag onthoudt.
 */

export type LeefstijlLadderLayer = {
  id: number;
  name: string;
  /** Voeding heeft er geen — de zes lagen dragen daar hun uitleg in `summary`. */
  subtitle?: string;
  summary: string;
  actions: readonly string[];
};

/** Zelfde vier standen als `MovementLayerState`; alleen beweging levert ze af. */
export type LeefstijlLayerState = "winst" | "ok" | "watch" | "wacht";

export type LeefstijlLadderConfig = {
  layers: readonly LeefstijlLadderLayer[];
  intro: string;
  eyebrow: string;
  /** Alleen waar hij expliciet is vastgelegd — nooit hergebruiken tussen domeinen. */
  safetyNetLine?: string;
  surface: string;
};

const LADDERS: Partial<Record<PillarId, LeefstijlLadderConfig>> = {
  slaap: {
    layers: SLEEP_PRIORITY_LAYERS,
    intro:
      "Zes lagen van je slaapbasis tot finetunen. Wat bovenaan staat draagt het meest; wat eronder staat telt pas mee als de lagen erboven staan. Open een laag om te zien wat wij aanraden en wat jij er zelf koos.",
    eyebrow: "Van basis naar finetunen",
    surface: "leefstijlprofiel_slaap",
  },
  beweging: {
    layers: MOVEMENT_PRIORITY_LAYERS,
    intro:
      "Zes lagen, van fundament naar finetunen. Wat bovenaan staat draagt het meest. Open een laag om te zien wat wij aanraden en wat jij er zelf koos.",
    eyebrow: "Fundament naar finetunen",
    surface: "leefstijlprofiel_beweging",
  },
  voeding: {
    layers: NUTRITION_PRIORITY_LAYERS,
    intro:
      "Zes lagen, van je eetbasis tot aanvullen. Wat bovenaan staat draagt het meest; wat eronder staat telt pas mee als de lagen erboven staan. Open een laag om te zien wat wij aanraden en wat jij er zelf koos.",
    eyebrow: "Van onder naar boven",
    surface: "leefstijlprofiel_voeding",
  },
  stress: {
    layers: STRESS_PRIORITY_LAYERS,
    intro:
      "Zes vlakken die spanning en herstel raken, van goedkoop naar duur. Wat bovenaan staat kost het minst en draagt het meest. Open een laag om te zien wat wij aanraden en wat jij er zelf koos.",
    eyebrow: "Kies wat herkenbaar is",
    surface: "leefstijlprofiel_stress",
  },
  verbinding: {
    layers: CONNECTION_PRIORITY_LAYERS,
    intro:
      "Zes vlakken waarop contact verbetert, van goedkoop naar duur. Wat bovenaan staat kost het minst en draagt het meest. Open een laag om te zien wat wij aanraden en wat jij er zelf koos.",
    eyebrow: "Kies wat herkenbaar is",
    safetyNetLine: CONNECTION_SAFETY_NET_LINE,
    surface: "leefstijlprofiel_verbinding",
  },
};

/** Energie en herstel zijn readouts, geen plandomeinen — die hebben geen ladder. */
export function getLeefstijlLadder(domain: PillarId): LeefstijlLadderConfig | null {
  return LADDERS[domain] ?? null;
}

export function resolveLadderLayerName(domain: PillarId, layerId: number): string | null {
  const ladder = getLeefstijlLadder(domain);
  return ladder?.layers.find((layer) => layer.id === layerId)?.name ?? null;
}

/**
 * De opties die de contextkolom op een aangeklikte ladderlaag toont.
 *
 * Vandaag is dat de statische `actions`-lijst van de laag (prebuild-copy).
 * Dit is het slot waar de vragenlijst-test later per laag inschuift — dezelfde
 * plek, een andere bron. Niet mergen: één lijst, één herkomst.
 */
export function resolveLayerOptions(layer: LeefstijlLadderLayer): readonly string[] {
  return layer.actions;
}

function slugifyAction(action: string): string {
  return action
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/**
 * De sleutel waarmee een gekozen actie zijn laag onthoudt.
 *
 * `account_favorites` is uniek op (account_id, item_id), dus het domein moet
 * erin: "Ga elke dag naar buiten" op laag 1 van slaap en op laag 1 van
 * beweging zijn twee rijen, geen botsing. De laag zit erin zodat Mijn keuze
 * per laag te tonen is zonder een tweede tabel — de ladder is de enige plek
 * waar dit id ontstaat, dus het blijft één bron.
 *
 * Blijft binnen de 128 tekens die de API accepteert: 5 + domein (≤10) + 4 + 90.
 */
export function ladderActionFavoriteId(
  domain: PillarId,
  layerId: number,
  action: string,
): string {
  return `laag-${domain}-p${layerId}-${slugifyAction(action)}`;
}

/**
 * De laag uit een favoriet-id, of `null` als het er geen van de ladder is.
 *
 * De legacy-vorm `actie-<laag>-<tekst>` komt uit de beweeg-aanbeveling van
 * 19 augustus. Die rijen staan al in accounts, dus ze blijven leesbaar — hun
 * domein komt uit het item zelf, dat veld heeft die vorm wél.
 */
export function parseLadderFavoriteLayer(itemId: string): number | null {
  const modern = /^laag-[a-z]+-p(\d+)-/.exec(itemId);
  if (modern) {
    return Number(modern[1]);
  }
  const legacy = /^actie-(\d+)-/.exec(itemId);
  return legacy ? Number(legacy[1]) : null;
}
