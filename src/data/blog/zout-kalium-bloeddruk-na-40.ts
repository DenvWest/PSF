import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const zoutKaliumBloeddrukNa40Data: BlogArtikel = {
  slug: "zout-kalium-bloeddruk-na-40",
  categorie: "energie",
  titel: "Zout en kalium: waarom de verhouding telt, niet het zoutvaatje",
  coverImage: "/images/blog/zout-kalium-bloeddruk-na-40.jpg",
  coverImageAlt: "Verse groenten en kruiden, rijk aan kalium",
  heroIntro:
    "Nederlandse mannen zitten structureel boven de aanbevolen 6 gram zout per dag — meer dan vrouwen, blijkt uit RIVM-onderzoek. Tegelijk krijgt bijna niemand genoeg kalium binnen. Dat is geen toeval: het zijn twee kanten van dezelfde [kalium-natriumbalans](/kennisbank/kalium-natrium-balans), en die stuurt mee op je bloeddruk. Dit artikel legt uit waar het misgaat, waarom het antwoord in je voeding zit en niet in een supplement, en hoe dat aansluit bij [energie na 30](/energie-na-40).",
  leestijd: "8 min",
  gepubliceerdOp: "2026-09-02",
  laatstBijgewerktOp: "2026-09-02",
  secties: [
    {
      type: "tekst",
      titel: "Twee tekorten die bij elkaar horen",
      tekst:
        "Zout te veel, kalium te weinig — bij de meeste Nederlandse mannen 30+ spelen beide tegelijk. Dat is meer dan toeval. Natrium (uit zout) en kalium sturen samen de vochtbalans en de spanning op je vaatwand, maar in tegengestelde richting. Kijk je naar maar één kant van die balans, dan mis je de helft van het verhaal.",
    },
    {
      type: "tekst",
      titel: "Hoe kalium en natrium tegen elkaar inwerken",
      tekst:
        "Natrium houdt vocht vast in je bloedbaan; te veel verhoogt de druk op de vaatwand. Kalium doet het tegenovergestelde: het helpt je nieren natrium af te voeren en ontspant de vaatwand. RIVM-onderzoek (rapport 2023-0373) laat zien dat Nederlandse mannen structureel boven de 6 gram zout per dag zitten. De Gezondheidsraad-richtlijn voor kalium wordt door het overgrote deel juist niet gehaald. Eén interventie — meer onbewerkt, plantaardig eten — werkt op beide assen tegelijk.",
    },
    {
      type: "tekst",
      titel: "Waar het vandaan komt (en waar niet)",
      tekst:
        "Het grootste deel van je zoutinname komt niet uit het zoutvaatje aan tafel, maar uit brood, vleeswaren, kaas en kant-en-klare producten. Kalium zit juist in het rijtje dat je al kent uit de Schijf van Vijf: peulvruchten, groente, banaan, avocado en aardappel. Je hoeft geen van beide apart bij te houden — vaker kiezen voor onbewerkt en plantaardig duwt de verhouding automatisch de goede kant op.",
    },
    {
      type: "opsomming",
      titel: "Praktisch: de verhouding bijsturen zonder tellen",
      items: [
        "Vervang één bewerkt product per dag door een onbewerkt alternatief — vers vlees in plaats van vleeswaren, zelfgemaakte saus in plaats van kant-en-klaar.",
        "Bouw dagelijks een kaliumbron in: een handvol peulvruchten, een banaan, avocado of aardappel met schil.",
        "Check het etiket op natrium per 100 gram bij brood en kaas — de verschillen tussen merken zijn groter dan je zou verwachten.",
        "Zout bijkoken mag; het probleem zit vrijwel nooit bij het zoutvaatje zelf.",
      ],
    },
    {
      type: "tekst",
      titel: "Wat dit niet is",
      tekst:
        "Dit is geen bloeddrukmeting en geen hypertensie-advies — dat hoort bij de huisarts, niet bij een leefstijlartikel. Het is ook geen pleidooi voor elektrolytenpoeders of kalium-/natriumsupplementen: die vervangen geen voedingspatroon en horen niet bij wat wij aanbevelen. Lees meer over de onderliggende mechanismen bij [kalium-natriumbalans](/kennisbank/kalium-natrium-balans).",
    },
    {
      type: "tekst",
      titel: "Turbo: waar voeding in je bredere leefstijlprofiel past",
      tekst:
        "Zout en kalium zijn één van de voedingsfactoren die meespelen in je bredere energie- en herstelprofiel. In de [Leefstijlcheck](/intake) zie je hoe voeding samenkomt met slaap, stress en beweging — zonder dat je losse nutriënten hoeft bij te houden.",
    },
  ],
  samenvatting:
    "Nederlandse mannen zitten structureel boven de aanbevolen zoutinname en onder de kaliumaanbeveling — twee kanten van dezelfde balans die meespeelt in je bloeddruk. De oplossing zit in minder bewerkt en meer plantaardig eten, niet in een supplement.",
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 30",
    href: "/energie-na-40",
  },
  gerelateerdeSluggen: [
    "middagdip-bloedsuiker-na-40",
    "eiwit-na-40",
    "vitamine-d-en-energie",
  ],
  metaTitle: "Zout en kalium: de balans die je bloeddruk stuurt",
  metaDescription:
    "Nederlandse mannen eten te veel zout en te weinig kalium. Waarom de verhouding telt, waar de bronnen zitten en waarom dit geen supplement-vraag is.",
  keywords: [
    "minder zout eten tips",
    "hoeveel zout per dag",
    "kalium natrium balans",
    "zout bloeddruk mannen",
    "kalium voeding bronnen",
  ],
  referenties: toRefs([
    "RIVM. Natrium-, kalium- en jodiumonderzoek in Nederland. Rapport 2023-0373.",
    "Voedingscentrum. Richtlijn zoutinname: maximaal 6 gram per dag binnen de Schijf van Vijf.",
    "Gezondheidsraad. Richtlijn kaliuminname Nederlandse bevolking.",
    "EFSA NDA Panel. Dietary reference values for potassium. EFSA Journal. Adequate intake 3500 mg/dag volwassenen.",
    "Filippini T et al. Blood pressure effects of sodium reduction: dose-response meta-analysis of experimental studies. Circulation. 2021;143(16):1542-1567.",
    "Neal B et al. Effect of salt substitution on cardiovascular events and death. N Engl J Med. 2021;385(12):1067-1077.",
  ]),
};
