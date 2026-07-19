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

export type MovementQuestion = {
  field: MovementQuestionField;
  dimension: MovementDimensionKey;
  question: string;
  subtitle?: string;
  options: { label: string; value: number }[];
};

export const MOVEMENT_QUESTIONS: MovementQuestion[] = [
  {
    field: "MOV2_STR",
    dimension: "kracht",
    question: "Hoe vaak doe je doelgerichte kracht- of weerstandstraining?",
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
    subtitle:
      "Dit tempo (zone 2) traint je conditie — de basis onder je energie en herstel.",
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
