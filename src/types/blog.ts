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

export interface BlogVergelijkingLink {
  /** Titel van de vergelijkingspagina, bv. "Beste ashwagandha supplementen" */
  titel: string;
  /** Korte trigger-tekst, bv. "Top 5 vergeleken op werkzame dosis en prijs" */
  beschrijving: string;
  /** Interne link naar de vergelijkingspagina, bv. "/beste-ashwagandha" */
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
  /** Links naar 1-2 vergelijkingspagina's — gerenderd als conversieblok in het artikel. */
  vergelijkingLinks?: BlogVergelijkingLink[];
  /** Sluggen van gerelateerde artikelen (2-3) */
  gerelateerdeSluggen: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}
