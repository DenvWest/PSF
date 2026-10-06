/**
 * De periode waarover Je patroon rekent: één dag, de laatste 7 of 30 dagen, of
 * een zelf gekozen reeks op de kalender. Per maaltijd en Per stof delen hem.
 *
 * Alle datums zijn `YYYY-MM-DD` en rekenen in UTC, zodat een zomertijdwissel
 * nooit een dag overslaat of dubbel telt.
 *
 * ## Waarom maximaal 42 dagen terug
 *
 * Etiketporties komen in één verzoek van maximaal 42 dagen
 * (`/api/account/supermarkt-portie-logs`). Een periode die verder teruggaat
 * zou stil een deel van je producten missen; de kalender biedt die dagen dus
 * niet aan.
 */

export type Periode = { van: string; tot: string };

export type PeriodeKeuze = "vandaag" | "7" | "30" | "eigen";

export const MAX_PERIODE_DAGEN = 42;

export function verschuifDag(datum: string, dagen: number): string {
  const dag = new Date(`${datum}T00:00:00Z`);
  dag.setUTCDate(dag.getUTCDate() + dagen);
  return dag.toISOString().slice(0, 10);
}

export function datumsTussen({ van, tot }: Periode): string[] {
  const datums: string[] = [];
  for (let datum = van; datum <= tot; datum = verschuifDag(datum, 1)) datums.push(datum);
  return datums;
}

export function periodeVoorKeuze(keuze: Exclude<PeriodeKeuze, "eigen">, vandaag: string): Periode {
  if (keuze === "vandaag") return { van: vandaag, tot: vandaag };
  return { van: verschuifDag(vandaag, -(Number(keuze) - 1)), tot: vandaag };
}

/** Zet twee aangetikte dagen in de goede volgorde. */
export function periodeTussen(a: string, b: string): Periode {
  return a <= b ? { van: a, tot: b } : { van: b, tot: a };
}

function opmaak(datum: string, opties: Intl.DateTimeFormatOptions): string {
  return new Date(`${datum}T00:00:00Z`).toLocaleDateString("nl-NL", { timeZone: "UTC", ...opties });
}

/** "ma 5 okt" voor één dag, "29 sep – 5 okt" voor een reeks. */
export function periodeLabel({ van, tot }: Periode): string {
  if (van === tot) return opmaak(van, { weekday: "short", day: "numeric", month: "short" });
  return `${opmaak(van, { day: "numeric", month: "short" })} – ${opmaak(tot, { day: "numeric", month: "short" })}`;
}
