import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";

export const movementPlanTemplate: LifestylePlanTemplate = {
  domain: "movement",
  guideThema: "beweging",
  version: "1.1",
  title: "Bewegingsplan na 40",
  recognition: {
    heading: "Dit herken je misschien",
    body:
      "Je traint nog wel, maar herstel duurt langer. Cardio lukt, maar kracht schiet erbij in — of andersom. " +
      "Je voelt dat spieren trager terugkomen — niet omdat bewegen niet meer werkt, maar omdat ritme en rust zwaarder meetellen.\n\n" +
      "Herkenning is de eerste stap. Daarna kun je gericht iets veranderen — thuis, zonder sportschool-hype.",
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
      title: "Deze week: één krachtprikkel thuis",
      intro: {
        body:
          "Geen sportschool nodig — kies één oefening die je vandaag kunt doen, of houd je bestaande ritme scherp. " +
          "Vink af wat je gedaan hebt; consistentie telt meer dan perfectie.",
      },
      steps: [
        {
          id: "mov-thuis-basisoefening",
          title:
            "Kies één kracht-oefening thuis — kniebuigingen, opdrukken tegen het aanrecht, of opstaan uit een stoel zonder je handen.",
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
          title:
            "Plan deze week één krachtsessie met squat, push en pull — korter dan gewoon, techniek scherp.",
          rationale: {
            body:
              "Je traint al kracht — winst zit nu vaak in consistentie en herstel, niet in meer volume. " +
              "Eén bewuste sessie houdt het ritme scherp zonder je lichaam te overbelasten.",
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
          title: "Plan na een zware dag een rustdag of lichte wandeling.",
          rationale: {
            body:
              "Herstel is waar je sterker wordt — niet tijdens de training. Een geplande rustdag voorkomt dat je te veel volume stapelt.",
          },
          tags: ["herstel"],
        },
        {
          id: "mov-trap-of-wandeling",
          title: "Neem vandaag de trap in plaats van de lift — of loop 20 minuten stevig.",
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
          title:
            "Plan 2× deze week matig intensief bewegen — fietsen, wandelen of sport waarbij praten nog lukt.",
          rationale: {
            body:
              "Je conditie staat al redelijk op peil. Twee bewuste sessies houden dat niveau vast zonder dat je meteen extra volume hoeft te stapelen.",
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
          title:
            "Train 2× per week full-body: squat/goblet, push, pull en hip hinge — 2–3 sets × 8–12 reps.",
          rationale: {
            body:
              "Twee korte krachtsessies per week zijn voor veel mannen 40+ een haalbaar startpunt. " +
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
          title:
            "Houd 2× per week full-body vol — noteer of je binnen 48–72 uur hersteld voelt.",
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
          title:
            "Loop of fiets 2× deze week 30 minuten matig intensief — praten lukt, zingen niet.",
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
          title:
            "Voeg tijdens één wandeling 3× 1 minuut stevig doorstappen toe — daarna rustig verder.",
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
          title: "Noteer 7 dagen: training, slaap en zwaarte na inspanning.",
          rationale: {
            body:
              "Belasting en herstel loggen maakt patronen zichtbaar wanneer je te veel of te weinig doet — vóór je extra supplementen stapelt.",
          },
          tags: ["meten"],
        },
        {
          id: "mov-eiwit-koppeling",
          title: "Check of je eiwit bij elke maaltijd zit — kracht zonder eiwit is half werk.",
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
          tags: ["voeding"],
        },
        {
          id: "mov-creatine-vergelijk",
          title:
            "Vergelijk creatine als aanvulling bij structurele krachttraining.",
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
          tags: ["supplement"],
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
          title:
            "Voeg een derde krachtdag toe óf verhoog volume op twee dagen — niet beide tegelijk.",
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
          title:
            "Evalueer elke zondag: hoeveel kracht- en conditiesessies deed je deze week?",
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
          title: "Doe na 8–12 weken opnieuw de intake om je voortgang te meten.",
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
          title: "Ontvang het volledige beweging-stappenplan per e-mail.",
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
