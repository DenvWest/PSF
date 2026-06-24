import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import type { LifestylePlanTemplate } from "@/types/lifestyle-plan";

export const stressPlanTemplate: LifestylePlanTemplate = {
  domain: "stress",
  guideThema: "stress",
  version: "1.0",
  title: "Stressplan na 40",
  recognition: {
    heading: "Dit herken je misschien",
    body:
      "Je blijft 'aan' staan na werk — je hoofd draait door terwijl je thuis al zou moeten zijn. " +
      "Je piekert in bed over morgen. En op een drukke dag kom je nauwelijks toe aan echte herstelmomenten.\n\n" +
      "Dat is geen karakterfout. Na je veertigste herstelt je stress-as trager; je lichaam schakelt minder snel terug naar rust. " +
      "Herkenning is de eerste stap — daarna kun je gericht iets veranderen.",
  },
  mechanism: {
    heading: "Waarom stressherstel na 40 trager gaat",
    body:
      "Je cortisol-as reageert nog steeds op druk, maar schakelt trager terug naar rust. " +
      "Een chronische 'aan'-stand trekt door in je avond, je slaap en je herstel — één stressvolle dag heeft meer nasleep dan vroeger.\n\n" +
      "Daarom win je hier het meeste met vaste overgangsmomenten, ademhaling en grenzen na werk — " +
      "niet met het zoveelste supplement. Magnesium kan aanvullen waar leefstijl niet rond komt, maar het vervangt geen ritme.",
    source: "Aansluitend op stress-scores uit je intake — patronen, geen diagnose.",
  },
  phases: [
    {
      id: "str-phase-deze-week",
      horizon: "deze-week",
      title: "Deze week: drie snelle winst",
      intro: {
        body:
          "Geen grote operatie — drie concrete gewoonten die je vandaag al kunt zetten. " +
          "Vink af wat je gedaan hebt; consistentie telt meer dan perfectie.",
      },
      steps: [
        {
          id: "str-box-breathing",
          title:
            "Doe elke werkdag 4 minuten box-breathing direct na werk — vóór je je telefoon pakt.",
          rationale: {
            body:
              "4 tellen in, 4 vast, 4 uit — herhaal 4 minuten. Langzame ademhaling helpt je lichaam meetbaar terugschakelen van 'aan' naar rust. " +
              "Koppel het aan het moment dat je thuiskomt of je laptop dichtklapt.",
          },
          tags: ["ritme"],
        },
        {
          id: "str-vast-afsluitmoment",
          title:
            "Plan een vast afsluitmoment tussen werk en avond — telefoon weg, korte wandeling of douche.",
          rationale: {
            body:
              "Je lichaam heeft een signaal nodig dat de werkdag voorbij is. Een overgangsritueel maakt die scheiding concreet — " +
              "zonder dat je de hele avond nog in werktmodus blijft hangen.",
          },
          tags: ["ritme"],
        },
        {
          id: "str-herstelmoment-overdag",
          title:
            "Neem één bewust herstelmoment van 5 minuten midden op de dag — weg van je scherm.",
          rationale: {
            body:
              "Stress stapelt op als je de hele dag doorrent. Eén korte pauze halverwege voorkomt dat je 's avonds pas leegloopt.",
          },
          showWhen: { type: "answerAtMost", question: "STR_RCV", value: 2 },
          tags: ["herstel"],
        },
      ],
    },
    {
      id: "str-phase-week-2-4",
      horizon: "week-2-4",
      title: "Week 2–4: grenzen en ritme verankeren",
      intro: {
        body:
          "Nu de basis staat, veranker je grenzen na werk en een vaste ademhalingsroutine. " +
          "Supplementstappen hieronder verschijnen alleen als je intake daar een signaal voor gaf.",
      },
      steps: [
        {
          id: "str-grenzen-werk",
          title:
            "Stel een vaste eindtijd in voor werkgerelateerde berichten — en houd je eraan.",
          rationale: {
            body:
              "Zonder grens blijft je hoofd in werktempo. Een vaste eindtijd geeft je lichaam ruimte om echt af te bouwen — " +
              "ook als er nog mail binnenkomt.",
          },
          link: {
            label: "Grenzen stellen na werk",
            href: "/blog/stress-werk-grenzen-stellen",
            kind: "article",
          },
          tags: ["grenzen"],
        },
        {
          id: "str-ademhaling-routine",
          title: "Breid je ademhalingsoefening uit naar 2× per dag — na werk én vóór het slapen.",
          rationale: {
            body:
              "Eén sessie helpt, twee sessies verankeren het patroon. Koppel elke sessie aan een vast moment zodat het automatisch wordt.",
          },
          link: {
            label: "Ademhaling tegen stress",
            href: "/blog/ademhaling-tegen-stress",
            kind: "article",
          },
          tags: ["ritme"],
        },
        {
          id: "str-magnesium-voeding",
          title:
            "Voeg dagelijks bladgroenten, noten of peulvruchten toe — check je voeding in 1 minuut.",
          rationale: {
            body:
              "Magnesium uit voeding komt vooral uit bladgroenten, noten en peulvruchten. " +
              "Eerst die basis; supplement is aanvulling, geen vervanging voor ritme.",
          },
          showWhen: { type: "signal", signal: "cortisol_risk" },
          link: {
            label: "Doe de voedingscheck",
            href: "/intake/voeding",
            kind: "article",
          },
          tags: ["voeding"],
        },
        {
          id: "str-magnesium-vergelijk",
          title:
            "Magnesium als aanvulling naast je stressroutine — alleen als voeding en ritme op orde zijn.",
          rationale: {
            body:
              "Magnesium draagt bij tot een normale psychologische functie en draagt bij tot de normale werking van het zenuwstelsel — " +
              "geen vervanging voor ritme of voeding.",
          },
          showWhen: { type: "signal", signal: "cortisol_risk" },
          link: {
            label: "Magnesium — normale psychologische functie (EFSA)",
            href: COMPARISON_PATHS.magnesium,
            kind: "comparison",
          },
          tags: ["supplement"],
        },
      ],
    },
    {
      id: "str-phase-week-4-12",
      horizon: "week-4-12",
      title: "Week 4–12: verankeren en meten",
      intro: {
        body:
          "Gewoonten die blijven hangen, zijn gewoonten die je af en toe bewust checkt. " +
          "Evalueer je voortgang en pas aan waar nodig — zonder alles opnieuw te beginnen.",
      },
      steps: [
        {
          id: "str-weekelijkse-check-in",
          title:
            "Evalueer elke zondag hoeveel dagen je je afsluitmoment en ademhalingsroutine aanhield.",
          rationale: {
            body:
              "Eén korte check per week houdt je ritme scherp. Geen dagboek nodig — tel alleen of je op koers bent of dat iets verschoven is.",
          },
          tags: ["check-in"],
        },
        {
          id: "str-ritme-vasthouden",
          title:
            "Houd je vaste afsluitmoment en ademhalingsroutine aan, ook na een drukke week.",
          rationale: {
            body:
              "Inhalen met uitzonderingen voelt logisch, maar verschuift je patroon. Consistentie herstelt sneller dan compenseren.",
          },
          tags: ["ritme"],
        },
        {
          id: "str-her-intake",
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
          id: "str-gids-download",
          title: "Ontvang het volledige stress-stappenplan per e-mail.",
          rationale: {
            body:
              "Alles over stressherstel, grenzen stellen en supplementen in één overzicht — handig om naast dit plan te bewaren.",
          },
          link: {
            label: "Gratis Stressgids",
            href: "/gids/stress",
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
      "Blijven klachten van overspanning aanhouden, voel je je uitgeput zonder herstel, of twijfel je over burn-out? " +
      "Bespreek het met je huisarts. Zekerheid haal je bij de arts, niet uit een vragenlijst.",
  },
};
