import { NUTRIENT_ORDER } from "@/lib/nutrition-food-index";
import type { PatroonStof } from "@/lib/nutrition-stof-meting";
import { VOEDINGSWAARDE_VELDEN } from "@/lib/nutrition-voedingswaarde";

/**
 * Waar je in Je patroon stond, in de URL: sectie, open stof, zoekterm en
 * periode. Zo brengt de terugknop van de browser je na een uitstap (bijv. naar
 * `/supplementen?categorie=eiwitpoeder`) terug in Per stof → Eiwit, met je
 * zoekterm nog in de zoekbalk, in plaats van op het begin van Patroon.
 *
 * Eén mechanisme voor alle stoffen: de stof is een parameter, geen code per stof.
 * Schrijven gaat met `replaceState`: elke tik in Patroon is geen eigen stap in
 * de geschiedenis, alleen de stand waarop je terugkomt.
 */

export type PatroonUrlSectie = "maaltijden" | "stof" | "trend";
export type PatroonUrlPeriode = "vandaag" | "7" | "30";

export type PatroonUrlStand = {
  sectie: PatroonUrlSectie | null;
  stof: PatroonStof | null;
  zoek: string;
  periode: PatroonUrlPeriode | null;
};

const SECTIES: ReadonlySet<string> = new Set(["maaltijden", "stof", "trend"]);
/** Kernstoffen en de stoffen van de voedingswaardetabel: alles wat een stof-detail kan openen. */
const STOFFEN: ReadonlySet<string> = new Set<string>([...NUTRIENT_ORDER, ...VOEDINGSWAARDE_VELDEN.map((v) => v.veld)]);
const PERIODES: ReadonlySet<string> = new Set(["vandaag", "7", "30"]);
const MAX_ZOEK = 60;

export function leesPatroonUrl(search: string): PatroonUrlStand {
  const params = new URLSearchParams(search);
  const sectie = params.get("sectie");
  const stof = params.get("stof");
  const periode = params.get("periode");
  return {
    sectie: sectie && SECTIES.has(sectie) ? (sectie as PatroonUrlSectie) : null,
    stof: stof && STOFFEN.has(stof) ? (stof as PatroonStof) : null,
    zoek: (params.get("zoek") ?? "").slice(0, MAX_ZOEK),
    periode: periode && PERIODES.has(periode) ? (periode as PatroonUrlPeriode) : null,
  };
}

/** De URL met deze stand erin; laat andere parameters (zoals `tab`) staan. */
export function metPatroonStand(href: string, stand: Partial<PatroonUrlStand>): string {
  const url = new URL(href);
  const zet = (naam: string, waarde: string | null | undefined) => {
    if (waarde === undefined) return;
    if (waarde === null || waarde === "") url.searchParams.delete(naam);
    else url.searchParams.set(naam, waarde);
  };
  zet("sectie", stand.sectie);
  zet("stof", stand.stof);
  zet("zoek", stand.zoek === undefined ? undefined : stand.zoek.trim().slice(0, MAX_ZOEK));
  zet("periode", stand.periode);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Schrijft de stand in de huidige URL zonder nieuwe stap in de geschiedenis. */
export function bewaarPatroonStand(stand: Partial<PatroonUrlStand>): void {
  if (typeof window === "undefined") return;
  const volgende = metPatroonStand(window.location.href, stand);
  const huidig = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (volgende !== huidig) window.history.replaceState(window.history.state, "", volgende);
}
