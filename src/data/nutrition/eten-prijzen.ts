/**
 * Indicatieve prijs per portie voor de rijkste bronnen van de kernstoffen
 * (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, herziening 8 okt, stap 4).
 *
 * Met de hand opgezocht, nooit gescrapet. Elke regel heeft een bronlink en een
 * datum; een regel zonder beide hoort hier niet. `key` is een sleutel uit
 * `FOOD_CATALOG`. De prijs staat per verpakking, de portie rekent de lib uit.
 */
export interface EtenPrijs {
  key: string;
  /** Wat er gekocht is, bijvoorbeeld "AH Scharrel kipfilet". */
  product: string;
  winkel: string;
  verpakkingGram: number;
  verpakkingCenten: number;
  /** Productpagina waar de prijs te controleren is. */
  bronUrl: string;
  /** ISO-datum waarop de prijs is bekeken. */
  gecontroleerd: string;
}

export const ETEN_PRIJZEN: readonly EtenPrijs[] = [];
