import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";

export const sleepPlanTemplate: LifestylePlanTemplate = {
  domain: "sleep",
  guideThema: "slaap",
  version: "1.0",
  title: "Slaapplan na 40",
  recognition: {
    heading: "Dit herken je misschien",
    body:
      "Je slaapt wel, maar wordt moe wakker. Je ligt 's nachts te malen over werk. " +
      "Je valt in slaap, maar wordt rond drie uur wakker — en in het weekend uitslapen helpt niet echt.\n\n" +
      "Dat is geen karakterfout. Na je veertigste verandert hoe je lichaam ritme houdt, stress verwerkt en 's nachts herstelt. " +
      "Herkenning is de eerste stap — daarna kun je gericht iets veranderen.",
  },
  mechanism: {
    heading: "Waarom slaap na 40 anders werkt",
    body:
      "Je innerlijke klok wordt gevoeliger voor licht, stress en onregelmatige tijden. " +
      "Melatonine komt later op gang, cortisol blijft langer actief en één slechte nacht trekt sneller door naar de volgende.\n\n" +
      "Daarom win je hier het meeste met vaste tijden, minder avondprikkels en een koele, donkere slaapkamer — " +
      "niet met het zoveelste trucje. Supplementen kunnen aanvullen waar leefstijl niet rond komt, maar ze vervangen geen ritme.",
    source: "Aansluitend op slaap- en stressscores uit je intake — patronen, geen diagnose.",
  },
  phases: [
    {
      id: "slp-phase-deze-week",
      horizon: "deze-week",
      title: "Deze week: drie snelle winst",
      intro: {
        body:
          "Geen grote operatie — drie concrete gewoonten die je vanavond al kunt zetten. " +
          "Vink af wat je gedaan hebt; consistentie telt meer dan perfectie.",
      },
      steps: [
        {
          id: "slp-vast-bedtijd-venster",
          title: "Ga de komende 3 nachten op hetzelfde tijdstip naar bed.",
          rationale: {
            body:
              "Je lichaam leert wanneer het mag afbouwen. Een vast venster — ook als je nog niet meteen inslaapt — " +
              "helpt je innerlijke klok kalibreren.",
          },
          tags: ["ritme"],
        },
        {
          id: "slp-slaapkamer-koel-donker-stil",
          title: "Houd je slaapkamer koel, donker en stil — geen scherm in bed.",
          rationale: {
            body:
              "Licht en prikkels houden je zenuwstelsel alert. Een koele, donkere omgeving ondersteunt wat je lichaam 's nachts vanzelf probeert te doen.",
          },
          tags: ["omgeving"],
        },
        {
          id: "slp-stop-eten-voor-slapen",
          title: "Stop met eten 2–3 uur voor het slapen.",
          rationale: {
            body:
              "Spijsvertering en slaap delen dezelfde avonduren. Een lege maag 's avonds maakt het makkelijker om door te schakelen naar rust.",
          },
          tags: ["voeding"],
        },
      ],
    },
    {
      id: "slp-phase-week-2-4",
      horizon: "week-2-4",
      title: "Week 2–4: ritme bouwen",
      intro: {
        body:
          "Nu de basis staat, veranker je een avondroutine en een vast slaap-waakritme. " +
          "Supplementstappen hieronder verschijnen alleen als je intake daar een signaal voor gaf.",
      },
      steps: [
        {
          id: "slp-avond-ademhaling",
          title: "Doe elke avond 5 minuten ademhaling vóór het slapen.",
          rationale: {
            body:
              "Langzame ademhaling helpt je lichaam overschakelen van 'aan' naar 'uit'. " +
              "Koppel het aan een vast moment — tandenpoetsen, douche of bed — zodat het automatisch wordt.",
          },
          tags: ["ritme", "stress"],
        },
        {
          id: "slp-vast-slaapritme",
          title:
            "Sta elke ochtend op binnen een half uur van je vaste tijd — ook in het weekend.",
          rationale: {
            body:
              "Opstaatijd is de anker voor je ritme. Uitslapen in het weekend voelt logisch, maar verschuift je klok en maakt maandag zwaarder.",
          },
          tags: ["ritme"],
        },
        {
          id: "slp-alcohol-vrije-avonden",
          title: "Plan 2–3 avonden per week zonder alcohol.",
          rationale: {
            body:
              "Alcohol kan inslapen makkelijker lijken, maar verkort diepe slaap. " +
              "Vaste alcoholvrije avonden geven je lichaam ruimte om echt te herstellen.",
          },
          showWhen: { type: "answerAtMost", question: "LIF_ALC", value: 2 },
          tags: ["ritme"],
        },
        {
          id: "slp-magnesium-vergelijk",
          title:
            "Vergelijk magnesium glycinaat als aanvulling naast je avondroutine.",
          rationale: {
            body:
              "Je antwoorden tonen signalen rond slapen en herstel. Magnesium draagt bij tot normale psychologische functie, " +
              "tot de normale werking van het zenuwstelsel en tot vermindering van vermoeidheid — geen vervanging voor ritme.",
          },
          showWhen: { type: "signal", signal: "magnesium_signal" },
          link: {
            label: "Vergelijk magnesium",
            href: COMPARISON_PATHS.magnesium,
            kind: "comparison",
          },
          tags: ["supplement"],
        },
        {
          id: "slp-melatonine-vergelijk",
          title:
            "Bekijk melatonine als je lang wakker ligt terwijl je avondroutine op orde is.",
          rationale: {
            body:
              "Je ligt regelmatig lang wakker. Melatonine kan helpen je slaap-waakritme te herstellen " +
              "(bij minimaal 1 mg voor het slapen volgens claimvoorwaarden) — naast vaste bedtijden, niet in plaats daarvan.",
          },
          showWhen: { type: "signal", signal: "melatonine_signal" },
          link: {
            label: "Vergelijk melatonine",
            href: COMPARISON_PATHS.melatonine,
            kind: "comparison",
          },
          tags: ["supplement"],
        },
      ],
    },
    {
      id: "slp-phase-week-4-12",
      horizon: "week-4-12",
      title: "Week 4–12: verankeren en meten",
      intro: {
        body:
          "Gewoonten die blijven hangen, zijn gewoonten die je af en toe bewust checkt. " +
          "Evalueer je voortgang en pas aan waar nodig — zonder alles opnieuw te beginnen.",
      },
      steps: [
        {
          id: "slp-weekelijkse-check-in",
          title:
            "Evalueer elke zondag hoeveel nachten je je vaste bedtijd aanhield.",
          rationale: {
            body:
              "Eén korte check per week houdt je ritme scherp. Geen dagboek nodig — tel alleen of je op koers bent of dat iets verschoven is.",
          },
          tags: ["check-in"],
        },
        {
          id: "slp-ritme-vasthouden",
          title:
            "Houd je vaste bed- en opstaatijden aan, ook na een slechte nacht.",
          rationale: {
            body:
              "Inhalen met uitslapen voelt logisch, maar verschuift je klok. Consistentie herstelt sneller dan compenseren.",
          },
          tags: ["ritme"],
        },
        {
          id: "slp-her-intake",
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
          id: "slp-gids-download",
          title: "Download de Slaapgids voor het volledige 7-dagen protocol.",
          rationale: {
            body:
              "Alles over slaaphygiëne, ritme en supplementen in één overzicht — handig om naast dit plan te bewaren.",
          },
          link: {
            label: "Gratis Slaapgids",
            href: "/gids/slaap",
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
      "Blijven slaapproblemen aanhouden, hoor je snurken met ademstops, of ben je overdag extreem slaperig? " +
      "Bespreek het met je huisarts. Bij langdurige klachten kun je bloedonderzoek laten doen — zekerheid haal je bij de arts, niet uit een vragenlijst.",
  },
};
