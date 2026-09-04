import { cortisolVerlagenData } from "./cortisol-verlagen-natuurlijk";
import { cortisolEnSlaapData } from "./cortisol-en-slaap";
import { ashwagandhaData } from "./ashwagandha-werking-mannen";
import { slaapVerbeterenData } from "./slaap-verbeteren-40-plus";
import { energieVerhogenData } from "./energie-verhogen-natuurlijk";
import { ademhalingTegenStressData } from "./ademhaling-tegen-stress";
import { stressWerkGrenzenStellenData } from "./stress-werk-grenzen-stellen";
import { slaaphygieneMannen40PlusData } from "./slaaphygiene-mannen-40-plus";
import { magnesiumEnSlaapkwaliteitData } from "./magnesium-en-slaapkwaliteit";
import { magnesiumEnSlaapData } from "./magnesium-en-slaap";
import { magnesiumInCombinatieMetMedicijnenData } from "./magnesium-in-combinatie-met-medicijnen";
import { melatonineWanneerWelNietData } from "./melatonine-wanneer-wel-niet";
import { melatonineNa40Data } from "./melatonine-na-40";
import { vitamineDTekortHerkennenData } from "./vitamine-d-tekort-herkennen";
import { testosteronEnEnergieNa40Data } from "./testosteron-en-energie-na-40";
import { omega3ConcentratieEnergieData } from "./omega-3-concentratie-energie";
import { slaapritmeHerstellenData } from "./slaapritme-herstellen";
import { creatineEnHerstelData } from "./creatine-en-herstel";
import { vitamineDEnEnergieData } from "./vitamine-d-en-energie";
import { cortisolEnTestosteronData } from "./cortisol-en-testosteron";
import { zinkEnTestosteronData } from "./zink-en-testosteron";
import { omega3EnHerstelData } from "./omega-3-en-herstel";
import { eiwitNa40Data } from "./eiwit-na-40";
import { eiwitinnameTimingMannen40Data } from "./eiwitinname-timing-mannen-40";
import { middagdipBloedsuikerNa40Data } from "./middagdip-bloedsuiker-na-40";
import { krachttrainingNa40Data } from "./krachttraining-na-40";
import { alcoholSlaapEnergieNa40Data } from "./alcohol-slaap-energie-na-40";
import { zonnebrandEnVitamineDData } from "./zonnebrand-en-vitamine-d";
import { vitamineDZonNederlandData } from "./vitamine-d-zon-nederland";
import { vitamineDEnK2SamenData } from "./vitamine-d-en-k2-samen";
import { vitamineDHogeDosesSocialMediaData } from "./vitamine-d-hoge-doses-social-media";
import { vitamineDMetenWanneerZinvolData } from "./vitamine-d-meten-wanneer-zinvol";
import { vitamineDSeizoenenJaarritmeData } from "./vitamine-d-seizoenen-jaarritme";
import { vitamineDAandoeningenOnderzoekData } from "./vitamine-d-aandoeningen-onderzoek";
import { vitamineDEnSlaapData } from "./vitamine-d-en-slaap";
import { multivitamineZinvolNa40Data } from "./multivitamine-zinvol-na-40";
import { zoutKaliumBloeddrukNa40Data } from "./zout-kalium-bloeddruk-na-40";
import { omega3HoeveelPerDagData } from "./omega-3-hoeveel-per-dag";
import { omega3UitVoedingOfSupplementData } from "./omega-3-uit-voeding-of-supplement";
import { algenolieOfVisolieData } from "./algenolie-of-visolie";
import { visolieOxidatieEnBijwerkingenData } from "./visolie-oxidatie-en-bijwerkingen";
import { omega3IndexMetenData } from "./omega-3-index-meten";
import { omega3EnMedicijnenData } from "./omega-3-en-medicijnen";
import { omega3EnHartOnderzoekData } from "./omega-3-en-hart-onderzoek";
import { cornerstoneSupplementenArtikelen } from "./cornerstone-supplementen";

import type { BlogArtikel, BlogCategorie } from "@/types/blog";

export const alleArtikelen: BlogArtikel[] = [
  cortisolVerlagenData,
  cortisolEnSlaapData,
  ashwagandhaData,
  slaapVerbeterenData,
  energieVerhogenData,
  ademhalingTegenStressData,
  stressWerkGrenzenStellenData,
  slaaphygieneMannen40PlusData,
  magnesiumEnSlaapkwaliteitData,
  magnesiumEnSlaapData,
  magnesiumInCombinatieMetMedicijnenData,
  melatonineWanneerWelNietData,
  melatonineNa40Data,
  vitamineDTekortHerkennenData,
  testosteronEnEnergieNa40Data,
  omega3ConcentratieEnergieData,
  slaapritmeHerstellenData,
  creatineEnHerstelData,
  vitamineDEnEnergieData,
  cortisolEnTestosteronData,
  zinkEnTestosteronData,
  omega3EnHerstelData,
  eiwitNa40Data,
  eiwitinnameTimingMannen40Data,
  middagdipBloedsuikerNa40Data,
  krachttrainingNa40Data,
  alcoholSlaapEnergieNa40Data,
  zonnebrandEnVitamineDData,
  vitamineDZonNederlandData,
  vitamineDEnK2SamenData,
  vitamineDHogeDosesSocialMediaData,
  vitamineDMetenWanneerZinvolData,
  vitamineDSeizoenenJaarritmeData,
  vitamineDAandoeningenOnderzoekData,
  vitamineDEnSlaapData,
  multivitamineZinvolNa40Data,
  zoutKaliumBloeddrukNa40Data,
  omega3HoeveelPerDagData,
  omega3UitVoedingOfSupplementData,
  algenolieOfVisolieData,
  visolieOxidatieEnBijwerkingenData,
  omega3IndexMetenData,
  omega3EnMedicijnenData,
  omega3EnHartOnderzoekData,
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
