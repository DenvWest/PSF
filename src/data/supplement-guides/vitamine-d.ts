import type { SupplementData } from "@/types/supplement-guide";

export const vitamineDData: SupplementData = {
  slug: "vitamine-d",
  naam: "Vitamine D",
  metaTitle:
    "Vitamine D: Welke Vorm Past Bij Jou?",
  metaDescription:
    "Vitamine D uitgelegd: vormen, dosering en bij welke klachten. Objectief en onafhankelijk.",
  datePublished: "2026-03-01",
  h1: "Vitamine D: welke vorm past bij jou?",
  introTekst:
    "Vitamine D werkt hormonaal — het beïnvloedt calciumhuishouding, spieren en immuunmodulatie. Combinaties van D3 met K2 (vaak als MK-7) zijn gangbaar na je 30e: ze sluiten aan bij zonlichttekort én bij de wens beide vetoplosbare vitamines in één product te nemen. Tekorten komen veel vaker voor in donkere maanden en bij weinig buitenbeweging — vaak zonder dat je het merkt.",

  watIsHet: {
    titel: "Wat doet vitamine D in je lichaam?",
    tekst:
      "Vitamine D wordt aangemaakt in je huid bij blootstelling aan UVB-straling van de zon. Het fungeert als hormoon dat honderden genen reguleert — van calcium-opname tot immuunrespons. Op supplementetiketten zie je doses vaak als percentage van de [ADH (aanbevolen dagelijkse hoeveelheid)](/kennisbank/adh) — een referentieminimum, geen persoonlijk optimum. Na je 30e daalt de aanmaakcapaciteit van je huid, terwijl je tegelijkertijd minder buiten bent en meer binnen werkt. Het resultaat: veel mannen hebben een tekort zonder het te weten. Vitamine K2 verschijnt vaak naast D3 in combo-producten: vitamine K draagt bij tot de instandhouding van normale botten en tot de normale bloedstolling. De hartclaim voor K2 is door EFSA afgewezen — zie [vitamine K2](/kennisbank/vitamine-k2).",
  },

  waaromRelevant: {
    titel: "Waarom is vitamine D zo belangrijk na je 30e?",
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
    titel: "Welke vorm vitamine D kies je?",
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
          "Functioneel: de erkende vitamine-D-claims gelden ook zonder K2. Een combo is handig als je beide stoffen wilt, geen vereiste.",
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
          "MK-7 (menaquinon-7) heeft een langere halfwaardetijd dan MK-4 en past bij één dosis per dag. Combineer met D3 als je beide in één product wilt — niet omdat D3 zonder K2 'niet werkt'.",
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
          "Een vitamine D-tekort is een van de meest over het hoofd geziene oorzaken van aanhoudende vermoeidheid bij mannen 30+.",
        href: "/gids/energie",
      },
      {
        symptoom: "Stress",
        tekst:
          "Vitamine D ondersteunt testosteronproductie en immuunregulatie — beiden relevant bij chronische stress en uitputting.",
        href: "/gids/stress",
      },
      {
        symptoom: "Slaap",
        tekst:
          "Een tekort gaat gepaard met vermoeidheid en prikkelbare buiendips; herstel van waarden sluit aan bij beter herstel overdag en rustiger avonden.",
        href: "/gids/slaap",
      },
    ],
  },

  faq: [
    {
      vraag: "Hoeveel vitamine D per dag?",
      antwoord:
        "Voor de meeste mannen boven de 30 is 1.000–2.000 IE per dag een veilige dagelijkse onderhoudsdosis. Bij een bewezen tekort (bloedwaarde <50 nmol/L) kan een arts tijdelijk hogere doses adviseren.",
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
      vraag: "Kan ik vitamine D combineren met andere supplementen?",
      antwoord:
        "Ja, vaak wordt D3 bij een maaltijd met vet ingenomen samen met K2 zoals beschreven op het etiket. Magnesium ondersteunt de omzetting van vitamine D naar de actieve vorm — een nuttige context naast zonlichtgedrag — maar hoeft niet op dezelfde minuut. Bij gelijktijdige ijzer-/calciumsuppletie: hou wat ruimte tussen innames voor opname-competitie.",
    },
    {
      vraag: "Waarom wordt D3 vaak met K2 gecombineerd?",
      antwoord:
        "D3 verhoogt de calciumopname (erkende claim). K2 (vaak MK-7) heeft eigen erkende claims op botten en bloedstolling. De zin dat K2 calcium 'uit slagaders houdt' is de hartclaim die EFSA heeft afgewezen. Vergelijk combo’s op de [vitamine D-pagina](/beste/vitamine-d).",
    },
  ],

  blogLinks: [
    {
      href: "/blog/vitamine-d-tekort-herkennen",
      titel: "Vitamine D-tekort herkennen: signalen die mannen negeren",
    },
    {
      href: "/blog/testosteron-en-energie-na-40",
      titel: "Testosteron en energie na 30: wanneer is actie nodig?",
    },
    {
      href: "/blog/energie-verhogen-natuurlijk",
      titel: "Energie verhogen: de fysiologie en wat je kunt doen",
    },
  ],

  productVergelijkingCta: {
    titel: "Welke vitamine D scoort het beste?",
    href: "/beste/vitamine-d",
    linkLabel: "Vergelijk D3-producten én D3+K2-combinaties →",
  },
};
