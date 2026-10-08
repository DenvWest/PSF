/**
 * Indicatieve prijs per portie voor de rijkste bronnen van de kernstoffen
 * (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, herziening 8 okt, stap 4).
 *
 * Met de hand vastgelegd (kassabon of productpagina), nooit gescrapet. Elke
 * regel heeft een bronomschrijving en een datum; een regel zonder beide hoort
 * hier niet. `key` is een sleutel uit
 * `FOOD_CATALOG`. De prijs staat per verpakking, de portie rekent de lib uit.
 */
export interface EtenPrijs {
  key: string;
  /** Wat er gekocht is, bijvoorbeeld "AH Scharrel kipfilet". */
  product: string;
  winkel: string;
  verpakkingGram: number;
  verpakkingCenten: number;
  /** Waar de prijs vandaan komt, bijvoorbeeld "kassabon AH, 8 okt 2026". */
  bron: string;
  /** Productpagina, alleen als de prijs daar te controleren is. */
  bronUrl?: string;
  /** ISO-datum waarop de prijs is bekeken. */
  gecontroleerd: string;
}

export const ETEN_PRIJZEN: readonly EtenPrijs[] = [];
