import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const magnesiumUitVoedingData: BlogArtikel = {
  slug: "magnesium-uit-voeding",
  categorie: "supplementen",
  titel: "Magnesium uit voeding: waar het in zit en waarom je het toch misloopt",
  coverImage: "/images/blog/magnesium-uit-voeding.jpg",
  coverImageAlt: "Verse groenten en kruiden, rijk aan mineralen",
  heroIntro:
    "Magnesium is geen zeldzame stof. Het zit in bladgroente, noten, zaden, peulvruchten, volkoren en pure chocolade — en toch zit een aanzienlijk deel van de Nederlandse bevolking onder de aanbevolen hoeveelheid. Dat komt niet doordat het voedsel verdwenen is, maar doordat de bewerking ervan is veranderd. Hier lees je hoeveel je met normale porties werkelijk binnenkrijgt, waar de verliezen zitten, en wanneer een supplement daar iets aan toevoegt.",
  leestijd: "10 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "De genoemde gehaltes zijn richtwaarden uit voedingsmiddelentabellen. Ze variëren met ras, bodem, seizoen en bereiding, en zijn bedoeld om ordes van grootte te schatten — niet om op de milligram nauwkeurig te rekenen.",
  secties: [
    {
      type: "tekst",
      titel: "Waarom uitgerekend deze producten",
      bewijsNiveau: "sterk",
      tekst:
        "Magnesium zit in het hart van het chlorofylmolecuul — het pigment waarmee planten licht omzetten. Groen blad is daarom per definitie magnesiumrijk. Daarnaast slaan planten magnesium op in het kiemwitje en de zemellaag van zaden, omdat een ontkiemend zaadje het nodig heeft voor zijn energiehuishouding. Dat verklaart in één keer de hele lijst: bladgroente, noten, pitten, peulvruchten en volkorengraan.\n\nEn het verklaart ook waar het misgaat. Bij het raffineren van graan tot witte bloem worden precies de kiem en de zemel verwijderd — de twee delen waar het magnesium in zit. Van het oorspronkelijke gehalte blijft in wit meel grofweg een vijfde over, en anders dan bij sommige vitamines wordt magnesium daarna niet wettelijk teruggevoegd. Wie zijn koolhydraten voornamelijk uit witbrood, witte pasta en witte rijst haalt, mist daardoor stelselmatig een bron die er ooit gewoon in zat.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "De overstap van wit naar volkoren is bij magnesium geen randverbetering maar de grootste enkele knop die je hebt: het is het verschil tussen ongeveer een vijfde en het volledige gehalte.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Wat een normale portie oplevert",
      inleiding:
        "Ordes van grootte per gangbare portie, zodat je kunt schatten in plaats van gokken. De dagbehoefte ligt rond de 350 mg (mannen) en 300 mg (vrouwen).",
      items: [
        "Pompoenpitten, handje van 30 g: ruwweg 150 mg. Verreweg de dichtste bron in de lijst en de makkelijkste toevoeging aan yoghurt of salade.",
        "Amandelen of cashewnoten, handje van 30 g: ruwweg 75 mg.",
        "Zwarte bonen of kikkererwten, portie van 150 g gekookt: ruwweg 70 tot 100 mg, afhankelijk van de soort.",
        "Spinazie, portie van 150 g gekookt: ruwweg 120 mg. Rauwe blaadjes wegen veel minder, dus een salade levert een fractie daarvan.",
        "Volkorenbrood, twee sneden: ruwweg 55 mg — tegenover ongeveer 12 mg voor twee sneden wit.",
        "Havermout, portie van 60 g droog: ruwweg 75 mg.",
        "Pure chocolade (70% of hoger), 20 g: ruwweg 45 mg. Genoeg om mee te tellen, niet genoeg om een strategie op te bouwen.",
        "Kraanwater: sterk regionaal verschillend. Hard water levert enkele tientallen milligrammen per dag, zacht water vrijwel niets.",
      ],
      callouts: [
        {
          variant: "tip",
          tekst:
            "Twee sneden volkoren in plaats van wit, een handje pompoenpitten en één portie peulvruchten dekken samen al ruim honderd milligram extra ten opzichte van een wit basispatroon. Dat is de omvang van een gemiddeld supplement.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Van bord naar bloedbaan: wat er onderweg verdwijnt",
      bewijsNiveau: "redelijk",
      subkoppen: [
        { titel: "Fytaat en vezel" },
        { titel: "Koken en weken" },
      ],
      tekst:
        "Wat op het etiket of in de voedingstabel staat, is niet wat je opneemt. Van magnesium uit een gemengd voedingspatroon wordt gemiddeld ergens tussen de dertig en vijftig procent daadwerkelijk opgenomen, en dat percentage beweegt met wat er verder op je bord ligt.\n\nDe bekendste remmer is fytinezuur, dat in zemel, peulvruchten en noten aan mineralen bindt. Het effect is echt maar wordt vaak overdreven: dezelfde producten zijn ook de rijkste bronnen, dus netto leveren ze nog altijd meer op dan de geraffineerde varianten waar het probleem mee wordt vergeleken. Weken, kiemen, fermenteren en zuurdesembereiding breken een deel van dat fytaat af — de reden dat zuurdesem-volkorenbrood op dit punt gunstiger uitpakt dan snelgistbrood.\n\nAan de andere kant staat de bereiding. Magnesium is wateroplosbaar en lekt bij koken weg in het kookvocht. Groente stomen of kort roerbakken houdt aanzienlijk meer binnenboord dan lang koken en afgieten — en wie peulvruchten uit blik gebruikt, gooit met het vocht een deel van de opbrengst weg.",
      bewijsKanttekening:
        "De opnamepercentages komen uit balansstudies met kleine deelnemersaantallen en verschillen sterk per voedingspatroon; ze beschrijven een gemiddelde, geen individuele waarde.",
    },
    {
      type: "tekst",
      titel: "Waarom “eet gewoon gezond” voor sommigen niet volstaat",
      bewijsNiveau: "redelijk",
      tekst:
        "Voor een deel van de mensen is de rekensom hierboven het hele verhaal: wie op de meeste dagen volkoren, noten, peulvruchten en groene groente eet, komt aan zijn behoefte en heeft aan een supplement weinig toe te voegen. Dat is de meerderheid, en dat is een prettiger boodschap dan de supplementenmarkt doorgaans brengt.\n\nEr zijn drie situaties waarin die redenering niet opgaat. De eerste is dat de behoefte omhoog gaat of het verlies toeneemt: fors zweten bij intensief sporten, structureel alcoholgebruik, of medicatie die magnesium via de nier of de darm wegtrekt — daarover gaat [magnesium en medicijnen](/blog/magnesium-in-combinatie-met-medicijnen). De tweede is dat de opname beperkt is, bij darmaandoeningen of na een maagoperatie. De derde is simpelweg dat het voedingspatroon niet aan de beschrijving voldoet, en dat op korte termijn ook niet gaat doen.\n\nIn al die gevallen is aanvullen redelijk. Maar dan is het ook echt aanvullen: 100 tot 200 mg elementair magnesium om het gat te dichten, niet 400 mg omdat het toevallig op de pot staat. Die rekensom staat in [hoeveel magnesium per dag](/blog/hoeveel-magnesium-per-dag).",
      callouts: [
        {
          variant: "letop",
          tekst:
            "Een supplement compenseert geen patroon. Het dicht een gat in de inname en verder niets — de vezels, kalium en polyfenolen die met magnesiumrijke voeding meekomen, zitten er niet in.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Vier wissels die in de praktijk standhouden",
      inleiding:
        "Niet een dieet, maar vier vervangingen die je één keer regelt en daarna vergeet.",
      items: [
        "Wit brood, pasta en rijst vervangen door de volkoren variant. De grootste enkele winst, zonder dat je iets extra's hoeft te kopen.",
        "Een pot pompoenpitten op het aanrecht, standaard door yoghurt, salade of havermout. Per handje ongeveer een halve dagbehoefte.",
        "Eén keer per week peulvruchten als basis van een hoofdmaaltijd in plaats van als bijgerecht.",
        "Groente stomen of roerbakken in plaats van koken en afgieten — of het kookvocht gebruiken in de saus.",
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: eerst het bord, dan het potje",
      tekst:
        "De volgorde die wij aanhouden is niet ideologisch maar praktisch: voeding levert meer dan alleen het mineraal, en een supplement is pas logisch als je weet welk gat je dicht. Hoe je voedingspatroon er op dit punt voorstaat, komt in de [Leefstijlcheck](/intake) langs naast slaap, stress en beweging. Wil je daarna gericht vergelijken, dan staan alle stoffen die wij beoordelen met hun onderbouwing naast elkaar in de [supplementengids](/supplementen); de bredere voedingsgids is [voeding na 40](/voeding-na-40).",
    },
  ],
  kernpunten: [
    "Magnesium zit in chlorofyl en in kiem en zemel van zaden — vandaar blad, noten, pitten, peulvruchten en volkoren.",
    "Raffinage tot witte bloem haalt grofweg vier vijfde van het magnesium weg, en dat wordt niet teruggevoegd.",
    "Een handje pompoenpitten levert ongeveer 150 mg; twee sneden volkoren ongeveer 55 mg tegen 12 mg voor wit.",
    "Van magnesium uit voeding wordt gemiddeld 30–50% opgenomen; koken en afgieten kost extra.",
    "Aanvullen is logisch bij verhoogd verlies, beperkte opname of een patroon dat niet gaat veranderen — en dan met 100–200 mg.",
  ],
  samenvatting:
    "Magnesium zit in chlorofyl en in de kiem en zemel van zaden, waardoor bladgroente, noten, pitten, peulvruchten en volkorengraan de rijkste bronnen zijn. Bij raffinage tot witte bloem verdwijnt grofweg vier vijfde van het gehalte, en dat wordt niet teruggevoegd — daar zit de grootste stille verliespost. Een handje pompoenpitten levert ruwweg 150 mg, twee sneden volkoren 55 mg tegen 12 mg voor wit. Van wat je eet wordt gemiddeld dertig tot vijftig procent opgenomen.",
  supplementCTA: {
    naam: "Magnesium",
    uitleg:
      "Blijft je inname uit voeding structureel achter, dan dicht 100–200 mg elementair magnesium het gat; hoger is zelden nodig zonder aangetoonde reden.",
    href: "/beste/magnesium",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: voeding na 40",
    href: "/voeding-na-40",
  },
  vergelijkingExtraLink: {
    label: "Alle supplementen in de supplementengids",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "hoeveel-magnesium-per-dag",
    "magnesium-tekort-herkennen",
    "magnesium-voor-wie-wel-niet",
  ],
  metaTitle: "Magnesium in voeding: waar zit het in en hoeveel per portie?",
  metaDescription:
    "Magnesium uit voeding: welke producten het meest leveren, hoeveel een normale portie oplevert, waarom witte bloem vier vijfde verliest en wanneer aanvullen zin heeft.",
  keywords: [
    "magnesium in voeding",
    "waar zit magnesium in",
    "magnesiumrijke voeding",
    "magnesium voedingsmiddelen lijst",
    "magnesium uit eten halen",
    "magnesium volkoren",
  ],
  referenties: toRefs([
    "NIH Office of Dietary Supplements. Magnesium: fact sheet for health professionals.",
    "Cazzola R, Della Porta M, Manoni M, et al. Going to the roots of reduced magnesium dietary intake: a tradeoff between climate changes and sources. Heliyon. 2020;6(11):e05390.",
    "Schuchardt JP, Hahn A. Intestinal absorption and factors influencing bioavailability of magnesium: an update. Curr Nutr Food Sci. 2017;13(4):260-278.",
    "Bohn T, Davidsson L, Walczyk T, Hurrell RF. Phytic acid added to whole-wheat bread inhibits fractional apparent magnesium absorption in humans. Am J Clin Nutr. 2004;79(3):418-423.",
    "Fine KD, Santa Ana CA, Porter JL, Fordtran JS. Intestinal absorption of magnesium from food and supplements. J Clin Invest. 1991;88(2):396-402.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Dietary reference values for magnesium. EFSA Journal. 2015;13(7):4186.",
    "RIVM. Nederlands Voedingsstoffenbestand (NEVO): gehaltes magnesium in voedingsmiddelen.",
  ]),
};
