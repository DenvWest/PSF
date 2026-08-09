export type MovementDimensionKey =
  | "kracht"
  | "conditie"
  | "intensiteit"
  | "zitten"
  | "conditie_ervaren"
  | "herstel"
  | "klachten"
  | "mobiliteit"
  | "belastbaarheid"
  | "consistentie"
  | "motivatie";

export type MovementBand = "aandacht" | "redelijk" | "sterk";

export type MovementQuestionField =
  | "MOV2_STR"
  | "MOV2_CARD"
  | "MOV2_VIG"
  | "MOV2_SIT"
  | "MOV2_COND"
  | "RCV_FEEL"
  | "MOV2_PAIN"
  | "MOV2_MOB"
  | "MOV2_FUNC"
  | "MOV2_CONSIST"
  | "MOV2_MOTIV";

/**
 * De opt-in uitleg per vraag (L13). `anchor` is de richtlijn in maximaal acht
 * woorden, of null waar er geen norm bestaat — dan toont de UI expliciet dat het
 * eigen antwoord de enige meetlat is. Nooit groepsgrenzen, nooit een tussenstand
 * en nooit een voorbeeld dat het gewenste antwoord verklapt.
 */
export type MovementQuestionHelp = {
  title: string;
  body: string;
  anchor: string | null;
};

export type MovementQuestion = {
  field: MovementQuestionField;
  dimension: MovementDimensionKey;
  question: string;
  help: MovementQuestionHelp;
  options: { label: string; value: number }[];
};

export const MOVEMENT_HELP_TRIGGER = "Waarom vragen we dit?";
export const MOVEMENT_HELP_NO_NORM = "Geen norm — dit is jouw eigen ijkpunt.";

