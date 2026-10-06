import { catalogEntry } from "@/data/nutrition/food-catalog";
import { supplementCatalogEntry } from "@/data/nutrition/supplement-catalog";
import type { DagboekItemBron } from "@/lib/nutrition-dagboek-items";
import { isEetmomentId, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Een product vanuit een ander scherm in het dagboek zetten: de link opent het
 * Dagboek (`?tab=vandaag`) direct in het portiescherm van dat product, met de
 * maaltijd al gekozen. Je kiest alleen nog de hoeveelheid.
 *
 * ## Waarom geen gewone `<Link>`
 *
 * Tabwissels in het dashboard lopen via `history.pushState` + een
 * popstate-melding, buiten de router om. Next weet daardoor niet altijd op
 * welke tab je staat: kwam je binnen op `?tab=vandaag` en ging je via de tab
 * naar Patroon, dan is een `<Link href="/dashboard?tab=vandaag">` voor Next
 * dezelfde URL en gebeurt er niets. {@link gaNaarDashboard} volgt daarom
 * hetzelfde pad als de tabs.
 */

export type DagboekVoeg = { bron: DagboekItemBron; key: string; moment: EetmomentId };

export function buildDagboekVoegHref({ bron, key, moment }: DagboekVoeg): string {
  const params = new URLSearchParams({ tab: "vandaag", voeg: `${bron}:${key}`, moment });
  return `/dashboard?${params.toString()}`;
}

/** De gevraagde toevoeging uit een URL, of null als die ontbreekt of niet (meer) bestaat. */
export function leesDagboekVoeg(search: string): DagboekVoeg | null {
  const params = new URLSearchParams(search);
  const voeg = params.get("voeg");
  if (!voeg) return null;
  const scheiding = voeg.indexOf(":");
  if (scheiding < 0) return null;
  const bron = voeg.slice(0, scheiding);
  const key = voeg.slice(scheiding + 1);
  if (bron === "voeding" ? !catalogEntry(key) : bron === "supplement" ? !supplementCatalogEntry(key) : true) {
    return null;
  }
  const momentParam = params.get("moment") ?? "";
  const moment: EetmomentId = isEetmomentId(momentParam) ? momentParam : "ontbijt";
  return { bron: bron as DagboekItemBron, key, moment };
}

/** Haalt `voeg`, `moment` en `favorieten` uit de URL, zodat herladen het portiescherm niet opnieuw opent. */
export function wisDagboekVoeg(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!["voeg", "moment", "favorieten"].some((naam) => url.searchParams.has(naam))) return;
  url.searchParams.delete("voeg");
  url.searchParams.delete("moment");
  url.searchParams.delete("favorieten");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

/** Navigeert binnen het dashboard zoals de tabs dat doen; daarbuiten een gewone navigatie. */
export function gaNaarDashboard(href: string): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/dashboard") {
    window.history.pushState(null, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }
  window.location.assign(href);
}

export type DagboekFavorietenTab = "producten" | "supplementen";

/** Het Dagboek, open op "Mijn producten" of "Mijn supplementen". */
export function buildDagboekFavorietenHref(tab: DagboekFavorietenTab): string {
  return `/dashboard?${new URLSearchParams({ tab: "vandaag", favorieten: tab }).toString()}`;
}

export function leesDagboekFavorieten(search: string): DagboekFavorietenTab | null {
  const waarde = new URLSearchParams(search).get("favorieten");
  return waarde === "producten" || waarde === "supplementen" ? waarde : null;
}
