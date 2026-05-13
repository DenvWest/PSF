import type { SupplementData } from "@/types/supplementen";

export const omega3Data: SupplementData = {
  slug: "omega-3",
  naam: "Omega-3",
  metaTitle: "Omega-3: Welke Vorm Past Bij Jou? | PerfectSupplement",
  metaDescription:
    "Omega-3 uitgelegd: vormen, dosering en bij welke klachten. Objectief en onafhankelijk.",
  datePublished: "2026-03-01",
  h1: "Omega-3: welke vorm past bij jou?",
  introTekst:
    "Omega-3 vetzuren zijn essentieel — je lichaam maakt ze niet zelf aan. EPA en DHA ondersteunen je hersenen, hart en ontstekingsbalans. Na je 40e worden deze functies steeds relevanter, terwijl de meeste mannen structureel te weinig omega-3 binnenkrijgen.",

  watIsHet: {
    titel: "Wat doet omega-3 in je lichaam?",
    tekst:
      "Omega-3 is een verzamelnaam voor meervoudig onverzadigde vetzuren. De twee werkzame vormen zijn [EPA en DHA](/kennisbank/epa-dha) (eicosapentaeenzuur en docosahexaeenzuur). Ze bouwen zich in in celmembraan van zenuwcellen en weefsels waar signaaltransductie plaatsvindt: EPA heeft vooral naam in ontstekings- en stemmingmodellering; DHA is de dominante meer-onverzadigde vetzuurketen in grijze stof en netvlies — vandaar de nadruk op cognitie en visus in richtlijnen. ALA uit lijnzaad of walnoten is een plantaardige voorloper maar wordt maar beperkt (<10%) omgezet naar EPA/DHA bij de meeste volwassenen — niet voldoende om op te vertrouwen als enige bron als je zo weinig vis eet als de gemiddelde man 40+. Met de leeftijd neemt de cardiovasculaire ‘ruis’ en oxidatieve spanning toe; stabiele omega-3-inname wordt daardoor praktischer relevant, los van elk marketingverhaal over ‘superhersenen’.",
  },

  waaromRelevant: {
    titel: "Waarom is omega-3 belangrijk na je 40e?",
    punten: [
      {
        titel: "Ontstekingsremming",
        uitleg:
          "Chronische laaggradige ontsteking neemt toe met leeftijd en wordt gelinkt aan vermoeidheid, stemmingsproblemen en cardiovasculaire risico's. EPA helpt dit te moduleren.",
      },
      {
        titel: "Hersenwerking & concentratie",
        uitleg:
          "DHA is de primaire structurele bouwsteen van hersencellen. Voldoende DHA is geassocieerd met betere concentratie en trager cognitief verval.",
      },
      {
        titel: "Stemming & stressbestendigheid",
        uitleg:
          "EPA heeft een aantoonbaar effect op stemming. Studies tonen dat hogere EPA-inname gepaard gaat met minder symptomen van angst en somberheid.",
      },
      {
        titel: "Cardiovasculaire gezondheid",
        uitleg:
          "Omega-3 verlaagt triglyceriden en ondersteunt een gezonde bloeddruk — twee risicofactoren die na de 40 vaker de kop opsteken.",
      },
    ],
  },

  vormenDosering: {
    titel: "Welke vorm omega-3 kies je?",
    vormen: [
      {
        naam: "Visolie (EPA + DHA)",
        geschiktVoor: "Algemeen gebruik — meest onderzocht",
        dosering: "1.000–2.000 mg EPA+DHA per dag (niet totale visolie)",
        opmerking:
          "Let op de EPA/DHA-verhouding op het etiket, niet het totale visoliegehalte. Voor stemmings- en stressondersteuning: hogere EPA-ratio (≥2:1 EPA:DHA).",
      },
      {
        naam: "Algenolie (plantaardig DHA+EPA)",
        geschiktVoor: "Plantaardige optie — zelfde werking als visolie",
        dosering: "500–1.000 mg DHA+EPA per dag",
        opmerking:
          "Vissen bevatten omega-3 juist omdat ze algen eten. Algenolie slaat de tussenstap over. Goed alternatief voor wie geen vis eet of visbijsmaak wil vermijden.",
      },
      {
        naam: "Krillolie",
        geschiktVoor: "Hogere biobeschikbaarheid, lagere dosis",
        dosering: "500–1.000 mg krillolie per dag",
        opmerking:
          "EPA en DHA zijn gebonden aan fosfolipiden, wat opname mogelijk verbetert. Bevat ook astaxanthine (antioxidant). Duurder per gram EPA/DHA.",
      },
    ],
    disclaimer:
      "Dit is informatief bedoeld en geen medisch advies. Bij gebruik van bloedverdunners of hoge doseringen: raadpleeg altijd je arts.",
  },

  waarOpLetten: {
    titel: "Waar let je op bij het kiezen?",
    criteria: [
      {
        criterium: "EPA + DHA gehalte, niet totale visolie",
        uitleg:
          "Een capsule van 1.000 mg visolie kan slechts 300 mg EPA+DHA bevatten. Check altijd het gecombineerde EPA+DHA-gehalte op het etiket.",
      },
      {
        criterium: "Versheid & ranzigheid",
        uitleg:
          "Geoxideerde visolie is minder effectief en kan schadelijk zijn. Kies producten met TOTOX-waarde <10 of met een certificering (IFOS, Friends of the Sea). Frisse geur = goed teken.",
      },
      {
        criterium: "Triglyceride- vs ethylestervorm",
        uitleg:
          "Triglyceridevorm heeft een iets betere opname. Ethylester is goedkoper en ook effectief, maar neem het bij voorkeur bij een maaltijd met vet voor optimale opname.",
      },
      {
        criterium: "Duurzaamheid & herkomst",
        uitleg:
          "MSC-certificering of kleinere vissoorten (sardines, ansjovis, makreel) zijn meer duurzame keuzes dan grotere roofvissen.",
      },
    ],
  },

  gerelateerdeSymptomen: {
    titel: "Omega-3 bij jouw klachten",
    links: [
      {
        symptoom: "Stress",
        tekst:
          "EPA moduleert ontstekingsreacties die bij chronische stress verhoogd zijn, en ondersteunt stemmingsstabiliteit.",
        href: "/thema/stress",
      },
      {
        symptoom: "Energie",
        tekst:
          "DHA ondersteunt hersenfunctie en concentratie overdag — twee pijlers van mentale energie.",
        href: "/thema/energie",
      },
      {
        symptoom: "Slaap",
        tekst:
          "Door ontstekingsbalans en hersenondersteuning draagt DHA indirect bij aan rust en herstel ’s nachts — naast je baseline slaaphygiëne.",
        href: "/thema/slaap",
      },
    ],
  },

  faq: [
    {
      vraag: "Kan ik omega-3 combineren met andere supplementen?",
      antwoord:
        "Ja. Omega-3 met vitamine D (beide vetoplosbaar, bij voorkeur met een maaltijd met vet), met magnesium voor ontspanning, of met multivitaminen is gangbaar. Hoge omega-3-doses kunnen de bloedingstijd subtiel beïnvloeden; bij vitamine-K-antagonisten of bloedverdunners eerst arts raadplegen.",
    },
    {
      vraag: "Hoeveel EPA versus DHA heb ik nodig?",
      antwoord:
        "Voor algemene gezondheid is een verhouding van roughly 1:1 goed. Voor stemming en stress kies je een hogere EPA-ratio (2:1 of meer). Voor hersenfunctie en ogen juist meer DHA.",
    },
    {
      vraag: "Is plantaardige omega-3 (ALA) genoeg?",
      antwoord:
        "Nee, niet als vervanging. ALA uit lijnzaad of walnoten wordt voor slechts 5–10% omgezet naar EPA en DHA. Voor de werkzame vormen heb je visolie of algenolie nodig.",
    },
    {
      vraag: "Hoe herken ik ranzig visoliesupplement?",
      antwoord:
        "Ranzig visolie ruikt sterk naar vis of heeft een bittere smaak. Goede visolie ruikt mild of zelfs licht citroenachtig. Bewaar het donker en koel. IFOS-gecertificeerde producten worden getest op ranzigheid.",
    },
    {
      vraag: "Wanneer merk ik effect?",
      antwoord:
        "Voor stemming en ontstekingsmarkers: 4–8 weken bij consistente inname. Cardiovasculaire effecten (triglyceriden) zijn meetbaar na 8–12 weken.",
    },
  ],

  blogLinks: [
    {
      href: "/blog/omega-3-concentratie-energie",
      titel: "Omega-3 en concentratie: wat zegt het onderzoek?",
    },
    {
      href: "/waar-let-je-op-bij-omega-3",
      titel: "Waar let je op bij omega-3?",
    },
    {
      href: "/supplement-kiezen-waar-op-letten",
      titel: "Supplement kiezen: waar op letten?",
    },
  ],

  productVergelijkingCta: {
    titel: "Welke omega-3 scoort het beste?",
    href: "/beste/omega-3-supplement",
    linkLabel: "Bekijk de vergelijking →",
  },
};