export const MOVEMENT_QUESTIONS: MovementQuestion[] = [
  {
    field: "MOV2_STR",
    dimension: "kracht",
    question: "Hoe vaak doe je doelgerichte kracht- of weerstandstraining?",
    help: {
      title: "Wat kracht hier betekent",
      body:
        "Spiermassa loopt na je veertigste terug zodra de prikkel wegvalt. Hoe váák je traint zegt daar meer over dan hoe zwaar. " +
        "Op je resultaat zie je je eigen antwoord naast de richtlijn.",
      anchor: "WHO 2020: 2× per week spierversterkend",
    },
    options: [
      { label: "3x per week of vaker", value: 5 },
      { label: "2x per week", value: 4 },
      { label: "1x per week", value: 3 },
      { label: "Minder dan 1x per week", value: 2 },
      { label: "Nooit", value: 1 },
    ],
  },
  {
    field: "MOV2_CARD",
    dimension: "conditie",
    question:
      "Hoeveel minuten beweeg je gemiddeld per week matig intensief — stevig doorwandelen, fietsen of sport waarbij praten nog lukt, maar zingen niet?",
    help: {
      title: "Wat cardio hier betekent",
      body:
        "Dit tempo — zone 2 — traint je conditie: de basis onder je energie en herstel. " +
        "We vragen minuten per week omdat de richtlijn daarin is uitgedrukt. Op je resultaat zie je jouw minuten naast die richtlijn.",
      anchor: "Beweegrichtlijnen: 150–300 minuten matig per week",
    },
    options: [
      { label: "300 minuten of meer", value: 5 },
      { label: "150-299 minuten", value: 4 },
      { label: "90-149 minuten", value: 3 },
      { label: "30-89 minuten", value: 2 },
      { label: "Minder dan 30 minuten", value: 1 },
    ],
  },
  {
    field: "MOV2_VIG",
    dimension: "intensiteit",
    question:
      "Hoeveel minuten per week beweeg je intensief — hardlopen, interval, stevige sport?",
    help: {
      title: "Wat intensieve inspanning betekent",
      body:
        "In de richtlijn telt één minuut intensief als twee minuten matig. Daarom vragen we die minuten apart. " +
        "Op je resultaat tellen we ze samen met je matige minuten tot één uitkomst.",
      anchor: "Beweegrichtlijnen: 75–150 minuten intensief per week",
    },
    options: [
      { label: "150 minuten of meer", value: 5 },
      { label: "75-149 minuten", value: 4 },
      { label: "30-74 minuten", value: 3 },
      { label: "Minder dan 30 minuten", value: 2 },
      { label: "Niet", value: 1 },
    ],
  },
  {
    field: "MOV2_SIT",
    dimension: "zitten",
    question: "Hoeveel uur zit je gemiddeld per dag?",
    help: {
      title: "Wat zitten hier betekent",
      body:
        'Lang zitten weegt mee los van wat je verder traint. Een getalsnorm is er niet: de richtlijn zegt alleen "voorkom veel stilzitten". ' +
        "Op je resultaat zie je je eigen uren terug, met wat het onderzoek erover zegt.",
      anchor: "Richtlijn: voorkom veel stilzitten — geen getalsnorm",
    },
    options: [
      { label: "Minder dan 4 uur", value: 5 },
      { label: "4-6 uur", value: 4 },
      { label: "6-8 uur", value: 3 },
      { label: "8-10 uur", value: 2 },
      { label: "Meer dan 10 uur", value: 1 },
    ],
  },
  {
    field: "MOV2_COND",
    dimension: "conditie_ervaren",
    question: "Hoe ervaar je jouw conditie op dit moment?",
    help: {
      title: "Wat ervaren conditie hier betekent",
      body:
        "Hoe je je conditie ervaart, bepaalt wat je durft op te bouwen. " +
        "Op je resultaat zie je of dat gevoel meebeweegt met je minuten.",
      anchor: null,
    },
    options: [
      { label: "Uitstekend", value: 5 },
      { label: "Goed", value: 4 },
      { label: "Redelijk", value: 3 },
      { label: "Matig", value: 2 },
      { label: "Slecht", value: 1 },
    ],
  },
  {
    field: "RCV_FEEL",
    dimension: "herstel",
    question: "Hoe hersteld voel je je vandaag?",
    help: {
      title: "Wat herstel hier betekent",
      body:
        "Deze vraag gaat over vandaag, niet over je maand. Hij bepaalt of we vandaag een lichtere of zwaardere sessie voorstellen. " +
        "Op je resultaat staat hij apart, los van je beweegbeeld.",
      anchor: null,
    },
    options: [
      { label: "Fris — klaar voor belasting", value: 5 },
      { label: "Redelijk — lichte sessie lukt", value: 4 },
      { label: "Matig — liever rustig aan", value: 3 },
      { label: "Moe — liever licht of rust", value: 2 },
      { label: "Uitgeput — liever rust", value: 1 },
    ],
  },
  {
    field: "MOV2_PAIN",
    dimension: "klachten",
    question: "Heb je spierpijn of lichamelijke klachten die je beweging beperken?",
    help: {
      title: "Wat klachten hier betekent",
      body:
        "We vragen dit om je plan aan te passen, niet om iets vast te stellen. Klachten sturen de zwaarte van wat we voorstellen. " +
        "Op je resultaat lees je hem terug als aandachtspunt, nooit als oordeel.",
      anchor: null,
    },
    options: [
      { label: "Nee", value: 5 },
      { label: "Licht", value: 4 },
      { label: "Regelmatig", value: 3 },
      { label: "Veel", value: 2 },
      { label: "Ernstig", value: 1 },
    ],
  },
  {
    field: "MOV2_MOB",
    dimension: "mobiliteit",
    question: "Hoe soepel voel je je — bukken, reiken, draaien?",
    help: {
      title: "Wat mobiliteit hier betekent",
      body:
        "Bukken, reiken en draaien bepalen hoeveel je van de rest kunt doen. Voor soepelheid bestaat geen norm — je eigen antwoord is het vergelijkpunt. " +
        "Op je resultaat zie je hem terug tussen je andere metingen.",
      anchor: null,
    },
    options: [
      { label: "Zeer soepel", value: 5 },
      { label: "Redelijk soepel", value: 4 },
      { label: "Gemiddeld", value: 3 },
      { label: "Stijf", value: 2 },
      { label: "Erg stijf", value: 1 },
    ],
  },
  {
    field: "MOV2_FUNC",
    dimension: "belastbaarheid",
    question: "Kun je twee verdiepingen traplopen zonder buiten adem te raken?",
    help: {
      title: "Wat belastbaarheid hier betekent",
      body:
        "Traplopen is een alledaagse test die je dagelijks functioneren vaak beter voorspelt dan één sportgetal. " +
        "Op je resultaat zie je of dit meebeweegt met je conditie.",
      anchor: null,
    },
    options: [
      { label: "Ja, gemakkelijk", value: 5 },
      { label: "Meestal", value: 4 },
      { label: "Soms", value: 3 },
      { label: "Moeizaam", value: 2 },
      { label: "Nee", value: 1 },
    ],
  },
  {
    field: "MOV2_CONSIST",
    dimension: "consistentie",
    question: "Hoeveel weken heb je de afgelopen maand je beweegdoel gehaald?",
    help: {
      title: "Wat consistentie hier betekent",
      body:
        "Herhaling voorspelt resultaat sterker dan de zwaarte van één sessie. We vragen weken, niet uren, omdat volhouden hier de variabele is. " +
        "Op je resultaat bepaalt dit of we je week verkleinen of uitbreiden.",
      anchor: null,
    },
    options: [
      { label: "4 weken", value: 5 },
      { label: "3 weken", value: 4 },
      { label: "2 weken", value: 3 },
      { label: "1 week", value: 2 },
      { label: "Geen", value: 1 },
    ],
  },
  {
    field: "MOV2_MOTIV",
    dimension: "motivatie",
    question: "Hoe gemotiveerd ben je om komende week te bewegen?",
    help: {
      title: "Wat motivatie hier betekent",
      body:
        "Motivatie bepaalt de grootte van de stap die we voorstellen, niet of je iets fout doet. Een eerlijk laag antwoord levert een kleiner en haalbaarder plan op. " +
        "Op je resultaat staat hij nooit als oordeel.",
      anchor: null,
    },
    options: [
      { label: "Heel gemotiveerd", value: 5 },
      { label: "Gemotiveerd", value: 4 },
      { label: "Twijfelend", value: 3 },
      { label: "Weinig motivatie", value: 2 },
      { label: "Geen motivatie", value: 1 },
    ],
  },
];

