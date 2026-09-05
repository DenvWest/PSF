import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const vitamineDAandoeningenOnderzoekData: BlogArtikel = {
  slug: "vitamine-d-aandoeningen-onderzoek",
  categorie: "energie",
  titel: "Vitamine D en schildklier, diabetes en duizeligheid: wat het onderzoek werkelijk zegt",
  coverImage: "/images/blog/vitamine-d-aandoeningen-onderzoek.jpg",
  coverImageAlt: "Wetenschappelijke boeken en aantekeningen op een bureau",
  heroIntro:
    "Zoek op vitamine D en je krijgt een reeks aandoeningen voorgeschoteld: de schildklier, diabetes, duizeligheid, je immuunsysteem. Bij vrijwel elk daarvan is dezelfde bevinding gedaan — mensen met de aandoening hebben gemiddeld een lagere vitamine D-waarde. Wat daar wel en niet uit volgt, is precies het onderwerp van dit artikel. Wij stellen geen diagnoses; dit is een leesgids bij wat je online tegenkomt over [vitamine D](/kennisbank/vitamine-d).",
  leestijd: "11 min",
  gepubliceerdOp: "2026-09-01",
  laatstBijgewerktOp: "2026-09-01",
  leesNuanceOnderHero:
    "Dit artikel vat literatuur samen en is geen medische aanbeveling. Vitamine D is geen behandeling voor de aandoeningen die hier besproken worden. Heb je een schildklieraandoening, diabetes, duizeligheidsklachten of gebruik je medicatie: bespreek suppletie met je huisarts of specialist, niet met een zoekmachine.",
  secties: [
    {
      type: "tekst",
      titel: "Waarom vitamine D bij álles opduikt",
      bewijsNiveau: "sterk",
      tekst:
        "Er is een structurele reden dat je vitamine D bij zoveel verschillende aandoeningen tegenkomt, en die is niet dat het overal tegen helpt. Vitamine D werkt als een prohormoon: er zitten vitamine D-receptoren in vrijwel elk weefsel in je lichaam, en het beïnvloedt de expressie van honderden genen. Zoek je naar een verband met wélke aandoening dan ook, dan is er altijd een plausibel mechanisme te schetsen.\n\nDaar komt een tweede, veel praktischer reden bij. Mensen die ziek zijn komen minder buiten. Ze bewegen minder, hebben vaker overgewicht, verblijven vaker binnen en zijn vaker ouder. Alle vier verlagen ze je vitamine D-status. Een lage waarde bij een zieke groep is daarom net zo goed te lezen als een gevolg van de ziekte als een oorzaak ervan.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Bijna elk 'vitamine D en ziekte X'-artikel rust op observationeel onderzoek: groep met aandoening heeft lagere waarden. Dat is een associatie. Of aanvullen ook iets verandert, kan alleen een trial beantwoorden — en die trials vallen consequent teleurstellender uit dan de associaties beloven.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Schildklier en Hashimoto",
      bewijsNiveau: "beperkt",
      subkoppen: [
        { titel: "Wat er gevonden is" },
        { titel: "Wat er niet uit volgt" },
      ],
      tekst:
        "De observatie is consistent: mensen met auto-immuun schildklieraandoeningen, waaronder de ziekte van Hashimoto, hebben gemiddeld lagere 25-OH-vitamine D-waarden dan controlegroepen. Het mechanistische verhaal erbij is ook echt — vitamine D speelt een rol in immuunregulatie, en Hashimoto is een auto-immuunproces.\n\nMaar het blijft bij een associatie. Interventieonderzoek naar vitamine D-suppletie bij schildklierpatiënten is beperkt in omvang en kwaliteit, en de uitkomsten zijn gemengd: sommige studies zien een daling in antistoftiters, andere niet, en een effect op de schildklierfunctie zelf of op de benodigde medicatie is niet overtuigend aangetoond.\n\nWat er dus níét uit volgt: dat vitamine D een schildklieraandoening veroorzaakt, dat aanvullen die behandelt, of dat het levothyroxine of ander voorgeschreven beleid kan vervangen. Wat er wél uit volgt is bescheidener en nuttiger: als je een schildklieraandoening hebt, is het redelijk dat je vitamine D-status een keer wordt meegenomen — en dat gesprek voer je met je behandelaar.",
      bewijsKanttekening:
        "Het onderzoek is overwegend observationeel of bestaat uit kleine trials met heterogene opzet. Omgekeerde causaliteit (minder buiten komen bij chronische ziekte) is in deze literatuur zelden uitgesloten.",
    },
    {
      type: "tekst",
      titel: "Diabetes en bloedsuiker",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "De grote trial die de vraag beantwoordde" },
        { titel: "Waar wel iets zit" },
      ],
      tekst:
        "Dit is het onderwerp waar we het meeste over weten, omdat de vraag rechtstreeks is getest. Observationeel is het beeld sterk: een lage vitamine D-status hangt samen met een hoger risico op type 2-diabetes, en er is een mechanisme — vitamine D-receptoren zitten ook op de bètacellen van de alvleesklier die insuline afgeven.\n\nDe D2d-trial randomiseerde ruim 2400 mensen met prediabetes naar 4000 IE vitamine D3 per dag of placebo. Dat is precies de groep waar je het grootste effect zou verwachten. Na gemiddeld ruim twee jaar was de verlaging van het risico op diabetes niet statistisch significant. Ook de VITAL-trial vond geen effect op het ontstaan van diabetes.\n\nWaar wel iets zit: bij mensen met type 2-diabetes én een aangetoond vitamine D-tekort zijn in sommige studies bescheiden verbeteringen in HbA1c gezien. Dat is een wezenlijk andere uitspraak dan 'vitamine D helpt tegen diabetes'. Het gaat om het corrigeren van een tekort bij iemand die er een heeft, met een klein effect — niet om een behandeling. De bredere context over bloedsuiker en energie staat in [middagdip en bloedsuiker na 30](/blog/middagdip-bloedsuiker-na-40) en bij [insulineresistentie](/kennisbank/insulineresistentie).",
    },
    {
      type: "tekst",
      titel: "Duizeligheid — en waarom die twee kanten op werkt",
      bewijsNiveau: "beperkt",
      tekst:
        "Duizeligheid is het interessantste geval, omdat vitamine D er aan beide uiteinden in voorkomt.\n\nAan de ene kant is er onderzoek naar BPPD (benigne paroxismale positieduizeligheid), de vorm van draaiduizeligheid die ontstaat door losgeraakte kristaldeeltjes in het evenwichtsorgaan. Die deeltjes bestaan uit calciumcarbonaat, en dat maakt een verband met de calciumhuishouding — waar vitamine D in zit — mechanistisch denkbaar. Er is een trial die suggereerde dat suppletie bij mensen met terugkerende BPPD én een lage vitamine D-waarde het aantal terugvallen verminderde. Dat is één spoor, in een specifieke groep, met een specifieke diagnose die door een arts is gesteld.\n\nAan de andere kant is duizeligheid ook een symptoom van vitamine D-*vergiftiging*. Bij langdurig zeer hoge inname ontstaat hypercalciëmie: te veel calcium in het bloed, met misselijkheid, dorst, veel plassen, verwardheid en duizeligheid. Precies dezelfde klacht dus, van de tegenovergestelde oorzaak — zie [hoge doses vitamine D](/blog/vitamine-d-hoge-doses-social-media).\n\nDe praktische les is helder: duizeligheid is een klacht met tientallen mogelijke oorzaken, van je evenwichtsorgaan tot je bloeddruk tot je medicatie. Het is geen klacht om zelf met supplementen te lijf te gaan.",
      bewijsKanttekening:
        "Het BPPD-spoor rust op een beperkt aantal trials in geselecteerde patiëntgroepen met een door een arts gestelde diagnose. Het is geen aanwijzing dat vitamine D duizeligheid in het algemeen verhelpt.",
    },
    {
      type: "tekst",
      titel: "Het patroon dat je overal terugziet",
      tekst:
        "Schildklier, diabetes, duizeligheid — bij alle drie loopt het verhaal hetzelfde. Een echte observatie (lagere waarden bij deze groep), een plausibel mechanisme (er zijn overal receptoren), en dan de sprong naar een conclusie die het onderzoek niet draagt (dus aanvullen helpt).\n\nDatzelfde patroon bespreken we bij [zonnebrand](/blog/zonnebrand-en-vitamine-d) — een kloppend percentage met een onjuiste gevolgtrekking — en bij [D3 en K2](/blog/vitamine-d-en-k2-samen), waar een afgewezen claim de verkoop draagt. Wie het patroon herkent, hoeft niet elke afzonderlijke claim op te zoeken.",
      callouts: [
        {
          variant: "letop",
          tekst:
            "Een AI-samenvatting bovenaan Google die begint met 'Ja, er is een verband' beantwoordt de vraag of er een associatie bestaat — niet de vraag of slikken bij jou iets verandert. Dat zijn verschillende vragen met verschillende antwoorden.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Wat dit betekent voor jou",
      items: [
        "Heb je een diagnose (schildklier, diabetes, terugkerende duizeligheid)? Dan hoort vitamine D thuis in het gesprek met je behandelaar, niet in een zelf samengesteld protocol.",
        "Aanvullen bij een gemeten tekort is zinvol en soms onderdeel van reguliere zorg. Aanvullen zonder tekort, in de hoop een aandoening te beïnvloeden, is niet onderbouwd.",
        "Gebruik je medicatie? Sommige middelen raken het vitamine D- of calciummetabolisme — zie [vitamine D innemen](/kennisbank/vitamine-d-inname) en overleg met arts of apotheker.",
        "Nieuwe of aanhoudende klachten horen bij de huisarts, ook (juist) als je online een supplement vindt dat erbij lijkt te passen.",
        "Wil je je status kennen, laat dan meten in plaats van te redeneren — zie [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol).",
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: waar wij wél iets over kunnen zeggen",
      tekst:
        "Wij vergelijken supplementen en ordenen leefstijl; diagnoses laten we aan de zorg. Wat we wél kunnen: laten zien welke claims op een etiket zijn toegestaan en welke niet — zie [EFSA-claims](/kennisbank/efsa-claims) — en met de [Leefstijlcheck](/intake) je slaap, stress, voeding en beweging ordenen zodat je weet waar je begint. De brede gids: [energie na 30](/energie-na-40).",
    },
  ],
  kernpunten: [
    "Vitamine D-receptoren zitten overal — daarom is er bij elke aandoening een mechanisme te schetsen.",
    "Zieke mensen komen minder buiten: lage waarden kunnen gevólg zijn, niet oorzaak.",
    "Schildklier: consistente associatie, geen overtuigend interventiebewijs.",
    "Diabetes: D2d testte 4000 IE bij prediabetes en vond geen significant effect.",
    "Duizeligheid staat aan beide kanten: BPPD-spoor én symptoom van overdosering.",
  ],
  samenvatting:
    "Bij schildklieraandoeningen, diabetes en duizeligheid is telkens dezelfde associatie gevonden: lagere vitamine D-waarden bij de groep met de aandoening. Omdat vitamine D-receptoren overal zitten én zieke mensen minder buiten komen, is die associatie zwak bewijs voor oorzaak. Waar het is getest — de D2d-trial bij prediabetes — bleef een effect uit. Aanvullen bij een gemeten tekort is iets anders dan behandelen; met een diagnose hoort vitamine D in het gesprek met je behandelaar.",
  supplementCTA: {
    naam: "Vitamine D3",
    uitleg:
      "Bij een gemeten tekort en op advies — geen behandeling voor de aandoeningen in dit artikel. Vergelijk µg/IE per capsule en prijs per dag.",
    href: "/beste/vitamine-d",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 30",
    href: "/energie-na-40",
  },
  vergelijkingExtraLink: {
    label: "Vitamine D supplementen vergelijken",
    href: "/beste/vitamine-d",
  },
  supplementenHubLink: {
    label: "Alle supplementen langs dezelfde meetlat",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "vitamine-d-hoge-doses-social-media",
    "vitamine-d-meten-wanneer-zinvol",
    "middagdip-bloedsuiker-na-40",
  ],
  metaTitle: "Vitamine D en schildklier, diabetes en duizeligheid",
  metaDescription:
    "Vitamine D en schildklier, diabetes of duizeligheid: overal dezelfde associatie, maar wat zeggen de trials? D2d, Hashimoto-onderzoek en BPPD nuchter uitgelegd.",
  keywords: [
    "vitamine d schildklier",
    "vitamine d hashimoto",
    "vitamine d diabetes",
    "vitamine d duizeligheid",
    "vitamine d bppd",
    "vitamine d hba1c",
  ],
  referenties: toRefs([
    "Pittas AG, Dawson-Hughes B, Sheehan P, et al. Vitamin D supplementation and prevention of type 2 diabetes (D2d). N Engl J Med. 2019;381(6):520-530.",
    "Manson JE, Cook NR, Lee IM, et al. Vitamin D supplements and prevention of cancer and cardiovascular disease (VITAL). N Engl J Med. 2019;380(1):33-44.",
    "Wang J, Lv S, Chen G, et al. Meta-analysis of the association between vitamin D and autoimmune thyroid disease. Nutrients. 2015;7(4):2485-2498.",
    "Taheriniya S, Arab A, Hadi A, Fadel A, Askari G. Vitamin D and thyroid disorders: a systematic review and meta-analysis of observational studies. BMC Endocr Disord. 2021;21(1):171.",
    "Jeong SH, Kim JS, Shin JW, et al. Decreased serum vitamin D in idiopathic benign paroxysmal positional vertigo. J Neurol. 2013;260(3):832-838.",
    "Jeong SH, Kim JS, Kim HJ, et al. Prevention of benign paroxysmal positional vertigo with vitamin D supplementation: a randomized trial. Neurology. 2020;95(9):e1117-e1125.",
    "Marcinowska-Suchowierska E, Kupisz-Urbanska M, Lukaszkiewicz J, Pludowski P, Jones G. Vitamin D toxicity: a clinical perspective. Front Endocrinol. 2018;9:550.",
    "Autier P, Boniol M, Pizot C, Mullie P. Vitamin D status and ill health: a systematic review. Lancet Diabetes Endocrinol. 2014;2(1):76-89.",
  ]),
};
