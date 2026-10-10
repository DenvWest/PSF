import { isEetmomentId, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { WisPlan } from "@/lib/keuze-overzicht-wissen";
import type { VoortgangFavoriteItem } from "@/lib/voortgang-favorites-context";

/**
 * Een vrije keuze in "Je dag": een voedingsmiddel op een moment, zonder stof.
 * Voor wat geen bron is van een van de kernstoffen (haver, koffie, een
 * boterham) maar wel in je dag hoort. Het moment zit in het id
 * (`voeding-vrij-<moment>-<key>`): verplaatsen is wissen en opnieuw bewaren.
 * Geen stofkaart en geen balk: die bestaan alleen per stof.
 */
const VRIJ_PREFIX = "voeding-vrij-";

export function vrijKeuzeId(moment: EetmomentId, key: string): string {
  return `${VRIJ_PREFIX}${moment}-${key}`;
}

export function parseVrijKeuze(id: string): { moment: EetmomentId; key: string } | null {
  if (!id.startsWith(VRIJ_PREFIX)) return null;
  const rest = id.slice(VRIJ_PREFIX.length);
  const scheiding = rest.indexOf("-");
  if (scheiding < 0) return null;
  const moment = rest.slice(0, scheiding);
  const key = rest.slice(scheiding + 1);
  return isEetmomentId(moment) && key ? { moment, key } : null;
}

export function vrijeKeuzes(items: readonly { id: string }[]): { key: string; moment: EetmomentId }[] {
  const gezien = new Set<string>();
  const uit: { key: string; moment: EetmomentId }[] = [];
  for (const item of items) {
    const keuze = parseVrijKeuze(item.id);
    if (!keuze || gezien.has(keuze.key)) continue;
    gezien.add(keuze.key);
    uit.push(keuze);
  }
  return uit;
}

function idsVoor(key: string, items: readonly { id: string }[]): string[] {
  return items.filter((item) => parseVrijKeuze(item.id)?.key === key).map((item) => item.id);
}

export function planVrijWeg(key: string, items: readonly VoortgangFavoriteItem[]): WisPlan {
  const ids = new Set(idsVoor(key, items));
  return { verwijder: items.filter((item) => ids.has(item.id)), voegToe: [] };
}

export function vrijKeuzeItem(key: string, titel: string, moment: EetmomentId): VoortgangFavoriteItem {
  return { id: vrijKeuzeId(moment, key), title: `${titel}: bij ${moment}`, kind: "activiteit", domain: "voeding", source: "mijn_keuze" };
}

/** Het moment wijzigen: de oude ids eruit, het nieuwe erin. */
export function planVrijVerplaats(
  key: string,
  titel: string,
  moment: EetmomentId,
  items: readonly VoortgangFavoriteItem[],
): WisPlan {
  const oud = planVrijWeg(key, items).verwijder.filter((item) => item.id !== vrijKeuzeId(moment, key));
  return { verwijder: oud, voegToe: [vrijKeuzeItem(key, titel, moment)] };
}
