import type { NutrientId } from "@/data/nutrition/intake-reference";

/**
 * De voedingsroute per nutriënt: wat je moet eten om hem uit je bord te halen,
 * uitgedrukt in de eenheid die de check ook daadwerkelijk meet.
 *
 * ## Waarom dit bestand bestaat
 *
 * Omega-3 heeft dit al en het werkt: "2× vette vis per week, anders een
 * supplement". Dat werkt omdat de vráág ("hoe vaak vette vis") en de nórm
 * ("2× per week") dezelfde eenheid delen — je kunt het antwoord letterlijk
 * naast de drempel leggen en er een keuze aan hangen.
 *
 * Bij magnesium en zink gaat dat níet zomaar. Hun referentiewaarde staat in
 * milligrammen per dag, en de check telt porties. `intake-reference.ts` zegt
 * dat zelf, met vertrouwen 1 van 4: "je band komt uit een groente-en-fruit-
 * telling, terwijl noten, volkoren en peulvruchten de sterkere bronnen zijn".
 *
 * ## De harde grens die hier geldt
 *
 * **Geen enkele route noemt een milligram-som.** Niet "je haalt 210 mg uit je
 * voeding" en niet "nog 140 mg te gaan". Drie redenen, en ze stapelen:
 *
 * 1. De check meet frequenties, geen grammen. Een mg-getal zou een precisie
 *    claimen die het instrument niet heeft.
 * 2. Elke waarde in `food-sources.ts` staat op `verified: false` — de
 *    NEVO-licentie is niet rond, de getallen zijn indicatief.
 * 3. Bij magnesium en zink bepaalt fytaat de opname méér dan het gehalte. Twee
 *    keer dezelfde mg uit brood en uit vlees zijn niet hetzelfde getal.
 *
 * Wat een route dus wél doet: een drempel in porties of momenten, de bronnen
 * die daaraan bijdragen, en een eerlijk woord over hoe hard die drempel is.
 * Dat is genoeg om een keuze op te baseren, en het is alles wat we kunnen
 * dragen.
 */

/**
 * Hoe hard de drempel is. Bepaalt welke taal de UI mag voeren, en het is
 * hetzelfde onderscheid dat `NutritionQuestionHelp.benchmarkKind` maakt.
 *
 * - `populatierichtlijn` — gepubliceerd door WHO of Gezondheidsraad.
 * - `vuistregel` — onze eigen indicatieve grens, herleidbaar maar niet
 *   gepubliceerd als norm.
 * - `proxy` — de vraag meet iets anders dan de stof zelf. Dit is de eerlijke
 *   naam voor magnesium en zink, en de UI hoort dat te zeggen in plaats van
 *   een grens te suggereren die er niet is.
 */
export type RouteThresholdKind = "populatierichtlijn" | "vuistregel" | "proxy";

export type NutrientRouteSource = {
  /** Sleutel in `FOOD_SOURCES[nutrient]` — de brug naar de bronnentabel. */
  foodSourceKey: string;
  /** Waarom juist deze bron de route draagt, max ~12 woorden. */
  whyNl: string;
};

export type NutrientRoute = {
  nutrient: NutrientId;
  /**
   * De drempel in de eenheid van de check: "2× vette vis per week". Dit is de
   * zin die naast zijn eigen antwoord komt te staan.
   */
  thresholdNl: string;
  thresholdKind: RouteThresholdKind;
  /** Wie de drempel publiceerde. Null bij vuistregel en proxy. */
  sourceNl: string | null;
  /**
   * De slider die deze route meet. Eén per route: is er geen vraag die de stof
   * in zijn eigen eenheid meet, dan is `thresholdKind` per definitie `proxy`.
   */
  sliderId: string;
  /**
   * Wat je concreet doet om de route te lopen. Eén handeling, geen lijst —
   * dit is de regel die op een knop of onder een keuze past.
   */
  actionNl: string;
  /** De sterkste bronnen, in de volgorde waarin de UI ze toont. */
  sources: readonly NutrientRouteSource[];
  /**
   * Wat je bord dagelijks van je vraagt om deze route te lopen, in porties.
   *
   * Dit is de vergelijking met een supplement, en het is bewust een
   * vergelijking van **moeite** en niet van hoeveelheid. Een capsule is één
   * handeling; een route is een patroon. Dat verschil kun je eerlijk naast
   * elkaar zetten zonder te weten hoeveel milligram er in beide zit — en dat
   * is maar goed ook, want dat weten we niet (zie de kop van dit bestand).
   *
   * Harde regel, dezelfde als voor de rest van dit bestand: **hier staat nooit
   * een mg-som en nooit een percentage van een ADH.** Niet "dit dekt je
   * dagbehoefte", niet "hiermee zit je op 80%". Wel: welke porties, hoe vaak,
   * en wat je bord meebrengt dat een potje niet meebrengt.
   */
  boardEffortNl: string;
  /**
   * Dezelfde moeite in één regel, voor Kompas.
   *
   * `boardEffortNl` is leeswerk en hoort op Voortgang; Kompas is een
   * keuzescherm en heeft aan een alinea per stof niets — daar staan er twee
   * onder elkaar en verdrinkt de keuze in tekst. Dit is dus geen samenvatting
   * die de UI zelf mag afkappen, maar een eigen formulering: de handeling en
   * haar frequentie, verder niets.
   *
   * Dezelfde harde regel: geen mg, geen percentage.
   */
  boardEffortShortNl: string;
  /**
   * Wanneer het bord deze stof niet meer kan dekken. Dit is de enige plek waar
   * een route zijn eigen grens erkent — en dus de enige eerlijke opening naar
   * een supplement.
   */
  boardCannotCoverNl: string;
  /**
   * Alleen invullen waar de meting zwak is. De UI toont dit letterlijk bij de
   * route, zodat de gebruiker weet hoe hard het oordeel is dat hij leest.
   */
  measurementCaveatNl?: string;
};

