export type SymptoomSlug = "stress" | "slaap" | "energie";
export type SubpaginaSlug = "oorzaken" | "oplossingen";

export interface SymptoomData {
  slug: SymptoomSlug;
  label: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroIntro: string;
  herkenning: string;
  ctaOorzaken: string;
  ctaOplossingen: string;
}

export interface OorzaakCategorie {
  titel: string;
  kernboodschap: string;
  voorbeelden: [string, string];
  blogLink: {
    href: string;
    titel: string;
  };
}

export interface OorzakenData {
  slug: SymptoomSlug;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  h2Titel: string;
  categorieen: [OorzaakCategorie, OorzaakCategorie, OorzaakCategorie, OorzaakCategorie];
  afsluitingTitel: string;
  afsluitingTekst: string;
  ctaOplossingen: {
    label: string;
    href: string;
  };
}

export interface Oplossing {
  titel: string;
  uitleg: string;
}

export interface OplossingsNiveau {
  niveau: 1 | 2 | 3;
  titel: string;
  kernboodschap: string;
  oplossingen: Oplossing[];
  blogLinks: {
    href: string;
    titel: string;
  }[];
  supplement?: {
    naam: string;
    uitleg: string;
    href: string;
  };
}

export interface OplossingenData {
  slug: SymptoomSlug;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  niveaus: [OplossingsNiveau, OplossingsNiveau, OplossingsNiveau];
  cta: {
    titel: string;
    tekst: string;
    knopLabel: string;
    knopDisabled: boolean;
    secundaireLink: {
      label: string;
      href: string;
    };
  };
}
