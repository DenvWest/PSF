import type { SupermarktProduct } from "@/types/supermarkt-product";

/** Kortste zoekterm waarmee de server nog iets teruggeeft (zie `MIN_ZOEKTERM_LENGTE`). */
export const MIN_ZOEK_LENGTE = 3;

/**
 * Zoekt supermarktproducten via de server. Geeft `[]` bij een fout, een te
 * korte zoekterm of een afgebroken verzoek: een zoekbalk die stilvalt is beter
 * dan een foutmelding bij elke toetsaanslag, en de rest van het zoekscherm
 * (voeding, supplementen) werkt gewoon door.
 */
export async function zoekSupermarktProductenViaApi(
  query: string,
  signal?: AbortSignal,
): Promise<SupermarktProduct[]> {
  const term = query.trim();
  if (term.length < MIN_ZOEK_LENGTE) return [];
  try {
    const response = await fetch(`/api/account/supermarkt-producten?q=${encodeURIComponent(term)}`, {
      credentials: "include",
      signal,
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { producten?: SupermarktProduct[] };
    return Array.isArray(body.producten) ? body.producten : [];
  } catch {
    return [];
  }
}