export const MOVEMENT_STATEMENTS: Record<MovementDimensionKey, Record<MovementBand, string>> = {
  kracht: {
    aandacht:
      "Krachttraining schiet er nu bij in — en juist daar valt na 40 het meest te winnen.",
    redelijk:
      "Je doet al iets aan kracht. Er is ruimte om er net wat consistenter in te worden.",
    sterk: "Je traint kracht stevig — mooi, dat houdt je spieren op peil.",
  },
  conditie: {
    aandacht:
      "Onder de 90 minuten matig intensief per week — de beweegrichtlijn ligt op 150 tot 300, en daar zit voor jou nog winst.",
    redelijk:
      "Je zit rond de beweegrichtlijn. Consistent volhouden telt hier zwaarder dan opschalen.",
    sterk:
      "Je haalt of overtreft de beweegrichtlijn — dat houdt je hart en vaten in conditie.",
  },
  intensiteit: {
    aandacht:
      "Weinig tot geen intensieve inspanning — dat is het stuk dat je hart-longcapaciteit het meest test.",
    redelijk:
      "Je haalt af en toe een pittige sessie. Iets vaker duwt je conditie merkbaar verder.",
    sterk:
      "Je haalt regelmatig intensieve inspanning — dat is precies wat cardiovasculaire achteruitgang na 40 tegenwerkt.",
  },
  zitten: {
    aandacht:
      "Meer dan 8 uur zitten per dag — dat weegt mee als apart risico, los van hoeveel je daarnaast sport.",
    redelijk:
      "Je zit een gemiddelde werkdag. Elk uur even onderbreken maakt hier al verschil.",
    sterk: "Je zit relatief weinig aaneengesloten — dat scheelt in sedentair risico.",
  },
  conditie_ervaren: {
    aandacht:
      "Je ervaart je conditie als beperkt — dat is precies het signaal om rustig op te bouwen, niet om in één keer veel te doen.",
    redelijk:
      "Je conditie is redelijk naar je gevoel — genoeg basis om uit te breiden.",
    sterk:
      "Je ervaart je conditie als sterk — dat is een goed teken voor herstel en duurzaamheid.",
  },
  herstel: {
    aandacht:
      "Je voelt je vandaag moe tot uitgeput — een rustige dag is dan verstandiger dan doorduwen.",
    redelijk:
      "Je herstel is wisselend vandaag — een lichte sessie past beter dan een zware.",
    sterk: "Je voelt je hersteld — ruimte voor een pittigere sessie als je dat wilt.",
  },
  klachten: {
    aandacht:
      "Je geeft aan regelmatig tot ernstige klachten te hebben — bouw voorzichtig op en overleg bij twijfel met een fysiotherapeut.",
    redelijk:
      "Lichte klachten af en toe — normaal bij opbouw, houd de intensiteit in de gaten.",
    sterk:
      "Geen noemenswaardige klachten — dat geeft ruimte om je training te verzwaren als je dat wilt.",
  },
  mobiliteit: {
    aandacht:
      "Je voelt je stijf — mobiliteit neemt vanaf ~40 sneller af dan de meeste mannen doorhebben.",
    redelijk: "Redelijk soepel — een paar minuten per dag houdt dat op peil.",
    sterk: "Je voelt je soepel — dat draagt direct bij aan je functionele fitheid.",
  },
  belastbaarheid: {
    aandacht:
      "Traplopen kost nu moeite — dit is een directe graadmeter voor functionele fitheid, sterker dan sportfrequentie alleen.",
    redelijk:
      "Meestal lukt het zonder problemen — met wat opbouw wordt dit steviger.",
    sterk:
      "Je haalt dit gemakkelijk — een goed teken voor je functionele fitheid op langere termijn.",
  },
  consistentie: {
    aandacht:
      "Minder dan de helft van de weken gehaald — één goede week is minder waardevol dan een haalbaar, herhaalbaar ritme.",
    redelijk:
      "Je haalt je doel de meeste weken — de basis van een routine staat.",
    sterk:
      "Je haalt je beweegdoel consistent — dat is de sterkste voorspeller van blijvend resultaat.",
  },
  motivatie: {
    aandacht:
      "Weinig motivatie deze week — dat is een signaal om je doel te verkleinen, niet om jezelf te forceren.",
    redelijk:
      "Je twijfelt — een klein, concreet eerste moment helpt vaak meer dan een groot plan.",
    sterk:
      "Je bent gemotiveerd — dit is het moment om een vast moment in te plannen, niet om het aan het gevoel over te laten.",
  },
};

