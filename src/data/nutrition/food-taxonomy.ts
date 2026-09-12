/**
 * De zoektaxonomie van het voedingsdagboek — hoe je een voedingsmiddel vindt.
 *
 * ## Twee assen, en waarom ze niet dezelfde mogen zijn
 *
 * Het dagboek kent twee indelingen die vaak verward worden, en het verwarren
 * ervan breekt allebei:
 *
 * 1. **Voedselgroepen** ({@link VoedselgroepId}, dertien stuks) — de
 *    *analyse-as*. Hierop draaien `berekenBreedte`, `berekenVariatie`, de
 *    weekendvergelijking en de brug naar de zelfrapportage van de check. Die
 *    dertien liggen vast: de noemer van "je at uit 6 van de 13 groepen" is
 *    onderdeel van een meting, en een groep erbij maakt alle eerdere dagen
 *    onvergelijkbaar (zelfde soort versiegrens als `gevraagdeGroepen()`).
 *
 * 2. **Zoekcategorieën** (dit bestand, drieëntwintig stuks) — de *navigatie-as*.
 *    Hierop blader je als je niet weet hoe je iets moet spellen. Deze lijst mag
 *    groeien zonder dat er ook maar iets aan een meting verandert.
 *
 * Zou je de analyse-as naar drieëntwintig groepen brengen, dan breekt de
 * breedtemaat. Zou je de navigatie-as tot dertien beperken, dan staan brood,
 * pasta, ontbijtgranen en rijst in één bak "granen" en vindt niemand iets.
 * Vandaar twee velden op elke catalogusregel: `groep` voor de analyse,
 * `category` voor het zoeken.
 *
 * ## Waarom "diepvries" en "conserven" hier géén categorie zijn
 *
 * Ze stonden in het oorspronkelijke voorstel wél in de lijst, en dat is een
 * val: het zijn *vormen*, geen soorten. Diepvriesbroccoli hoort onder
 * groenten; hem ook onder "diepvries" zetten betekent dat hij op twee plekken
 * staat, of dat iemand moet raden waar hij te vinden is.
 *
 * De vorm zit daarom op een eigen as ({@link Bereiding}) en werkt als filter
 * bínnen een categorie: *groenten → broccoli → diepvries*. Dat is één plek per
 * voedingsmiddel, en de vraag "welke vorm" wordt gesteld waar hij hoort.
 *
 * ## Waarom een voedingsmiddel in meer dan één categorie mag staan
 *
 * Havermout is een graan en een ontbijtproduct. Pindakaas is een smeersel en
 * een ontbijtproduct. Noten zijn noten en een snack. Zonder oplossing kiest de
 * catalogus willekeurig, en dan is de helft van de tijd de verkeerde.
 *
 * `category` is de plek waar hij *woont* (één, altijd); `ookIn` zijn de plekken
 * waar hij ook *gevonden* wordt. Geen duplicaten in de data, wel op de plekken
 * waar mensen kijken.
 */

import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * De drieëntwintig zoekcategorieën.
 *
 * Volgorde volgt het bord en daarna de winkel: plantkant, eiwitkant, dragers,
 * dan de samengestelde en bewerkte hoek. Niet alfabetisch — een alfabetische
 * lijst zet "aardappelen" naast "alcohol" en dat helpt niemand.
 */
export type FoodCategoryId =
  | "groenten"
  | "fruit"
  | "granen"
  | "brood"
  | "pasta"
  | "peulvruchten"
  | "noten"
  | "zaden"
  | "vlees"
  | "orgaanvlees"
  | "vis"
  | "zeevruchten"
  | "eieren"
  | "zuivel"
  | "kaas"
  | "plantaardig"
  | "vetten"
  | "sauzen"
  | "ontbijt"
  | "snacks"
  | "soepen"
  | "maaltijden"
  | "dranken";

