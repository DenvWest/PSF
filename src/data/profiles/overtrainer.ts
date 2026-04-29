import type { ProfilePageData } from "@/types/profile-page";

export const overtrainer: ProfilePageData = {
  slug: "overtrainer",
  label: "Overtrainer",

  seo: {
    title: "Overtraining Herkennen: Signalen en Oplossingen | PerfectSupplement",
    description:
      "Je traint hard maar wordt slechter in plaats van beter. Herken de signalen van overtraining en ontdek wat je eraan doet.",
    canonical: "https://perfectsupplement.nl/profiel/overtrainer",
    targetKeyword: "overtraining symptomen man",
  },

  hero: {
    headline: "Overtrainer: meer trainen maakt je niet sterker",
    subline:
      "Je denkt dat harder trainen de oplossing is. Maar je lichaam schreeuwt om rust — en je luistert niet. Na 40 is dat een gevaarlijke combinatie.",
  },

  recognition: {
    intro: "Ken je dit?",
    points: [
      {
        situation:
          "Je traint 4-5 keer per week maar je wordt niet sterker. Je prestaties stagneren of gaan achteruit.",
        emotion: "frustratie",
      },
      {
        situation:
          "Je rusthartslag is hoger dan normaal. Je slaapt slecht ondanks dat je fysiek uitgeput bent.",
        emotion: "verwarring",
      },
      {
        situation:
          "Je bent prikkelbaar, gedemotiveerd, of je hebt geen zin meer in trainen — terwijl het normaal je uitlaatklep is.",
        emotion: "verlies",
      },
      {
        situation:
          "Blessures stapelen zich op. Net als die ene knie beter is, begint je schouder te protesteren.",
        emotion: "wanhoop",
      },
      {
        situation:
          "Je denkt: als ik nu stop met trainen, verlies ik alles. Dus je gaat door — met pijn, met vermoeidheid, met tegenzin.",
        emotion: "angst",
      },
    ],
    closer:
      "Overtraining is geen badge of honor. Het is een toestand waarin je lichaam meer afbreekt dan opbouwt. En na 40 — met dalende herstelhormonen — is de grens sneller bereikt dan je denkt.",
  },

  understanding: {
    title: "Wat overtraining doet met je lichaam na 40",
    paragraphs: [
      "Training is stress. Goede stress — als je genoeg herstelt. Elke training veroorzaakt microscopische schade in je spieren, verhoogt cortisol, en put je energievoorraden uit. In de rustperiode daarna herstelt je lichaam en wordt het sterker. Dat heet supercompensatie.",
      "Maar als de volgende training komt vóórdat het herstel compleet is, stapelt de schade zich op. Je cortisol blijft chronisch hoog. Je testosteron daalt. Je immuunsysteem verzwakt. Je slaap wordt oppervlakkiger — precies wanneer je diepe slaap het hardst nodig hebt.",
      "Na 40 is de hersteltijd van nature langer. Dezelfde training die je op je 30e in 24 uur verwerkte, kost nu 48-72 uur. Als je dat niet respecteert, eindig je niet in betere shape — maar in een blessurecyclus.",
    ],
  },

  stepCare: [
    {
      id: "vandaag",
      title: "Wat je vandaag nog kunt doen",
      subtitle: "De eerste stap: gas terugnemen",
      items: [
        {
          title: "Neem morgen een rustdag",
          description:
            "Niet 'actief herstel'. Niet 'een lichte sessie'. Rust. Je lichaam heeft een volledig signaal nodig dat de belasting stopt. Wandelen mag — trainen niet.",
          actionable: "Verwijder de training van morgen uit je agenda. Vervang door een wandeling.",
          timeframe: "Vandaag",
        },
        {
          title: "Eet vanavond extra eiwit",
          description:
            "Je lichaam is in herstelmodus maar heeft te weinig bouwstenen. Voeg vanavond een extra portie eiwit toe: een bak kwark, een extra ei, of een eiwitshake.",
          actionable:
            "Voeg 20-30 gram eiwit toe aan je avondmaaltijd of als snack voor het slapen.",
          timeframe: "Vandaag",
        },
        {
          title: "Ga een uur eerder naar bed",
          description:
            "Diepe slaap is wanneer groeihormoon vrijkomt — het hormoon dat je spieren herstelt. Meer slaap = meer herstel. Vanavond een uur eerder is de simpelste interventie.",
          actionable: "Zet een alarm op 'bedtijd' — een uur eerder dan normaal.",
          timeframe: "Vandaag",
        },
      ],
    },
    {
      id: "deze-week",
      title: "Wat je deze week kunt aanpassen",
      subtitle: "Je trainingsschema herstructureren",
      items: [
        {
          title: "Maximaal 3 trainingen per week",
          description:
            "Drie goed uitgevoerde trainingen met voldoende rust ertussen leveren meer op dan vijf halfbakken sessies. Kwaliteit wint van kwantiteit — altijd.",
          actionable: "Schrap deze week 1-2 trainingen. Vervang ze door wandelen of stretching.",
          timeframe: "Deze week",
        },
        {
          title: "Nooit twee zware dagen achter elkaar",
          description:
            "Wissel af: zware training → rustdag of lichte training → zware training. Geef je lichaam minimaal 48 uur herstel na een intensieve sessie.",
          actionable:
            "Herplan je trainingsweek met minimaal een rustdag tussen zware sessies.",
          timeframe: "Deze week",
        },
        {
          title: "Luister naar je lichaam — echt",
          description:
            "Verhoogde rusthartslag, slechte slaap, prikkelbaarheid, of geen zin in trainen? Dat zijn geen tekenen van zwakte. Het zijn signalen dat je lichaam hersteltijd nodig heeft.",
          actionable:
            "Meet je rusthartslag 's ochtends. Als die 5+ slagen hoger is dan normaal: rustdag.",
          timeframe: "Deze week",
        },
      ],
    },
    {
      id: "komende-maand",
      title: "De komende 30 dagen",
      subtitle: "Duurzaam sterker worden",
      items: [
        {
          title: "Bouw deload-weken in",
          description:
            "Elke 3-4 weken een week met 50% van je normale volume. Dit is geen achteruitgang — dit is wanneer je lichaam daadwerkelijk sterker wordt. Elke serieuze atleet doet dit.",
          actionable: "Plan nu je eerste deload-week over 3 weken.",
          timeframe: "Komende 30 dagen",
        },
        {
          title: "Overweeg gerichte supplementen",
          description:
            "Als je trainingsbelasting, rust en voeding in balans zijn, kunnen supplementen het herstel ondersteunen.",
          actionable: "Lees hieronder welke supplementen bij dit profiel passen.",
          timeframe: "Komende 30 dagen",
        },
      ],
    },
  ],

  supplements: [
    {
      name: "Creatine monohydraat",
      efsa_claim:
        "Creatine verhoogt de lichamelijke prestatie bij opeenvolgende korte, zeer intensieve inspanningen.",
      why_this_profile:
        "Een van de best onderzochte supplementen voor kracht en herstel. Na 40 daalt je natuurlijke creatineproductie — aanvullen helpt bij prestatie en spierbehoud.",
      href: "/beste-creatine",
      hasComparison: true,
    },
    {
      name: "Magnesium glycinaat",
      efsa_claim:
        "Magnesium draagt bij tot de normale spierfunctie en tot de vermindering van vermoeidheid.",
      why_this_profile:
        "Bij intensief trainen verlies je magnesium via zweet. Tekort leidt tot krampen, trage recovery en slechte slaap — precies het patroon van de Overtrainer.",
      href: "/beste-magnesium",
      hasComparison: true,
    },
  ],

  guidanceCta: {
    title: "Train je te hard — of herstel je te weinig?",
    text: "De Leefstijlcheck meet je herstelvermogen, beweging, slaap en meer in 3 minuten. Ontdek waar de balans is verstoord.",
  },

  relatedPillar: null,

  relatedComparisons: [
    {
      href: "/beste-creatine",
      turboSnippet:
        "Creatine monohydraat: welk merk geeft de beste kwaliteit voor de prijs? Vergeleken.",
    },
    {
      href: "/beste-magnesium",
      turboSnippet:
        "Welke magnesium helpt het beste bij spierherstel? Glycinaat vs citraat — vergeleken.",
    },
  ],

  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Profielen", href: "/profiel" },
    { name: "Overtrainer", href: "/profiel/overtrainer" },
  ],
};
