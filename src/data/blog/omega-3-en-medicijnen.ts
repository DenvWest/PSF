import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const omega3EnMedicijnenData: BlogArtikel = {
  slug: "omega-3-en-medicijnen",
  categorie: "supplementen",
  titel: "Omega-3 en medicijnen: de bloedingsangst, en waar hij vandaan komt",
  coverImage: "/images/blog/omega-3-en-medicijnen.jpg",
  coverImageAlt: "Supplementcapsules en potjes naast medicijnblisters op een rustig blad",
  heroIntro:
    "“Niet combineren met bloedverdunners” staat op vrijwel elke bijsluiter en op vrijwel elk forum. Het waarschuwende zinnetje is ouder dan het onderzoek dat het inmiddels genuanceerd heeft. Hier lees je wat er werkelijk gemeten is bij visolie naast antistolling, en welke situaties wél om overleg vragen — inclusief de operatie waar het advies vandaan komt.",
  leestijd: "8 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Dit artikel vervangt geen medisch advies. Gebruik je antistolling, plaatjesremmers of sta je op de operatielijst, overleg dan met je arts, apotheker of trombosedienst voordat je iets start of stopt.",
  secties: [
    {
      type: "tekst",
      titel: "Waar de waarschuwing vandaan komt",
      bewijsNiveau: "redelijk",
      tekst:
        "Het mechanisme is echt. EPA verdringt arachidonzuur in celmembranen en verschuift daarmee de productie van tromboxanen — de signaalstoffen die bloedplaatjes doen samenklonteren. In laboratoriumonderzoek is een licht verlengde bloedingstijd bij hoge doseringen herhaaldelijk gemeten.\n\nDat mechanisme werd in de jaren tachtig versterkt door een observatie bij Inuit-populaties, waar een hoge visinname samenging met een lage frequentie van hart- en vaatziekten en, in sommige rapportages, met meer bloedneuzen. Die combinatie leidde tot de aanname dat omega-3 in de praktijk als bloedverdunner werkt.\n\nDe Inuit-observaties zijn later stevig bekritiseerd: de oorspronkelijke gegevens waren beperkt, de vergelijkingsgroepen ongelijk, en de conclusies zijn nooit goed gerepliceerd. Wat overbleef was een waarschuwing die zich verspreidde sneller dan het onderzoek dat haar moest onderbouwen.",
    },
    {
      type: "tekst",
      titel: "Wat er sinds die aanname is gemeten",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "Naast antistolling en plaatjesremmers" },
        { titel: "Rondom operaties" },
      ],
      tekst:
        "Systematische reviews van trials waarin deelnemers visolie kregen naast acetylsalicylzuur, clopidogrel of warfarine vonden geen klinisch relevante toename van ernstige bloedingen. Er zijn signalen van iets meer kleine bloedingen — blauwe plekken, langer nabloeden bij een snee — maar dat is een andere categorie dan een bloeding die medisch ingrijpen vraagt.\n\nRondom chirurgie is het bewijs inmiddels het duidelijkst, en het gaat de andere kant op dan het advies suggereert. In de OPERA-trial kregen hartchirurgiepatiënten hoge doses omega-3 vlak vóór hun operatie; het bloedverlies nam niet toe en het aantal transfusies daalde zelfs licht. Een aantal chirurgische richtlijnen heeft daarop het standaardadvies om visolie een week van tevoren te stoppen laten vallen.\n\nDe praktijk loopt daar nog op achter. Veel preoperatieve instructies noemen visolie nog steeds bij de te staken supplementen. Dat is geen reden om die instructie te negeren — je ziekenhuis heeft één protocol en dat volg je — maar wel om te weten dat het conservatisme is, geen aangetoond risico.",
      bewijsKanttekening:
        "Het meeste onderzoek betreft doseringen tot ongeveer 4 gram EPA+DHA per dag bij volwassenen zonder stollingsstoornis. Bij een aangeboren stollingsafwijking of een instabiele INR gelden andere afwegingen.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Het gedocumenteerde risico van omega-3 naast antistolling is klein en betreft vooral kleine bloedingen. Het advies om vóór een operatie te stoppen berust op voorzichtigheid, niet op trialuitkomsten.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Wanneer je het wél eerst bespreekt",
      inleiding:
        "Vijf situaties waarin een korte vraag aan arts of apotheker meer waard is dan een zoekopdracht.",
      items: [
        "Je gebruikt een vitamine K-antagonist (acenocoumarol, fenprocoumon) en wordt door de trombosedienst gecontroleerd. Elke verandering in je vaste inname hoort daar gemeld te worden — niet vanwege een groot risico, maar omdat je INR de maat is die klopt moet blijven.",
        "Je gebruikt een DOAC of een plaatjesremmer én hebt eerder een bloeding gehad. Dan is de context anders dan bij iemand zonder die voorgeschiedenis.",
        "Je staat op de operatielijst. Volg de instructie van je ziekenhuis, ook als die strenger is dan het onderzoek rechtvaardigt.",
        "Je gebruikt bloeddrukverlagers. Omega-3 verlaagt de bloeddruk in hogere doseringen licht; dat telt op, en bij sommige mensen merkbaar.",
        "Je krijgt receptmedicatie tegen verhoogde triglyceriden. Dat zijn omega-3-preparaten in geneesmiddeldosering — daar een supplement bovenop stapelen is dubbelen zonder doel.",
      ],
    },
    {
      type: "tekst",
      titel: "Wat níet met omega-3 botst",
      tekst:
        "Rond supplementen circuleren veel gecombineerde waarschuwingen die geen basis hebben. Omega-3 naast [magnesium](/beste/magnesium), [vitamine D](/beste/vitamine-d) of een multivitamine is geen probleem; er is geen opnameconflict en geen bekende interactie. Ook de combinatie met [creatine](/beste/creatine) of eiwitpoeder speelt niet.\n\nDe combinatie die wél aandacht verdient, is die met andere stoffen die de stolling raken: hoge doses vitamine E, knoflookextract, ginkgo en gemberpreparaten in supplementdosering. Elk voor zich klein, maar ze tellen op — en juist die stapeling zie je zelden benoemd worden.\n\nDe algemene lijn: één supplement met een duidelijke reden is verdedigbaar. Vijf supplementen zonder plan is de situatie waarin interacties ontstaan die niemand meer overziet. Zie ook [magnesium in combinatie met medicijnen](/blog/magnesium-in-combinatie-met-medicijnen) voor dezelfde afweging bij een andere stof.",
      callouts: [
        {
          variant: "letop",
          tekst:
            "Stop nooit zelf met voorgeschreven antistolling om een supplement te kunnen gebruiken. Het supplement is altijd het onderdeel dat wijkt, nooit de medicatie.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: eerst de vraag of je het nodig hebt",
      tekst:
        "Interactievragen zijn pas relevant als suppletie voor jou zinvol is. Reken eerst na wat je binnenkrijgt via [omega-3 uit voeding](/blog/omega-3-uit-voeding-of-supplement) en [hoeveel omega-3 per dag](/blog/omega-3-hoeveel-per-dag). Blijft er een reden over, dan kies je bewust — de producten staan op [beste omega-3 supplement](/beste/omega-3-supplement), de bredere catalogus in de [supplementenafdeling](/supplementen).",
    },
  ],
  kernpunten: [
    "Het bloedingsmechanisme is echt, maar het klinische effect is klein.",
    "Reviews vonden geen toename van ernstige bloedingen naast antistolling.",
    "De OPERA-trial vond bij hartchirurgie geen extra bloedverlies bij hoge doses.",
    "Volg het stopadvies van je ziekenhuis toch — één protocol, geen discussie.",
    "Stapeling met vitamine E, knoflook, ginkgo en gember is de onderschatte route.",
  ],
  samenvatting:
    "Dat omega-3 de stolling beïnvloedt, is mechanistisch juist, maar het klinische effect blijkt klein: systematische reviews vonden naast antistolling of plaatjesremmers geen toename van ernstige bloedingen, en de OPERA-trial vond bij hartchirurgie zelfs geen extra bloedverlies bij hoge doses. Het advies om visolie vóór een operatie te staken berust daarmee op voorzichtigheid. Overleg blijft aangewezen bij vitamine K-antagonisten, een eerdere bloeding, bloeddrukverlagers en receptmatige omega-3-preparaten.",
  supplementCTA: {
    naam: "Omega-3 (EPA/DHA)",
    uitleg:
      "Is suppletie voor jou verdedigbaar, dan telt de dosering: hoe hoger je gaat, hoe relevanter het gesprek met arts of apotheker wordt.",
    href: "/beste/omega-3-supplement",
  },
  cornerstoneLink: {
    label: "Supplementgids: omega-3",
    href: "/supplementen/omega-3",
  },
  vergelijkingExtraLink: {
    label: "Omega-3 supplementen vergelijken",
    href: "/beste/omega-3-supplement",
  },
  supplementenHubLink: {
    label: "Alle supplementen langs dezelfde meetlat",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "magnesium-in-combinatie-met-medicijnen",
    "omega-3-en-hart-onderzoek",
    "visolie-oxidatie-en-bijwerkingen",
  ],
  metaTitle: "Omega-3 en bloedverdunners: hoe groot is het risico echt?",
  metaDescription:
    "Visolie naast antistolling of vóór een operatie: wat reviews en de OPERA-trial lieten zien, en in welke vijf situaties overleg met arts of apotheker wel nodig is.",
  keywords: [
    "omega 3 bloedverdunners",
    "visolie bloedverdunnend",
    "omega 3 voor operatie stoppen",
    "omega 3 interacties medicijnen",
    "visolie acenocoumarol",
    "omega 3 stolling",
  ],
  referenties: toRefs([
    "Wachira JK, Larson MK, Harris WS. n-3 Fatty acids affect haemostasis but do not increase the risk of bleeding: clinical observations and mechanistic insights. Br J Nutr. 2014;111(9):1652-1662.",
    "Akintoye E, Sethi P, Harris WS, et al. Fish oil and perioperative bleeding: insights from the OPERA randomized trial. Circ Cardiovasc Qual Outcomes. 2018;11(11):e004584.",
    "Begtrup KM, Krag AE, Hvas AM. No impact of fish oil supplements on bleeding risk: a systematic review. Dan Med J. 2017;64(5):A5366.",
    "Fenton JI, Gurzell EA, Davidson EA, Harris WS. Red blood cell fatty acids and bleeding: mechanistic considerations. Prostaglandins Leukot Essent Fatty Acids. 2016;112:12-23.",
    "Miller PE, Van Elswyk M, Alexander DD. Long-chain omega-3 fatty acids EPA and DHA and blood pressure: a meta-analysis of randomized controlled trials. Am J Hypertens. 2014;27(7):885-896.",
    "Fugh-Berman A. Herb-drug interactions. Lancet. 2000;355(9198):134-138.",
    "Koninklijke Nederlandse Maatschappij ter bevordering der Pharmacie. Informatorium Medicamentorum: interacties van voedingssupplementen met antitrombotica. Den Haag.",
  ]),
};
