import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";

export const movementPlanTemplate: LifestylePlanTemplate = {
  domain: "movement",
  guideThema: "beweging",
  version: "1.4",
  title: "Bewegingsplan na 40",
  recognition: {
    heading: "Dit herken je misschien",
    body:
      "Herstel duurt langer, of kracht en conditie lopen uit elkaar — ritme en rust tellen zwaarder na 40. " +
      "Eén lichte actie deze week is genoeg om te starten.",
  },
  mechanism: {
    heading: "Waarom beweging na 40 anders werkt",
    body:
      "Vanaf je 40e verlies je gemiddeld spiermassa als je geen krachtprikkel geeft. Cardio alleen houdt conditie op peil, " +
      "maar krachttraining is wat sarcopenie het hardst remt — mits je genoeg eiwit eet en herstelt.\n\n" +
      "Waar begin je? Met één echte krachtprikkel thuis als je net start — niet met een perfect schema. " +
      "Train je al regelmatig? Houd eerst je ritme en herstel scherp, bouw daarna pas volume op. " +
      "Kracht vóór extra volume; conditie bouw je op via stevig wandelen en daarna zone 2 — niet meteen alles tegelijk.\n\n" +
      "Supplementen kunnen aanvullen waar leefstijl niet rond komt, maar ze vervangen geen training of rust.",
    source: "Aansluitend op beweging- en herstelscores uit je intake — patronen, geen diagnose.",
  },
  phases: [
    {
      id: "mov-phase-deze-week",
      horizon: "deze-week",
      title: "Deze week: kies je focus",
      intro: {
        body:
          "Kies een categorie — één focus per keer. Geen sportschool nodig; vink af wat je gedaan hebt.",
      },
      steps: [
        {
          id: "mov-thuis-basisoefening",
          intensityTier: "high",
          title: "Eén krachtoefening thuis: kniebuiging, opdrukken of opstaan uit een stoel",
          rationale: {
            body:
              "Eén echte krachtprikkel per week is beter dan een perfect schema dat je niet volhoudt. " +
              "Kies wat past bij je lichaam en schema — één is genoeg om te starten.",
          },
          showWhen: { type: "answerAtMost", question: "MOV_STR", value: 2 },
          link: {
            label: "Onderbouwing krachttraining",
            href: "/onderbouwing#MOV_STR",
            kind: "article",
          },
          tags: ["kracht", "thuis", "starter"],
        },
        {
          id: "mov-kracht-onderhoud-week",
          intensityTier: "high",
          title: "Eén krachtsessie: squat, push, pull",
          rationale: {
            body:
              "Je traint al kracht — winst zit nu vaak in consistentie en herstel, niet in meer volume. " +
              "Eén bewuste sessie houdt het ritme scherp: korter dan gewoon, techniek scherp, zonder je lichaam te overbelasten.",
          },
          showWhen: { type: "answerAtLeast", question: "MOV_STR", value: 3 },
          link: {
            label: "Lees het 8-weken startprotocol",
            href: "/blog/krachttraining-na-40",
            kind: "article",
          },
          tags: ["kracht", "onderhoud"],
        },
        {
          id: "mov-rustdag-na-inspanning",
          intensityTier: "recovery",
          title: "Rustdag of lichte wandeling",
          rationale: {
            body:
              "Herstel is waar je sterker wordt — niet tijdens de training. Een geplande rustdag voorkomt dat je te veel volume stapelt.",
          },
          tags: ["herstel"],
        },
        {
          id: "mov-trap-of-wandeling",
          intensityTier: "moderate",
          title: "Neem de trap of loop 20 min stevig",
          rationale: {
            body:
              "Conditie en kracht vullen elkaar aan. Een korte stevige wandeling of extra trap telt mee, ook zonder sportschool.",
          },
          showWhen: { type: "answerAtMost", question: "MOV_CARD", value: 2 },
          link: {
            label: "Onderbouwing conditie",
            href: "/onderbouwing#MOV_CARD",
            kind: "article",
          },
          tags: ["conditie", "starter"],
        },
        {
          id: "mov-conditie-onderhoud-week",
          intensityTier: "moderate",
          title: "2× matig intensief bewegen",
          rationale: {
            body:
              "Je conditie staat al redelijk op peil. Twee bewuste sessies — fietsen, wandelen of sport waarbij praten nog lukt — houden dat niveau vast zonder dat je meteen extra volume hoeft te stapelen.",
          },
          showWhen: { type: "answerAtLeast", question: "MOV_CARD", value: 3 },
          link: {
            label: "Beweging na 40 — kracht & conditie",
            href: "/beweging-na-40",
            kind: "article",
          },
          tags: ["conditie", "onderhoud"],
        },
      ],
    },
    {
      id: "mov-phase-week-2-4",
      horizon: "week-2-4",
      title: "Week 2–4: structureel krachttrainen",
      intro: {
        body:
          "Nu de basis staat, bouw je op naar 2× per week full-body kracht — of houd dat ritme scherp als je al traint. " +
          "Noteer kort wat je deed; dat maakt patronen zichtbaar.",
      },
      steps: [
        {
          id: "mov-full-body-2x",
          intensityTier: "high",
          title: "2× per week full-body kracht",
          rationale: {
            body:
              "Twee korte krachtsessies per week zijn voor veel mannen 40+ een haalbaar startpunt: squat/goblet, push, pull en hip hinge — 2–3 sets × 8–12 reps. " +
              "Techniek eerst, zwaarte daarna — rust 48–72 uur tussen krachtdagen.",
          },
          showWhen: { type: "answerAtMost", question: "MOV_STR", value: 2 },
          link: {
            label: "Lees het 8-weken startprotocol",
            href: "/blog/krachttraining-na-40",
            kind: "article",
          },
          tags: ["kracht", "starter"],
        },
        {
          id: "mov-kracht-consistentie",
          intensityTier: "high",
          title: "Houd 2× per week full-body vol",
          rationale: {
            body:
              "Je traint al structureel kracht. Consistentie en herstel zijn nu belangrijker dan extra dagen. " +
              "Voel je je chronisch zwaar? Plan een rustdag vóór je volume verhoogt.",
          },
          showWhen: { type: "answerAtLeast", question: "MOV_STR", value: 3 },
          link: {
            label: "Onderbouwing krachttraining",
            href: "/onderbouwing#MOV_STR",
            kind: "article",
          },
          tags: ["kracht", "onderhoud"],
        },
        {
          id: "mov-conditie-zone2",
          intensityTier: "moderate",
          title: "2× 30 min matig intensief (zone 2)",
          rationale: {
            body:
              "Zone 2 (matig intensief) bouwt conditie op zonder je herstel te slopen. " +
              "Praten-nog-lukt is je eenvoudige test — geen hartslagmeter nodig.",
          },
          showWhen: { type: "answerAtMost", question: "MOV_CARD", value: 2 },
          link: {
            label: "Onderbouwing conditie",
            href: "/onderbouwing#MOV_CARD",
            kind: "article",
          },
          tags: ["conditie", "starter"],
        },
        {
          id: "mov-conditie-interval-lite",
          intensityTier: "high",
          title: "3× 1 min stevig doorstappen tijdens je wandeling",
          rationale: {
            body:
              "Je conditie is redelijk — korte stevige stukken geven een extra prikkel zonder een heel intervalschema. " +
              "Blijf binnen de spreektest: praten moet net nog lukken na elk stuk.",
          },
          showWhen: { type: "answerEquals", question: "MOV_CARD", value: 3 },
          tags: ["conditie"],
        },
        {
          id: "mov-training-log",
          title: "Log 7 dagen: training, slaap, zwaarte",
          rationale: {
            body:
              "Belasting en herstel loggen maakt patronen zichtbaar wanneer je te veel of te weinig doet — vóór je extra supplementen stapelt.",
          },
          tags: ["meten"],
        },
        {
          id: "mov-eiwit-koppeling",
          title: "Eiwit bij elke maaltijd",
          rationale: {
            body:
              "Spierbehoud vraagt om eiwit én beweging. Als je voeding achterblijft, levert training minder op — eerst tafel, dan potje.",
          },
          showWhen: { type: "signal", signal: "protein_gap_signal" },
          link: {
            label: "Doe de voedingscheck",
            href: "/intake/voeding",
            kind: "article",
          },
          tags: ["voeding", "nutrient-bridge"],
        },
        {
          id: "mov-creatine-vergelijk",
          title: "Vergelijk creatine als aanvulling",
          rationale: {
            body:
              "Je antwoorden tonen signalen rond kracht en herstel. Creatine wordt veel besproken bij krachttraining — " +
              "geen vervanging van slaap, eiwit of rustdagen.",
          },
          showWhen: { type: "answerAtMost", question: "MOV_STR", value: 2 },
          link: {
            label: "Vergelijk creatine",
            href: COMPARISON_PATHS.creatine,
            kind: "comparison",
          },
          tags: ["supplement", "nutrient-bridge"],
        },
      ],
    },
    {
      id: "mov-phase-week-4-12",
      horizon: "week-4-12",
      title: "Week 4–12: verankeren en meten",
      intro: {
        body:
          "Gewoonten die blijven hangen, zijn gewoonten die je af en toe bewust checkt. " +
          "Bouw volume rustig op — niet beide tegelijk.",
      },
      steps: [
        {
          id: "mov-volume-opbouwen",
          title: "Derde krachtdag óf meer volume — niet beide",
          rationale: {
            body:
              "Meer volume is niet automatisch beter. Eén variabele tegelijk aanpassen houdt herstel haalbaar — " +
              "alleen zinvol als 2× per week al voelt als routine.",
          },
          showWhen: { type: "answerAtLeast", question: "MOV_STR", value: 3 },
          tags: ["kracht"],
        },
        {
          id: "mov-weekelijkse-check-in",
          title: "Zondag: tel je kracht- en conditiesessies",
          rationale: {
            body:
              "Eén korte check per week houdt je ritme scherp. Geen dagboek nodig — tel alleen of je op koers bent.",
          },
          link: {
            label: "Doe de beweegcheck",
            href: "/intake/beweging",
            kind: "article",
          },
          tags: ["check-in"],
        },
        {
          id: "mov-her-intake",
          title: "Herhaal na 8–12 weken de intake",
          rationale: {
            body:
              "Je lichaam verandert; je antwoorden ook. Een her-intake laat zien wat beter gaat en waar je focus naartoe verschuift.",
          },
          link: {
            label: "Start her-intake",
            href: "/intake",
            kind: "article",
          },
          tags: ["check-in"],
        },
        {
          id: "mov-gids-download",
          title: "Ontvang het volledige stappenplan per e-mail",
          rationale: {
            body:
              "Alles over kracht thuis, herstel en supplementen in één overzicht — handig om naast dit plan te bewaren.",
          },
          link: {
            label: "Gratis Bewegingsgids",
            href: "/gids/beweging",
            kind: "guide",
          },
          tags: ["gids"],
        },
      ],
    },
  ],
  medicalBoundary: {
    heading: "Advies, geen diagnose",
    body:
      "Dit plan helpt je patronen te herkennen en gericht te handelen — het vervangt geen medisch advies.\n\n" +
      "Pijn bij bewegen, duizeligheid of aanhoudende vermoeidheid na training? Bespreek het met je huisarts of fysiotherapeut. " +
      "Bij twijfel over creatine of andere supplementen: eerst je basis op orde, daarna vergelijken.",
  },
};
