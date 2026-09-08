/**
 * De micronutriënten die het dagboek per voedingsmiddel toont.
 *
 * ## Waarom dit naast `intake-reference.ts` staat
 *
 * `NutrientId` (eiwit, omega-3, magnesium, vitamine D, zink) is de lijst met
 * een **interventiepad**: elk van die vijf heeft een `/beste/`-pagina, een
 * goedgekeurde claim en een supplement-gate. Die lijst mag niet groeien zonder
 * dat er ook een pad achter zit — anders belooft de gate iets wat er niet is.
 *
 * Deze lijst beantwoordt een andere vraag: *wat levert dit bord?* Daar horen
 * ook stoffen bij waar wij niks te verkopen hebben — kalium, foliumzuur,
 * vitamine C, vezels. Juist die stoffen dragen het argument dat het Kompas
 * maakt: je haalt dit uit groenten, niet uit een potje. Ze weglaten omdat er
 * geen route achter zit zou het overzicht laten kantelen naar precies de vijf
 * stoffen waar een supplement bij te koop is.
 *
 * De brug tussen de twee lijsten is {@link Micronutrient.nutrientId}: waar een
 * micronutriënt óók een interventiepad heeft, staat die sleutel erbij en kan de
 * UI doorlinken naar de bestaande route-logica.
 *
 * ## Wat deze lijst NIET is
 *
 * Geen inname-boekhouding. De harde leesregel uit `food-sources.ts` geldt hier
 * onverkort: gehaltes per portie tellen **niet** op tot een dagtotaal dat je
 * tegen een ADH legt. Wat het dagboek wél doet is tellen wélke bronnen
 * langskwamen — dekking, geen milligrammen. Zie `nutrition-dagdekking.ts`.
 */

import type { NutrientId } from "@/data/nutrition/intake-reference";

export type MicronutrientId =
  // Mineralen
  | "magnesium"
  | "kalium"
  | "calcium"
  | "ijzer"
  | "zink"
  | "jodium"
  | "selenium"
  // Vitamines
  | "vitamine_a"
  | "vitamine_c"
  | "vitamine_d"
  | "vitamine_e"
  | "vitamine_k"
  | "foliumzuur"
  | "vitamine_b6"
  | "vitamine_b12"
  // Macro's met een micro-rol: ze horen in dit overzicht omdat je ze uit
  // dezelfde bronnen haalt en het gesprek erover hetzelfde is.
  | "vezels"
  | "omega3"
  | "eiwit";

export type MicronutrientGroep = "mineraal" | "vitamine" | "overig";

export type MicronutrientEenheid = "g" | "mg" | "µg";

export interface Micronutrient {
  id: MicronutrientId;
  /** Gebruikerslabel, Nederlands. */
  label: string;
  groep: MicronutrientGroep;
  eenheid: MicronutrientEenheid;
  /**
   * Wat deze stof in het lichaam doet, in één regel zonder claim-taal. Geen
   * "helpt tegen", geen "verbetert" — dat is claimgebied (zie approved-claims).
   */
  rolRegel: string;
  /**
   * Waar je hem vooral vandaan haalt, in gewone taal. Draagt de lege staat van
   * een bronnenlijst en de regel onder een dekkingsbalk.
   */
  bronRegel: string;
  /**
   * De sleutel in `intake-reference.ts`, als deze stof een interventiepad
   * heeft. Null = wel te meten in je bord, geen supplement-route bij ons.
   */
  nutrientId: NutrientId | null;
  /**
   * De dagreferentie waar één portie tegen gewogen wordt, in `eenheid`.
   *
   * **Waarvoor dit getal wél is.** Het weegt één portie: is dit een rijke bron
   * van deze stof, een bron, of een spoortje? Die weging volgt de
   * etiketteringsconventie uit EU-verordening 1169/2011 (bijlage XIII): vanaf
   * 15% van de referentie-inname mag iets "bron van" heten, vanaf 30% "rijk
   * aan". Dat is een gepubliceerde grens, geen eigen vuistregel — zie
   * `bijdrageNiveau` in `micronutrient-index.ts`.
   *
   * **Waarvoor het niet is.** Niet om porties bij elkaar op te tellen tot een
   * dagpercentage. De gehaltes in `food-items.ts` staan op `verified: false`,
   * de porties zijn standaardporties en niet die van jou, en bij magnesium,
   * zink en ijzer bepaalt fytaat mede hoeveel je er werkelijk uit haalt. Een
   * som van drie indicatieve getallen tegen een norm leggen is een
   * inname-claim; die dragen we niet. Wat het dagoverzicht wél doet is bronnen
   * tellen — zie `nutrition-dagdekking.ts`.
   */
  referentiePerDag: number;
  /** Hoe de referentie er in de UI uitziet: "375 mg per dag". */
  referentieLabel: string;
  /** Waar de referentie vandaan komt. Altijd zichtbaar bij weergave. */
  referentieBron: string;
}