export const MOVEMENT_CHOICES: Record<MovementDimensionKey, string[]> = {
  kracht: [
    "Opstaan uit een stoel zonder je handen — een paar keer achter elkaar",
    "Kniebuigingen of opdrukken tegen het aanrecht",
    "Boodschappentassen of een krat bewust tillen, rug recht",
    "Plan één krachtsessie met squat, push en pull — korter dan gewoon",
  ],
  conditie: [
    "Loop 30 min stevig — 3x deze week",
    "Fiets een boodschap i.p.v. de auto",
    "Zet een wandeling in je agenda, vast tijdstip",
    "Combineer twee korte wandelingen i.p.v. één lange",
  ],
  intensiteit: [
    "3× 1 minuut stevig doorstappen tijdens een wandeling",
    "Eén keer per week een interval-sessie (fietsen/roeien/lopen)",
    "Sportles met wisselend tempo",
    "Trap op i.p.v. lift, elke dag",
  ],
  zitten: [
    "Zet een uur-alarm: 3 minuten staan of lopen",
    "Bel staand in plaats van zittend",
    "Sta op bij elke reclame/pauze",
    "Eet je lunch niet achter het scherm",
  ],
  conditie_ervaren: [
    "Kies één vaste cardio-vorm die je prettig vindt",
    "Bouw met kleine stappen op, geen sprong",
    "Meet elke maand hoe een vaste wandeling voelt",
    "Vraag een looptest bij twijfel",
  ],
  herstel: [
    "Kies vandaag rust of een korte wandeling",
    "Slaap voorrang geven boven een avondsessie",
    "Licht mobiliteitswerk i.p.v. training",
    "Plan de zwaardere sessie een dag later",
  ],
  klachten: [
    "Vervang de belastende beweging tijdelijk door een lichtere variant",
    "Bouw 48-72 uur rust in tussen zware sessies",
    "Zoek de oorzaak (houding, opbouw, schoeisel) voor je verder gaat",
    "Raadpleeg een fysiotherapeut bij aanhoudende klachten",
  ],
  mobiliteit: [
    "5 minuten mobiliteitsoefeningen na het opstaan",
    "Dynamisch rekken vóór een sessie, niet erna",
    "Bouw een korte yoga- of mobiliteitsroutine in",
    "Bukken en reiken bewust in je dagelijkse bewegingen",
  ],
  belastbaarheid: [
    "Neem bewust de trap i.p.v. de lift",
    "Bouw 1 stevige wandeling per week op in tempo",
    "Combineer kracht + cardio i.p.v. los",
    "Meet elke maand hetzelfde trapje/traject",
  ],
  consistentie: [
    "Verklein je doel tot iets dat je zeker haalt",
    "Zet een vast moment in je week, geen los voornemen",
    "Koppel bewegen aan een bestaande gewoonte",
    "Mis je een week, start de volgende gewoon weer",
  ],
  motivatie: [
    "Plan één concreet moment deze week, dag + tijd",
    "Kies iets wat je leuk vindt, niet wat 'moet'",
    "Zoek een vaste maat of afspraak",
    "Begin kleiner dan je denkt nodig te hebben",
  ],
};

