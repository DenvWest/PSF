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

/** Haalt één NEVO-voedingsmiddel op code op. `null` bij een fout of onbekende code. */
export async function haalNevoProductViaApi(nevoCode: string): Promise<SupermarktProduct | null> {
  try {
    const response = await fetch(`/api/account/nevo-voedingsmiddel?code=${encodeURIComponent(nevoCode)}`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { product?: SupermarktProduct };
    return body.product ?? null;
  } catch {
    return null;
  }
}

/** Zoveel codes accepteert `/api/account/nevo-voedingsmiddel` per verzoek. */
const NEVO_CODES_PER_VERZOEK = 60;

/**
 * Haalt meerdere NEVO-voedingsmiddelen op, in stukken van hoogstens 60 codes.
 * Een mislukt stuk levert voor die codes niets op (`n.o.`), de rest blijft.
 */
export async function haalNevoProductenViaApi(nevoCodes: readonly string[]): Promise<SupermarktProduct[]> {
  if (nevoCodes.length <= NEVO_CODES_PER_VERZOEK) return haalNevoStuk(nevoCodes);
  const stukken: string[][] = [];
  for (let i = 0; i < nevoCodes.length; i += NEVO_CODES_PER_VERZOEK) {
    stukken.push(nevoCodes.slice(i, i + NEVO_CODES_PER_VERZOEK));
  }
  return (await Promise.all(stukken.map(haalNevoStuk))).flat();
}

async function haalNevoStuk(nevoCodes: readonly string[]): Promise<SupermarktProduct[]> {
  if (nevoCodes.length === 0) return [];
  try {
    const response = await fetch(
      `/api/account/nevo-voedingsmiddel?codes=${encodeURIComponent(nevoCodes.join(","))}`,
      { credentials: "include" },
    );
    if (!response.ok) return [];
    const body = (await response.json()) as { producten?: SupermarktProduct[] };
    return Array.isArray(body.producten) ? body.producten : [];
  } catch {
    return [];
  }
}
