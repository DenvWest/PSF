import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const hoeveelMagnesiumPerDagData: BlogArtikel = {
  slug: "hoeveel-magnesium-per-dag",
  categorie: "supplementen",
  titel: "Hoeveel magnesium per dag? Twee getallen die niet hetzelfde betekenen",
  heroIntro:
    "De aanbevolen dagelijkse hoeveelheid magnesium ligt rond de 350 mg voor mannen en 300 mg voor vrouwen. De bovengrens voor magnesium uit supplementen is 250 mg per dag. Dat lijkt tegenstrijdig en is het niet — het zijn twee getallen over twee verschillende dingen, en wie ze door elkaar haalt, koopt te veel of te weinig. Hier lees je wat elk getal betekent, hoe je elementair magnesium van etiketgewicht onderscheidt en waarom één grote dosis minder oplevert dan twee kleine.",
  leestijd: "11 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Dit artikel beschrijft algemene voedingsnormen en doseringen uit onderzoek. Het is geen persoonlijk doseringsadvies; bij nierproblemen, medicatie of zwangerschap overleg je eerst met je arts of apotheker.",
  secties: [
    {
      type: "tekst",
      titel: "Het verschil tussen de ADH en de bovengrens",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "De ADH: alles bij elkaar opgeteld" },
        { titel: "De bovengrens: alleen wat uit een potje komt" },
      ],
      tekst:
        "De [aanbevolen dagelijkse hoeveelheid](/kennisbank/adh) voor magnesium is in Nederland ongeveer 350 mg per dag voor volwassen mannen en 300 mg voor volwassen vrouwen. Dat getal slaat op je totale inname: brood, groente, noten, koffie, kraanwater en een eventueel supplement bij elkaar opgeteld. Het is een streefwaarde voor de hele dag, geen instructie voor een capsule.\n\nDe bovengrens van 250 mg per dag komt uit een andere hoek. Europese wetenschappelijke adviesorganen hebben die vastgesteld voor magnesium uit supplementen en verrijkte producten — nadrukkelijk niet voor magnesium uit gewone voeding. De reden is banaal maar echt: bij hogere doseringen in één keer trekt onopgenomen magnesium water de darm in en krijg je een losse ontlasting. Magnesium uit voeding komt langzaam en verdund binnen en doet dat niet, en daarom valt het buiten de grens.\n\nDe praktische vertaling: een supplement is bedoeld om het gat tussen je voeding en je behoefte te dichten, niet om die 350 mg in z'n eentje te leveren. Wie 300 mg uit voeding haalt, heeft aan 100 mg extra genoeg. Wie een capsule van 400 mg elementair magnesium neemt bovenop een normaal eetpatroon, zit boven de bovengrens voor suppletie én merkt dat meestal aan zijn darmen.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "350 mg is je totale dagbehoefte uit alle bronnen. 250 mg is het maximum dat uit supplementen mag komen. Beide getallen kloppen; ze gaan alleen niet over hetzelfde.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Elementair magnesium: het enige getal dat telt",
      bewijsNiveau: "sterk",
      tekst:
        "Magnesium zit nooit los in een capsule. Het is altijd gebonden aan iets anders — citroenzuur, glycine, appelzuur, zuurstof — en dat bindmiddel weegt mee. Op de voorkant van een pot staat vaak het gewicht van dat hele zout; op de achterkant, in de voedingswaardetabel, staat hoeveel magnesium er daadwerkelijk in zit. Dat laatste heet elementair magnesium en dat is het enige getal waarmee je kunt rekenen.\n\nDe verschillen zijn niet subtiel. Bij magnesiumbisglycinaat is grofweg tien tot veertien procent van het gewicht elementair magnesium: een capsule van 500 mg bisglycinaat levert dus ongeveer 50 tot 70 mg. Bij citraat ligt dat rond de zestien procent. Bij oxide is het aandeel juist hoog — ruim zestig procent — maar daar staat een aanzienlijk slechtere opname tegenover, waardoor het hoge etiketgetal weinig zegt. Meer over die afweging staat bij [magnesiumvormen](/kennisbank/magnesiumvormen) en [biobeschikbaarheid](/kennisbank/biobeschikbaarheid).\n\nDaardoor kan een pot met “Magnesium 400 mg” op de voorkant in werkelijkheid 60 mg leveren, en een pot met een bescheiden “Magnesium 200 mg” het dubbele. Zonder de achterkant te lezen vergelijk je verpakkingsteksten, geen supplementen.",
      callouts: [
        {
          variant: "letop",
          tekst:
            "Staat er nergens op het etiket hoeveel elementair magnesium een dagdosering levert, dan is dat op zichzelf al informatie. Zet zo'n product opzij.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Waarom twee kleine doses meer opleveren dan één grote",
      bewijsNiveau: "redelijk",
      tekst:
        "Je darm neemt magnesium via twee routes op: een verzadigbaar transportsysteem dat efficiënt werkt bij lage concentraties, en passieve diffusie die pas op gang komt als er veel tegelijk langskomt. Het gevolg is dat het opgenomen percentage daalt naarmate de dosis stijgt. In het klassieke onderzoek hiernaar werd bij een kleine inname ruim zestig procent opgenomen en bij een grote inname nog maar rond de tien tot vijftien procent.\n\nAbsoluut gezien levert een grotere dosis nog steeds meer op — maar de winst per milligram wordt snel kleiner, terwijl het onopgenomen deel juist het deel is dat je darm laxeert. Twee keer 100 mg over de dag verdeeld is daarom in bijna alle gevallen een betere deal dan één keer 200 mg, zowel qua opname als qua verdraagzaamheid. Wanneer je die momenten legt, staat in [wanneer neem je magnesium in](/blog/magnesium-wanneer-innemen).",
      bewijsKanttekening:
        "Het dosis-opnameverband is stevig aangetoond, maar de precieze percentages komen uit kleine studies met beperkte aantallen deelnemers en verschillen per magnesiumvorm en per persoon.",
    },
    {
      type: "opsomming",
      titel: "Doseringen zoals ze in onderzoek zijn gebruikt",
      inleiding:
        "Dit zijn geen aanbevelingen voor jou, maar de ordes van grootte waarmee in studies is gewerkt. Ze geven vooral houvast bij het beoordelen van een etiket: ligt een product hier ver onder, dan is het onwaarschijnlijk dat het doet wat de verpakking suggereert.",
      items: [
        "Slaapgericht onderzoek bij ouderen: doorgaans 200–500 mg elementair magnesium per dag, in kleine studies met zwakke tot matige bewijskracht — zie [magnesium voor slaap](/blog/magnesium-en-slaap).",
        "Onderzoek naar stress en spanning: meestal 100–300 mg per dag, vaak in combinatie met vitamine B6, met resultaten die suggestief zijn maar methodologisch mager — zie [magnesium en stress](/blog/magnesium-en-stress).",
        "Aanvullen van een aangetoond tekort: hier bepaalt de behandelend arts de dosering, die fors hoger kan liggen dan de suppletiebovengrens en dan onder begeleiding valt.",
        "Sport en herstel: studies gebruiken 200–400 mg per dag, met effecten die zich concentreren bij sporters die vóóraf al krap zaten.",
        "Zwangerschap, nierziekte of gebruik van vaste medicatie: hier gelden eigen kaders. Dit is een gesprek met je arts, niet met een etiket.",
      ],
    },
    {
      type: "tekst",
      titel: "Hoe je jouw eigen getal bepaalt",
      tekst:
        "De bruikbaarste volgorde is: eerst schatten wat je uit voeding haalt, dan pas kijken wat er nog bij moet. Een portie volkorenbrood met pindakaas, een handvol noten, een portie bladgroente en een portie peulvruchten brengen samen al snel 200 tot 300 mg — wie dat op de meeste dagen haalt, heeft aan een supplement weinig toe te voegen. Waar dat magnesium precies vandaan komt en waarom raffinage er zoveel van sloopt, staat in [magnesium uit voeding](/blog/magnesium-uit-voeding).\n\nBlijf je daar structureel onder, dan is 100 tot 200 mg elementair magnesium uit een supplement een verdedigbare aanvulling: genoeg om het gat te dichten, ruim onder de bovengrens, en klein genoeg om goed te worden opgenomen. Hoger gaan is zelden nodig zonder aangetoonde reden, en de eerste die je dat vertelt is je darm.\n\nDe uitzondering is wanneer er in je situatie iets zit dat magnesium wegtrekt — maagzuurremmers, plaspillen, fors alcoholgebruik of darmklachten. Dan verschuift het hele plaatje en hoort de vraag thuis bij je huisarts of apotheker, niet bij een dosisadvies uit een artikel. Welke combinaties dat zijn, staat in [magnesium en medicijnen](/blog/magnesium-in-combinatie-met-medicijnen).",
      callouts: [
        {
          variant: "tip",
          tekst:
            "Praktische vuistregel bij het vergelijken van potjes: deel het aantal milligram elementair magnesium per dagdosering door de prijs per dag. Dat is de enige verhouding die iets zegt.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: van dosering naar de juiste stof",
      tekst:
        "Een dosering bepalen heeft alleen zin als magnesium überhaupt de stof is die bij jouw klacht hoort. In de [supplementengids](/supplementen) staan alle stoffen die wij beoordelen naast elkaar, met per stof de onderzoeksdosis, de vorm en de onderbouwing — zodat je ziet of magnesium bovenaan jouw rij hoort of ergens halverwege. Weet je dat nog niet, dan wijst de [Leefstijlcheck](/intake) eerst het domein aan.",
    },
  ],
  kernpunten: [
    "ADH ± 350 mg (man) / 300 mg (vrouw) geldt voor álle bronnen samen, inclusief voeding.",
    "De EU-bovengrens van 250 mg/dag geldt alleen voor magnesium uit supplementen.",
    "Reken uitsluitend met elementair magnesium van de achterkant, nooit met het gewicht op de voorkant.",
    "Het opgenomen percentage daalt naarmate de dosis stijgt: verdeel over twee momenten.",
    "Voor de meeste mensen dicht 100–200 mg elementair magnesium het gat ruim voldoende.",
  ],
  samenvatting:
    "De ADH van circa 350 mg (mannen) en 300 mg (vrouwen) slaat op je totale inname uit voeding én supplementen, terwijl de Europese bovengrens van 250 mg per dag alleen geldt voor wat uit supplementen komt. Reken daarbij altijd met elementair magnesium van de achterkant van het etiket: een capsule van 500 mg bisglycinaat levert vaak maar 50 tot 70 mg. Omdat het opgenomen percentage daalt bij hogere doses, levert twee keer een kleine dosis meer op dan één grote.",
  supplementCTA: {
    naam: "Magnesium",
    uitleg:
      "Vergelijk op elementair magnesium per dagdosering en op vorm; reken dan pas de prijs per dag uit.",
    href: "/beste/magnesium",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 40",
    href: "/energie-na-40",
  },
  vergelijkingExtraLink: {
    label: "Alle supplementen in de supplementengids",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "magnesium-wanneer-innemen",
    "magnesium-tekort-herkennen",
    "magnesium-en-slaapkwaliteit",
  ],
  metaTitle: "Hoeveel magnesium per dag? ADH, bovengrens en elementair mg",
  metaDescription:
    "Hoeveel magnesium per dag: waarom de ADH van 350 mg en de supplementbovengrens van 250 mg allebei kloppen, hoe je elementair magnesium afleest en waarom je de dosis verdeelt.",
  keywords: [
    "hoeveel magnesium per dag",
    "magnesium dosering",
    "elementair magnesium",
    "magnesium adh",
    "magnesium te veel",
    "magnesium maximale dosering",
  ],
  referenties: toRefs([
    "Gezondheidsraad. Voedingsnormen voor vitamines en mineralen: magnesium. Den Haag: Gezondheidsraad.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Dietary reference values for magnesium. EFSA Journal. 2015;13(7):4186.",
    "Scientific Committee on Food. Opinion on the tolerable upper intake level of magnesium. European Commission, SCF/CS/NUT/UPPLEV/54.",
    "Fine KD, Santa Ana CA, Porter JL, Fordtran JS. Intestinal absorption of magnesium from food and supplements. J Clin Invest. 1991;88(2):396-402.",
    "Schuchardt JP, Hahn A. Intestinal absorption and factors influencing bioavailability of magnesium: an update. Curr Nutr Food Sci. 2017;13(4):260-278.",
    "Mah J, Pitre T. Oral magnesium supplementation for insomnia in older adults: a systematic review and meta-analysis. BMC Complement Med Ther. 2021;21(1):125.",
    "NIH Office of Dietary Supplements. Magnesium: fact sheet for health professionals.",
  ]),
};