export const MOVEMENT_DEEPEN: Record<MovementDimensionKey, string | null> = {
  kracht:
    "Wil je verder? Bouw rustig op naar 2× per week full-body — squat, push, pull en hip hinge. " +
    "Zwaar genoeg dat de laatste herhalingen pittig zijn, met 48–72 uur rust tussen krachtdagen.",
  conditie:
    "Wil je verder? Bouw naar 150 min matig intensief per week op — verdeeld over minimaal 3 dagen bouwt duurzamer op dan één lange sessie.",
  intensiteit:
    "Wil je verder? 75 minuten intensief per week (of een mix met matig) is de bovengrens van de beweegrichtlijn — daarboven is voor de meeste mannen 40+ herstel de beperkende factor, niet motivatie.",
  zitten:
    "Wil je verder? Onderzoek naar zitgedrag laat zien dat losse onderbrekingen (elk uur even bewegen) een deel van het risico van langdurig zitten compenseren — los van je sportfrequentie.",
  conditie_ervaren:
    "Wil je verder? Ervaren conditie is een prima startpunt — een eenvoudige wandeltest (bijv. tijd voor een vaste afstand) maakt het objectiever te volgen.",
  herstel:
    "Wil je verder? Herstel is dag-tot-dag — het is geen falen om een sessie te verzetten. Chronisch moe vóór inspanning is wél een signaal om naar slaap en belasting samen te kijken.",
  klachten: null,
  mobiliteit:
    "Wil je verder? Mobiliteitswerk werkt het best kort en vaak — 5 minuten per dag slaat meer aan dan 30 minuten één keer per week.",
  belastbaarheid:
    "Wil je verder? Functionele tests zoals traplopen voorspellen dagelijks functioneren vaak beter dan een enkel sportgetal — het is de brug tussen trainen en je dagelijks leven.",
  consistentie:
    "Wil je verder? Onderzoek naar gedragsverandering laat consistent zien: frequentie van herhaling voorspelt resultaat beter dan intensiteit van een enkele sessie.",
  motivatie: null,
};

