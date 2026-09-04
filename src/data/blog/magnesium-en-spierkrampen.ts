import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const magnesiumEnSpierkrampenData: BlogArtikel = {
  slug: "magnesium-en-spierkrampen",
  categorie: "supplementen",
  titel: "Magnesium tegen spierkrampen: wat het onderzoek wél en niet laat zien",
  heroIntro:
    "Kramp in je kuit, midden in de nacht. De reflex is bijna universeel: magnesium. Toch is dit precies het gebruik waarvoor de bewijsvoering het zwakst is — een Cochrane-review concludeerde dat magnesium bij oudere volwassenen waarschijnlijk geen klinisch betekenisvolle vermindering van krampen geeft. Dat is ongemakkelijk nieuws voor het bestverkochte argument van de hele categorie. Hier lees je wat er dan wél achter nachtkrampen zit, en in welke situaties magnesium alsnog verdedigbaar is.",
  leestijd: "10 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Dit artikel bespreekt onderzoek naar spierkrampen bij overigens gezonde volwassenen. Krampen met spierzwakte, tintelingen, zwelling of pijn die aanhoudt horen bij je huisarts, niet bij een supplement.",
  secties: [
    {
      type: "tekst",
      titel: "Wat de systematische reviews vinden",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "De Cochrane-conclusie" },
        { titel: "Waarom het idee toch zo hardnekkig is" },
      ],
      tekst:
        "De Cochrane-samenwerking heeft de trials over magnesium en skeletspierkrampen meermaals samengevat. De conclusie voor oudere volwassenen met idiopathische krampen — krampen zonder aanwijsbare onderliggende oorzaak, de groep waar het bij nachtkrampen meestal om gaat — is dat magnesiumsuppletie waarschijnlijk weinig tot geen klinisch betekenisvol verschil maakt in het aantal of de ernst van de krampen. Dat oordeel steunt op gerandomiseerde, placebogecontroleerde trials en is daarmee van een hoger bewijsniveau dan vrijwel alles wat er in productteksten over magnesium wordt beweerd.\n\nDat het idee toch zo stevig staat, is goed te verklaren. Krampen komen in golven: een paar slechte nachten, dan weken niets. Wie op het dieptepunt begint met magnesium, ervaart de daarop volgende verbetering als effect — terwijl die verbetering statistisch gezien sowieso zou zijn gekomen. Dat verschijnsel, terugkeer naar het gemiddelde, is bij aanvalsgewijze klachten de belangrijkste bron van valse zekerheid. Precies daarom heb je placebogecontroleerd onderzoek nodig om er doorheen te kijken.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Voor nachtelijke kuitkramp bij volwassenen zonder aangetoond tekort is magnesium een van de slechtst onderbouwde toepassingen — juist de toepassing waarvoor het het vaakst wordt gekocht.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Waar krampen dan wél vandaan komen",
      bewijsNiveau: "redelijk",
      tekst:
        "De oude verklaring — kramp is een tekort aan vocht of zouten — houdt bij inspanningsgebonden krampen slecht stand. Sportonderzoek wijst eerder richting neuromusculaire vermoeidheid: bij oververmoeide spieren raakt de balans verstoord tussen de spierspoeltjes die aanspanning stimuleren en de peesorgaantjes die dat juist remmen. Het resultaat is een spier die spontaan blijft vuren. Dat verklaart waarom kramp typisch optreedt aan het eind van een zware inspanning, in een verkorte spierpositie, en waarom rekken bijna onmiddellijk helpt terwijl een elektrolytendrankje dat niet doet.\n\nBij nachtkrampen zonder sport speelt iets anders. Daar komen leeftijd, langdurig staan, bepaalde medicatie en de slaaphouding — voeten in strekstand onder een strak dekbed — vaker terug als factor. En een aanzienlijk deel van wat mensen 's nachts als kramp beleven, is bij navraag rustelozebenensyndroom, een ander probleem met een andere aanpak.\n\nDat maakt de nuttigste eerste stap niet het kiezen van een supplement, maar het bepalen van het type kramp. Zit hij bij inspanning, dan wijst het naar belasting en herstel — daarover gaat [krachttraining na 40](/blog/krachttraining-na-40) en de gids [herstel verbeteren na 40](/herstel-verbeteren-na-40). Zit hij 's nachts en in rust, dan is de route via je huisarts korter dan die via een potje.",
      bewijsKanttekening:
        "De neuromusculaire verklaring voor inspanningskramp heeft de sterkste steun, maar is niet definitief bewezen; bij nachtkrampen zonder duidelijke oorzaak blijft de onderliggende mechaniek grotendeels onbekend.",
    },
    {
      type: "opsomming",
      titel: "Wanneer magnesium bij kramp wél verdedigbaar is",
      inleiding:
        "“Niet aangetoond bij de gemiddelde persoon” is niet hetzelfde als “nooit zinvol”. Dit zijn de situaties waarin de afweging anders uitvalt.",
      items: [
        "Bij een aangetoond laag magnesium in het bloed. Dan behandel je een tekort, en is kramp een van de klachten die daarbij horen — dat is een medisch traject, niet een zelfzorgkeuze.",
        "Bij langdurig gebruik van plaspillen of maagzuurremmers, die de magnesiumstatus aantoonbaar kunnen verlagen. Zie [magnesium en medicijnen](/blog/magnesium-in-combinatie-met-medicijnen).",
        "Bij een voedingspatroon dat structureel arm is aan noten, zaden, peulvruchten en volkoren — dan is aanvullen om de inname zélf verdedigbaar, met kramp hooguit als bijvangst. Zie [magnesium uit voeding](/blog/magnesium-uit-voeding).",
        "Bij zwangerschapskrampen wordt magnesium in richtlijnen soms genoemd, maar de trials spreken elkaar tegen. Dit hoort bij de verloskundige of gynaecoloog.",
        "Bij fors alcoholgebruik of ontregelde diabetes, waarbij het verlies via de nier verhoogd is en de kans op een echt tekort dus reëel.",
      ],
      callouts: [
        {
          variant: "letop",
          tekst:
            "Krampen die gepaard gaan met spierzwakte, tintelingen, een dik of rood been, of die plotseling veel vaker optreden: geen zelfzorg. Dat is een afspraak bij de huisarts.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Wat er wél iets doet bij terugkerende nachtkramp",
      inleiding:
        "Minder spectaculair dan een supplement, maar met betere papieren of tenminste zonder kosten en risico.",
      items: [
        "Rekken op het moment zelf: de kuitspier passief op lengte brengen doorbreekt de kramp doorgaans binnen seconden. Dit is de best gedocumenteerde interventie die er is.",
        "Preventief rekken vóór het slapen, dagelijks. Het bewijs is gemengd maar het is kosteloos en risicoloos.",
        "Kijk naar je slaaphouding: een strak ingestopt dekbed dwingt je voeten in strekstand, precies de positie waarin de kuit het makkelijkst verkrampt.",
        "Neem je medicatielijst door met je apotheker. Diuretica, statines en sommige luchtwegmedicijnen staan bekend om krampklachten.",
        "Bouw trainingsbelasting geleidelijk op in plaats van in sprongen; inspanningskramp volgt op onwennige belasting vaker dan op vochtverlies.",
        "Alcohol in de avond verstoort zowel je slaapstructuur als je vochthuishouding — zie [alcohol, slaap en energie na 40](/blog/alcohol-slaap-energie-na-40).",
      ],
    },
    {
      type: "tekst",
      titel: "Waarom wij dit zo opschrijven",
      tekst:
        "Het zou commercieel handiger zijn om hier te schrijven dat magnesium kramp oplost. Het is alleen niet wat het beste beschikbare bewijs laat zien, en een vergelijkingssite die alleen de gunstige studies citeert is een advertentie met voetnoten.\n\nDat betekent niet dat magnesium een zinloos supplement is. Het betekent dat de reden waarom je het overweegt, ertoe doet: voor het aanvullen van een krappe inname is de onderbouwing redelijk, voor slaapkwaliteit is die zwak maar aanwezig, en voor kramp bij iemand zonder tekort is die er nauwelijks. Dezelfde stof, drie verschillende antwoorden. Welke stof bij welke klacht wél past en op welke onderbouwing, staat naast elkaar in de [supplementengids](/supplementen).",
    },
    {
      type: "tekst",
      titel: "Turbo: eerst het patroon, dan de stof",
      tekst:
        "Krampen zijn zelden een losstaand probleem — ze komen vaker in gezelschap van slecht herstel, hoge belasting of onrustige slaap. De [Leefstijlcheck](/intake) legt die combinatie bloot en laat zien welk domein bij jou het zwaarst weegt, zodat je niet maandenlang de verkeerde knop indrukt.",
    },
  ],
  kernpunten: [
    "Cochrane: bij oudere volwassenen met idiopathische krampen waarschijnlijk geen klinisch betekenisvol effect.",
    "Krampen komen in golven; verbetering na starten is meestal terugkeer naar het gemiddelde.",
    "Inspanningskramp wijst eerder op neuromusculaire vermoeidheid dan op elektrolytenverlies.",
    "Wél verdedigbaar bij aangetoond tekort, bij diuretica of maagzuurremmers, of bij een structureel arme inname.",
    "Rekken op het moment zelf is de best onderbouwde ingreep die er is.",
  ],
  samenvatting:
    "Voor spierkrampen is magnesium slechter onderbouwd dan zijn reputatie: een Cochrane-review concludeert dat het bij oudere volwassenen met krampen zonder aanwijsbare oorzaak waarschijnlijk geen klinisch betekenisvol verschil maakt. Dat het idee standhoudt, komt doordat krampen in golven optreden en verbetering na starten meestal terugkeer naar het gemiddelde is. Inspanningskramp wijst eerder op neuromusculaire vermoeidheid dan op zoutverlies. Magnesium blijft verdedigbaar bij een aangetoond tekort, bij medicatie die magnesium wegtrekt, of bij een structureel arme inname.",
  supplementCTA: {
    naam: "Magnesium",
    uitleg:
      "Overweeg je het om je inname aan te vullen in plaats van tegen kramp: let dan op elementair magnesium per dagdosering en op de vorm.",
    href: "/beste/magnesium",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: herstel verbeteren na 40",
    href: "/herstel-verbeteren-na-40",
  },
  vergelijkingExtraLink: {
    label: "Alle supplementen in de supplementengids",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "magnesium-tekort-herkennen",
    "magnesium-voor-wie-wel-niet",
    "krachttraining-na-40",
  ],
  metaTitle: "Magnesium tegen spierkrampen: werkt het? Wat onderzoek zegt",
  metaDescription:
    "Magnesium en spierkrampen: Cochrane vindt bij ouderen geen betekenisvol effect. Wat kramp dan wél veroorzaakt en wanneer magnesium alsnog verdedigbaar is.",
  keywords: [
    "magnesium spierkrampen",
    "magnesium kuitkramp nacht",
    "helpt magnesium tegen kramp",
    "nachtelijke kramp oorzaak",
    "magnesium krampen onderzoek",
    "spierkramp na sporten",
  ],
  referenties: toRefs([
    "Garrison SR, Korownyk CS, Kolber MR, et al. Magnesium for skeletal muscle cramps. Cochrane Database Syst Rev. 2020;9:CD009402.",
    "Schwellnus MP. Cause of exercise associated muscle cramps (EAMC): altered neuromuscular control, dehydration or electrolyte depletion? Br J Sports Med. 2009;43(6):401-408.",
    "Hallegraeff J, van der Schans C, de Ruiter R, de Greef M. Stretching before sleep reduces the frequency and severity of nocturnal leg cramps in older adults: a randomised trial. J Physiother. 2012;58(1):17-22.",
    "Allen RE, Kirby KA. Nocturnal leg cramps. Am Fam Physician. 2012;86(4):350-355.",
    "Miller KC, McDermott BP, Yeargin SW, et al. An evidence-based review of the pathophysiology, treatment, and prevention of exercise-associated muscle cramps. J Athl Train. 2022;57(1):5-15.",
    "Cheungpasitporn W, Thongprayoon C, Kittanamongkolchai W, et al. Proton pump inhibitors linked to hypomagnesemia: a systematic review and meta-analysis of observational studies. Ren Fail. 2015;37(7):1237-1241.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on the substantiation of health claims related to magnesium. EFSA Journal. 2010;8(10):1807.",
  ]),
};
