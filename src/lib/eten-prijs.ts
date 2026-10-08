import { ETEN_PRIJZEN, type EtenPrijs } from "@/data/nutrition/eten-prijzen";

export interface EtenPrijsPerPortie {
  centen: number;
  winkel: string;
  product: string;
  bronUrl: string;
  gecontroleerd: string;
}

export function etenPrijsPerPortie(
  key: string,
  portieGram: number,
  prijzen: readonly EtenPrijs[] = ETEN_PRIJZEN,
): EtenPrijsPerPortie | null {
  const regel = prijzen.find((p) => p.key === key);
  if (!regel || regel.verpakkingGram <= 0 || portieGram <= 0) return null;
  return {
    centen: Math.round((regel.verpakkingCenten * portieGram) / regel.verpakkingGram),
    winkel: regel.winkel,
    product: regel.product,
    bronUrl: regel.bronUrl,
    gecontroleerd: regel.gecontroleerd,
  };
}