export interface FoodCategory {
  id: FoodCategoryId;
  labelNl: string;
  /**
   * De voedselgroep waar het merendeel van deze categorie in valt. Puur voor
   * een leeg-staat-hint in de UI ("groenten tellen mee voor je groentegroep");
   * de werkelijke groep staat **per regel** in de catalogus, want een
   * categorie dekt er meer dan één. "Conserven" was daar het bewijs van:
   * bonen, tomaten en tonijn vallen in drie verschillende groepen.
   */
  hoofdgroep: VoedselgroepId;
  /** Eén regel die zegt wat er wel en niet in valt. Voorkomt grensgevallen. */
  omschrijving: string;
}

export const FOOD_CATEGORIES: readonly FoodCategory[] = [
  { id: "groenten", labelNl: "Groenten", hoofdgroep: "groente",
    omschrijving: "Alles wat als groente op het bord komt, in elke vorm — vers, diepvries of uit blik." },
  { id: "fruit", labelNl: "Fruit", hoofdgroep: "fruit",
    omschrijving: "Vers, diepvries en gedroogd fruit. Sap staat bij dranken." },
  { id: "granen", labelNl: "Granen & rijst", hoofdgroep: "granen",
    omschrijving: "Losse granen en pseudogranen. Brood en pasta hebben een eigen categorie." },
  { id: "brood", labelNl: "Brood & bakkerij", hoofdgroep: "granen",
    omschrijving: "Brood, crackers en hartige bakkerij. Zoete bakkerij staat bij snacks." },
  { id: "pasta", labelNl: "Pasta & noedels", hoofdgroep: "granen",
    omschrijving: "Deegwaren van tarwe, rijst of peulvruchten." },
  { id: "peulvruchten", labelNl: "Peulvruchten", hoofdgroep: "peulvruchten",
    omschrijving: "Bonen, linzen en erwten — droog, gekookt of uit blik." },
  { id: "noten", labelNl: "Noten", hoofdgroep: "noten",
    omschrijving: "Noten en pinda's. Notenpasta staat bij sauzen & smeersels." },
  { id: "zaden", labelNl: "Zaden", hoofdgroep: "noten",
    omschrijving: "Zaden en pitten. Vallen analytisch onder noten & zaden." },
  { id: "vlees", labelNl: "Vlees", hoofdgroep: "vlees",
    omschrijving: "Spiervlees en vleeswaren. Orgaanvlees heeft een eigen categorie." },
  { id: "orgaanvlees", labelNl: "Orgaanvlees", hoofdgroep: "vlees",
    omschrijving: "Lever, hart, nier. Apart omdat de gehaltes een orde afwijken van spiervlees." },
  { id: "vis", labelNl: "Vis", hoofdgroep: "vis",
    omschrijving: "Vis in elke vorm. Schaal- en schelpdieren staan apart." },
  { id: "zeevruchten", labelNl: "Schaal- en schelpdieren", hoofdgroep: "vis",
    omschrijving: "Garnalen, mosselen, oesters, inktvis." },
  { id: "eieren", labelNl: "Eieren", hoofdgroep: "eieren",
    omschrijving: "Ei in elke bereiding." },
  { id: "zuivel", labelNl: "Zuivel", hoofdgroep: "zuivel",
    omschrijving: "Melk, yoghurt, kwark en room. Kaas heeft een eigen categorie." },
  { id: "kaas", labelNl: "Kaas", hoofdgroep: "zuivel",
    omschrijving: "Alle kaas. Apart van zuivel omdat de portie en het eiwit per 100 g sterk afwijken." },
  { id: "plantaardig", labelNl: "Plantaardige alternatieven", hoofdgroep: "peulvruchten",
    omschrijving: "Vervangers voor zuivel en vlees. Let op: verrijking is een merkkeuze, geen voedingsmiddel-eigenschap." },
  { id: "vetten", labelNl: "Oliën & vetten", hoofdgroep: "vetten",
    omschrijving: "Bak-, braad- en slaolie, boter en margarine." },
  { id: "sauzen", labelNl: "Sauzen & smeersels", hoofdgroep: "vetten",
    omschrijving: "Van mayonaise tot hummus en pindakaas." },
  { id: "ontbijt", labelNl: "Ontbijtproducten", hoofdgroep: "granen",
    omschrijving: "Wat er 's ochtends op tafel staat — verzamelt uit granen, brood en smeersels." },
  { id: "snacks", labelNl: "Snacks & zoet", hoofdgroep: "suiker",
    omschrijving: "Tussendoor en zoet. Noten staan bij noten, ook als je ze als snack eet." },
  { id: "soepen", labelNl: "Soepen", hoofdgroep: "groente",
    omschrijving: "Soep als geheel. De ingrediënten los staan in hun eigen categorie." },
  { id: "maaltijden", labelNl: "Kant-en-klaarmaaltijden", hoofdgroep: "zetmeel",
    omschrijving: "Samengestelde gerechten. Gehaltes komen uit de componenten, nooit uit een eigen tabelwaarde." },
  { id: "dranken", labelNl: "Dranken", hoofdgroep: "dranken",
    omschrijving: "Alles wat je drinkt, inclusief sap en koffie." },
] as const;

