/**
 * Best-effort parse van een vrije-tekst prijs-spec uit de statische
 * productdata (bijv. "€ 17,95", "€ 0,42 (eenm.) / € 0,35 (abo)", "€ 0,20 (bij
 * 5 g/dag)") naar centen. Pakt altijd het EERSTE bedrag — bij een eenmalig/
 * abonnementsprijs-paar is dat de eenmalige (reguliere) prijs, niet de
 * actieprijs. Geeft null terug als de tekst geen €-bedrag bevat — nooit een
 * gok op basis van een andere spec. Werkt op elk label ("Prijs", "Prijs /
 * dag", "Prijs indicatie"); de aanroeper bepaalt wat het bedrag betekent.
 */
export function parseEuroAmountSpec(value: string): number | null {
  const match = /€\s*([\d.,]+)/.exec(value);
  if (!match) return null;
  const normalized = match[1].replace(/\./g, "").replace(",", ".");
  const euros = Number(normalized);
  if (!Number.isFinite(euros) || euros <= 0) return null;
  return Math.round(euros * 100);
}
