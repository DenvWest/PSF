/**
 * PesticidenEetwijzer — gemiddeld aantal verschillende pesticide-residuen per
 * product, uit de NVWA-steekproeven 2023–2025, samengesteld door Pesticide
 * Action Network Netherlands.
 *
 * ## Waarom deze tabel hier staat, en wat hij NIET is
 *
 * Dit is **productkennis**, geen persoonsmeting. Het getal zegt iets over wat
 * er gemiddeld op een appel uit het Nederlandse handelskanaal zit — niet over
 * wat iemand binnenkrijgt. Daarom:
 *
 * - Deze data telt **niet mee in computeNutritionScore** en levert **geen
 *   band** op. Een kwaliteitsoordeel over een product is geen frequentie
 *   tegenover een richtlijn, en de score-keten voedt de supplement-poort:
 *   een pesticide-signaal heeft daar geen route achter (er bestaat geen
 *   supplement dat dit oplost). Zie nutrition-verhouding.ts voor de as die
 *   wél scoort.
 * - Er hoort **geen gezondheidsclaim** bij. Alle geteste producten zitten
 *   onder de wettelijke residulimiet (MRL); PAN rangschikt op het *aantal
 *   verschillende* residuen, niet op overschrijding en niet op toxiciteit.
 *   Het cocktaileffect van meerdere residuen samen is wetenschappelijk nog
 *   open — dat is precies waarom PAN deze lijst maakt, en precies waarom wij
 *   er geen conclusie aan hangen.
 * - De boodschap onder de tabel is PAN's eigen slotzin, en die is geen
 *   waarschuwing maar een aanmoediging: eet groente en fruit. Deze lijst
 *   helpt kiezen *welke*, niet of.
 *
 * ## Methode (bron: pan-netherlands.org/eetwijzer/methode)
 *
 * - Bron: alle steekproefsgewijze NVWA-testgegevens van verse groente en fruit
 *   uit de drie meest recent gepubliceerde jaren (2023–2025).
 * - Monsters uit het hele handelskanaal: supermarkten, horecagroothandels,
 *   distributiecentra, groentespeciaalzaken.
 * - Alleen soorten met meer dan 10 uitgevoerde tests; dezelfde ondergrens die
 *   de NVWA zelf hanteert bij haar inspectierapportage.
 * - Alleen residuen vanaf 0,01 mg/kg (de gangbare detectielimiet).
 * - Gangbaar en biologisch apart beoordeeld; deze ranglijst is **uitsluitend
 *   gangbare** teelt.
 * - Omvang: 3.333 tests, 17 fruitsoorten, 27 groentesoorten en aardappelen.
 *   Gemiddeld 74 tests per soort.
 * - Tests zijn gedaan op het hele product, inclusief schil.
 * - Mandarijnen, sinaasappels, grapefruit en citroenen zijn samengevoegd als
 *   "citrusvruchten" omdat hun waarden vergelijkbaar zijn.
 *
 * Bekende beperking die PAN zelf noemt: het aantal residuen op een individueel
 * product uit de supermarkt kan sterk afwijken van dit gemiddelde, door
 * seizoen, teler en land van herkomst.
 *
 * ## Waarom niet per 100 g (in tegenstelling tot NEVO)
 *
 * NEVO publiceert gehalten per 100 g — een concentratie. PAN telt het aantal
 * *verschillende* stoffen op een representatief productmonster. Dat is geen
 * dosis, geen gehalte, en niet om te rekenen naar 100 g: de eenheid ís het
 * product. Die twee op dezelfde noemer zetten zou een vergelijkbare meting
 * suggereren die er niet is.
 */

export type EetwijzerCategorie = "fruit" | "groente" | "overig";

export interface EetwijzerItem {
  /** Productnaam zoals PAN hem noemt. */
  naam: string;
  /** Gemiddeld aantal verschillende pesticide-residuen. */
  residuen: number;
  categorie: EetwijzerCategorie;
}

export const EETWIJZER_BRON = {
  naam: "PesticidenEetwijzer",
  organisatie: "Pesticide Action Network Netherlands",
  url: "https://pan-netherlands.org/eetwijzer/testresultaten/",
  methodeUrl: "https://pan-netherlands.org/eetwijzer/methode/",
  onderzoeksjaren: "2023–2025",
  dataBron: "NVWA-steekproeven",
  aantalTests: 3333,
  gemiddeldTestsPerSoort: 74,
  detectielimiet: "0,01 mg/kg",
  teelt: "gangbaar",
} as const;

/**
 * Ranglijst fruit — hoogste aantal residuen eerst, zoals PAN hem publiceert.
 * Citrusvruchten is een samengevoegde categorie (zie methode-comment).
 */
