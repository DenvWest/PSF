import type { ThemaPageData } from "@/types/thema";

export const herstelThema: ThemaPageData = {
  slug: "herstel",
  title: "Herstel",
  heroTitle: "Herstel is waar groei begint",
  heroSubtitle:
    "Je traint, je werkt, je doet alles goed — maar je lichaam herstelt niet meer zoals vroeger. Spierpijn die dagen aanhoudt, stijfheid bij het opstaan, of een vermoeidheid die niet weggaat met een nachtje slaap. Na 40 verandert je herstelvermogen. Dat is fysiologisch — maar je kunt er veel aan doen.",
  heroLabel: "THEMA",

  recognition: {
    sectionLabel: "HERKENBAAR?",
    title: "Dit hoor je jezelf misschien zeggen",
    quotes: [
      "Na een training heb ik twee dagen spierpijn.",
      "Ik ben altijd stijf als ik 's ochtends opsta.",
      "Ik sport veel, maar word niet sterker.",
      "In het weekend slaap ik uit, maar het helpt niet echt.",
      "Ik kan niet meer 'aan' en 'uit' schakelen — het draait altijd door.",
    ],
  },

  causes: {
    sectionLabel: "WAT ER SPEELT",
    title: "Waarom herstel verandert na 40",
    intro:
      "Na je 40e verandert hoe snel je lichaam weefsel herstelt en spieren opbouwt. Dat zit in hormonen, slaap, eiwitrespons en ontstekingsbalans — geen gebrek aan discipline, wel andere fysiologie.",
    items: [
      {
        title: "Spiereiwitaanmaak (MPS) wordt trager",
        description:
          "Muscle protein synthesis daalt — je hebt meer eiwit nodig per maaltijd (minimaal 30 g per keer) om dezelfde respons te triggeren als vroeger.",
        icon: "🧬",
      },
      {
        title: "Cortisol en herstel",
        description:
          "Cortisolniveaus reageren trager op herstel — chronische stress houdt cortisol hoog, wat spieropbouw en weefselreparatie remt.",
        icon: "📈",
      },
      {
        title: "Slaapkwaliteit en N3",
        description:
          "Slaapkwaliteit daalt met leeftijd — en diepe slaap (N3) is de fase waarin groeihormoon vrijkomt en het meeste fysieke herstel plaatsvindt.",
        icon: "🌙",
      },
      {
        title: "Lichte chronische ontsteking (inflammaging)",
        description:
          "Dit neemt toe en remt spier- en weefselherstel; het draagt bij aan stijfheid en pijn die langer blijven hangen.",
        icon: "🔥",
      },
    ],
  },

  quickWins: {
    sectionLabel: "DIRECT TOEPASBAAR",
    title: "Quick wins: wat je zelf kunt doen",
    items: [
      {
        title: "Minimaal 30 g eiwit per hoofdmaaltijd",
        description:
          "Eieren, kwark, kip, vis, peulvruchten — dit is de drempel voor optimale spiereiwitaanmaak na 40.",
        icon: "🥚",
      },
      {
        title: "Minstens 1 rustdag per 3 trainingsdagen",
        description:
          "Meer trainen is niet altijd beter; geef je lichaam geplande ruimte om te herstellen.",
        icon: "📅",
      },
      {
        title: "Slaap prioriteren: 7–8 uur, vast ritme",
        description:
          "Geen schermen na 21:00 — herstel gebeurt vooral tijdens diepe slaap.",
        icon: "⏰",
      },
      {
        title: "10–15 minuten wandelen na het avondeten",
        description:
          "Verlaagt cortisol en verbetert bloedsuikerregulatie — rustig voor je systeem voor de nacht.",
        icon: "🚶",
      },
      {
        title: "Stretch of foam roll na training",
        description:
          "Niet alleen voor flexibiliteit, maar voor doorbloeding en afvoer van afvalstoffen.",
        icon: "🧘",
      },
    ],
  },

  supplements: {
    sectionLabel: "SUPPLEMENTEN DIE KUNNEN HELPEN",
    title: "Welke supplementen helpen bij herstel",
    intro:
      "Supplementen zijn geen vervanging voor rust, slaap en voeding. Deze vier hebben in onderzoek en praktijk de meeste ondersteuning voor herstel na 40 — klik door naar de gids voor vormen en dosering; bij magnesium, omega-3, creatine en zink ook naar onze productvergelijking.",
    items: [
      {
        name: "Magnesium (glycinaat)",
        reason:
          "Ontspant spieren, verbetert slaapkwaliteit, essentieel voor 300+ enzymatische processen waaronder eiwitaanmaak.",
        guideLink: "/supplementen/magnesium",
        comparisonLink: "/beste-magnesium",
        icon: "⚡",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "Remt ontstekingsreacties (inflammaging), ondersteunt celmembranen en herstel op celniveau.",
        guideLink: "/supplementen/omega-3",
        comparisonLink: "/beste-omega-3-supplement",
        icon: "🐟",
      },
      {
        name: "Creatine",
        reason:
          "Ondersteunt ATP-productie (spierenergie), bewezen effectief voor kracht en herstel. Na 40 daalt de natuurlijke creatineaanmaak.",
        guideLink: "/supplementen/creatine",
        comparisonLink: "/beste-creatine",
        icon: "💪",
      },
      {
        name: "Zink",
        reason:
          "Essentieel voor eiwitaanmaak, immuunfunctie en wondgenezing. Tekort vertraagt spierherstel.",
        guideLink: "/supplementen/zink",
        comparisonLink: "/beste-zink",
        icon: "🔩",
      },
    ],
  },

  emailGate: {
    sectionLabel: "GRATIS HERSTELGIDS",
    title: "De complete gids voor beter herstel na 40",
    subtitle:
      "Alles over rust, voeding, supplementen en mentaal herstel — in één overzichtelijke PDF. Direct toepasbaar.",
    bulletPoints: [
      "Waarom rustdagen net zo belangrijk zijn als trainingsdagen",
      "Een 7-dagen herstelprotocol dat je deze week kunt starten",
      "Doseerschema's voor magnesium, omega-3, creatine en zink bij herstel",
      "De drie grootste herstelfouten die mannen 40+ maken",
    ],
    ctaText: "Download de Herstelgids",
    privacyText:
      "Je e-mail wordt alleen gebruikt voor de gids en relevante tips. Geen spam, altijd opzegbaar.",
    successMessage: "Check je inbox — de Herstelgids is onderweg.",
  },

  expertQuote: {
    quote:
      "Mannen boven de 40 die blijven presteren zonder bewust te herstellen, breken hun lichaam sneller af dan ze het opbouwen. Herstel is geen luxe — het is de voorwaarde.",
    author: "Sportfysioloog",
    credential: "Specialisatie inspanningsfysiologie 40+",
  },

  premiumCta: {
    sectionLabel: "PERSOONLIJK ADVIES",
    title: "Wil je weten hoe jouw herstel ervoor staat?",
    subtitle:
      "De Leefstijlcheck analyseert je slaap, stress, energie, voeding, beweging en herstel in 12 vragen. Je krijgt een persoonlijk Herstelplan met concrete stappen.",
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
      title: "Ademhaling tegen stress: technieken die werken",
      slug: "ademhaling-tegen-stress",
      category: "stress",
    },
    {
      title: "Slaap verbeteren na 40: wat werkt écht?",
      slug: "slaap-verbeteren-40-plus",
      category: "slaap",
    },
    {
      title: "Magnesium en slaapkwaliteit: wat zegt het onderzoek?",
      slug: "magnesium-en-slaapkwaliteit",
      category: "slaap",
    },
  ],

  leesOok: {
    sectionLabel: "MEER NAVIGATIE",
    title: "Lees ook",
    items: [
      {
        context:
          "Herstel begint bij slaap. Zonder diepe slaap herstellen je spieren niet — groeihormoon komt vrij tijdens N3-slaap.",
        href: "/thema/slaap",
        label: "Thema: slaap (nachtrust en herstel)",
      },
      {
        context:
          "Chronische stress houdt cortisol hoog. Cortisol remt spieropbouw en vertraagt weefselreparatie.",
        href: "/thema/stress",
        label: "Thema: stress (cortisol en herstel)",
      },
      {
        context:
          "Slecht herstel vreet aan je energie. Het zijn twee kanten van dezelfde munt — als je niet herstelt, heb je geen brandstof.",
        href: "/thema/energie",
        label: "Thema: energie (herstel en belasting)",
      },
      {
        context:
          "Je traint, slaapt en eet goed — maar je lichaam herstelt moeizamer dan vroeger. Herken de signalen van de Stille Slijter.",
        href: "/profiel/stille-slijter",
        label: "Herstelt je lichaam niet meer goed? Herken de signalen →",
      },
      {
        context:
          "Meer trainen leidt na 40 snel tot overreaching. Herken de signalen voordat overtraining optreedt.",
        href: "/profiel/overtrainer",
        label: "Meer trainen ≠ beter worden. Herken overtraining →",
      },
      {
        context:
          "Magnesium glycinaat ontspant spieren, verbetert slaapkwaliteit en ondersteunt enzymatische processen bij herstel.",
        href: "/beste-magnesium",
        label: "Magnesium ondersteunt je spierherstel →",
      },
    ],
  },

  seo: {
    title:
      "Herstel verbeteren als man 40+ — Slaap, eiwit, cortisol, magnesium, omega-3 | PerfectSupplement",
    description:
      "Waarom herstel na 40 anders is: MPS, cortisol, diepe slaap, inflammaging. Quick wins, supplementen (magnesium, omega-3, creatine, zink) en gerelateerde thema’s — plus gratis herstelgids.",
    canonical: "/thema/herstel",
  },
};
