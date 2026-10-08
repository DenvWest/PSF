import type { EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Welke hoofdmaaltijden iemand meestal eet, en welke hij op een dag bewust
 * oversloeg (`BESLUIT_EETPATROON_OVERGESLAGEN_2026-10.md`).
 *
 * ## Standaard plus uitzondering
 *
 * - **Eetpatroon** (Je doelen): één keer instellen. Wie periodiek vast en twee
 *   keer eet, heeft dan op 2/2 een volledige dag. Leeg = alle drie.
 * - **Niet gegeten** (dagboek, per dag): de uitzondering. Vandaag geen lunch.
 *
 * Een overgeslagen maaltijd telt als geregistreerd met 0: wat je niet at is
 * een feit, geen gat. Hij telt niet mee in "je gebruikelijke lunch", want dat
 * gemiddelde gaat over de keren dat je hem wél at.
 */

export const HOOFDMAALTIJDEN: readonly EetmomentId[] = ["ontbijt", "lunch", "avondeten"];

function isHoofdmaaltijd(value: unknown): value is EetmomentId {
  return typeof value === "string" && (HOOFDMAALTIJDEN as readonly string[]).includes(value);
}

/** Alleen hoofdmaaltijden, uniek, in de vaste volgorde. Onbekende waarden vallen weg. */
export function sanitizeHoofdmaaltijden(raw: unknown): EetmomentId[] {
  if (!Array.isArray(raw)) return [];
  const gekozen = new Set(raw.filter(isHoofdmaaltijd));
  return HOOFDMAALTIJDEN.filter((moment) => gekozen.has(moment));
}

/** Null (alle drie) of een niet-lege lijst hoofdmaaltijden. */
export function isGeldigEetpatroon(value: unknown): value is EetmomentId[] | null {
  if (value === null) return true;
  return Array.isArray(value) && value.length > 0 && value.every(isHoofdmaaltijd);
}

/** De maaltijden die een dag volledig maken. Leeg of null = alle drie. */
export function verwachteMaaltijden(gewone: readonly EetmomentId[] | null | undefined): readonly EetmomentId[] {
  const schoon = sanitizeHoofdmaaltijden(gewone ?? []);
  return schoon.length > 0 ? schoon : HOOFDMAALTIJDEN;
}

/**
 * Hoort dit moment bij je eetpatroon? Tussendoor altijd. Een maaltijd buiten
 * je patroon blijft toevoegbaar, maar staat in dagboek en Patroon op de
 * achtergrond zolang er niets op staat.
 */
export function inEetpatroon(moment: EetmomentId, gewone: readonly EetmomentId[] | null | undefined): boolean {
  return moment === "tussendoor" || verwachteMaaltijden(gewone).includes(moment);
}
