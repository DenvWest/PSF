import type { AudienceTag } from "@/lib/content-audience";
import { overgangReferences } from "@/data/references/overgang";
import { testosteronNa40References } from "@/data/references/testosteron-na-40";

/**
 * De twee pijlerpagina's waar de fysiologie wél geslachtsspecifiek is. Ze staan
 * niet in `alleArtikelen` (geen BlogArtikel-vorm), maar horen wel in de
 * bibliotheek: zonder deze twee zou een gerichte lens naar een leeg blok wijzen.
 */
export type PubliekPijler = {
  slug: string;
  href: string;
  titel: string;
  samenvatting: string;
  categorie: "energie" | "stress" | "slaap" | "supplementen";
  audience: AudienceTag;
  leestijd: string;
  /** ISO 8601 — bepaalt de plek in de sortering op nieuwste. */
  gepubliceerdOp: string;
  bronnen: number;
  trefwoorden: string[];
};

export const PUBLIEK_PIJLERS: PubliekPijler[] = [
  {
    slug: "pijler-testosteron-na-40",
    href: "/testosteron-na-40",
    titel: "Testosteron na 40: wat er daalt en wat je eraan doet",
    samenvatting:
      "Testosteron zakt na je veertigste met ongeveer een procent per jaar. Wat dat merkbaar doet met energie, herstel en spiermassa — en welke leefstijlknoppen er volgens onderzoek toe doen.",
    categorie: "energie",
    audience: "mannen",
    leestijd: "12 min",
    gepubliceerdOp: "2026-08-20",
    bronnen: testosteronNa40References.length,
    trefwoorden: [
      "testosteron",
      "libido",
      "spiermassa",
      "man 45",
      "vermoeidheid man",
    ],
  },
  {
    slug: "pijler-overgang",
    href: "/overgang",
    titel: "Overgang: wat verandert en wat helpt",
    samenvatting:
      "Perimenopauze in begrijpelijke taal: wat dalend oestrogeen doet met je slaap, botten en spieren — en welke leefstijlkeuzes daar volgens onderzoek het meeste aan doen.",
    categorie: "slaap",
    audience: "vrouwen",
    leestijd: "14 min",
    gepubliceerdOp: "2026-08-29",
    bronnen: overgangReferences.length,
    trefwoorden: [
      "overgang",
      "perimenopauze",
      "menopauze",
      "opvliegers",
      "botdichtheid",
      "vrouw 45",
      "nachtzweten",
    ],
  },
];