/**
 * Het antwoordlabel dat de gebruiker zelf aanklikte, terug te lezen op het
 * resultaat. Zoeken op `value` — de opties staan aflopend (value 5 op index 0),
 * dus indexeren op `value - 1` levert het verkeerde label.
 */
export function movementAnswerLabel(
  field: MovementQuestionField,
  value: number,
): string | null {
  const question = MOVEMENT_QUESTIONS.find((q) => q.field === field);
  if (!question) return null;
  return question.options.find((option) => option.value === value)?.label ?? null;
}

export const MOVEMENT_DIMENSION_LABELS: Record<MovementDimensionKey, string> = {
  kracht: "Kracht",
  conditie: "Cardio",
  intensiteit: "Intensieve inspanning",
  zitten: "Zitten",
  conditie_ervaren: "Ervaren conditie",
  herstel: "Herstel",
  klachten: "Klachten",
  mobiliteit: "Mobiliteit",
  belastbaarheid: "Belastbaarheid",
  consistentie: "Consistentie",
  motivatie: "Motivatie",
};

/**
 * De dimensies waar een programma daadwerkelijk aan kan draaien. `herstel` en
 * `klachten` zijn moderatoren (ze sturen de zwaarte van vandaag, niet je focus),
 * `motivatie` bepaalt de grootte van de stap, en `conditie_ervaren` en
 * `belastbaarheid` zijn subjectieve respectievelijk functionele uitlezingen van
 * `conditie` — die als focus kiezen telt hetzelfde gat twee keer.
 *
 * De volgorde is de tie-break bij een gelijke score en volgt de leefstijl-ladder:
 * dagelijks bewegen (laag 1) vóór kracht en basisconditie (laag 2) vóór opbouw.
 */
/**
 * Waar de winst zit en waaróm juist daar — één zin per focus-dimensie en band.
 * Nooit een instructie: het advies staat op de doe-surface, de implicatie hier.
 * `sterk` ontbreekt bewust; een sterke dimensie wordt nooit focus.
 */
export const MOVEMENT_IMPLICATIONS: Record<
  MovementFocusKey,
  Record<Exclude<MovementBand, "sterk">, string>
> = {
  zitten: {
    aandacht:
      "Lang zitten weegt als apart risico mee, los van wat je verder traint — dit deel staat naast je training, niet erin.",
    redelijk:
      "Je zit een gemiddelde werkdag; de winst zit hier in het onderbreken, niet in minder uren.",
  },
  kracht: {
    aandacht:
      "Zolang kracht onder één keer per week blijft, is dit het deel dat het meeste laat liggen — meer wandelen vult het niet op.",
    redelijk:
      "Van één naar twee keer per week is de stap die na 40 het meeste spierweefsel behoudt; daar zit je winst nu.",
  },
  conditie: {
    aandacht:
      "Cardio ligt nu het verst onder de richtlijn van 150 tot 300 minuten; daar levert hetzelfde kwartier meer op dan bij de andere delen.",
    redelijk:
      "Je zit rond de richtlijn — hier telt volhouden zwaarder dan opschalen.",
  },
  consistentie: {
    aandacht:
      "Zolang de weken niet gehaald worden, verandert een zwaarder programma niets — de winst zit in een kleinere week die je wél haalt.",
    redelijk:
      "Je haalt de meeste weken; het verschil zit nu in de week die je normaal overslaat.",
  },
  intensiteit: {
    aandacht:
      "Intensieve inspanning test je hart-longcapaciteit het scherpst, en dat deel ontbreekt nu vrijwel volledig.",
    redelijk:
      "Je haalt af en toe een pittige sessie; één keer meer per week is hier de merkbaarste verandering.",
  },
  mobiliteit: {
    aandacht:
      "Mobiliteit neemt vanaf ongeveer 40 sneller af dan de meeste mannen doorhebben — dit deel bepaalt hoeveel je van de rest kunt doen.",
    redelijk:
      "Je bent redelijk soepel; kort en vaak houdt dat op peil, niet lang en zelden.",
  },
};

