import type { MeetreeksRow } from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement } from "@/types/dashboard";

/** Eén kolombreedte voor tabel én grafiek — zo staat de datumstrip in beide gelijk. */
export const MEETREEKS_COL = 104;
export const MEETREEKS_CHART_H = 148;
export const MEETREEKS_AXIS_GUTTER = 46;

export function shortMeetreeksDate(dateLabel: string): string {
  return dateLabel.replace(/\s+\d{4}$/, "");
}

/**
 * Boven de acht momenten wordt een datum-onder-elke-kolom een tekstmuur.
 * Daarboven tonen we alleen begin, eind, een paar tussenpunten en de actieve
 * kolom als label — de rest blijft een stille tik, aanklikbaar maar stil.
 */
export function meetreeksLabelAnchors(count: number, activeIndex: number): Set<number> {
  if (count <= 8) {
    return new Set(Array.from({ length: count }, (_, index) => index));
  }
  const targetLabels = 6;
  const step = Math.max(1, Math.round((count - 1) / (targetLabels - 1)));
  const anchors = new Set<number>();
  for (let index = 0; index < count; index += step) {
    anchors.add(index);
  }
  anchors.add(count - 1);
  anchors.add(activeIndex);
  return anchors;
}

export function meetreeksSourceLabel(source: DomainMeasurement["source"]): string {
  switch (source) {
    case "intake":
      return "Leefstijlcheck";
    case "nutrition_log":
      return "Voedingslog";
    default:
      return "Domeincheck";
  }
}

export function meetreeksDaysAgoLabel(daysAgo: number): string {
  if (daysAgo === 0) {
    return "vandaag";
  }
  if (daysAgo === 1) {
    return "gisteren";
  }
  return `${daysAgo} dagen geleden`;
}

/**
 * Wat de as betekent. Alleen `richtlijn` mag norm-taal voeren — daar staat een
 * gebronde grens onder de indeling. Stress is puur zelfrapportage en mag zich
 * dus geen richtlijn noemen; voeding komt hier niet langs, want die rijen
 * dragen geen positie en krijgen dus geen as.
 */
export function meetreeksScaleHint(row: MeetreeksRow): string {
  switch (row.scale) {
    case "score":
      return "Schaal 0-100, hoger is beter.";
    case "richtlijn":
      return "Schaal: onder de richtlijn → bijna → haalt 'm. De richtlijn staat per meting erbij.";
    default:
      return `Schaal 1-${row.levelMax}: je eigen antwoord, van zwakst naar sterkst. Geen richtlijn.`;
  }
}

export function meetreeksGridLevels(row: MeetreeksRow): number[] {
  if (row.scale === "score") {
    return [0, 25, 50, 75, 100];
  }
  return Array.from({ length: row.levelMax }, (_, index) => index + 1);
}

export function meetreeksTickLabel(row: MeetreeksRow, level: number): string {
  if (row.scale === "score") {
    return String(level);
  }
  if (row.scale === "richtlijn") {
    return ["onder", "bijna", "haalt"][level - 1] ?? String(level);
  }
  return String(level);
}

export function meetreeksLevelToY(row: MeetreeksRow, level: number): number {
  const padY = 16;
  const floor = row.scale === "score" ? 0 : 1;
  const span = Math.max(1, row.levelMax - floor);
  const ratio = (level - floor) / span;
  return MEETREEKS_CHART_H - padY - ratio * (MEETREEKS_CHART_H - padY * 2);
}
