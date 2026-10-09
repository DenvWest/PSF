import type { DoelEvaluatie } from "@/lib/account-voedingsdoelen";

/**
 * Wanneer de evaluatie van je doel aan de beurt is
 * (`BESLUIT_DOEL_ZONE_RICHTING_EVALUATIE_2026-10.md` §3).
 *
 * Twee voorwaarden: 30 dagen sinds je richting koos of voor het laatst
 * "Houden" zei, en minstens 14 dagen sinds de startstand, zodat de vergelijking
 * van twee ondergrenzen iets te zeggen heeft.
 */

export const EVALUATIE_NA_DAGEN = 30;
export const STARTSTAND_MIN_DAGEN = 14;

const DAG_MS = 24 * 60 * 60 * 1000;

function dagenSinds(iso: string, nu: Date): number {
  const tijd = Date.parse(iso);
  return Number.isNaN(tijd) ? 0 : Math.floor((nu.getTime() - tijd) / DAG_MS);
}

export function evaluatieDue(evaluatie: DoelEvaluatie, stof: string, nu: Date): boolean {
  if (!evaluatie.gekozenOp) return false;
  const start = evaluatie.startstand[stof];
  if (!start || dagenSinds(start.datum, nu) < STARTSTAND_MIN_DAGEN) return false;
  const laatste = evaluatie.bevestigdOp && evaluatie.bevestigdOp > evaluatie.gekozenOp ? evaluatie.bevestigdOp : evaluatie.gekozenOp;
  return dagenSinds(laatste, nu) >= EVALUATIE_NA_DAGEN;
}

export function dagenTussen(vanIso: string, nu: Date): number {
  return dagenSinds(vanIso, nu);
}

/** "9 september". */
export function datumLabel(iso: string): string {
  const tijd = Date.parse(iso);
  if (Number.isNaN(tijd)) return "";
  return new Date(tijd).toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}
