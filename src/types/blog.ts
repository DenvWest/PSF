import type { ReferentieItem } from "@/types/referenties";

export type BlogCategorie = "stress" | "slaap" | "energie" | "supplementen";

export type BlogCalloutVariant = "kerninzicht" | "letop" | "tip";

export type BlogSectieType = "tekst" | "opsomming";

export type BlogEvidenceNiveau = "sterk" | "redelijk" | "beperkt" | "vroeg";

/** Optionele tussenkop onder een sectie voor langere teksten (TOC H3); `tekst` weglaten = alleen kop in TOC. */
export interface BlogSubkop {
  titel: string;
  tekst?: string;
}

export interface BlogSectie {
  type: BlogSectieType;
  titel: string;
  /** Subtiel bewijsniveau voor evidence‑based presentatie — alleen gebruiken waar relevant. */
  bewijsNiveau?: BlogEvidenceNiveau;
  /** Extra H3-structuren onder deze sectie; verschijnt automatisch in de inhoudsopgave. */
  subkoppen?: BlogSubkop[];
  /** Doorlopende tekst — voor type "tekst" */
  tekst?: string;
  /** Optionele inleidende zin voor type "opsomming" */
  inleiding?: string;
  /** Lijst items — voor type "opsomming" */
  items?: string[];
  /**
   * Optionele markering als sectie rust op beperkt, heterogeen of gedateerd bewijs (geen diagnoses).
   */
  bewijsKanttekening?: string;
  /** Inline inzicht-blokken binnen de sectie — geen eigen kop of TOC-entry. */
  callouts?: { variant: BlogCalloutVariant; tekst: string }[];
}

export interface BlogSupplementCTA {
  naam: string;
  uitleg: string;
  href: string;
}

export interface BlogCornerstoneLink {
  /** Zichtbaar label, bv. "Oplossingen bij stress" */
  label: string;
  href: string;
}

export interface BlogArtikel {
  slug: string;
  /** Optioneel publiek pad (bv. `/beste/omega-3-supplement`); anders `/blog/${slug}`. */
  pad?: string;
  categorie: BlogCategorie;
  titel: string;
  /** Introductietekst direct onder de H1 */
  heroIntro: string;
  leestijd: string;
  /** ISO 8601, bv. "2026-04-01" */
  gepubliceerdOp: string;
  secties: BlogSectie[];
  /** 2-3 zinnen voor het samenvatting-blok */
  samenvatting: string;
  supplementCTA?: BlogSupplementCTA;
  cornerstoneLink: BlogCornerstoneLink;
  /** Optionele extra link naar productvergelijking (naast cornerstone naar educatieve pagina). */
  vergelijkingExtraLink?: BlogCornerstoneLink;
  /** Sluggen van gerelateerde artikelen (2-3) */
  gerelateerdeSluggen: string[];
  /** Vancouver-stijl referenties + type werk (minimaal 5). */
  referenties: ReferentieItem[];
  /** ISO 8601 inhoudelijk herzien voor professionele referentie; default vuller in layout. */
  laatstBijgewerktOp?: string;
  /** Zichtbaar onderaan o.a. bij referenties. */
  inhoudelijkeVerantwoordelijke?: string;
  /** Korte leestekst onder de hero (bewijs‑informed toon). */
  leesNuanceOnderHero?: string;
  /** Langere zin voor blok naar `/stress-verminderen-man` (alleen stress-pillar-cluster). */
  stressPillarTurbo?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  /** Compacte actiepunten in het dark Kernpunten-blok — optioneel, render-when-present. */
  kernpunten?: string[];
}
