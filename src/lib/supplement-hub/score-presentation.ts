import type { ClaimStance } from "@/types/supplement-score";

/**
 * Presentatielaag voor de PS-Score. Getallen blijven de bron; deze module
 * vertaalt ze naar het woord en de kleur die op de kaart staan, zodat een
 * kaart een oordeel toont in plaats van een alinea.
 */

export type ScoreBandKey = "uitstekend" | "sterk" | "goed" | "redelijk" | "zwak";

export interface ScoreBand {
  key: ScoreBandKey;
  label: string;
  /** Tailwind-klassen voor de badge rond het totaalcijfer. */
  badge: string;
  bar: string;
}

const BANDS: ReadonlyArray<{ min: number } & ScoreBand> = [
  {
    min: 90,
    key: "uitstekend",
    label: "Uitstekend",
    badge: "bg-emerald-700 text-white",
    bar: "bg-emerald-700",
  },
  {
    min: 80,
    key: "sterk",
    label: "Sterk",
    badge: "bg-emerald-600 text-white",
    bar: "bg-emerald-600",
  },
  {
    min: 70,
    key: "goed",
    label: "Goed",
    badge: "bg-ps-green text-white",
    bar: "bg-ps-green",
  },
  {
    min: 60,
    key: "redelijk",
    label: "Redelijk",
    badge: "bg-amber-500 text-white",
    bar: "bg-amber-500",
  },
  {
    min: 0,
    key: "zwak",
    label: "Zwak",
    badge: "bg-stone-500 text-white",
    bar: "bg-stone-400",
  },
];

export function getScoreBand(total: number): ScoreBand {
  const band = BANDS.find((entry) => total >= entry.min) ?? BANDS[BANDS.length - 1];
  return { key: band.key, label: band.label, badge: band.badge, bar: band.bar };
}

export type ComponentStatusKey = "hoog" | "goed" | "matig" | "laag" | "onbekend";

export interface ComponentStatus {
  key: ComponentStatusKey;
  label: string;
  dot: string;
  text: string;
}

const COMPONENT_STATUSES: Record<ComponentStatusKey, ComponentStatus> = {
  hoog: { key: "hoog", label: "Hoog", dot: "bg-emerald-600", text: "text-emerald-800" },
  goed: { key: "goed", label: "Goed", dot: "bg-emerald-500", text: "text-emerald-700" },
  matig: { key: "matig", label: "Matig", dot: "bg-amber-500", text: "text-amber-800" },
  laag: { key: "laag", label: "Laag", dot: "bg-stone-400", text: "text-stone-600" },
  onbekend: {
    key: "onbekend",
    label: "Onbekend",
    dot: "bg-stone-300",
    text: "text-stone-500",
  },
};

export function getComponentStatus(points: number | null): ComponentStatus {
  if (points === null) return COMPONENT_STATUSES.onbekend;
  if (points >= 85) return COMPONENT_STATUSES.hoog;
  if (points >= 65) return COMPONENT_STATUSES.goed;
  if (points >= 40) return COMPONENT_STATUSES.matig;
  return COMPONENT_STATUSES.laag;
}

export interface ClaimPresentation {
  /** Kort label voor op de kaart — geen zin, een toestand. */
  short: string;
  dot: string;
  text: string;
}

export const CLAIM_PRESENTATION: Record<ClaimStance, ClaimPresentation> = {
  voldoet: { short: "Voldoet", dot: "bg-emerald-600", text: "text-emerald-800" },
  voldoet_deels: { short: "Deels", dot: "bg-amber-500", text: "text-amber-800" },
  voldoet_niet: { short: "Onder drempel", dot: "bg-amber-600", text: "text-amber-900" },
  geen_erkende_claim: {
    short: "Geen EU-claim",
    dot: "bg-stone-300",
    text: "text-stone-500",
  },
  onbepaald: { short: "Onbekend", dot: "bg-stone-300", text: "text-stone-500" },
};
