import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs"

export const vitamineDTekortHerkennenData: BlogArtikel = {
  slug: "vitamine-d-tekort-herkennen",
  categorie: "energie",
  titel: "Vitamine D-tekort: herken je de signalen?",
  coverImage: "/images/blog/vitamine-d-tekort-herkennen.jpg",
  coverImageAlt: "Zonlicht over een groen natuurlandschap",
  heroIntro:
    "Vermoeidheid, spierzwakte, vaker ziek — het passen allemaal bij [vitamine D-tekort](/kennisbank/vitamine-d), maar ze zijn niet specifiek. Zo zet je signalen in context en wat je vervolgens praktisch kunt doen als man boven de 30.",
  leestijd: "9 min",
  gepubliceerdOp: "2026-03-10",
  laatstBijgewerktOp: "2026-09-01",
  secties: [
    {
      type: "tekst",
      titel: "Waarom tekort zo vaak over het hoofd wordt gezien",
      tekst:
        "[Beste vitamine D-supplementen](/beste/vitamine-d) kies je pas zinvol na meten; het hormoon zelf ontstaat in de huid bij UVB-blootstelling en reguleert de aanmaak van honderden eiwitten — van calciumhuishouding tot immuunfunctie. In Nederland is blootstelling aan zon in de winter onvoldoende voor veel mensen; donkere huid en binnenwerk versterken dat. Klachten zijn vaak vaag, waardoor andere oorzaken eerst worden overwogen en tekort later in beeld kan komen.",
    },
    {
      type: "opsomming",
      titel: "Signalen die wél aanleiding zijn om te meten",
      inleiding:
        "Geen van deze klachten is specifiek voor vitamine D — ze passen bij tientallen oorzaken. Ze zijn een reden om te meten, niet om te concluderen.",
      items: [
        "Aanhoudende vermoeidheid ondanks redelijke slaap.",
        "Spierzwakte of sneller spiervermoeidheid dan je gewend bent.",
        "Spierpijn of spierkrampen zonder duidelijke aanleiding, en bij ernstiger tekort bot- of gewrichtspijn (vaak onderrug, bekken, benen).",
        "Vaker luchtweginfecties in het seizoen waarin je weinig buiten komt.",
        "Somberheid of lusteloosheid in het winterhalfjaar — met het uitdrukkelijke voorbehoud hieronder.",
        "Botklachten in combinatie met risicofactoren (weinig zon, oudere leeftijd, absorptiestoornissen).",
      ],
      callouts: [
        {
          variant: "letop",
          tekst:
            "Deze lijst is bedoeld om te bepalen of meten zinvol is. Herkenning is geen diagnose: dezelfde klachten passen bij schildklierproblemen, bloedarmoede, slaaptekort, depressie en nog veel meer. Aanhoudende klachten horen bij de huisarts.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Waarom de spierklachten er wél uitspringen",
      bewijsNiveau: "redelijk",
      tekst:
        "Van alle klachten in de lijst hierboven heeft de spierkant de sterkste onderbouwing. Vitamine D speelt een rol in de spierfunctie, en het is een van de weinige terreinen waar de EU een claim heeft toegelaten: vitamine D draagt bij tot de instandhouding van een normale spierfunctie. Bij een uitgesproken tekort is spierzwakte — vooral in de bovenbenen en heupen, merkbaar bij traplopen of opstaan uit een stoel — een bekend en herkenbaar beeld.\n\nBij een ernstig en langdurig tekort kan osteomalacie ontstaan: verweking van het botweefsel, met diffuse bot- en spierpijn. Dat is een medisch beeld dat door een arts wordt vastgesteld, geen zelfherkenning.",
    },
    {
      type: "tekst",
      titel: "Stemming: het klopt minder goed dan het voelt",
      bewijsNiveau: "beperkt",
      tekst:
        "Somberheid staat op elke online symptomenlijst, en de associatie is echt gevonden: mensen met lagere waarden rapporteren vaker sombere klachten. Maar trials waarin vitamine D wordt gegeven om stemming te verbeteren, laten bij mensen zonder aangetoond tekort doorgaans weinig tot geen effect zien.\n\nDe verklaring ligt waarschijnlijk in wat beide veroorzaakt: in de winter kom je minder buiten, krijg je minder daglicht, beweeg je minder en zie je minder mensen. Dat drukt je stemming én je vitamine D-waarde, zonder dat het een het ander veroorzaakt. Hetzelfde patroon bespreken we voor andere aandoeningen in [vitamine D en schildklier, diabetes en duizeligheid](/blog/vitamine-d-aandoeningen-onderzoek) en voor de seizoenen in [vitamine D door het jaar heen](/blog/vitamine-d-seizoenen-jaarritme).",
      bewijsKanttekening:
        "Onderzoek naar vitamine D en stemming is heterogeen en wordt bemoeilijkt door omgekeerde causaliteit. Lees dit als 'niet aangetoond', niet als 'weerlegd' — en bespreek aanhoudende somberheid met je huisarts.",
    },
    {
      type: "tekst",
      titel: "Wat meten betekent",
      tekst:
        "De standaardtest is 25-hydroxyvitamine D in bloed. Interpretatie hangt af van referentiewaarden van het lab; bespreek uitslagen met je arts. Let op de eenheid: nmol/l en ng/ml schelen een factor 2,5. Wanneer meten iets toevoegt en hoe je een uitslag leest, staat in [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol). Suppletie is veilig binnen gangbare doseringen, maar extreem hoge doses op eigen houtje zijn niet nodig en kunnen bijwerkingen geven — zie [hoge doses vitamine D](/blog/vitamine-d-hoge-doses-social-media). Vitamine K2 wordt vaak met D3 gecombineerd; wat daar wel en niet over geclaimd mag worden staat in [vitamine D en K2 samen](/blog/vitamine-d-en-k2-samen).",
    },
  ],
  samenvatting:
    "Vitamine D-tekort gaat vaak gepaard met vage klachten; aanhoudende vermoeidheid en spierzwakte zijn redenen om 25-OH-D te laten meten. Van alle signalen heeft de spierkant de sterkste onderbouwing — bij stemming is de samenhang waarschijnlijk vooral een gedeelde winteroorzaak. Bij vastgesteld tekort kan suppletie onder begeleiding zinvol zijn; laat je niet verleiden tot hoge doses zonder monitoring.",
  supplementCTA: {
    naam: "Vitamine D",
    uitleg:
      "D3, K2 en wat je op het etiket wilt zien — praktische keuzehulp na 30.",
    href: "/supplementen/vitamine-d",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 30",
    href: "/energie-na-40",
  },
  supplementenHubLink: {
    label: "Alle supplementen langs dezelfde meetlat",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "vitamine-d-meten-wanneer-zinvol",
    "vitamine-d-zon-nederland",
    "energie-verhogen-natuurlijk",
  ],
  kernpunten: [
    "Geen enkele klacht is specifiek voor vitamine D — ze zijn reden om te meten, niet om te concluderen.",
    "Spierzwakte in bovenbenen en heupen is het best onderbouwde signaal.",
    "Vitamine D heeft een toegelaten EU-claim op normale spierfunctie.",
    "Bij stemming is de samenhang waarschijnlijk een gedeelde winteroorzaak.",
    "Aanhoudende klachten horen bij de huisarts, niet bij een symptomenlijst.",
  ],
  metaTitle:
    "Vitamine D-tekort herkennen: signalen en testen",
  metaDescription:
    "Hoe herken je vitamine D-tekort? Vermoeidheid, spieren, immuun — en waarom meten slimmer is dan gokken met hoge doses.",
  keywords: [
    "vitamine d tekort",
    "vitamine d vermoeidheid",
    "vitamine d tekort symptomen",
    "vitamine d spierpijn",
    "vitamine d somber",
    "25-OH vitamine d",
    "vitamine d mannen",
  ],
  referenties: toRefs([
    "Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.",
    "Ross AC et al. Dietary Reference Intakes calcium vitamin D Institute Medicine US 2011 report context.",
    "Bouillon R. Comparative analysis nutritional guidelines vitamin D Endocr Connect guideline synthesis context.",
    "Aranow C. Vitamin D immune function clinical disease J Investig Med vitamin D physiology beyond bone.",
    "EFSA Vitamin D authorised health claims bone teeth muscle immune EU register dossier reference.",
    "Amrein K et al. Vitamin D deficiency 2 revisiting supplementation critical care contexts broader clinical supplementation evidence.",
    "Beaudart C, Buckinx F, Rabenda V, et al. The effects of vitamin D on skeletal muscle strength, muscle mass, and muscle power: a systematic review and meta-analysis of randomized controlled trials. J Clin Endocrinol Metab. 2014;99(11):4336-4345.",
    "Gowda U, Mutowo MP, Smith BJ, Wluka AE, Renzaho AM. Vitamin D supplementation to reduce depression in adults: meta-analysis of randomized controlled trials. Nutrition. 2015;31(3):421-429.",
    "Uday S, Hogler W. Nutritional rickets and osteomalacia in the twenty-first century: revised concepts, public health, and prevention strategies. Curr Osteoporos Rep. 2017;15(4):293-302.",
  ]),
};