/**
 * De vorm waarin een voedingsmiddel op tafel komt.
 *
 * ## Wanneer een vorm een eigen catalogusregel verdient
 *
 * Alleen als hij het gehalte of de portie **meetbaar** verandert. Twee
 * mechanismen doen dat:
 *
 * - **Water.** Koken voegt water toe (rijst, pasta), drogen haalt het weg
 *   (vijgen, abrikozen). Het gehalte per 100 g beweegt dan mee zonder dat er
 *   één molecuul bij of af gaat. Dit is de grootste bron van verschil, en de
 *   makkelijkste om over het hoofd te zien.
 * - **Uitloging.** Koken in ruim water laat mineralen weglopen; stomen veel
 *   minder. Bij blikgroente en -peulvruchten zit een deel in het vocht dat je
 *   weggooit.
 *
 * En één die het gehalte níét verandert maar de invoer wel: **portie**. Een
 * portie rauwe spinazie is 75 g, gekookt 150 g — dezelfde bak, ingekookt.
 * Zonder aparte regel logt iemand structureel de helft.
 *
 * ## Wanneer níét
 *
 * Roosteren van noten. Mineralen zijn elementen; verhitting laat ze staan. Het
 * waterverlies tilt het gehalte per 100 g enkele procenten op, en dat valt
 * ruim binnen de spreidingsband van de bron zelf. Een aparte regel zou een
 * verschil suggereren dat de meting niet kan zien.
 */
export type Bereiding =
  | "rauw"
  | "gekookt"
  | "gestoomd"
  | "gebakken"
  | "gegrild"
  | "gefrituurd"
  | "geroosterd"
  | "diepvries"
  | "blik"
  | "gedroogd"
  | "gerookt"
  | "gefermenteerd";

export const BEREIDING_LABEL: Record<Bereiding, string> = {
  rauw: "rauw",
  gekookt: "gekookt",
  gestoomd: "gestoomd",
  gebakken: "gebakken",
  gegrild: "gegrild",
  gefrituurd: "gefrituurd",
  geroosterd: "geroosterd",
  diepvries: "diepvries",
  blik: "uit blik",
  gedroogd: "gedroogd",
  gerookt: "gerookt",
  gefermenteerd: "gefermenteerd",
};

const CATEGORY_BY_ID: ReadonlyMap<FoodCategoryId, FoodCategory> = new Map(
  FOOD_CATEGORIES.map((category) => [category.id, category]),
);

export function foodCategory(id: FoodCategoryId): FoodCategory | null {
  return CATEGORY_BY_ID.get(id) ?? null;
}

export function isFoodCategoryId(value: string): value is FoodCategoryId {
  return CATEGORY_BY_ID.has(value as FoodCategoryId);
}