/**
 * Volgorde: mineralen, vitamines, dan de drie overige. Binnen een groep op hoe
 * vaak de stof in een Nederlands eetpatroon knelt — niet alfabetisch, want dan
 * staat calcium boven magnesium terwijl magnesium vaker het gesprek is.
 */
export const MICRONUTRIENTEN: readonly Micronutrient[] = [
  {
    id: "magnesium",
    label: "Magnesium",
    groep: "mineraal",
    eenheid: "mg",
    rolRegel: "Betrokken bij spier- en zenuwfunctie en bij de energiestofwisseling.",
    bronRegel: "Noten, zaden, peulvruchten, volkoren en donkergroene bladgroente.",
    nutrientId: "magnesium",
    referentiePerDag: 375,
    referentieLabel: "375 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "kalium",
    label: "Kalium",
    groep: "mineraal",
    eenheid: "mg",
    rolRegel: "Speelt een rol bij de vochtbalans en bij de bloeddruk.",
    bronRegel: "Groente, aardappelen, peulvruchten, banaan en zuivel.",
    nutrientId: null,
    referentiePerDag: 2000,
    referentieLabel: "2.000 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "calcium",
    label: "Calcium",
    groep: "mineraal",
    eenheid: "mg",
    rolRegel: "Bouwstof voor botten en gebit.",
    bronRegel: "Zuivel, groene bladgroente, noten en verrijkte plantendrank.",
    nutrientId: null,
    referentiePerDag: 800,
    referentieLabel: "800 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "ijzer",
    label: "IJzer",
    groep: "mineraal",
    eenheid: "mg",
    rolRegel: "Nodig voor het zuurstoftransport in het bloed.",
    bronRegel: "Vlees, peulvruchten, volkoren en donkergroene bladgroente.",
    nutrientId: null,
    referentiePerDag: 14,
    referentieLabel: "14 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "zink",
    label: "Zink",
    groep: "mineraal",
    eenheid: "mg",
    rolRegel: "Betrokken bij afweer, celdeling en eiwitsynthese.",
    bronRegel: "Vlees, schaaldieren, kaas, peulvruchten en volkoren.",
    nutrientId: "zinc",
    referentiePerDag: 10,
    referentieLabel: "10 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "jodium",
    label: "Jodium",
    groep: "mineraal",
    eenheid: "µg",
    rolRegel: "Bouwstof voor schildklierhormoon.",
    bronRegel: "Bakkerszout in brood, vis, zuivel en ei.",
    nutrientId: null,
    referentiePerDag: 150,
    referentieLabel: "150 µg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "selenium",
    label: "Selenium",
    groep: "mineraal",
    eenheid: "µg",
    rolRegel: "Onderdeel van enzymen die cellen tegen oxidatie beschermen.",
    bronRegel: "Vis, ei, vlees en paranoten.",
    nutrientId: null,
    referentiePerDag: 55,
    referentieLabel: "55 µg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vitamine_a",
    label: "Vitamine A",
    groep: "vitamine",
    eenheid: "µg",
    rolRegel: "Speelt een rol bij zicht, huid en afweer.",
    bronRegel: "Wortel, zoete aardappel, donkergroene bladgroente, lever en zuivel.",
    nutrientId: null,
    referentiePerDag: 800,
    referentieLabel: "800 µg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vitamine_c",
    label: "Vitamine C",
    groep: "vitamine",
    eenheid: "mg",
    rolRegel: "Betrokken bij bindweefsel, afweer en de opname van ijzer uit planten.",
    bronRegel: "Paprika, kool, citrus, bessen en aardappelen.",
    nutrientId: null,
    referentiePerDag: 80,
    referentieLabel: "80 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vitamine_d",
    label: "Vitamine D",
    groep: "vitamine",
    eenheid: "µg",
    rolRegel: "Nodig voor de opname van calcium en voor botten en spieren.",
    bronRegel: "Vette vis, ei en margarine — en van oktober tot maart nauwelijks uit de zon.",
    nutrientId: "vitamin_d",
    referentiePerDag: 5,
    referentieLabel: "5 µg per dag (etiket-referentie)",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011); de Gezondheidsraad houdt 10 µg aan",
  },
  {
    id: "vitamine_e",
    label: "Vitamine E",
    groep: "vitamine",
    eenheid: "mg",
    rolRegel: "Beschermt vetten in celmembranen tegen oxidatie.",
    bronRegel: "Plantaardige olie, noten, zaden en avocado.",
    nutrientId: null,
    referentiePerDag: 12,
    referentieLabel: "12 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vitamine_k",
    label: "Vitamine K",
    groep: "vitamine",
    eenheid: "µg",
    rolRegel: "Nodig voor de bloedstolling en betrokken bij botaanmaak.",
    bronRegel: "Donkergroene bladgroente, kool, broccoli en plantaardige olie.",
    nutrientId: null,
    referentiePerDag: 75,
    referentieLabel: "75 µg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "foliumzuur",
    label: "Foliumzuur",
    groep: "vitamine",
    eenheid: "µg",
    rolRegel: "Betrokken bij celdeling en bloedaanmaak.",
    bronRegel: "Bladgroente, peulvruchten, kool en volkoren.",
    nutrientId: null,
    referentiePerDag: 200,
    referentieLabel: "200 µg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vitamine_b6",
    label: "Vitamine B6",
    groep: "vitamine",
    eenheid: "mg",
    rolRegel: "Betrokken bij de eiwitstofwisseling en bij het zenuwstelsel.",
    bronRegel: "Vlees, vis, aardappelen, peulvruchten en banaan.",
    nutrientId: null,
    referentiePerDag: 1.4,
    referentieLabel: "1,4 mg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vitamine_b12",
    label: "Vitamine B12",
    groep: "vitamine",
    eenheid: "µg",
    rolRegel: "Nodig voor bloedaanmaak en het zenuwstelsel; zit alleen in dierlijke producten.",
    bronRegel: "Vlees, vis, ei, zuivel en verrijkte plantendrank.",
    nutrientId: null,
    referentiePerDag: 2.5,
    referentieLabel: "2,5 µg per dag",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011, bijlage XIII)",
  },
  {
    id: "vezels",
    label: "Vezels",
    groep: "overig",
    eenheid: "g",
    rolRegel: "Voeden de darmflora en dragen bij aan een normale stoelgang.",
    bronRegel: "Volkoren, peulvruchten, groente, fruit, noten en zaden.",
    nutrientId: null,
    referentiePerDag: 30,
    referentieLabel: "30 g per dag",
    referentieBron: "Gezondheidsraad, richtlijnen goede voeding",
  },
  {
    id: "omega3",
    label: "Omega-3 (EPA/DHA)",
    groep: "overig",
    eenheid: "mg",
    rolRegel: "Vetzuren die het lichaam nauwelijks zelf maakt; ze komen uit vis.",
    bronRegel: "Vette vis. Plantaardige ALA (lijnzaad, walnoot) wordt maar deels omgezet.",
    nutrientId: "omega3",
    referentiePerDag: 250,
    referentieLabel: "250 mg EPA/DHA per dag",
    referentieBron: "EFSA, adequate inname voor volwassenen",
  },
  {
    id: "eiwit",
    label: "Eiwit",
    groep: "overig",
    eenheid: "g",
    rolRegel: "Bouwstof voor spieren en weefsel; de behoefte stijgt met de leeftijd.",
    bronRegel: "Vlees, vis, ei, zuivel, peulvruchten, noten en volkoren.",
    nutrientId: "protein",
    referentiePerDag: 50,
    referentieLabel: "50 g per dag (etiket-referentie)",
    referentieBron: "EU-referentie-inname (Vo. 1169/2011); je eigen behoefte hangt van je gewicht af",
  },
] as const;