export const MOVEMENT_MAINTENANCE_IMPLICATION =
  "Vasthouden is hier de winst: dit valt in een drukke week sneller terug dan het is opgebouwd.";

export const MOVEMENT_FOCUS_ORDER = [
  "zitten",
  "kracht",
  "conditie",
  "consistentie",
  "intensiteit",
  "mobiliteit",
] as const satisfies readonly MovementDimensionKey[];

export type MovementFocusKey = (typeof MOVEMENT_FOCUS_ORDER)[number];

/**
 * De feitenrijen op het resultaat: eigen antwoord eerst, dan de richtlijn waar
 * die bestaat, dan pas een kwalificatie (L12). `aeroob` vat cardio en intensief
 * samen — de richtlijn kent één aerobe norm met twee valuta's, dus twee losse
 * rijen zouden één gat als twee tonen. `herstel` en `klachten` staan er bewust
 * niet in: die gaan over vandaag en sturen de zwaarte, niet je winst — en een
 * oordeel over klachten zou een medische claim zijn.
 */
export const MOVEMENT_FACT_ROW_ORDER = [
  "aeroob",
  "kracht",
  "zitten",
  "conditie_ervaren",
  "mobiliteit",
  "belastbaarheid",
  "consistentie",
  "motivatie",
] as const;

export type MovementFactRowKey = (typeof MOVEMENT_FACT_ROW_ORDER)[number];

export const MOVEMENT_FACT_LABELS: Record<MovementFactRowKey, string> = {
  aeroob: "Cardio en intensief samen",
  kracht: MOVEMENT_DIMENSION_LABELS.kracht,
  zitten: MOVEMENT_DIMENSION_LABELS.zitten,
  conditie_ervaren: MOVEMENT_DIMENSION_LABELS.conditie_ervaren,
  mobiliteit: MOVEMENT_DIMENSION_LABELS.mobiliteit,
  belastbaarheid: MOVEMENT_DIMENSION_LABELS.belastbaarheid,
  consistentie: MOVEMENT_DIMENSION_LABELS.consistentie,
  motivatie: MOVEMENT_DIMENSION_LABELS.motivatie,
};

export type MovementBenchmark = {
  label: string;
  source: string;
  /** Korte vorm voor lopende zinnen — "de richtlijn van {short}". */
  short: string | null;
  footnote: string | null;
};

export const MOVEMENT_BENCHMARKS: Partial<Record<MovementFactRowKey, MovementBenchmark>> = {
  kracht: {
    label: "Richtlijn: 2× per week krachttraining",
    source: "WHO 2020",
    short: "twee keer per week",
    footnote: null,
  },
  aeroob: {
    label: "Richtlijn: 150–300 minuten matig per week, of 75–150 minuten intensief",
    source: "WHO 2020 · Beweegrichtlijnen 2017",
    short: "150 tot 300 minuten matig per week",
    footnote:
      "In de richtlijn telt één minuut intensief als twee minuten matig — daarom staan ze hier samen.",
  },
  // Zitten heeft wél een richtlijn, maar een kwalitatieve: "voorkom veel
  // stilzitten". De ~8-uursgrens komt uit cohortonderzoek. Daarom geen `short`
  // (er valt niets aan af te meten) en een voetnoot die het verschil benoemt.
  zitten: {
    label: "Richtlijn: voorkom veel stilzitten — geen getalsnorm",
    source: "WHO 2020",
    short: null,
    footnote:
      "De grens van ongeveer 8 uur per dag komt uit cohortonderzoek naar zitgedrag, niet uit een richtlijn.",
  },
};

/**
 * Waarom een rij meetelt, in maximaal twaalf woorden. `below` krijgt de
 * kans-variant: feit plus opening, nooit een saldo en nooit schuld.
 */
