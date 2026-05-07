import type { ReferentieItem } from "@/types/referenties";

export type BlogCategorie = "stress" | "slaap" | "energie" | "supplementen";

export type BlogSectieType = "tekst" | "opsomming";

export interface BlogSectie {
  type: BlogSectieType;
  titel: string;
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
  /** Optioneel publiek pad (bv. `/omega-3-vergelijken`); anders `/blog/${slug}`. */
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
}