const BY_ID = new Map<MicronutrientId, Micronutrient>(
  MICRONUTRIENTEN.map((stof) => [stof.id, stof]),
);

export function getMicronutrient(id: MicronutrientId): Micronutrient | undefined {
  return BY_ID.get(id);
}

export function isMicronutrientId(value: string): value is MicronutrientId {
  return BY_ID.has(value as MicronutrientId);
}

/** Label zonder lookup-ceremonie; valt terug op de sleutel zelf. */
export function micronutrientLabel(id: MicronutrientId): string {
  return BY_ID.get(id)?.label ?? id;
}

export const MICRONUTRIENT_GROEP_LABEL: Record<MicronutrientGroep, string> = {
  mineraal: "Mineralen",
  vitamine: "Vitamines",
  overig: "Vezels, vetzuren & eiwit",
};

/**
 * Een hoeveelheid met eenheid, afgerond op wat de bron kan dragen.
 *
 * Onder de 10 één decimaal, daarboven heel — meer cijfers claimen precisie die
 * een indicatieve tabel niet heeft, en minder maakt kleine bijdragen
 * ononderscheidbaar van nul.
 */
export function formatMicronutrientHoeveelheid(
  waarde: number,
  eenheid: MicronutrientEenheid,
): string {
  const afgerond =
    waarde >= 10 ? Math.round(waarde) : Math.round(waarde * 10) / 10;
  return `${String(afgerond).replace(".", ",")} ${eenheid}`;
}
