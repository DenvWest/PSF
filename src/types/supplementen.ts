export type SupplementSlug =
  | "magnesium"
  | "ashwagandha"
  | "omega-3"
  | "vitamine-d"
  | "melatonine";

export interface SupplementData {
  slug: SupplementSlug;
  naam: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  introTekst: string;

  watIsHet: {
    titel: string;
    tekst: string;
  };

  waaromRelevant: {
    titel: string;
    punten: {
      titel: string;
      uitleg: string;
    }[];
  };

  vormenDosering: {
    titel: string;
    vormen: {
      naam: string;
      geschiktVoor: string;
      dosering: string;
      opmerking?: string;
    }[];
    disclaimer: string;
  };

  waarOpLetten: {
    titel: string;
    criteria: {
      criterium: string;
      uitleg: string;
    }[];
  };

  gerelateerdeSymptomen: {
    titel: string;
    links: {
      symptoom: string;
      tekst: string;
      href: string;
    }[];
  };

  faq: {
    vraag: string;
    antwoord: string;
  }[];

  blogLinks: {
    href: string;
    titel: string;
  }[];
}
