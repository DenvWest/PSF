import { cortisolVerlagenData } from "./cortisol-verlagen-natuurlijk";
import { ashwagandhaData } from "./ashwagandha-werking-mannen";
import { slaapVerbeterenData } from "./slaap-verbeteren-40-plus";
import { energieVerhogenData } from "./energie-verhogen-natuurlijk";
import { ademhalingTegenStressData } from "./ademhaling-tegen-stress";
import { stressWerkGrenzenStellenData } from "./stress-werk-grenzen-stellen";
import { slaaphygieneMannen40PlusData } from "./slaaphygiene-mannen-40-plus";
import { magnesiumEnSlaapkwaliteitData } from "./magnesium-en-slaapkwaliteit";
import { magnesiumEnSlaapData } from "./magnesium-en-slaap";
import { melatonineWanneerWelNietData } from "./melatonine-wanneer-wel-niet";
import { vitamineDTekortHerkennenData } from "./vitamine-d-tekort-herkennen";
import { testosteronEnEnergieNa40Data } from "./testosteron-en-energie-na-40";
import { omega3ConcentratieEnergieData } from "./omega-3-concentratie-energie";
import { cornerstoneSupplementenArtikelen } from "./cornerstone-supplementen";

import type { BlogArtikel, BlogCategorie } from "@/types/blog";

export const alleArtikelen: BlogArtikel[] = [
  cortisolVerlagenData,
  ashwagandhaData,
  slaapVerbeterenData,
  energieVerhogenData,
  ademhalingTegenStressData,
  stressWerkGrenzenStellenData,
  slaaphygieneMannen40PlusData,
  magnesiumEnSlaapkwaliteitData,
  magnesiumEnSlaapData,
  melatonineWanneerWelNietData,
  vitamineDTekortHerkennenData,
  testosteronEnEnergieNa40Data,
  omega3ConcentratieEnergieData,
  ...cornerstoneSupplementenArtikelen,
].sort(
  (a, b) =>
    new Date(b.gepubliceerdOp).getTime() - new Date(a.gepubliceerdOp).getTime(),
);

export function getArtikelBySlug(slug: string): BlogArtikel | undefined {
  return alleArtikelen.find((a) => a.slug === slug);
}

export function getArtikelenByCategorie(categorie: BlogCategorie): BlogArtikel[] {
  return alleArtikelen.filter((a) => a.categorie === categorie);
}

export function getGerelateerdeArtikelen(artikel: BlogArtikel): BlogArtikel[] {
  return artikel.gerelateerdeSluggen
    .map((slug) => getArtikelBySlug(slug))
    .filter((a): a is BlogArtikel => a !== undefined)
    .slice(0, 3);
}
