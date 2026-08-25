import type { MeetreeksRow } from "@/lib/voortgang-meetreeks";
import type { DomainMeasurement } from "@/types/dashboard";

/** Eén kolombreedte voor tabel én grafiek — zo staat de datumstrip in beide gelijk. */
export const MEETREEKS_COL = 104;
export const MEETREEKS_CHART_H = 148;
export const MEETREEKS_AXIS_GUTTER = 46;

export function shortMeetreeksDate(dateLabel: string): string {
  return dateLabel.replace(/\s+\d{4}$/, "");
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
 * gebronde grens onder de indeling. Voeding is een frequentie-inschatting met
 * indicatieve drempels en stress is puur zelfrapportage; die mogen zich geen
 * richtlijn noemen.
 */
export function meetreeksScaleHint(row: MeetreeksRow): string {
  switch (row.scale) {
    case "score":
      return "Schaal 0-100, hoger is beter.";
    case "richtlijn":
      return "Schaal: onder de richtlijn → bijna → haalt 'm. De richtlijn staat per meting erbij.";
    case "vuistregel":
      return "Twee standen: aan de lage kant, of geen aandachtspunt. Een vuistregel uit je eetfrequentie — geen norm en geen bloedwaarde.";
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
  if (row.scale === "vuistregel") {
    return level === 1 ? "Laag" : "OK";
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
