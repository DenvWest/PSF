import { ThemaPageData } from "@/types/thema";

export const slaapThema: ThemaPageData = {
  slug: "slaap",
  title: "Slaap",
  heroTitle: "Slaap is waar herstel begint",
  heroSubtitle:
    "Als je 's nachts niet oplaadt, draai je overdag op reserves. Herken de signalen, begrijp wat er speelt, en ontdek wat je er concreet aan kunt doen.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Ik slaap wel, maar word moe wakker.",
      "Ik lig 's nachts te malen over werk.",
      "Ik val makkelijk in slaap, maar word om 3 uur wakker.",
      "In het weekend slaap ik uit, maar het helpt niet.",
      "Mijn partner zegt dat ik onrustig slaap.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waarom je slaap verandert na je 40e",
    intro:
      "Slaapproblemen na je 40e zijn niet alleen een kwestie van slechte gewoonten. Er zijn biologische verschuivingen die je slaapkwaliteit direct beïnvloeden.",
    items: [
      {
        title: "Melatonine daalt",
        description:
          "Melatonine kan onder meer een rol spelen in timing van je slaap‑waaksysteem en circadiaan ritme. Je lichaam maakt gemiddeld minder melatonine aan naarmate je ouder wordt; na je 40e wordt die daling bij veel mensen meetbaar, wat kan samengaan met langer wakker liggen en lichter slapen.",
        icon: "🌙",
        source:
          "Wurtman RJ, J Clin Endocrinol Metab, 2000; Claustrat & Leston, Endotext, 2022",
      },
      {
        title: "Cortisol blijft hoog",
        description:
          "Chronische stress houdt je cortisolspiegel verhoogd — precies het hormoon dat 's avonds hoort te dalen. Cortisol en melatonine werken als tegenpolen: als cortisol hoog blijft, krijgt melatonine geen ruimte.",
        icon: "📈",
        source: "Chrousos GP, Nat Rev Endocrinol, 2009",
      },
      {
        title: "Magnesiumtekort",
        description:
          "Magnesium draagt bij tot de normale werking van het zenuwstelsel en normale spierfunctie, en bij voldoende dosis tot de vermindering van vermoeidheid en een normale psychologische functie. Bij een tekort — wat bij 40+ relatief veel voorkomt — wordt je systeem eerder ’te lang waak gehouden’. In een RCT werden met magnesium bisglycinaat vergeleken met placebo insomnierelatieve scores gemeten; onderzoeksresultaten overdraag niet 1‑op‑1 naar beloftes over slaap op het etiket.",
        icon: "⚡",
        source: "Schuster et al., Nat Sci Sleep, 2025 (RCT, n=155)",
      },
      {
        title: "Minder diepe slaap",
        description:
          "De hoeveelheid diepe slaap (slow-wave sleep) neemt af met de leeftijd. Je slaapt misschien 7 uur, maar het herstellend vermogen is lager. Diepe slaap is ook wanneer 80% van je dagelijkse testosteron wordt aangemaakt.",
        icon: "📉",
        source:
          "Ohayon et al., Sleep, 2004 (meta-analyse); Wittert G, Asian J Androl, 2014",
      },
    ],
  },

  scienceBlock: {
    sectionLabel: "WAT ONDERZOEK LAAT ZIEN",
    title: "De wetenschap achter slaapverandering",
    intro: "Geen meningen, maar meetbare feiten uit peer-reviewed onderzoek.",
    facts: [
      {
        claim: "Bij mensen boven de 90 is melatonine minder dan 20% van het niveau van jonge volwassenen.",
        source: "Claustrat & Leston, Endotext (NIH), 2022",
        pubmedId: "NBK550972",
      },
      {
        claim: "Cafeïne 6 uur voor bedtijd vermindert de totale slaaptijd met gemiddeld 1 uur.",
        source: "Drake et al., J Clin Sleep Med, 2013",
        pubmedId: "24235903",
      },
      {
        claim:
          "In een dubbelblinde placebo-gecontroleerde studie rapporteerden volwassenen met slechte slaap na 4 weken andere insomnierelateerde uitkomsten met magnesiumbisglycinaat dan met placebo — individueel effect varieert.",
        source: "Schuster et al., Nat Sci Sleep, 2025",
      },
      {
        claim:
          "Een gecontroleerde studie rapporteerde na 60 dagen met een ashwagandha‑extract andere serum‑cortisolwaarden versus placebo; dit is onderzoekscontext geen EU‑goedgekeurde claim en garandeert geen betere slaap.",
        source: "Chandrasekhar et al., Indian J Psychol Med, 2012",
        pubmedId: "23439798",
      },
      {
        claim: "Avondlicht van e-readers onderdrukt melatonine, vertraagt het circadiaan ritme en vermindert alertheid de volgende ochtend.",
        source: "Chang et al., Proc Natl Acad Sci, 2015",
        pubmedId: "25535358",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "3 dingen die je vanavond al kunt doen",
    items: [
      {
        title: "Vast slaapritme",
        description:
          "Ga elke dag op hetzelfde tijdstip naar bed en sta op hetzelfde tijdstip op — ook in het weekend. Je circadiaan ritme heeft consistentie nodig, geen inhaalweekenden.",
        icon: "⏰",
      },
      {
        title: "Scherm uit om 21:00",
        description:
          "Blauw licht onderdrukt melatonine. Zet je telefoon op vliegtuigmodus en pak een boek. De eerste drie avonden voelen raar — daarna merk je het verschil.",
        icon: "📱",
      },
      {
        title: "Koele slaapkamer",
        description:
          "Je kerntemperatuur moet dalen om in te slapen. Zet je slaapkamer op 16-18°C. Een te warme kamer is een van de meest onderschatte slaapverstoorders.",
        icon: "🌡️",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Gericht aanvullen — niet zomaar slikken",
    intro:
      "Sommige stoffen hebben officiële EU‑claims voor specifieke lichaamsfuncties; andere worden in onderzoek besproken in relatie tot nachtrust. Lees hier de nuance — en klik door naar de gids voor dosering en productvergelijking.",
    items: [
      {
        name: "Magnesium",
        reason:
          "Magnesium draagt bij tot de normale werking van het zenuwstelsel en spieren, tot vermindering van vermoeidheid en een normale psychologische functie (EFSA‑claims bij voldoende dosis) — veel mensen gebruiken glycinaat/bisglycinaat bij een avondroutine.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste/magnesium",
        icon: "⚡",
      },
      {
        name: "Ashwagandha",
        reason:
          "Ashwagandha staat bij EFSA op de on‑holdlijst voor claims: onderzoeken suggereren mogelijk een rol in hoe je stress ervaart, maar dat is géén erkende gezondheidsclaim. Als spanning je nacht belemmert, plaats je het in die context — gebruik op eigen risico.",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste/ashwagandha",
        icon: "🌿",
      },
      {
        name: "Omega-3",
        reason:
          "EPA en DHA dragen bij tot de normale werking van het hart; DHA draagt bij tot het instandhouden van normale hersenfunctie — geen EU‑claim gericht op slaapkwaliteit. Wel een gangbare bouwsteen voor wie weinig vis eet.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste/omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Melatonine",
        reason:
          "Je lichaam maakt gemiddeld minder melatonine aan naarmate je ouder wordt. Melatonine draagt bij aan het verkorten van de inslaaptijd onder de officiële claimvoorwaarden — geschikt bij vooral ritme-/timingvragen na overleg bij langdurige klachten.",
        guideLink: "/supplementen/melatonine",
        comparisonLink: "/beste/melatonine",
        icon: "🌙",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS SLAAPGIDS",
    title: "De complete gids voor betere slaap na 40",
    subtitle:
      "Alles wat je moet weten over slaaphygiëne, supplementdosering en ritme-opbouw — in één overzichtelijke PDF.",
    bulletPoints: [
      "Waarom magnesium glycinaat beter werkt dan oxide voor slaap",
      "Een 7-dagen slaapritme-protocol dat je vanavond kunt starten",
      "Doseerschema's per supplement, gebaseerd op klinisch onderzoek",
      "Veelgemaakte fouten die je slaap saboteren zonder dat je het weet",
    ],
    ctaText: "Download ter inspiratie",
    privacyText:
      "Je ontvangt de gids en maximaal 3 tips over slaap en supplementen. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Slaapgids is onderweg.",
  },

  pillarPage: {
    href: "/slaap-verbeteren-na-40",
    title: "De complete gids: slaap verbeteren na 40",
    description:
      "Van de biologie achter slaapverandering tot een concreet weekplan met supplementen. Alles wat op deze pagina in het kort staat, uitgewerkt met bronnen en context.",
  },

  expertQuote: {
    quote:
      "Slaap is de meest onderschatte interventie voor mannen boven de 40. Geen supplement compenseert voor structureel slaaptekort.",
    author: "Praktische voorlichting",
    credential:
      "Samengesteld door PerfectSupplement op basis van klinisch onderzoek",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten wat er bij jou speelt?",
    subtitle:
      "De Leefstijlcheck analyseert je slaap, stress, energie, voeding, beweging en herstel in 15 vragen. Je krijgt een persoonlijk Herstelplan met concrete stappen.",
    features: [
      "15 vragen, 3 minuten",
      "Scores op 6 leefstijldomeinen",
      "Persoonlijk Herstelplan met quick wins",
      "Gerichte supplementroute op basis van jouw profiel",
    ],
    ctaText: "Start de Leefstijlcheck",
    ctaLink: "/intake",
    note: "Gratis · Geen account nodig · Anoniem verwerkt",
  },

  relatedArticles: [
    {
      title: "Slaap verbeteren na je 40e: wat werkt en wat niet",
      slug: "slaap-verbeteren-40-plus",
      category: "slaap",
    },
    {
      title:
        "Cortisol benaderen: vijf leefstijlroutes uit onderzoek, zonder medicatie",
      slug: "cortisol-verlagen-natuurlijk",
      category: "stress",
    },
  ],

  leesOok: {
    sectionLabel: "MEER NAVIGATIE",
    title: "Lees ook",
    items: [
      {
        context:
          "Hoge of scheve cortisol geeft vaak dezelfde nachtrust-problemen als ‘pure’ slaapissues — het helpt om stress en herstel in één beeld te zien.",
        href: "/thema/stress",
        label: "Thema: stress (cortisol en herstel)",
      },
      {
        context:
          "Magnesium is een van de meest gebruikte mineraal-supplementen voor betere nachtrust; onze vergelijking zet vorm, prijs en praktische dosering op een rij.",
        href: "/beste/magnesium",
        label: "Beste magnesium-supplementen vergeleken",
      },
      {
        context:
          "Diep in op glycinaat, citraat, oxide en wanneer wat past bij jouw doel (slaap, spieren, spijsvertering).",
        href: "/supplementen/magnesium",
        label: "Magnesiumgids: werking, vormen, dosering",
      },
      {
        context:
          "Lig je regelmatig wakker, slaap je onrustig of word je moe wakker? Herken je jezelf in het profiel van de Onrustige Slaper.",
        href: "/profiel/onrustige-slaper",
        label: "Herken je jezelf? Ontdek of je een Onrustige Slaper bent →",
      },
      {
        context:
          "Hoe wij supplementen onafhankelijk beoordelen: criteria, weging en werkwijze.",
        href: "/methodologie",
        label: "Hoe wij supplementen beoordelen →",
      },
    ],
  },

  seo: {
    title:
      "Slaap verbeteren als man 40+ — Oorzaken, tips en supplementen | PerfectSupplement",
    description:
      "Waarom je slaap verandert na je 40e en wat je eraan kunt doen. Concrete leefstijltips, supplementadvies en een gratis slaapgids.",
    canonical: "/thema/slaap",
  },
};