export const NUTRIENT_ROUTES: Record<NutrientId, NutrientRoute> = {
  omega3: {
    nutrient: "omega3",
    thresholdNl: "1× per week vette vis, 2× is beter",
    thresholdKind: "populatierichtlijn",
    sourceNl: "Gezondheidsraad 2015",
    sliderId: "oilyFish",
    actionNl: "Zet één keer vette vis op je boodschappenlijst.",
    sources: [
      { foodSourceKey: "haring", whyNl: "De sterkste EPA/DHA-bron per portie, ook uit het vuistje." },
      { foodSourceKey: "makreel", whyNl: "Uit blik net zo goed als vers — en jaarrond te krijgen." },
      { foodSourceKey: "zalm-gekweekt", whyNl: "Levert minder dan wild, maar nog altijd ruim." },
    ],
    boardEffortNl:
      "Eén tot twee keer per week een portie vette vis — haring uit het vuistje, makreel uit blik, of zalm bij het avondeten. Dat is een boodschap per week, geen dagelijkse handeling. Wat je er bovenop krijgt: vis levert ook jodium, vitamine D en eiwit, en dat staat in geen enkele capsule.",
    boardEffortShortNl:
      "Eén tot twee keer per week een portie vette vis — dat is een boodschap per week, geen dagelijkse handeling.",
    boardCannotCoverNl:
      "Eet je geen vis, dan is dit de enige van de vijf waar je bord geen alternatief heeft: plantaardig ALA zet je lichaam maar voor enkele procenten om naar EPA en DHA.",
  },
  protein: {
    nutrient: "protein",
    thresholdNl: "3 eiwitrijke eetmomenten per dag",
    thresholdKind: "vuistregel",
    sourceNl: "PROT-AGE 2013",
    sliderId: "proteinMeals",
    actionNl: "Verplaats één eiwitrijk moment naar je ontbijt.",
    sources: [
      { foodSourceKey: "magere-kwark", whyNl: "Het makkelijkste ontbijtmoment om erbij te zetten." },
      { foodSourceKey: "kipfilet", whyNl: "Veel eiwit per portie, weinig eromheen." },
      { foodSourceKey: "eieren", whyNl: "Compleet aminozuurprofiel en overal te krijgen." },
    ],
    boardEffortNl:
      "Drie momenten op een dag met een stevige eiwitbron: 200 g kwark, 100 g kip of vis, twee eieren, een portie peulvruchten. Het zwaarste is niet de hoeveelheid maar het ontbijt — daar staat bij de meeste mannen het derde moment leeg. Een poeder lost precies dat ene moment op en verder niets.",
    boardEffortShortNl:
      "Drie momenten per dag met een stevige eiwitbron. Het zwaarste is het ontbijt, niet de hoeveelheid.",
    boardCannotCoverNl:
      "Boven de dertig telt de verdeling zwaarder dan het dagtotaal. Krijg je drie momenten niet rond — bijvoorbeeld bij weinig eetlust 's ochtends — dan is dat het moment waarop een poeder iets oplost dat je bord niet oplost.",
  },
  vitamin_d: {
    nutrient: "vitamin_d",
    thresholdNl: "dagelijks 15 minuten buiten met onbedekte huid",
    thresholdKind: "vuistregel",
    sourceNl: null,
    sliderId: "daylight",
    actionNl: "Loop één keer per dag een kwartier naar buiten.",
    sources: [
      { foodSourceKey: "haring", whyNl: "Vette vis is de enige noemenswaardige bron op je bord." },
      { foodSourceKey: "eieren", whyNl: "Draagt bij, maar dekt het nooit alleen." },
    ],
    boardEffortNl:
      "Hier vraagt je bord bijna niets, en dat is precies het probleem: buiten vette vis is er geen bron die noemenswaardig bijdraagt. De inspanning zit in je agenda, niet in je boodschappen — een kwartier buiten per dag, met je mouwen omhoog. Van april tot september doet dat het werk; daarbuiten niet, hoe vaak je ook gaat.",
    boardEffortShortNl:
      "Hier vraagt je bord bijna niets — de inspanning zit in je agenda: een kwartier buiten per dag, van april tot september.",
    boardCannotCoverNl:
      "Dit is de omgekeerde route: je vitamine D komt in Nederland van je huid, niet van je bord. Tussen oktober en april staat de zon hier te laag — dan kan geen enkel eetpatroon dit dichten, en is aanvullen de normale route in plaats van de uitzondering.",
  },
  magnesium: {
    nutrient: "magnesium",
    thresholdNl: "dagelijks noten, peulvruchten, volkoren of bladgroente",
    thresholdKind: "proxy",
    sourceNl: null,
    sliderId: "vegetables",
    actionNl: "Zet een handvol ongezouten noten neer als vaste tussendoor.",
    sources: [
      { foodSourceKey: "pompoenzaden", whyNl: "De dichtste bron per handvol die er is." },
      { foodSourceKey: "spinazie", whyNl: "Kookvocht meenemen scheelt — magnesium loogt erin uit." },
      { foodSourceKey: "zwarte-bonen", whyNl: "Weken en weekwater weggooien verlaagt het fytaat." },
    ],
    boardEffortNl:
      "Dagelijks iets uit de sterke hoek: een handvol pompoenzaden of noten, volkoren in plaats van wit, peulvruchten bij de warme maaltijd, bladgroente met het kookvocht erbij. Eén bron per dag is de handeling, geen vier. Let op wat dit níet is: één soort in grote hoeveelheid haalt het niet — met bananen of avocado alleen kom je er niet, die staan onderaan de lijst en niet bovenaan. De winst zit in dagelijkse spreiding, en die brengt tegelijk vezels en kalium mee.",
    boardEffortShortNl:
      "Dagelijks één bron uit de sterke hoek: noten, volkoren, peulvruchten of bladgroente. Spreiding wint het van één soort in grote hoeveelheid.",
    boardCannotCoverNl:
      "Magnesium zit breed verspreid in plantaardig eten, dus een bord dat staat dekt dit meestal. Blijft de klacht staan terwijl je route loopt, dan is dat het moment om te vergelijken — niet eerder.",
    measurementCaveatNl:
      "We meten dit met je plantporties, niet met milligrammen. Dat is een benadering: noten, volkoren en peulvruchten zijn sterkere bronnen dan groente en fruit, en fytaat bepaalt hoeveel je er werkelijk uit haalt. Je leest hier dus een richting, geen hoeveelheid.",
  },
  zinc: {
    nutrient: "zinc",
    thresholdNl: "dagelijks vlees, vis, peulvruchten of zuivel",
    thresholdKind: "proxy",
    sourceNl: null,
    sliderId: "meatLegumes",
    actionNl: "Voeg peulvruchten toe aan één warme maaltijd per week.",
    sources: [
      { foodSourceKey: "rundvlees", whyNl: "Dierlijke bronnen kennen de fytaatrem niet." },
      { foodSourceKey: "pompoenzaden", whyNl: "Plantaardig sterk, maar de opname ligt lager." },
      { foodSourceKey: "belegen-kaas", whyNl: "Levert stil mee zonder dat je erop let." },
    ],
    boardEffortNl:
      "Dagelijks één portie uit vlees, vis, zuivel of peulvruchten — 100 g rundvlees, twee sneden belegen kaas, een schaal linzen. Dierlijk is hier minder werk dan plantaardig: dezelfde portie levert bij vlees meer op omdat de fytaatrem ontbreekt. Eet je plantaardig, dan is het niet meer maar ánders eten: weken, zuurdesem en gisting halen fytaat omlaag.",
    boardEffortShortNl:
      "Dagelijks één portie uit vlees, vis, zuivel of peulvruchten. Dierlijk is hier minder werk dan plantaardig.",
    boardCannotCoverNl:
      "Eet je geen vlees en vis, dan werkt de fytaatrem structureel tegen je: uit peulvruchten en volkoren komt minder aan dan uit vlees, ook als de bron er staat. Dat is de situatie waarin aanvullen zin heeft.",
    measurementCaveatNl:
      "We meten dit met je vlees-, vis- en peulvruchtporties. Bij zink bepaalt de fytaat:zinkverhouding hoeveel er werkelijk aankomt, en die kunnen we uit een frequentievraag niet afleiden. Je leest hier dus of de bron er is, niet hoeveel je opneemt.",
  },
};

/** Alle routes in de volgorde waarin de UI ze toont: bord-eerst, huid apart. */
export const NUTRIENT_ROUTE_ORDER: readonly NutrientId[] = [
  "protein",
  "omega3",
  "magnesium",
  "zinc",
  "vitamin_d",
];

export function nutrientRoute(nutrient: NutrientId): NutrientRoute {
  return NUTRIENT_ROUTES[nutrient];
}

/**
 * Of deze route hard genoeg is om er een oordeel op te baseren.
 *
 * Een `proxy`-route mag wél een richting tonen ("hier ligt je winst") maar
 * nooit een tekort uitspreken alsof er een grens gemist is — er ís geen grens
 * in de eenheid die we meten. Dit is de machinaal toetsbare kant van de
 * vertrouwens-annotatie in `intake-reference.ts`.
 */
export function routeCarriesVerdict(route: NutrientRoute): boolean {
  return route.thresholdKind !== "proxy";
}
