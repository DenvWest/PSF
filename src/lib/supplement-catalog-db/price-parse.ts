/**
 * Best-effort parse van de vrije-tekst "Prijs / dag"-spec uit de statische
 * productdata (bijv. "€ 0,43", "€ 0,42 (eenm.) / € 0,35 (abo)", "€ 0,20 (bij
 * 5 g/dag)") naar centen. Pakt altijd het EERSTE bedrag — bij een eenmalig/
 * abonnementsprijs-paar is dat de eenmalige (reguliere) prijs, niet de
 * actieprijs. Geeft null terug als er geen "Prijs / dag"-spec is (bijv.
 * eiwitpoeder, dat alleen een maandprijs-indicatie heeft) — nooit een gok op
 * basis van een andere spec.
 */
export function parsePricePerDaySpec(value: string): number | null {
  const match = /€\s*([\d.,]+)/.exec(value);
  if (!match) return null;
  const normalized = match[1].replace(/\./g, "").replace(",", ".");
  const euros = Number(normalized);
  if (!Number.isFinite(euros) || euros <= 0) return null;
  return Math.round(euros * 100);
}
