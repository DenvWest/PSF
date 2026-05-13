import { ThemaPageData } from "@/types/thema";

export const energieThema: ThemaPageData = {
  slug: "energie",
  title: "Energie",
  heroTitle: "Weinig energie na je 40e: meer dan gewoon moe zijn",
  heroSubtitle:
    "Je slaapt genoeg, maar je dag voelt zwaar. Die middagdip die steeds vroeger komt, het moeite kosten van taken die vroeger vanzelf gingen, die vage hersenmist — dat is geen luiheid, dat zijn signalen dat er iets uit balans is.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "’s Middags stort ik in terwijl de dag nog niet klaar is.",
      "Ik stel dingen uit die vroeger geen moeite kostten — ik ben geen procastinator, denk ik.",
      "Mijn lichaam is op bed, mijn hoofd draait nog op halve toeren.",
      "Ik dacht dat dit erbij hoorde na 40, maar iedereen lijkt het wel te hebben — en te accepteren.",
      "Koffie houdt me overeind, maar versterkt de middagdip nóg meer.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waar je energie vandaan komt (en weglekt) na je 40e",
    intro:
      "Energieproblemen zijn zelden één-oorzakelijk. Bloedsuiker, hormonen, stress en beweging versterken elkaar. Hieronder vier domeinen die het vaakst een rol spelen.",
    items: [
      {
        title: "Leefstijl — de energielekken in je dag",
        description:
          "Bloedsuikerschommelingen, onvoldoende eiwitten en te weinig water zijn de stille, aanhoudende drains. Een eiwitrijk ontbijt (≥30g) verlaagt bloedsuikerpieken significant de rest van de dag.",
        icon: "🥗",
        source: "Leidy et al., Am J Clin Nutr, 2013",
      },
      {
        title: "Mentaal & emotioneel",
        description:
          "Gevoelens van onrust, ruis of onderstimulatie vreten net zo hard aan je tank als overbelasting. Chronische mentale vermoeidheid verlaagt de mitochondriële efficiëntie via verhoogde oxidatieve stress.",
        icon: "🧠",
        source: "Picard et al., Nat Rev Endocrinol, 2018",
      },
      {
        title: "Werk & omgeving",
        description:
          "Langdurig zitten verlaagt je stofwisseling en onderdrukt mitochondriële biogenese. Al 10 minuten wandelen na het eten verlaagt je bloedsuikerpiek met 12-22%.",
        icon: "💼",
        source: "Buffey et al., Sports Med, 2022",
      },
      {
        title: "Fysiek & hormonaal",
        description:
          "Vitamine D-tekort (naar schatting 40-60% in NL), dalend testosteron (gemiddeld naar schatting 1-2%/jaar na 30) en verminderde insulinegevoeligheid: kleine verschuivingen met grote impact op hoe 'vol' je je voelt.",
        icon: "🩺",
        source: "Gezondheidsraad NL, 2012; Travison et al., J Clin Endocrinol Metab, 2007",
      },
    ],
  },

  scienceBlock: {
    sectionLabel: "WAT ONDERZOEK LAAT ZIEN",
    title: "De wetenschap achter energieverlies na 40",
    intro: "Geen meningen, maar meetbare feiten uit peer-reviewed onderzoek.",
    facts: [
      {
        claim:
          "Mitochondriële functie daalt met 8-10% per decennium na je 30e — minder ATP uit dezelfde voedingsstoffen.",
        source: "Short et al., Proc Natl Acad Sci, 2005",
        pubmedId: "15767349",
      },
      {
        claim:
          "40-60% van de Nederlandse volwassenen heeft een suboptimaal vitamine D-niveau, vooral in wintermaanden.",
        source: "Gezondheidsraad NL, Evaluatie voedingsnormen vitamine D, 2012",
        pubmedId: "",
      },
      {
        claim:
          "Onderzoek suggereert dat creatine monohydraat (3-5 g/dag) kan bijdragen aan cognitieve prestaties bij slaaptekort en mentale vermoeidheid.",
        source: "Avgerinos et al., Exp Gerontol, 2018 (systematic review)",
        pubmedId: "29704637",
      },
      {
        claim:
          "Een eiwitrijk ontbijt (≥30g) vermindert honger, verbetert alertheid en stabiliseert bloedsuiker bij jonge vrouwen en mannen.",
        source: "Leidy et al., Am J Clin Nutr, 2013",
        pubmedId: "23446906",
      },
      {
        claim:
          "10 minuten wandelen na een maaltijd verlaagt de postprandiale bloedsuikerpiek met 12-22%.",
        source: "Buffey et al., Sports Med, 2022 (meta-analyse)",
        pubmedId: "35364009",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "3 dingen die je vandaag al energie kunnen geven",
    items: [
      {
        title: "500 ml water direct na opstaan",
        description:
          "Na nachten zonder inname is rehydraties de snelste manier om concentratie en alertheid te herstellen — vóór je eerste koffie.",
        icon: "💧",
      },
      {
        title: "Eiwit + vet bij het ontbijt",
        description:
          "Een stabielere ochtendbloedsuiker betekent minder mid-morning crash en minder neiging tot koffie-escalatie.",
        icon: "🍳",
      },
      {
        title: "10 minuten ochtendlicht",
        description:
          "Buitenlicht in de ochtend helpt je cortisol- en waakritme te zetten — dat ondersteunt later op de dag meer alertheid.",
        icon: "☀️",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Gericht aanvullen — afgestemd op veelvoorkomende gaten",
    intro:
      "Deze keuzes hebben ondersteuning in literatuur als voeding, slaap of bloedwaarden niet optimaal zijn. In de gidsen lees je wanneer wat past en hoe je producten vergelijkt.",
    items: [
      {
        name: "Vitamine D3 (+ K2)",
        reason:
          "Vitamine D draagt bij tot de normale werking van het immuunsysteem, het instandhouden van normale botten en een normale spierfunctie (EFSA) — veel mannen halen niet genoeg binnen naar een schatting van beleidsdocumenten voor NL.",
        guideLink: "/supplementen/vitamine-d",
        comparisonLink: "/beste/vitamine-d",
        icon: "☀️",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "EPA en DHA dragen bij tot de normale werking van het hart; DHA aan het instandhouden van normale hersenfunctie (EFSA bij voldoende dosering). Geen EU‑labelclaim op ‘more energie’ of cel‑ATP hier.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste/omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Ashwagandha",
        reason:
          "Ashwagandha staat bij EFSA op de on‑holdlijst: literatuur bespreekt mogelijk andere stressperceptie of herstelperceptie bij langdurige belasting — geen officiële claim; gebruik alleen als je deze context accepteert (zie kader onderaan).",
        guideLink: "/supplementen/ashwagandha",
        comparisonLink: "/beste/ashwagandha",
        icon: "🌿",
      },
      {
        name: "Creatine",
        reason:
          "Creatine ondersteunt de ATP‑voorziening in cellen wat spier‑ en explosieve kracht kan ondersteunen bij langdurige inname en bij regelmatig trainen; de erkende EU‑claim formulering beschrijft heel korte, intense spiertaken bij voldoende dagdosis.",
        guideLink: "/supplementen/creatine",
        comparisonLink: "/beste/creatine",
        icon: "💪",
      },
      {
        name: "Eiwitpoeder",
        reason:
          "Voldoende eiwitinname in je voeding ondersteunt spieronderhoud; na je 40e wordt behoud vaak meer aandacht. In de EU hebben eiwit‑supplementen o.a. claims rond spiermassa en botten onder voorwaarden — geen garantie voor ‘meer pit’ uit één scooptje.",
        guideLink: "/supplementen/eiwitpoeder",
        comparisonLink: "/beste/eiwitpoeder",
        icon: "💪",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS ENERGIEGIDS",
    title: "Gratis Energiegids (PDF)",
    subtitle:
      "17 pagina's met concrete stappen voor meer energie na 40. Van voeding en beweging tot de supplementen met de beste evidence.",
    bulletPoints: [
      "Hoe leefstijl en hormonen elkaar versterken na je 40e",
      "Eenvoudig weekplan: eten, beweging, licht (haalbaar in drukke weken)",
      "Supplementinformatie op hoofdlijnen met links naar onze gidsen",
      "Wanneer vermoeidheid wél iets ernstigers kan betekenen — en wat je bespreekt",
    ],
    ctaText: "Download de Energiegids",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Energiegids is onderweg.",
  },

  pillarPage: {
    href: "/energie-na-40",
    title: "De complete gids: energie terugwinnen na 40",
    description:
      "Van mitochondriën en bloedsuiker tot een concreet weekplan met supplementen. Alles wat op deze pagina in het kort staat, uitgewerkt met bronnen.",
  },

  expertQuote: {
    quote:
      "Vermoeidheid is zelden ‘één’ oorzaak. Meestal is het de som van wat je s ’nachts, aan tafel en tussen je oren niet meer volledig herstelt.",
    author: "Praktische voorlichting",
    credential: "Samengesteld door PerfectSupplement",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten wat er bij jou speelt?",
    subtitle:
      "De Leefstijlcheck analyseert je energie, slaap, stress, voeding, beweging en herstel in 12 vragen. Je krijgt een persoonlijk Herstelplan met concrete stappen.",
    features: [
      "12 vragen, 3 minuten",
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
      title: "Testosteron en energie na 40: wanneer is actie nodig?",
      slug: "testosteron-en-energie-na-40",
      category: "energie",
    },
    {
      title: "Vitamine D-tekort: herken je de signalen?",
      slug: "vitamine-d-tekort-herkennen",
      category: "energie",
    },
  ],

  leesOok: {
    sectionLabel: "MEER NAVIGATIE",
    title: "Lees ook",
    items: [
      {
        context:
          "Chronische stress en hoge insuline-eisen vreten dezelfde ‘brandstof’ weg als pure energie-tekorten — lees beide lijnen naast elkaar.",
        href: "/thema/stress",
        label: "Thema: stress (cortisol, herstel)",
      },
      {
        context:
          "EPA en DHA op één lijn gezet: zuiverheid, dosering, prijs per dag — handig als je weinig vette vis eet.",
        href: "/beste/omega-3-supplement",
        label: "Beste omega-3-supplementen vergeleken",
      },
      {
        context:
          "Monohydraat en prijs per dosering: compact vergelijken als je (weer) met creatine aan de slag wilt om explosieve en cognitieve output te ondersteunen.",
        href: "/beste/creatine",
        label: "Beste creatine-supplementen vergeleken",
      },
      {
        context:
          "Hersenen, hart: wanneer EPA/DHA volgens EU‑claims past na je 40e en hoe je producten beoordeelt.",
        href: "/supplementen/omega-3",
        label: "Omega-3 gids (EPA, DHA, keuzehulp)",
      },
      {
        context:
          "D3, K2, opname, veelvoorkomende tekorten en wat je op het etiket checkt (ook voor vermoeidheid en spierfunctie).",
        href: "/supplementen/vitamine-d",
        label: "Vitamine D gids (D3, K2, praktische keuze)",
      },
      {
        context:
          "Slaap je genoeg maar voel je je toch leeg? Herken het patroon van de Lage Batterij — structurele vermoeidheid na 40.",
        href: "/profiel/lage-batterij",
        label: "Altijd moe na 40? Ontdek of je een Lage Batterij profiel hebt →",
      },
    ],
  },

  seo: {
    title:
      "Energie terugwinnen als man 40+ | Oorzaken, tips en supplementen | PerfectSupplement",
    description:
      "Middagdips, hersenmist en weinig puf begrijpen. Leefstijl, verdieping wanneer nodig, en supplementinformatie onafhankelijk uit de doeken gedaan.",
    canonical: "/thema/energie",
  },
};
