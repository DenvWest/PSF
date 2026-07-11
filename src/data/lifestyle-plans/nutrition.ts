import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";

export const nutritionPlanTemplate: LifestylePlanTemplate = {
  domain: "nutrition",
  guideThema: "voeding",
  version: "1.0",
  title: "Voedingsplan na 40",
  recognition: {
    heading: "Dit herken je misschien",
    body:
      "Je eet \"gezond genoeg\", maar herstel en energie lopen achter. Eiwit schiet erbij in, vette vis komt te weinig voor, " +
      "en supplementen lijken makkelijker dan je voeding structureren.\n\n" +
      "Herkenning is de eerste stap — daarna kun je gericht iets veranderen, maaltijd voor maaltijd.",
  },
  mechanism: {
    heading: "Waarom voeding na 40 anders telt",
    body:
      "Na je 40e gebruikt je lichaam eiwit minder efficiënt voor spierbehoud. Stabiel bloedsuiker en voldoende vetzuren " +
      "ondersteunen energie en herstel — supplementen vullen aan waar voeding structureel tekortschiet.\n\n" +
      "Daarom win je hier het meeste met eiwit bij elke maaltijd en vette vis 2× per week — niet met het zoveelste potje. " +
      "Vergelijken pas als je basis op orde is.",
    source: "Aansluitend op voeding- en energie-scores uit je intake — inname-inschatting, geen diagnose.",
  },
  phases: [
    {
      id: "nut-phase-deze-week",
      horizon: "deze-week",
      title: "Deze week: eiwit als anker",
      intro: {
        body:
          "Geen dieet — één gewoonte die je elke dag herhaalt. " +
          "Vink af wat je gedaan hebt; consistentie telt meer dan perfectie.",
      },
      steps: [
        {
          id: "nut-eiwit-per-maaltijd",
          title: "Begin elke maaltijd met 20–30 g eiwit — 2 eieren + kwark, 100 g kip of 135 g linzen.",
          rationale: {
            body:
              "Voldoende eiwit per maaltijd ondersteunt spiermassa en herstel — vooral relevant na 40. " +
              "Verspreid over de dag werkt beter dan één grote portie 's avonds.",
          },
          tags: ["eiwit"],
        },
        {
          id: "nut-vaste-eetmomenten",
          title: "Eet op vaste tijden — geen urenlang overslaan en 's avonds inhalen.",
          rationale: {
            body:
              "Regelmaat helpt je energie stabieler te houden. Een vaste structuur maakt eiwit en vezels makkelijker vol te houden.",
          },
          tags: ["ritme"],
        },
        {
          id: "nut-vette-vis",
          title: "Plan deze week 1–2 porties vette vis (100–150 g zalm, makreel of haring).",
          rationale: {
            body:
              "EPA en DHA komen vooral uit vette vis. Eet je minder dan twee porties per week, is omega-3 later het logische gesprek — eerst voeding.",
          },
          showWhen: { type: "signal", signal: "omega3_deficiency" },
          tags: ["vetzuren"],
        },
      ],
    },
    {
      id: "nut-phase-week-2-4",
      horizon: "week-2-4",
      title: "Week 2–4: inzicht in je patroon",
      intro: {
        body:
          "Nu de basis staat, krijg je zicht op wat je echt binnenkrijgt. " +
          "Een korte check is genoeg — geen calorie-app nodig.",
      },
      steps: [
        {
          id: "nut-voeding-log",
          title: "Noteer 5 dagen: eiwit per maaltijd en hoe vaak je vette vis at.",
          rationale: {
            body:
              "Bijhouden maakt tekorten zichtbaar voordat je supplementeert. Patronen worden duidelijker dan gokken.",
          },
          tags: ["meten"],
        },
        {
          id: "nut-intake-voeding",
          title: "Doe de snelle voedingscheck — 1 minuut, direct inzicht.",
          rationale: {
            body:
              "Zelf-gerapporteerd, geen diagnose — wel een eerlijk beeld van gisteren. Herhaal over twee weken om verschil te zien.",
          },
          link: {
            label: "Start voedingscheck",
            href: "/intake/voeding",
            kind: "article",
          },
          tags: ["meten"],
        },
        {
          id: "nut-beweging-koppeling",
          title: "Check of je genoeg beweging doet — eiwit zonder prikkel is half werk.",
          rationale: {
            body:
              "Spierbehoud vraagt om eiwit én krachttraining. Als beweging achterblijft, levert voeding alleen minder op.",
          },
          showWhen: { type: "scoreBelow", domain: "movement", value: 65 },
          link: {
            label: "Doe de beweegcheck",
            href: "/intake/beweging",
            kind: "article",
          },
          tags: ["beweging"],
        },
      ],
    },
    {
      id: "nut-phase-week-4-12",
      horizon: "week-4-12",
      title: "Week 4–12: aanvullen waar nodig",
      intro: {
        body:
          "Supplementen zijn geen vervanging voor voeding — wel een logische tweede stap als je basis op orde is en inname structureel tekortschiet.",
      },
      steps: [
        {
          id: "nut-weekelijkse-check-in",
          title:
            "Evalueer elke zondag: at je deze week eiwit bij elke maaltijd?",
          rationale: {
            body:
              "Eén korte check per week houdt je gewoonte scherp. Geen dagboek nodig — tel alleen of je op koers bent.",
          },
          tags: ["check-in"],
        },
        {
          id: "nut-omega-3-vergelijk",
          title:
            "Vergelijk omega-3 als vette vis structureel ontbreekt.",
          rationale: {
            body:
              "Je antwoorden tonen signalen rond vetzuren. EPA en DHA dragen bij tot normale hartfunctie — geen vervanging voor vis op je bord.",
          },
          showWhen: { type: "signal", signal: "omega3_deficiency" },
          link: {
            label: "Vergelijk omega-3",
            href: COMPARISON_PATHS["omega-3-supplement"],
            kind: "comparison",
          },
          tags: ["supplement"],
        },
        {
          id: "nut-eiwitpoeder",
          title:
            "Vergelijk eiwitpoeder als je eiwit via voeding niet vol krijgt.",
          rationale: {
            body:
              "Poeder is aanvulling — geen vervanging voor maaltijden. Pas relevant als je structureel onder je behoefte zit ondanks je inspanning.",
          },
          showWhen: { type: "signal", signal: "protein_gap_signal" },
          link: {
            label: "Vergelijk eiwitpoeder",
            href: "/beste/eiwitpoeder",
            kind: "comparison",
          },
          tags: ["supplement"],
        },
        {
          id: "nut-her-intake",
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
          id: "nut-gids-download",
          title: "Ontvang het volledige voedings-stappenplan per e-mail.",
          rationale: {
            body:
              "Alles over eiwit, ritme en supplementen in één overzicht — handig om naast dit plan te bewaren.",
          },
          link: {
            label: "Gratis Voedingsgids",
            href: "/gids/voeding",
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
      "Aanhoudende vermoeidheid, onverklaard gewichtsverlies of twijfel over tekorten? Bespreek het met je huisarts. " +
      "Bloedonderzoek geeft zekerheid — een vragenlijst geeft richting, geen diagnose.",
  },
};
