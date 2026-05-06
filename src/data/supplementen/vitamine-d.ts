import type { SupplementData } from "@/types/supplementen";

export const vitamineDData: SupplementData = {
  slug: "vitamine-d",
  naam: "Vitamine D",
  metaTitle:
    "Vitamine D: Welke Vorm Past Bij Jou? | PerfectSupplement",
  metaDescription:
    "Vitamine D uitgelegd: vormen, dosering en bij welke klachten. Objectief en onafhankelijk.",
  datePublished: "2026-03-01",
  h1: "Vitamine D: waarom D3 + K2 samen?",
  introTekst:
    "Vitamine D is strikt genomen een hormoon, geen vitamine. Het beïnvloedt energie, immuunsysteem, stemming en testosteron — en een tekort is bij mannen boven de 40 verrassend gewoon, ook in landen met regelmatig zonlicht.",

  watIsHet: {
    titel: "Wat doet vitamine D in je lichaam?",
    tekst:
      "Vitamine D wordt aangemaakt in je huid bij blootstelling aan UVB-straling van de zon. Het fungeert als hormoon dat honderden genen reguleert — van calcium-opname tot immuunrespons tot de aanmaak van testosteron. Op supplementetiketten zie je doses vaak als percentage van de [ADH (aanbevolen dagelijkse hoeveelheid)](/kennisbank/adh) — een referentieminimum, geen persoonlijk optimum. Na je 40e daalt de aanmaakcapaciteit van je huid, terwijl je tegelijkertijd minder buiten bent en meer binnen werkt. Het resultaat: veel mannen hebben een tekort zonder het te weten. Vitamine K2 is de partner van D3: het zorgt dat calcium naar botten gaat in plaats van aderkalking te veroorzaken.",
  },

  waaromRelevant: {
    titel: "Waarom is vitamine D zo relevant na je 40e?",
    punten: [
      {
        titel: "Vermoeidheid bij tekort",
        uitleg:
          "Vitamine D draagt bij aan een normaal energieleverend metabolisme. Aanhoudende vermoeidheid is een veelvoorkomend signaal van een vitamine D-tekort.",
      },
      {
        titel: "Testosteronondersteuning",
        uitleg:
          "Studies tonen een significante associatie tussen vitamine D-waarden en testosteronniveaus bij mannen. Suppletie bij een tekort kan testosteron meetbaar verhogen.",
      },
      {
        titel: "Stemming & mentale gezondheid",
        uitleg:
          "Vitamine D speelt een rol bij de aanmaak van serotonine. Een tekort wordt geassocieerd met verhoogd risico op somberheid, prikkelbaarheid en slaperige buien.",
      },
      {
        titel: "Immuunsysteem",
        uitleg:
          "Vitamine D moduleert de immuunrespons — zowel bij infecties als bij chronische ontsteking. Lage waarden hangen samen met hogere vatbaarheid en trager herstel.",
      },
    ],
  },

  vormenDosering: {
    titel: "D3 met K2: hoe en hoeveel?",
    vormen: [
      {
        naam: "Vitamine D3 + K2 (MK-7) — capsule",
        geschiktVoor: "Dagelijks tekort aanvullen",
        dosering: "1.000–2.000 IE D3 + 75–200 mcg K2 per dag",
        opmerking:
          "MK-7 is de langwerkende vorm van K2. Combinatieproducten zijn handig. Neem met een maaltijd die vet bevat — D3 is vetoplosbaar.",
      },
      {
        naam: "Vitamine D3 druppels",
        geschiktVoor: "Flexibele dosering of hogere doseringen",
        dosering: "Startdosis afhankelijk van bloedwaarden (bepaal via test)",
        opmerking:
          "Makkelijk aan te passen. Voeg K2 apart toe als de druppels dit niet bevatten. Let op: hoge doseringen (>4.000 IE) alleen op basis van een bloedtest.",
      },
      {
        naam: "D3 alleen (zonder K2)",
        geschiktVoor: "Tijdelijk of als je al K2 via voeding binnenkrijgt",
        dosering: "1.000–2.000 IE per dag",
        opmerking:
          "Functioneel, maar bij hogere doseringen of langdurig gebruik is K2-toevoeging verstandig vanwege calcium-regulatie.",
      },
    ],
    disclaimer:
      "Dit is informatief bedoeld en geen medisch advies. Bij twijfel over dosering: laat eerst je vitamine D-waarden meten via een bloedtest bij je huisarts. Overdosering is mogelijk bij langdurig hoge doseringen.",
  },

  waarOpLetten: {
    titel: "Waar let je op bij het kiezen?",
    criteria: [
      {
        criterium: "D3, niet D2",
        uitleg:
          "Vitamine D3 (cholecalciferol) verhoogt bloedwaarden effectiever dan D2 (ergocalciferol). Check het etiket.",
      },
      {
        criterium: "K2 als MK-7",
        uitleg:
          "MK-7 (menaquinon-7) heeft een langere halfwaardetijd dan MK-4 en werkt beter bij lagere dagelijkse doses. Combineer met D3.",
      },
      {
        criterium: "Vetoplosbaar — innemen met vet",
        uitleg:
          "D3 heeft vet nodig voor opname. Neem het bij je grootste maaltijd of met een lepel noten/avocado voor optimale absorptie.",
      },
      {
        criterium: "Dosering afstemmen op bloedwaarden",
        uitleg:
          "Zonder meting is 1.000–2.000 IE per dag voor de meeste mannen veilig. Bij bewezen tekort kan een arts hogere doses adviseren. Meet na 3 maanden suppletie opnieuw.",
      },
    ],
  },

  gerelateerdeSymptomen: {
    titel: "Vitamine D bij jouw klachten",
    links: [
      {
        symptoom: "Energie",
        tekst:
          "Een vitamine D-tekort is een van de meest over het hoofd geziene oorzaken van aanhoudende vermoeidheid bij mannen 40+.",
        href: "/thema/energie",
      },
      {
        symptoom: "Stress",
        tekst:
          "Vitamine D ondersteunt testosteronproductie en immuunregulatie — beiden relevant bij chronische stress en uitputting.",
        href: "/thema/stress",
      },
      {
        symptoom: "Slaap",
        tekst:
          "Een tekort gaat gepaard met vermoeidheid en prikkelbare buiendips; herstel van waarden sluit aan bij beter herstel overdag en rustiger avonden.",
        href: "/thema/slaap",
      },
    ],
  },

  faq: [
    {
      vraag: "Hoeveel vitamine D per dag?",
      antwoord:
        "Voor de meeste mannen boven de 40 is 1.000–2.000 IE per dag een veilige dagelijkse onderhoudsdosis. Bij een bewezen tekort (bloedwaarde <50 nmol/L) kan een arts tijdelijk hogere doses adviseren.",
    },
    {
      vraag: "Hoe weet ik of ik een tekort heb?",
      antwoord:
        "Via een eenvoudige bloedtest bij je huisarts (25-OH vitamine D). Streefwaarde is 75–125 nmol/L. In Nederland heeft naar schatting 40–50% van de volwassenen een tekort, met name in de winter.",
    },
    {
      vraag: "Kan ik teveel vitamine D innemen?",
      antwoord:
        "Bij doseringen tot 4.000 IE per dag is overdosering voor de meeste mensen onwaarschijnlijk. Langdurig gebruik van hogere doseringen zonder monitoring kan leiden tot hypercalciëmie. Houd je aan aanbevolen doseringen of gebruik het onder begeleiding.",
    },
    {
      vraag: "Waarom wordt D3 vaak met K2 gecombineerd?",
      antwoord:
        "D3 verbetert calciumopname; K2 (vooral MK-7) helpt calcium naar botten en weg van zachte weefsels. Die combinatie is ingestudeerd op lange termijn veiligheid bij suppletie.",
    },
  ],

  blogLinks: [
    {
      href: "/blog/vitamine-d-tekort-herkennen",
      titel: "Vitamine D-tekort herkennen: signalen die mannen negeren",
    },
    {
      href: "/blog/testosteron-en-energie-na-40",
      titel: "Testosteron en energie na 40: wanneer is actie nodig?",
    },
    {
      href: "/blog/energie-verhogen-natuurlijk",
      titel: "Energie verhogen na je 40e: de fysiologie en wat je kunt doen",
    },
  ],

  productVergelijkingCta: {
    titel: "Welke vitamine D scoort het beste?",
    href: "/beste-vitamine-d",
    linkLabel: "Bekijk de vergelijking →",
  },
};
