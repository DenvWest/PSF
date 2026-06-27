/**
 * Server/build-time datafile: voeding-eerst herkadering van de engine-supplementen
 * voor de Aanpak-modus (Q1). NIET importeren in "use client"-componenten.
 * De engine (buildRecommendations) bepaalt WELKE + de volgorde; dit bestand bepaalt
 * alleen de leefstijl-eerst TITEL + moeite-label per supplement.
 */

export type MoeiteLevel = "laag" | "gemiddeld" | "hoog";

export const MOEITE_LABEL: Record<MoeiteLevel, string> = {
  laag: "Moeite · laag",
  gemiddeld: "Moeite · gemiddeld",
  hoog: "Moeite · hoog",
};

type SupplementCardCopy = { title: string; moeite: MoeiteLevel };

const SUPPLEMENT_CARD_COPY: Record<string, SupplementCardCopy> = {
  eiwitpoeder: { title: "Eiwit bij elke maaltijd", moeite: "laag" },
  "omega-3": { title: "Vette vis of een omega-3-bron", moeite: "laag" },
  creatine: { title: "Creatine voor je krachttraining", moeite: "laag" },
  magnesium: { title: "Magnesium voor herstel en slaap", moeite: "laag" },
  "vitamine-d": { title: "Vitamine D als basis", moeite: "laag" },
  zink: { title: "Zink voor je weerstand", moeite: "laag" },
};

/** Titel + moeite voor een engine-slug; valt terug op de engine-naam bij onbekende slug. */
export function getSupplementCardCopy(
  slug: string,
  fallbackTitle: string,
): SupplementCardCopy {
  return SUPPLEMENT_CARD_COPY[slug] ?? { title: fallbackTitle, moeite: "laag" };
}
