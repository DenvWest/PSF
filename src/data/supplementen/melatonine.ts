import type { SupplementData } from "@/types/supplementen";

export const melatonineData: SupplementData = {
  slug: "melatonine",
  naam: "Melatonine",
  metaTitle: "Melatonine voor mannen 40+ | Dosering, vormen & wanneer stoppen | PerfectSupplement",
  metaDescription:
    "Lage dosis of slow-release? Wanneer gebruik je melatonine — en wanneer juist niet? Praktisch advies voor mannen boven de 40.",
  h1: "Melatonine: minder is meer",
  introTekst:
    "Melatonine is je slaaphormoon — maar het is geen slaapmiddel. Het geeft je lichaam een tijdssignaal: het is nacht. Slim gebruik versterkt je circadiaans ritme. Verkeerd gebruik verstoort het juist.",

  watIsHet: {
    titel: "Wat doet melatonine in je lichaam?",
    tekst:
      "Melatonine wordt aangemaakt in je pijnappelklier zodra het donker wordt — het is het signaal dat je slaap-waakcyclus in gang zet. Het reguleert het tijdstip van slapen, niet de diepte ervan. Na je 40e neemt de melatonineproductie geleidelijk af: de piek wordt lager en later in de avond bereikt. Dit kan verklaren waarom je moeilijker in slaap valt, eerder wakker wordt of je slaap minder verkwikkend aanvoelt.",
  },

  waaromRelevant: {
    titel: "Waarom is melatonine relevant na je 40e?",
    punten: [
      {
        titel: "Slaapinitiatie",
        uitleg:
          "Een lage dosis melatonine op het juiste tijdstip verkort de inslaapduur — met name bij mensen die later dan gewenst moe worden.",
      },
      {
        titel: "Circadiaans ritme herstellen",
        uitleg:
          "Onregelmatige slaaptijden, ploegendienst of veel beeldschermgebruik verstoren je ritme. Melatonine helpt het opnieuw in te stellen.",
      },
      {
        titel: "Jetlag",
        uitleg:
          "De meest bewezen toepassing van melatonine: het herstelt je slaap-waakcyclus na tijdzoneverandering significant sneller.",
      },
      {
        titel: "Leeftijdsgerelateerde daling",
        uitleg:
          "Mannen boven de 40 maken aantoonbaar minder melatonine aan. Lage suppletie kan dit compenseren zonder het eigen systeem te onderdrukken.",
      },
    ],
  },

  vormenDosering: {
    titel: "Laaggedoseerd of slow-release?",
    vormen: [
      {
        naam: "Laaggedoseerd (0,3–0,5 mg) — direct werkend",
        geschiktVoor: "Slaapinitiatie, circadiaans ritme instellen",
        dosering: "0,3–0,5 mg, 30–60 minuten voor gewenste slaaptijd",
        opmerking:
          "Studies tonen dat 0,3 mg even effectief is als hogere doses voor slaapinitiatie, met minder kans op sufheid 's ochtends. Begin laag.",
      },
      {
        naam: "Standaard (1–3 mg) — direct werkend",
        geschiktVoor: "Jetlag, incidenteel slaapprobleem",
        dosering: "1–3 mg, 30–60 minuten voor het slapen",
        opmerking:
          "Breed verkrijgbaar. Hogere doses geven geen beter effect op slaapkwaliteit — ze verlengen alleen de melatoninespiegel in het bloed.",
      },
      {
        naam: "Slow-release melatonine",
        geschiktVoor: "Doorslaapproblemen, vroeg wakker worden",
        dosering: "2 mg slow-release, 1–2 uur voor het slapen",
        opmerking:
          "Geeft een geleidelijker melatonineniveau door de nacht. Nuttig als je niet het inslapen maar het doorslapen als probleem ervaart.",
      },
    ],
    disclaimer:
      "Melatonine is bedoeld voor kortstondig gebruik of specifieke situaties zoals jetlag. Langdurig dagelijks gebruik zonder begeleiding wordt niet aanbevolen. Raadpleeg een arts als slaapproblemen aanhouden.",
  },

  waarOpLetten: {
    titel: "Waar let je op bij het kiezen?",
    criteria: [
      {
        criterium: "Begin met de laagste effectieve dosis",
        uitleg:
          "0,3–0,5 mg is voor de meeste mensen voldoende. Hogere doses geven geen betere slaap maar wel meer kans op sufheid en het verstoren van je eigen ritme.",
      },
      {
        criterium: "Timing is alles",
        uitleg:
          "Neem melatonine 30–60 minuten voor je gewenste slaaptijd, in een donkere ruimte. Gebruik het consequent op hetzelfde tijdstip voor het beste effect.",
      },
      {
        criterium: "Direct vs slow-release afhankelijk van probleem",
        uitleg:
          "Moeite met inslapen → direct werkend. Moeite met doorslapen of te vroeg wakker → slow-release. Beide aanpakken tegelijk? Overleg dan met een arts.",
      },
      {
        criterium: "Niet voor langdurig dagelijks gebruik",
        uitleg:
          "Melatonine is geen slaappil voor elke nacht. Langdurig gebruik kan je eigen productie onderdrukken. Gebruik het gericht: jetlag, ritmeverstoringen, tijdelijke slaapproblemen.",
      },
    ],
  },

  gerelateerdeSymptomen: {
    titel: "Melatonine bij jouw klachten",
    links: [
      {
        symptoom: "Slaap",
        tekst:
          "Melatonine is het meest direct werkzame supplement bij slaapinitiatieproblemen en circadiane ritmeverstoringen.",
        href: "/symptomen/slaap/oplossingen",
      },
    ],
  },

  faq: [
    {
      vraag: "Went je aan melatonine?",
      antwoord:
        "Bij de lage doses die aanbevolen worden (0,3–1 mg) is gewenning niet aangetoond. Bij hogere doses of dagelijks gebruik kan je eigen melatonineproductie minder worden gestimuleerd. Dit is een reden om laag te doseren en niet structureel te gebruiken.",
    },
    {
      vraag: "Mag ik melatonine combineren met andere supplementen?",
      antwoord:
        "Met magnesium glycinaat werkt melatonine complementair — magnesium bevordert ontspanning, melatonine geeft het tijdssignaal. Combineer niet met alcohol of slaapbevorderende medicatie zonder advies van een arts.",
    },
    {
      vraag: "Wanneer stop ik met melatonine?",
      antwoord:
        "Stop als het probleem is opgelost of als je het 4 weken aaneengesloten gebruikt hebt. Evalueer dan of je slaap verbeterd is en of je lichaam het ritme zelf kan vasthouden. Bij aanhoudende slaapproblemen: raadpleeg een arts.",
    },
    {
      vraag: "Helpt melatonine ook bij slaapkwaliteit (diepte)?",
      antwoord:
        "Melatonine verbetert primair de timing van slaap, niet de diepte. Voor diepe slaap zijn magnesium, stressreductie en slaaphygiëne effectiever. Gebruik melatonine niet als vervanging van die basis.",
    },
  ],

  blogLinks: [
    {
      href: "/blog/melatonine-wanneer-wel-niet",
      titel: "Melatonine: wanneer wel en wanneer niet?",
    },
    {
      href: "/blog/slaaphygiene-mannen-40-plus",
      titel: "Slaaphygiëne: wat wél werkt na je 40e",
    },
  ],
};