export const MOVEMENT_FACT_WHY: Record<
  MovementFactRowKey,
  { neutral: string; below?: string }
> = {
  aeroob: {
    neutral: "Intensieve minuten tellen dubbel; samen vormen ze je aerobe basis.",
    below: "Onder de richtlijn — hier levert hetzelfde kwartier meer op dan bij de andere delen.",
  },
  kracht: {
    neutral: "Spierbehoud na 40 hangt aan frequentie, niet aan zwaarte.",
    below: "Richtlijn is 2× per week; jij zit daar nu onder. Eén vast moment brengt dit binnen bereik.",
  },
  zitten: { neutral: "Lang zitten weegt apart mee, los van je training." },
  conditie_ervaren: { neutral: "Je gevoel over je conditie stuurt wat je durft op te bouwen." },
  mobiliteit: { neutral: "Soepelheid bepaalt hoeveel je van de rest kunt doen." },
  belastbaarheid: { neutral: "Traplopen voorspelt dagelijks functioneren beter dan één sportgetal." },
  consistentie: { neutral: "Herhaling voorspelt resultaat sterker dan de zwaarte van één sessie." },
  motivatie: { neutral: "Bepaalt de grootte van de stap, niet je resultaat." },
};

export const MOVEMENT_FACT_HEADING = "Wat je antwoordde, en waar dat staat";
export const MOVEMENT_FACT_INTRO =
  "Waar een richtlijn bestaat, staat hij erbij. De rest meet je tegen jezelf.";

export const MOVEMENT_FACT_STATUS_LABELS = {
  below: "Onder de richtlijn",
  near: "Bijna op de richtlijn",
  meets: "Haalt de richtlijn",
  own: "Jouw ijkpunt",
} as const;

/**
 * Het vervolg op het check-in resultaat: waar het platform je naartoe stuurt,
 * niet wat je moet doen (dat staat op de doe-surface). Maximaal drie uitgangen,
 * elk precies één link — de enige knop op het scherm blijft de programma-CTA.
 */
export type MovementStripVariant = "S1" | "S2" | "S3";
export type MovementFollowupRoute = "programma" | "voortgang" | "mijn_dag";

export const MOVEMENT_FOLLOWUP_ROUTES: Record<
  MovementFollowupRoute,
  { label: string; hint: string }
> = {
  programma: {
    label: "Naar je beweegplan",
    hint: "Daar staat wat je deze week doet.",
  },
  voortgang: {
    label: "Bekijk je volledige beeld",
    hint: "Al je metingen bij elkaar, met wat erna komt.",
  },
  mijn_dag: {
    label: "Terug naar Mijn Dag",
    hint: "Je meting is opgeslagen; je dag staat er nog.",
  },
};

export const MOVEMENT_STRIP_VARIANTS: Record<
  MovementStripVariant,
  { heading: string; lines: string[]; routes: MovementFollowupRoute[] }
> = {
  S1: {
    heading: "Wat er hierna gebeurt",
    lines: [
      "We beginnen met een week die je haalt — kleiner dan je zelf zou plannen.",
      "Blijft die staan, dan bouwen we hem uit. Verdieping komt pas als het ritme er is.",
    ],
    routes: ["programma", "voortgang"],
  },
  // Bewust één deur: wie net terugviel, sturen we niet naar een vollediger
  // overzicht van diezelfde terugval.
  S2: {
    heading: "Wat we nu doen",
    lines: [
      "Een mindere maand is informatie, geen oordeel.",
      "Je plan gaat daarom kleiner, niet zwaarder — één moment dat je zeker haalt.",
    ],
    routes: ["programma"],
  },
  S3: {
    heading: "Wat er hierna gebeurt",
    lines: [
      "Je hoeft nu niets nieuws te doen. Dit vasthouden is het werk.",
      "We houden je metingen bij en zeggen het als er iets verschuift.",
    ],
    routes: ["voortgang", "programma"],
  },
};
