import type { ProfilePageData } from "@/types/profile-page";

export const lageBatterijProfile: ProfilePageData = {
  slug: "lage-batterij",
  label: "Lage Batterij",

  seo: {
    title: "Altijd Moe Na 40? Dit Is Waarom (en Wat Je Eraan Doet) | PerfectSupplement",
    description:
      "Je energie is op. Niet even, maar structureel. Herkenning, uitleg in begrijpelijke taal en wat je stap voor stap kunt doen.",
    canonical: "https://perfectsupplement.nl/profiel/lage-batterij",
    targetKeyword: "altijd moe na 40",
  },

  hero: {
    headline: "Lage Batterij: ben jij al moe voor de dag begonnen is?",
    subline:
      "Het is niet luiheid en niet \"gewoon ouder worden\". Vaak spelen slaap, voeding, beweging en stress samen — en je kunt daar concreet op sturen.",
  },

  recognition: {
    intro: "Ken je dit?",
    points: [
      {
        situation:
          "Je wekker gaat en je eerste gedachte is: ik wil nog 3 uur slapen. Niet omdat je laat naar bed ging, maar omdat slapen niet helpt.",
        emotion: "moedeloosheid",
      },
      {
        situation:
          "Om 10 uur 's ochtends heb je al het gevoel dat de dag voorbij is. De koffie werkt even, maar de crash erna is erger.",
        emotion: "wanhoop",
      },
      {
        situation:
          "Je hebt geen energie meer voor de dingen die je leuk vindt. Sporten, hobby's, tijd met je gezin — het kost allemaal meer dan het oplevert.",
        emotion: "verlies",
      },
      {
        situation:
          "In het weekend voel je je net zo moe als doordeweeks. Uitslapen lost niets op.",
        emotion: "uitzichtloosheid",
      },
      {
        situation:
          "Je merkt dat je dagen meer zittend zijn dan vroeger — en bewegen voelt zwaarder.",
        emotion: "frustratie",
      },
      {
        situation:
          "Je weet dat je meer zou moeten sporten, maar de drempel is groot.",
        emotion: "schuldgevoel",
      },
      {
        situation:
          "Je vergelijkt jezelf met 5 jaar geleden en je snapt niet waar het is misgegaan. Hetzelfde lichaam, de helft van de energie.",
        emotion: "verwarring",
      },
    ],
    closer:
      "Als je hier drie of meer van herkent, past dat bij veel mannen 40+: de dag voelt zwaarder terwijl je routine hetzelfde lijkt. Het goede nieuws: met kleine stappen in ritme, voeding en beweging kun je vaak merkbaar verschil maken.",
  },

  understanding: {
    title: "Waarom je energie vaak minder voelt na 40",
    paragraphs: [
      "Je lichaam haalt energie uit voeding, slaap en beweging. [Mitochondriën](/kennisbank/mitochondrien) — je energiefabriekjes in elke cel — maken [ATP](/kennisbank/atp) aan; als één van de drie pijlers scheef staat, merken veel mensen dat ze zich sneller leeg voelen.",
      "Veel zitten en weinig beweging versterken dat gevoel: je wordt sneller moe van dingen die vroeger vanzelf gingen. Schommelende bloedsuiker — soms gelinkt aan [insulineresistentie](/kennisbank/insulineresistentie) — geeft pieken en crashes. Een korte wandeling of vaste eetmomenten helpen vaak al om de dag \"vlakker\" te maken.",
      "Daar komt bij dat stress en slechte slaap elkaar versterken: slecht slapen maakt de volgende dag zwaarder, en een zware dag maakt 's avonds loslaten lastiger. Koffie en snoep geven een korte boost, maar geen structurele oplossing.",
      "De aanpak is geen wonderpil: eerst de basis (slaap, voeding, beweging), daarna gericht aanvullen waar je echt tekort komt.",
    ],
  },

  stepCare: [
    {
      id: "vandaag",
      title: "Wat je vandaag nog kunt doen",
      subtitle: "Drie dingen die direct werken",
      items: [
        {
          title: "Start de dag met eiwit, niet met suiker",
          description:
            "Een ontbijt van brood met jam geeft een snelle bloedsuikerpiek en daarna een crash. Eiwit (eieren, kwark, noten) geeft stabiele energie tot de lunch.",
          actionable: "Morgenochtend: 2 eieren of een bak kwark met noten.",
          timeframe: "Vandaag",
        },
        {
          title: "Vervang je middagsnack",
          description:
            "Die koek of cracker om 15:00 is precies het moment waarop je bloedsuiker crasht. Een handvol noten of een stuk fruit met pindakaas houdt je stabiel.",
          actionable: "Leg vanavond noten klaar voor morgen.",
          timeframe: "Vandaag",
        },
        {
          title: "Wandel 10 minuten na het avondeten",
          description:
            "Een korte wandeling na het eten stabiliseert je bloedsuiker en geeft je lichaam het signaal dat de dag afloopt. Het is de simpelste energieboost die er is.",
          actionable: "Vanavond, na het eten, schoenen aan en een rondje lopen.",
          timeframe: "Vandaag",
        },
      ],
    },
    {
      id: "deze-week",
      title: "Wat je deze week kunt aanpassen",
      subtitle: "De basis op orde krijgen",
      items: [
        {
          title: "Eet 2x per week vette vis",
          description:
            "Zalm, makreel of sardines bevatten omega-3 vetzuren die je lichaam nodig heeft maar zelf niet maakt. De meeste Nederlanders krijgen te weinig.",
          actionable: "Plan deze week twee vismaaltijden in.",
          timeframe: "Deze week",
        },
        {
          title: "Drink 2 liter water per dag",
          description:
            "Milde uitdroging veroorzaakt vermoeidheid, hoofdpijn en concentratieverlies. De meeste mannen drinken te weinig water en te veel koffie.",
          actionable: "Zet een fles van 1 liter op je bureau. Leeg hem twee keer.",
          timeframe: "Deze week",
        },
        {
          title: "Beweeg 3x 30 minuten",
          description:
            "Beweging genereert energie — het kost het niet. Maar begin laagdrempelig: wandelen, fietsen, een korte krachttraining. Geen marathon, geen HIIT.",
          actionable: "Plan 3 momenten in je agenda, behandel ze als vergaderingen.",
          timeframe: "Deze week",
        },
      ],
    },
    {
      id: "komende-maand",
      title: "De komende 30 dagen",
      subtitle: "Structureel meer energie opbouwen",
      items: [
        {
          title: "Slaaphygiëne opbouwen",
          description:
            "Je energie overdag begint bij je slaap 's nachts. Vast slaapritme, koel slaapkamer (16-18°C), geen scherm een uur voor bed. Binnen 2 weken merk je verschil.",
          actionable: "Kies een vaste bedtijd en houd die 5 van de 7 dagen aan.",
          timeframe: "Komende 30 dagen",
        },
        {
          title: "Overweeg gerichte supplementen",
          description:
            "Als de basis staat maar je energie nog steeds achterblijft, kunnen specifieke supplementen helpen — vooral als je tekorten hebt in omega-3, vitamine D of magnesium.",
          actionable: "Lees hieronder welke supplementen bij dit profiel passen.",
          timeframe: "Komende 30 dagen",
        },
      ],
    },
  ],

  supplements: [
    {
      name: "Omega-3 (EPA/DHA)",
      efsa_claim:
        "EPA en DHA dragen bij tot de normale werking van het hart. DHA draagt bij tot de instandhouding van normale hersenfunctie.",
      why_this_profile:
        "EPA en DHA dragen bij tot de normale werking van het hart; DHA draagt bij tot het instandhouden van normale hersenfunctie (EFSA). Geen Europese claim op ‘cellulaire energiefabriek’ of middagdip hier—wel een logische stap als je weinig vette vis eet en je algemene voedingskwaliteit wilt ondersteunen.",
      href: "/beste/omega-3-supplement",
      hasComparison: true,
    },
    {
      name: "Vitamine D3",
      efsa_claim:
        "Vitamine D draagt bij tot de normale werking van het immuunsysteem en de instandhouding van normale spierfunctie.",
      why_this_profile:
        "In beleidsdocumenten wordt vaak benadrukt dat veel volwassenen in NL suboptimale vitamine D‑status hebben. Vitamine D draagt onder voorwaarden bij aan immuunsysteem, botten en een normale spierwerking (EFSA) — passend als je weinig zon ziet of veel binnen werkt.",
      href: "/beste/vitamine-d",
      hasComparison: true,
    },
  ],

  guidanceCta: {
    title: "Ontdek waar jouw energie weglekt",
    text: "In 3 minuten weet je welke supplementen bij jouw situatie passen en welke bouwstenen je mist.",
  },

  relatedPillar: {
    href: "/energie-na-40",
    turboSnippet:
      "Energie na 40: ritme, voeding, slaap en supplementen — één gids met een concreet weekplan.",
  },

  relatedComparisons: [
    {
      href: "/blog/middagdip-bloedsuiker-na-40",
      turboSnippet:
        "Middagdip na 40: bloedsuiker, koffie en wat je vóór 14:00 kunt sturen — zonder wilskracht-moraliseren.",
    },
    {
      href: "/blog/krachttraining-na-40",
      turboSnippet:
        "Krachttraining na 40: spierbehoud en energie zonder uren in de gym — het duo met eiwit en herstel.",
    },
    {
      href: "/blog/eiwit-na-40",
      turboSnippet:
        "Eiwit na 40: hoeveel gram per dag, anabole resistentie en wanneer poeder zinvol is.",
    },
    {
      href: "/blog/vitamine-d-en-energie",
      turboSnippet:
        "Vitamine D en energie: wat claims wél zeggen, wanneer meten zinvol is — zonder wonderbeloftes.",
    },
    {
      href: "/beste/omega-3-supplement",
      turboSnippet:
        "EPA/DHA: hart‑ en hersenclaims (EFSA) — vergelijk zuiverheid en prijs per dag →",
    },
    {
      href: "/intake",
      turboSnippet: "Waar lekt jouw energie weg? Ontdek het gratis →",
      linkText: "Doe de gratis check",
    },
  ],

  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Profielen", href: "/profiel" },
    { name: "Lage Batterij", href: "/profiel/lage-batterij" },
  ],
};