export const EETWIJZER_FRUIT: EetwijzerItem[] = [
  { naam: "Citrusvruchten", residuen: 4.4, categorie: "fruit" },
  { naam: "Aardbeien", residuen: 4.2, categorie: "fruit" },
  { naam: "Kersen", residuen: 4.0, categorie: "fruit" },
  { naam: "Peren", residuen: 3.8, categorie: "fruit" },
  { naam: "Druiven", residuen: 3.8, categorie: "fruit" },
  { naam: "Perziken", residuen: 3.2, categorie: "fruit" },
  { naam: "Appels", residuen: 3.1, categorie: "fruit" },
  { naam: "Frambozen", residuen: 3.1, categorie: "fruit" },
  { naam: "Nectarines", residuen: 2.7, categorie: "fruit" },
  { naam: "Bananen", residuen: 2.6, categorie: "fruit" },
  { naam: "Blauwe bessen", residuen: 2.5, categorie: "fruit" },
  { naam: "Pruimen", residuen: 1.6, categorie: "fruit" },
  { naam: "Meloenen", residuen: 1.6, categorie: "fruit" },
  { naam: "Mango's", residuen: 1.3, categorie: "fruit" },
  { naam: "Ananassen", residuen: 0.9, categorie: "fruit" },
  { naam: "Watermeloenen", residuen: 0.9, categorie: "fruit" },
  { naam: "Kiwi's", residuen: 0.5, categorie: "fruit" },
];

/** Gemiddelde over alle fruitsoorten, zoals PAN hem in de totaalregel toont. */
export const EETWIJZER_FRUIT_GEMIDDELDE = 2.6;

export const EETWIJZER_GROENTE: EetwijzerItem[] = [
  { naam: "Spinazie", residuen: 2.3, categorie: "groente" },
  { naam: "Paprika's", residuen: 2.3, categorie: "groente" },
  { naam: "Andijvie", residuen: 2.2, categorie: "groente" },
  { naam: "Paksoi", residuen: 2.2, categorie: "groente" },
  { naam: "Knolselderij", residuen: 2.1, categorie: "groente" },
  { naam: "Tomaten", residuen: 2.0, categorie: "groente" },
  { naam: "Bleekselderij", residuen: 1.9, categorie: "groente" },
  { naam: "Spruitjes", residuen: 1.9, categorie: "groente" },
  { naam: "Uien", residuen: 1.6, categorie: "groente" },
  { naam: "Sperziebonen", residuen: 1.5, categorie: "groente" },
  { naam: "Knolvenkel", residuen: 1.5, categorie: "groente" },
  { naam: "Komkommers", residuen: 1.4, categorie: "groente" },
  { naam: "Broccoli", residuen: 1.3, categorie: "groente" },
  { naam: "Prei", residuen: 1.3, categorie: "groente" },
  { naam: "IJsbergsla", residuen: 1.2, categorie: "groente" },
  { naam: "Courgettes", residuen: 1.2, categorie: "groente" },
  { naam: "Aubergines", residuen: 1.1, categorie: "groente" },
  { naam: "Chinese kool", residuen: 1.0, categorie: "groente" },
  { naam: "Spitskool", residuen: 1.0, categorie: "groente" },
  { naam: "Wortels", residuen: 1.0, categorie: "groente" },
  { naam: "Avocado's", residuen: 0.7, categorie: "groente" },
  { naam: "Rode kool", residuen: 0.7, categorie: "groente" },
  { naam: "Bloemkolen", residuen: 0.4, categorie: "groente" },
  { naam: "Witlof", residuen: 0.4, categorie: "groente" },
  { naam: "Pompoenen", residuen: 0.2, categorie: "groente" },
  { naam: "Rode bieten", residuen: 0.1, categorie: "groente" },
  { naam: "Asperges", residuen: 0.0, categorie: "groente" },
];

export const EETWIJZER_GROENTE_GEMIDDELDE = 1.3;

export const EETWIJZER_OVERIG: EetwijzerItem[] = [
  { naam: "Aardappelen", residuen: 0.6, categorie: "overig" },
];

/**
 * Kleurzones voor de ranglijst.
 *
 * PAN gebruikt een doorlopend verloop van rood naar groen over de hele lijst.
 * Wij zetten er drie zones in, met de grenzen op ronde getallen die voor beide
 * lijsten werken: fruit loopt 0,5–4,4 en groente 0,0–2,3.
 *
 * Deze zones zijn **presentatie**, geen oordeel over veiligheid. Ze zeggen
 * "hier zitten meer verschillende residuen op dan daar", niet "dit is
 * ongezond" — alle waarden liggen onder de wettelijke limiet.
 */
export type EetwijzerZone = "veel" | "midden" | "weinig";

const ZONE_VEEL_MIN = 2.0;
const ZONE_MIDDEN_MIN = 1.0;

export function eetwijzerZone(residuen: number): EetwijzerZone {
  if (residuen >= ZONE_VEEL_MIN) return "veel";
  if (residuen >= ZONE_MIDDEN_MIN) return "midden";
  return "weinig";
}

export const EETWIJZER_ZONE_KLEUR: Record<EetwijzerZone, string> = {
  veel: "#C24B4B",
  midden: "#D4824A",
  weinig: "#3D8B5A",
};

export const EETWIJZER_ZONE_LABEL: Record<EetwijzerZone, string> = {
  veel: "relatief veel verschillende residuen",
  midden: "gemiddeld aantal residuen",
  weinig: "relatief weinig residuen",
};
