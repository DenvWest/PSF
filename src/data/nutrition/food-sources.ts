/**
 * Voedingsbronnen per nutriënt — "wat lever ik met één portie".
 * Productkennis, geen persoonsdata.
 *
 * Alle getallen zijn vandaag INDICATIEF (orde van grootte per portie) — te
 * vervangen door NEVO-waarden vóór livegang, net als portion-dictionary.ts.
 * Die stand staat per rij in `source` + `verified` in plaats van alleen in
 * deze comment: geen enkele rij is vandaag geverifieerd, en dat is afleesbaar
 * in plaats van te onthouden.
 *
 * ## Citeren mag, herrekenen is van ons (v3)
 *
 * NEVO is herbruikbaar: data.overheid.nl noemt CC BY 4.0, en RIVM staat
 * gebruik toe "only unchanged and stating the source and version number", met
 * de voorgeschreven referentie in `NEVO_CITATION`. Die twee lopen niet
 * helemaal gelijk — CC BY staat afgeleide werken toe, "unchanged" niet — en
 * daarom houden we de strengste lezing aan.
 *
 * Dat dwingt een scheiding af die deze tabel eerder niet had, en die ook los
 * van de licentie beter is:
 *
 * - `nutrientValue` — het gehalte per 100 g zoals de bron het publiceert.
 *   Ongewijzigd, met code en editie. Dit is het geciteerde deel.
 * - `amount` — datzelfde gehalte omgerekend naar onze portie. Onze bewerking,
 *   via `amountForPortion()`, en dus nooit te presenteren als brondcijfer.
 *
 * Zonder die scheiding is aan `amount: 16` bij "125 g makreel" niet af te
 * lezen welk deel uit NEVO komt en welk deel uit een portie-aanname — en een
 * afgeleid getal is niet tegen een brondbestand te leggen, waardoor
 * `verified` betekenisloos zou zijn.
 *
 * Wat NIET uit NEVO komt en dus een eigen verificatiespoor houdt:
 * `bioavailability`, `variability`, `preparationNote` en `qualityNote`. Dat
 * zijn literatuuroordelen, en juist die dragen bij magnesium en zink de
 * zwaarste conclusie (fytaat maakt mg uit brood iets anders dan mg uit vlees).
 *
 * VERIFY: Gezondheidsraad ADH before referenceLabel/threshold updates
 *         (350 mg Mg, 9–11 mg Zn, 10 µg vit D).
 *
 * Harde leesregel voor elke UI die dit toont: deze waarden tellen NIET op tot
 * een dagtotaal. De band per nutriënt komt uit frequentievragen
 * (estimateNutritionIntake), niet uit grammen. De lijst staat er om te kunnen
 * kíezen tussen bronnen — niet om inname te berekenen.
 *
 * Deze tabel staat naast portion-dictionary.ts en vervangt hem niet: daar staat
 * `PortionGroup → gram-equivalent`, hier `voedingsmiddel → (nutriënt,
 * hoeveelheid per portie, portiegroep, seizoen)`.
 *
 * ## Waarom één getal niet genoeg is (v2)
 *
 * Drie dingen laten de werkelijke inname afwijken van een tabelwaarde, en ze
 * werken verschillend — vandaar aparte velden in plaats van één opmerking:
 *
 * 1. **Variatie in het product** (`variability`). Vitamine D en EPA/DHA in vis
 *    verschillen fors tussen wild en gekweekt; magnesium en zink in planten
 *    volgen bodem en ras; eiwit in vlees en zuivel is juist stabiel.
 * 2. **Opname** (`bioavailability`). Bij magnesium en zink weegt dit zwaarder
 *    dan de variatie: fytaat in volkoren, peulvruchten, noten en zaden bindt
 *    beide mineralen, en bij zink is de fytaat:zink-verhouding bepalend. En
 *    plantaardig omega-3 (ALA) wordt maar voor enkele procenten omgezet naar
 *    EPA/DHA — daarom staan die bronnen op `amount: null`.
 * 3. **Bereiding** (`preparationNote`). Koken laat magnesium uitlogen; zuurdesem
 *    breekt fytaat af. Waar de bereiding het gedrag verandert, staat het erbij.
 *
 * Wat v2 dus toevoegt is onderbouwing, geen precisie. Het meetinstrument blijft
 * een frequentievragenlijst; preciezere gehaltes maken die schatting niet beter.
 * Zie docs/plan/SPEC_VOEDINGSBRONNEN_TABEL_V2.md voor bronstrategie en scope.
 */

import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { PortionGroup } from "@/data/nutrition/portion-dictionary";

/** Waar een gehalte vandaan komt. Eén bron per waarde — nooit middelen. */
export type SourceOrigin = "nevo" | "usda" | "voedingscentrum" | "literatuur";

export interface SourceRef {
  origin: SourceOrigin;
  /**
   * NEVO-code, USDA fdcId of paginaverwijzing. `null` = nog niet tegen het
   * echte bestand gelegd; die rij is dan per definitie `verified: false`.
   */
  ref: string | null;
  /** Editie/jaar van de dataset. Null zolang `ref` null is. */
  edition: string | null;
}

/**
 * Een gehalte zoals de brondataset het publiceert — ongewijzigd overgenomen.
 *
 * ## Waarom dit apart staat van `amount`
 *
 * NEVO's gebruiksvoorwaarden staan hergebruik toe "only unchanged and stating
 * the source and version number". Een waarde per 100 g die wij
 * vermenigvuldigen met een zelfgekozen portiegrootte is per definitie
 * gewijzigd — die mag je niet als NEVO-cijfer presenteren.
 *
 * Vandaar de splitsing: `NutrientValue` is het geciteerde deel (ongewijzigd,
 * met code en versie), `FoodSource.amount` is onze eigen portieberekening
 * daarbovenop. Zonder die scheiding is aan `amount: 16` niet af te lezen welk
 * deel uit de bron komt en welk deel uit een portie-aanname — en dat is niet
 * alleen een licentiekwestie maar ook een verificatiekwestie: je kunt een
 * afgeleid getal niet tegen een brondbestand leggen.
 *
 * Verplichte bronvermelding bij elke NEVO-waarde, letterlijk zoals RIVM hem
 * voorschrijft: zie `NEVO_CITATION`.
 */
export interface NutrientValue {
  /** Het gehalte zoals de bron het geeft, per `per`. Nooit herrekend. */
  value: number;
  /** Eenheid van `value`: "g" voor eiwit, "mg" voor mineralen, "µg" voor vitamine D. */
  unit: "g" | "mg" | "µg";
  /**
   * Waar `value` bij hoort. NEVO publiceert per 100 g eetbaar gedeelte; dat is
   * de enige waarde die we ongewijzigd citeren.
   */
  per: "100g";
  /** De brondataset. Bij NEVO: `origin: "nevo"` met de NEVO-code als `ref`. */
  source: SourceRef;
  /** De naam zoals de brondataset het voedingsmiddel noemt — niet onze `labelNl`. */
  sourceNameNl?: string;
  /**
   * Waargenomen spreiding uit de bron, per 100 g in dezelfde `unit` als `value`.
   *
   * Alleen USDA Foundation Foods draagt dit: per nutriënt de `min`, `max`,
   * `median` en het aantal monsters van de werkelijke labanalyses. Waar dit
   * gevuld is, wint het van de gebronde klassenband uit ONDERZOEK §1.7 — de
   * waargenomen spreiding van echte monsters slaat elke vuistregel. Ontbreekt
   * het (SR Legacy, één monster, of de WebSearch-route die de gestructureerde
   * FDC-velden niet meelevert), dan valt de rij terug op die klassenband.
   *
   * `samples` is USDA `dataPoints`; 0 of 1 betekent: geen spreiding beschikbaar,
   * en dan horen `min`/`max` gelijk aan `value` te zijn of weggelaten. Vorm
   * vastgelegd in ONDERZOEK_SPREIDING_EN_USDA_2026-09.md §2.3.
   */
  observed?: {
    min: number;
    max: number;
    median?: number;
    samples: number;
  };
}

/**
 * De bronvermelding die RIVM voorschrijft voor elk gebruik van NEVO-gegevens.
 * Letterlijk overnemen; de versie hoort erbij en verandert per editie.
 *
 * Bron: https://www.rivm.nl/en/dutch-food-composition-database/access-nevo-data/nevo-online/copyright-and-disclaimer
 */
export const NEVO_CITATION = "NEVO-online versie 2025/9.0, RIVM, Bilthoven";

/**
 * USDA FoodData Central is public domain — geen licentie-akkoord, geen
 * bronvermeldingsplicht in juridische zin; attributie blijft netjes. Deze
 * regel hoort bij elke `origin: "usda"`-waarde.
 *
 * De sandbox van deze omgeving blokkeert de FDC-API (403 op CONNECT), dus de
 * import van september 2026 liep via WebSearch: dat levert de per-100 g-waarde
 * en de fdcId, maar niet de gestructureerde `min`/`max`/`median`/`dataPoints`.
 * USDA-rijen uit die ronde dragen daarom geen `observed` en vallen terug op de
 * klassenband uit ONDERZOEK §1.7. Een latere run van `scripts/usda-extract.mjs`
 * met FDC-API-toegang vult `observed` alsnog, en dan wint dat van de band.
 */
export const USDA_CITATION =
  "USDA FoodData Central, U.S. Department of Agriculture (public domain)";

/**
 * Bouw een USDA-bronreferentie: de fdcId als `ref`, het FDC-datatype als
 * `edition`. Foundation Foods gaat vóór SR Legacy (ONDERZOEK §2.4), maar beide
 * zijn bruikbaar; alleen het datatype legt vast welk record geciteerd is.
 */
function usda(fdcId: string, dataType: "Foundation" | "SR Legacy"): SourceRef {
  return { origin: "usda", ref: fdcId, edition: dataType };
}

/**
 * Hoe sterk het gehalte rond de tabelwaarde spreidt.
 * - `low` — structureel bestanddeel, spreiding verwaarloosbaar (eiwit in vlees).
 * - `moderate` — bodem, ras en groeiomstandigheden werken door (mineralen in planten).
 * - `high` — wild/gekweekt of seizoen scheelt een veelvoud (vitamine D en EPA/DHA in vis).
 */
export type Variability = "low" | "moderate" | "high";

/**
 * Of er van dit gehalte meer of minder aankomt dan het getal suggereert.
 * `reduced` is bij magnesium en zink eerder regel dan uitzondering: fytaat
 * bindt beide, en dat maakt 1,4 mg zink uit brood iets anders dan 1,4 mg uit
 * vlees.
 */
export type Bioavailability = "normal" | "reduced" | "enhanced";

/**
 * Omega-3 is geen één ding. EPA en DHA komen uit vis en algen; ALA uit noten
 * en zaden, en daarvan zet het lichaam maar enkele procenten om. Ze staan
 * daarom nooit in dezelfde eenheid naast elkaar — een ALA-bron houdt
 * `amount: null` zolang er geen aparte ALA-eenheid is.
 */
export type Omega3Kind = "epa_dha" | "ala";

/**
 * Elke lijst staat aflopend op `amount`, bronnen zonder waarde (`null`) achteraan.
 * Een UI die er drie toont, toont daarmee ook de drie sterkste — en een balkje
 * dat op de sterkste normaliseert kan nooit boven 100% uitkomen.
 */
export interface FoodSource {
  /** Stabiel, kebab-case. Uniek binnen één nutriënt; sleutel in events. */
  key: string;
  labelNl: string;
  /** Portie waar `amount` bij hoort, zoals getoond: "25 g (handvol)". */
  portionNl: string;
  /**
   * Per portie, in de eenheid van het nutriënt; null = niet te geven.
   *
   * **Dit is onze eigen afgeleide waarde, geen brondcijfer.** Het is de
   * brondwaarde per 100 g (`nutrientValue`) omgerekend naar de portie in
   * `portionNl`. Presenteer hem daarom nooit als NEVO-getal: de bron
   * publiceert per 100 g, en de portiegrootte is onze keuze.
   *
   * Zolang `nutrientValue` ontbreekt is dit een indicatieve literatuurwaarde
   * uit N0 — dan staat `verified` op false en is er niets om tegen te leggen.
   */
  amount: number | null;
  /**
   * Het gehalte zoals de brondataset het publiceert, ongewijzigd. Ontbreekt
   * zolang de rij niet tegen NEVO (of een andere dataset) is gelegd.
   *
   * Dit veld is de bron van waarheid; `amount` is ervan afgeleid. Een rij mag
   * alleen `verified: true` dragen als dit veld gevuld is — zie
   * `isNevoBacked()`.
   */
  nutrientValue?: NutrientValue;
  portionGroup: PortionGroup;
  /** Nederlands seizoen als [startmaand, eindmaand], 1-based en inclusief. */
  seasonMonths?: readonly [number, number];
  noteNl?: string;
  /** Naad naar partners. Vandaag overal undefined. */
  productKey?: string;

  // ── v2: waar het getal vandaan komt en wat het waard is ──────────────────

  /** Welke bron dit gehalte leverde. */
  source: SourceRef;
  /**
   * Of het gehalte daadwerkelijk naast de brondataset is gelegd.
   *
   * Slaat **alleen op `nutrientValue`**, niet op de rest van de rij:
   * `bioavailability`, `variability` en de bijbehorende toelichtingen zijn
   * literatuuroordelen die niet in NEVO staan en dus een eigen
   * verificatiespoor houden. Een rij met `verified: true` heeft een
   * nageslagen gehalte, geen nageslagen fytaat-oordeel.
   *
   * Vandaag overal `false`: de getallen zijn indicatief sinds N0. Het veld
   * bestaat om dat verschil zichtbaar te houden, niet om het te vergeten.
   */
  verified: boolean;
  variability: Variability;
  /** Waarom die spreiding. Verplicht zodra `variability` niet `low` is. */
  variabilityWhy?: string;
  bioavailability: Bioavailability;
  /** Waarom de opname afwijkt. Verplicht zodra `bioavailability` niet `normal` is. */
  bioavailabilityWhy?: string;
  /** Alleen op omega3-bronnen — daar verplicht. */
  omega3Kind?: Omega3Kind;
  /**
   * Eiwitkwaliteit. Alleen op plantaardige eiwitbronnen: die zijn niet slechter,
   * maar hun aminozuurprofiel is eenzijdiger, en combineren lost dat op — geen
   * DIAAS-getal, want die precisie kunnen we hier niet dragen.
   */
  qualityNote?: string;
  /** Wat bereiding met het gehalte doet, waar dat het gedrag verandert. */
  preparationNote?: string;
}

/** Nog niet tegen een dataset gelegd — de eerlijke startstand van elke rij. */
const UNVERIFIED: SourceRef = { origin: "literatuur", ref: null, edition: null };

/** Waarom fytaat bij magnesium remt — één formulering, overal dezelfde. */
const FYTAAT =
  "Fytaat in noten, zaden, peulvruchten en volkoren bindt magnesium — de mg zijn er, je haalt er minder uit.";

/** Waarom fytaat bij zink remt: hier is de verhouding bepalend, niet de hoeveelheid. */
const FYT =
  "Fytaat bindt zink in de darm; bij een hoge fytaat:zink-verhouding komt er beduidend minder van aan dan het getal suggereert.";

/**
 * Eiwit — g per portie. De enige stof hier waar naast de hoeveelheid ook de
 * kwaliteit telt: dierlijke bronnen dekken alle essentiële aminozuren, veel
 * plantaardige zijn eenzijdiger. Dat lost combineren op (peulvrucht + graan),
 * en dat staat in `qualityNote` — geen DIAAS-getal, want die precisie dragen
 * we hier niet. Variatie is bij vlees, vis, ei en zuivel laag: eiwit is
 * structureel weefsel, geen opnameafhankelijk sporenelement.
 */
const PROTEIN_SOURCES: readonly FoodSource[] = [
  {
    key: "tonijn-blik",
    labelNl: "Tonijn uit blik, op water",
    portionNl: "100 g uitgelekt",
    amount: 24.9,
    portionGroup: "other",
    source: { origin: "nevo", ref: "1590", edition: "2025/9.0" },
    nutrientValue: {
      value: 24.9,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "1590", edition: "2025/9.0" },
      sourceNameNl: "Tonijn in water blik",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    noteNl:
      "Veel eiwit, weinig EPA/DHA — voor omega-3 is dit niet je vis.",
  },
  {
    key: "kipfilet",
    labelNl: "Kipfilet",
    portionNl: "100 g",
    amount: 23.3,
    portionGroup: "leanMeat",
    source: { origin: "nevo", ref: "1634", edition: "2025/9.0" },
    nutrientValue: {
      value: 23.3,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "1634", edition: "2025/9.0" },
      sourceNameNl: "Kipfilet rauw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "rundvlees-mager",
    labelNl: "Rundvlees, mager",
    portionNl: "100 g",
    amount: 22.6,
    portionGroup: "leanMeat",
    source: { origin: "nevo", ref: "1663", edition: "2025/9.0" },
    nutrientValue: {
      value: 22.6,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "1663", edition: "2025/9.0" },
      sourceNameNl: "Rundvlees <5 g vet rauw gem",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "varkenshaas",
    labelNl: "Varkenshaas",
    portionNl: "100 g",
    amount: 22.4,
    portionGroup: "leanMeat",
    source: { origin: "nevo", ref: "1422", edition: "2025/9.0" },
    nutrientValue: {
      value: 22.4,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "1422", edition: "2025/9.0" },
      sourceNameNl: "Varkenshaas rauw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "seitan",
    labelNl: "Seitan",
    portionNl: "100 g",
    amount: 19,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy:
      "Verschilt sterk per merk en bereiding.",
    bioavailability: "normal",
    qualityNote:
      "Tarwe-eiwit is arm aan lysine — combineer met peulvruchten voor een compleet profiel.",
  },
  {
    key: "belegen-kaas",
    labelNl: "Belegen kaas",
    portionNl: "50 g (2 sneden)",
    amount: 18,
    portionGroup: "dairy",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "tempe",
    labelNl: "Tempé",
    portionNl: "100 g",
    amount: 17.6,
    portionGroup: "other",
    source: { origin: "nevo", ref: "5573", edition: "2025/9.0" },
    nutrientValue: {
      value: 17.6,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "5573", edition: "2025/9.0" },
      sourceNameNl: "Tempeh onbereid",
    },
    verified: true,
    variability: "low",
    bioavailability: "enhanced",
    bioavailabilityWhy:
      "Gefermenteerd, waardoor het fytaat grotendeels is afgebroken — je haalt er meer uit dan uit onbewerkte soja.",
    qualityNote:
      "Soja-eiwit dekt als enige plantaardige bron alle essentiële aminozuren.",
  },
  {
    key: "kabeljauw",
    labelNl: "Kabeljauw",
    portionNl: "100 g",
    amount: 17.5,
    portionGroup: "other",
    source: { origin: "nevo", ref: "820", edition: "2025/9.0" },
    nutrientValue: {
      value: 17.5,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "820", edition: "2025/9.0" },
      sourceNameNl: "Kabeljauw rauw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "magere-kwark",
    labelNl: "Magere kwark",
    portionNl: "200 g",
    amount: 16.8,
    portionGroup: "dairy",
    source: { origin: "nevo", ref: "305", edition: "2025/9.0" },
    nutrientValue: {
      value: 8.4,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "305", edition: "2025/9.0" },
      sourceNameNl: "Kwark magere",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "skyr",
    labelNl: "Skyr",
    portionNl: "150 g",
    amount: 15.9,
    portionGroup: "dairy",
    source: { origin: "nevo", ref: "5295", edition: "2025/9.0" },
    nutrientValue: {
      value: 10.6,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "5295", edition: "2025/9.0" },
      sourceNameNl: "Skyr naturel magere",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "linzen",
    labelNl: "Linzen",
    portionNl: "150 g gekookt",
    amount: 13.2,
    portionGroup: "legumes",
    source: { origin: "nevo", ref: "970", edition: "2025/9.0" },
    nutrientValue: {
      value: 8.8,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "970", edition: "2025/9.0" },
      sourceNameNl: "Linzen groene en bruine gekookt",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Arm aan methionine — met graan (brood, rijst) erbij is het profiel compleet.",
  },
  {
    key: "tofu",
    labelNl: "Tofu",
    portionNl: "100 g",
    amount: 12.4,
    portionGroup: "other",
    source: { origin: "nevo", ref: "5519", edition: "2025/9.0" },
    nutrientValue: {
      value: 12.4,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "5519", edition: "2025/9.0" },
      sourceNameNl: "Tofu onbereid",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy:
      "Stevige tofu bevat fors meer eiwit dan siliken tofu.",
    bioavailability: "normal",
    qualityNote:
      "Soja dekt alle essentiële aminozuren — geen combinatie nodig.",
  },
  {
    key: "kidneybonen",
    labelNl: "Kidneybonen",
    portionNl: "150 g gekookt",
    amount: 12.4,
    portionGroup: "legumes",
    source: { origin: "nevo", ref: "5173", edition: "2025/9.0" },
    nutrientValue: {
      value: 8.3,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "5173", edition: "2025/9.0" },
      sourceNameNl: "Bonen kidney- rode gekookt",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Combineer met graan voor een compleet aminozuurprofiel.",
  },
  {
    key: "griekse-yoghurt",
    labelNl: "Griekse yoghurt",
    portionNl: "150 g",
    amount: 12.3,
    portionGroup: "dairy",
    source: { origin: "nevo", ref: "5271", edition: "2025/9.0" },
    nutrientValue: {
      value: 8.2,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "5271", edition: "2025/9.0" },
      sourceNameNl: "Yoghurt Griekse magere",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy:
      "Volle en magere varianten verschillen sterk in eiwitgehalte.",
    bioavailability: "normal",
  },
  {
    key: "eieren",
    labelNl: "Eieren",
    portionNl: "2 stuks",
    amount: 12.3,
    portionGroup: "egg",
    source: { origin: "nevo", ref: "84", edition: "2025/9.0" },
    nutrientValue: {
      value: 12.3,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "84", edition: "2025/9.0" },
      sourceNameNl: "Ei kippen- gekookt gem",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    noteNl:
      "NEVO geeft dit gehalte per 100 g; 2 stuks is hier als 100 g gerekend (aanname ~50 g per ei).",
  },
  {
    key: "kikkererwten",
    labelNl: "Kikkererwten",
    portionNl: "150 g gekookt",
    amount: 12,
    portionGroup: "legumes",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Combineer met graan voor een compleet aminozuurprofiel.",
  },
  {
    key: "huttenkase",
    labelNl: "Hüttenkäse",
    portionNl: "100 g",
    amount: 11.2,
    portionGroup: "dairy",
    source: { origin: "nevo", ref: "654", edition: "2025/9.0" },
    nutrientValue: {
      value: 11.2,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "654", edition: "2025/9.0" },
      sourceNameNl: "Kaas huttenkase",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "volkoren-pasta",
    labelNl: "Volkoren pasta",
    portionNl: "75 g droog",
    amount: 10.0,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "811", edition: "2025/9.0" },
    nutrientValue: {
      value: 13.3,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "811", edition: "2025/9.0" },
      sourceNameNl: "Pasta volkoren rauw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "erwten-diepvries",
    labelNl: "Doperwten, diepvries",
    portionNl: "150 g",
    amount: 9.0,
    portionGroup: "legumes",
    source: { origin: "nevo", ref: "953", edition: "2025/9.0" },
    nutrientValue: {
      value: 6.0,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "953", edition: "2025/9.0" },
      sourceNameNl: "Doperwten diepvries gekookt",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    noteNl:
      "Diepvries verliest hier niets — geoogst en direct ingevroren.",
  },
  {
    key: "sojadrink-verrijkt",
    labelNl: "Sojadrink, verrijkt",
    portionNl: "250 ml",
    amount: 8.5,
    portionGroup: "dairy",
    source: { origin: "nevo", ref: "3180", edition: "2025/9.0" },
    nutrientValue: {
      value: 3.4,
      unit: "g",
      per: "100g",
      source: { origin: "nevo", ref: "3180", edition: "2025/9.0" },
      sourceNameNl: "Drink soja- z suiker verrijkt m calcium en vitamines",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy:
      "Alleen verrijkte varianten; ongezoete sojadrink verschilt per merk.",
    bioavailability: "normal",
    qualityNote:
      "Van de plantaardige dranken de enige met een zuivelwaardig eiwitgehalte.",
  },
  {
    key: "havermout",
    labelNl: "Havermout",
    portionNl: "60 g droog",
    amount: 8,
    portionGroup: "wholegrain",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Losse graanportie telt op over de dag; alleen niet je hoofdbron.",
  },

  // ── USDA-import september 2026 (WebSearch-route; geen observed) ──
  {
    key: "pinda",
    labelNl: "Pinda's",
    portionNl: "25 g (handvol)",
    amount: 6.5,
    portionGroup: "nuts",
    source: usda("172430", "SR Legacy"),
    nutrientValue: {
      value: 25.8,
      unit: "g",
      per: "100g",
      source: usda("172430", "SR Legacy"),
      sourceNameNl: "Peanuts, all types, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Pinda-eiwit is relatief compleet voor een plantbron, maar arm aan methionine — combineer over de dag met granen.",
  },
  {
    key: "pistachenoten",
    labelNl: "Pistachenoten",
    portionNl: "25 g (handvol)",
    amount: 5,
    portionGroup: "nuts",
    source: usda("170184", "SR Legacy"),
    nutrientValue: {
      value: 20.16,
      unit: "g",
      per: "100g",
      source: usda("170184", "SR Legacy"),
      sourceNameNl: "Nuts, pistachio nuts, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Noteneiwit is onvolledig — vul over de dag aan met granen of peulvruchten voor alle essentiële aminozuren.",
  },
  {
    key: "sojabonen-gekookt",
    labelNl: "Sojabonen, gekookt",
    portionNl: "150 g gekookt",
    amount: 27.9,
    portionGroup: "legumes",
    source: usda("174271", "SR Legacy"),
    nutrientValue: {
      value: 18.6,
      unit: "g",
      per: "100g",
      source: usda("174271", "SR Legacy"),
      sourceNameNl: "Soybeans, mature seeds, cooked, boiled, without salt",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Soja-eiwit is volwaardig — het dekt alle essentiële aminozuren, ongebruikelijk voor een plantbron.",
  },
  {
    key: "edamame",
    labelNl: "Edamame",
    portionNl: "150 g",
    amount: 17.9,
    portionGroup: "legumes",
    source: usda("168411", "SR Legacy"),
    nutrientValue: {
      value: 11.9,
      unit: "g",
      per: "100g",
      source: usda("168411", "SR Legacy"),
      sourceNameNl: "Edamame, frozen, prepared",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Soja-eiwit is volwaardig — het dekt alle essentiële aminozuren, ongebruikelijk voor een plantbron.",
  },
  {
    key: "spliterwten-gekookt",
    labelNl: "Spliterwten, gekookt",
    portionNl: "150 g gekookt",
    amount: 12.5,
    portionGroup: "legumes",
    source: usda("172429", "SR Legacy"),
    nutrientValue: {
      value: 8.34,
      unit: "g",
      per: "100g",
      source: usda("172429", "SR Legacy"),
      sourceNameNl: "Peas, split, mature seeds, cooked, boiled, without salt",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Peulvrucht-eiwit is arm aan methionine — combineer over de dag met granen voor een compleet profiel.",
  },
  {
    key: "tuinbonen-gekookt",
    labelNl: "Tuinbonen, gekookt",
    portionNl: "150 g gekookt",
    amount: 11.4,
    portionGroup: "legumes",
    source: usda("173735", "SR Legacy"),
    nutrientValue: {
      value: 7.6,
      unit: "g",
      per: "100g",
      source: usda("173735", "SR Legacy"),
      sourceNameNl: "Broadbeans (fava beans), mature seeds, cooked, boiled, without salt",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Peulvrucht-eiwit is arm aan methionine — combineer over de dag met granen voor een compleet profiel.",
  },
  {
    key: "quinoa-droog",
    labelNl: "Quinoa, droog",
    portionNl: "60 g droog",
    amount: 8.5,
    portionGroup: "wholegrain",
    source: usda("168874", "SR Legacy"),
    nutrientValue: {
      value: 14.1,
      unit: "g",
      per: "100g",
      source: usda("168874", "SR Legacy"),
      sourceNameNl: "Quinoa, uncooked",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    qualityNote:
      "Quinoa-eiwit is volwaardig — een van de weinige plantbronnen met alle essentiële aminozuren.",
  },
  {
    key: "paling",
    labelNl: "Paling",
    portionNl: "100 g",
    amount: 23.7,
    portionGroup: "oilyFish",
    source: usda("174194", "SR Legacy"),
    nutrientValue: {
      value: 23.65,
      unit: "g",
      per: "100g",
      source: usda("174194", "SR Legacy"),
      sourceNameNl: "Fish, eel, mixed species, cooked, dry heat",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "rundergehakt",
    labelNl: "Rundergehakt",
    portionNl: "100 g",
    amount: 18.7,
    portionGroup: "leanMeat",
    source: usda("171796", "SR Legacy"),
    nutrientValue: {
      value: 18.7,
      unit: "g",
      per: "100g",
      source: usda("171796", "SR Legacy"),
      sourceNameNl: "Beef, ground, 85% lean meat / 15% fat, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "jonge-kaas",
    labelNl: "Jonge kaas",
    portionNl: "40 g (2 plakken)",
    amount: 10,
    portionGroup: "dairy",
    source: usda("171241", "SR Legacy"),
    nutrientValue: {
      value: 24.9,
      unit: "g",
      per: "100g",
      source: usda("171241", "SR Legacy"),
      sourceNameNl: "Cheese, gouda",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "mosselen",
    labelNl: "Mosselen",
    portionNl: "150 g",
    amount: 35.1,
    portionGroup: "other",
    source: usda("174217", "SR Legacy"),
    nutrientValue: {
      value: 23.4,
      unit: "g",
      per: "100g",
      source: usda("174217", "SR Legacy"),
      sourceNameNl: "Mollusks, mussel, blue, cooked, moist heat",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "biefstuk",
    labelNl: "Biefstuk",
    portionNl: "100 g",
    amount: 22.4,
    portionGroup: "leanMeat",
    source: usda("171804", "SR Legacy"),
    nutrientValue: {
      value: 22.4,
      unit: "g",
      per: "100g",
      source: usda("171804", "SR Legacy"),
      sourceNameNl: "Beef, top sirloin, steak, trimmed to 1/8\" fat, select, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "kippenlever",
    labelNl: "Kippenlever",
    portionNl: "100 g",
    amount: 16.9,
    portionGroup: "leanMeat",
    source: usda("171060", "SR Legacy"),
    nutrientValue: {
      value: 16.9,
      unit: "g",
      per: "100g",
      source: usda("171060", "SR Legacy"),
      sourceNameNl: "Chicken, liver, all classes, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
];

const MAGNESIUM_SOURCES: readonly FoodSource[] = [
  {
    key: "pompoenzaden",
    labelNl: "Pompoenzaden",
    portionNl: "25 g (handvol)",
    amount: 133.8,
    portionGroup: "nuts",
    source: { origin: "nevo", ref: "2806", edition: "2025/9.0" },
    nutrientValue: {
      value: 535.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "2806", edition: "2025/9.0" },
      sourceNameNl: "Pompoenpitten",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "spinazie",
    labelNl: "Spinazie, gekookt",
    portionNl: "150 g",
    amount: 115.5,
    portionGroup: "vegetables",
    seasonMonths: [4, 10],
    source: { origin: "nevo", ref: "52", edition: "2025/9.0" },
    nutrientValue: {
      value: 77.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "52", edition: "2025/9.0" },
      sourceNameNl: "Spinazie gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "Oxaalzuur in bladgroente bindt magnesium — minder sterk dan fytaat, maar merkbaar.",
    preparationNote: "Kookvocht meenemen scheelt: een deel van het magnesium loogt erin uit.",
  },
  {
    key: "zwarte-bonen",
    labelNl: "Zwarte bonen",
    portionNl: "150 g gekookt",
    amount: 105,
    portionGroup: "legumes",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
    preparationNote: "Weken en het weekwater weggooien verlaagt het fytaat.",
  },
  {
    key: "quinoa",
    labelNl: "Quinoa",
    portionNl: "150 g gekookt",
    amount: 96.0,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "3154", edition: "2025/9.0" },
    nutrientValue: {
      value: 64.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "3154", edition: "2025/9.0" },
      sourceNameNl: "Quinoa gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
    preparationNote: "Spoelen vóór koken haalt saponine weg, niet het fytaat.",
  },
  {
    key: "zonnebloempitten",
    labelNl: "Zonnebloempitten",
    portionNl: "25 g",
    amount: 90.8,
    portionGroup: "nuts",
    source: { origin: "nevo", ref: "872", edition: "2025/9.0" },
    nutrientValue: {
      value: 363.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "872", edition: "2025/9.0" },
      sourceNameNl: "Zonnebloempitten",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "havermout",
    labelNl: "Havermout",
    portionNl: "60 g droog",
    amount: 72.0,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "213", edition: "2025/9.0" },
    nutrientValue: {
      value: 120.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "213", edition: "2025/9.0" },
      sourceNameNl: "Vlokken haver-",
    },
    verified: true,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "cashewnoten",
    labelNl: "Cashewnoten",
    portionNl: "25 g",
    amount: 67.2,
    portionGroup: "nuts",
    source: { origin: "nevo", ref: "199", edition: "2025/9.0" },
    nutrientValue: {
      value: 269.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "199", edition: "2025/9.0" },
      sourceNameNl: "Noten cashew- ongezouten",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "amandelen",
    labelNl: "Amandelen",
    portionNl: "25 g",
    amount: 65,
    portionGroup: "nuts",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "zilvervliesrijst",
    labelNl: "Zilvervliesrijst",
    portionNl: "150 g gekookt",
    amount: 58.5,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "1014", edition: "2025/9.0" },
    nutrientValue: {
      value: 39.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "1014", edition: "2025/9.0" },
      sourceNameNl: "Rijst zilvervlies- gekookt",
    },
    verified: true,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "volkorenbrood",
    labelNl: "Volkorenbrood",
    portionNl: "2 sneden",
    amount: 55,
    portionGroup: "wholegrain",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
    preparationNote:
      "Zuurdesem breekt tijdens het rijzen een deel van het fytaat af — daar haal je meer uit dan uit gistbrood.",
  },
  {
    key: "tahin",
    labelNl: "Tahin (sesampasta)",
    portionNl: "20 g (1 el)",
    amount: 47,
    portionGroup: "nuts",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "pure-chocolade",
    labelNl: "Pure chocolade 70%",
    portionNl: "20 g",
    amount: 45,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Hoger cacaopercentage betekent meer magnesium.",
    bioavailability: "normal",
  },
  {
    key: "witte-bonen",
    labelNl: "Witte bonen",
    portionNl: "150 g gekookt",
    amount: 45,
    portionGroup: "legumes",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
    preparationNote: "Weken en het weekwater weggooien verlaagt het fytaat.",
  },
  {
    key: "banaan",
    labelNl: "Banaan",
    portionNl: "1 stuk (120 g)",
    amount: 33.6,
    portionGroup: "fruit",
    source: { origin: "nevo", ref: "151", edition: "2025/9.0" },
    nutrientValue: {
      value: 28.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "151", edition: "2025/9.0" },
      sourceNameNl: "Banaan",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "gedroogde-vijgen",
    labelNl: "Gedroogde vijgen",
    portionNl: "40 g (4 stuks)",
    amount: 27.2,
    portionGroup: "fruit",
    source: { origin: "nevo", ref: "193", edition: "2025/9.0" },
    nutrientValue: {
      value: 68.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "193", edition: "2025/9.0" },
      sourceNameNl: "Vijgen gedroogd",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "avocado",
    labelNl: "Avocado",
    portionNl: "½ stuk (100 g)",
    amount: 26.0,
    portionGroup: "fruit",
    source: { origin: "nevo", ref: "689", edition: "2025/9.0" },
    nutrientValue: {
      value: 26.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "689", edition: "2025/9.0" },
      sourceNameNl: "Avocado",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "boerenkool",
    labelNl: "Boerenkool, gekookt",
    portionNl: "150 g",
    amount: 19.5,
    portionGroup: "vegetables",
    seasonMonths: [11, 3],
    source: { origin: "nevo", ref: "16", edition: "2025/9.0" },
    nutrientValue: {
      value: 13.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "16", edition: "2025/9.0" },
      sourceNameNl: "Kool boeren- gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "normal",
  },
  {
    key: "snijbiet",
    labelNl: "Snijbiet, gekookt",
    portionNl: "150 g",
    amount: 16.5,
    portionGroup: "vegetables",
    seasonMonths: [6, 10],
    source: { origin: "nevo", ref: "48", edition: "2025/9.0" },
    nutrientValue: {
      value: 11.0,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "48", edition: "2025/9.0" },
      sourceNameNl: "Snijbiet gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: "Oxaalzuur in bladgroente bindt een deel van het magnesium.",
    preparationNote: "Kookvocht meenemen scheelt.",
  },

  // ── USDA-import september 2026 (WebSearch-route; geen observed, zie USDA_CITATION) ──
  {
    key: "spinazie-rauw",
    labelNl: "Spinazie, rauw",
    portionNl: "75 g",
    amount: 59.3,
    portionGroup: "vegetables",
    seasonMonths: [4, 10],
    source: usda("168462", "SR Legacy"),
    nutrientValue: {
      value: 79,
      unit: "mg",
      per: "100g",
      source: usda("168462", "SR Legacy"),
      sourceNameNl: "Spinach, raw",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "Oxaalzuur in bladgroente bindt magnesium — minder sterk dan fytaat, maar merkbaar.",
  },
  {
    key: "spinazie-diepvries",
    labelNl: "Spinazie, diepvries",
    portionNl: "150 g",
    amount: 112.5,
    portionGroup: "vegetables",
    source: usda("169287", "SR Legacy"),
    nutrientValue: {
      value: 75,
      unit: "mg",
      per: "100g",
      source: usda("169287", "SR Legacy"),
      sourceNameNl: "Spinach, frozen, chopped or leaf, unprepared",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "Oxaalzuur in bladgroente bindt magnesium — minder sterk dan fytaat, maar merkbaar.",
  },
  {
    key: "broccoli-gekookt",
    labelNl: "Broccoli, gekookt",
    portionNl: "150 g",
    amount: 31.5,
    portionGroup: "vegetables",
    source: usda("169967", "SR Legacy"),
    nutrientValue: {
      value: 21,
      unit: "mg",
      per: "100g",
      source: usda("169967", "SR Legacy"),
      sourceNameNl: "Broccoli, cooked, boiled, drained, without salt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "normal",
  },
  {
    key: "hazelnoten",
    labelNl: "Hazelnoten",
    portionNl: "25 g (handvol)",
    amount: 40.8,
    portionGroup: "nuts",
    source: usda("170581", "SR Legacy"),
    nutrientValue: {
      value: 163,
      unit: "mg",
      per: "100g",
      source: usda("170581", "SR Legacy"),
      sourceNameNl: "Nuts, hazelnuts or filberts",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "pecannoten",
    labelNl: "Pecannoten",
    portionNl: "25 g (handvol)",
    amount: 30.3,
    portionGroup: "nuts",
    source: usda("170182", "SR Legacy"),
    nutrientValue: {
      value: 121,
      unit: "mg",
      per: "100g",
      source: usda("170182", "SR Legacy"),
      sourceNameNl: "Nuts, pecans",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "pistachenoten",
    labelNl: "Pistachenoten",
    portionNl: "25 g (handvol)",
    amount: 30.3,
    portionGroup: "nuts",
    source: usda("170184", "SR Legacy"),
    nutrientValue: {
      value: 121,
      unit: "mg",
      per: "100g",
      source: usda("170184", "SR Legacy"),
      sourceNameNl: "Nuts, pistachio nuts, raw",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "macadamia",
    labelNl: "Macadamianoten",
    portionNl: "25 g (handvol)",
    amount: 32.5,
    portionGroup: "nuts",
    source: usda("170178", "SR Legacy"),
    nutrientValue: {
      value: 130,
      unit: "mg",
      per: "100g",
      source: usda("170178", "SR Legacy"),
      sourceNameNl: "Nuts, macadamia nuts, raw",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "pinda",
    labelNl: "Pinda's",
    portionNl: "25 g (handvol)",
    amount: 42,
    portionGroup: "nuts",
    source: usda("172430", "SR Legacy"),
    nutrientValue: {
      value: 168,
      unit: "mg",
      per: "100g",
      source: usda("172430", "SR Legacy"),
      sourceNameNl: "Peanuts, all types, raw",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "sesamzaad",
    labelNl: "Sesamzaad",
    portionNl: "10 g (eetlepel)",
    amount: 35.1,
    portionGroup: "nuts",
    source: usda("170150", "SR Legacy"),
    nutrientValue: {
      value: 351,
      unit: "mg",
      per: "100g",
      source: usda("170150", "SR Legacy"),
      sourceNameNl: "Seeds, sesame seeds, whole, dried",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "maanzaad",
    labelNl: "Maanzaad",
    portionNl: "9 g (eetlepel)",
    amount: 31.2,
    portionGroup: "nuts",
    source: usda("171330", "SR Legacy"),
    nutrientValue: {
      value: 347,
      unit: "mg",
      per: "100g",
      source: usda("171330", "SR Legacy"),
      sourceNameNl: "Seeds, poppy seed",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "sojabonen-gekookt",
    labelNl: "Sojabonen, gekookt",
    portionNl: "150 g gekookt",
    amount: 129,
    portionGroup: "legumes",
    source: usda("174271", "SR Legacy"),
    nutrientValue: {
      value: 86,
      unit: "mg",
      per: "100g",
      source: usda("174271", "SR Legacy"),
      sourceNameNl: "Soybeans, mature seeds, cooked, boiled, without salt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "edamame",
    labelNl: "Edamame",
    portionNl: "150 g",
    amount: 96,
    portionGroup: "legumes",
    source: usda("168411", "SR Legacy"),
    nutrientValue: {
      value: 64,
      unit: "mg",
      per: "100g",
      source: usda("168411", "SR Legacy"),
      sourceNameNl: "Edamame, frozen, prepared",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "tuinbonen-gekookt",
    labelNl: "Tuinbonen, gekookt",
    portionNl: "150 g gekookt",
    amount: 64.5,
    portionGroup: "legumes",
    source: usda("173735", "SR Legacy"),
    nutrientValue: {
      value: 43,
      unit: "mg",
      per: "100g",
      source: usda("173735", "SR Legacy"),
      sourceNameNl: "Broadbeans (fava beans), mature seeds, cooked, boiled, without salt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "spliterwten-gekookt",
    labelNl: "Spliterwten, gekookt",
    portionNl: "150 g gekookt",
    amount: 54,
    portionGroup: "legumes",
    source: usda("172429", "SR Legacy"),
    nutrientValue: {
      value: 36,
      unit: "mg",
      per: "100g",
      source: usda("172429", "SR Legacy"),
      sourceNameNl: "Peas, split, mature seeds, cooked, boiled, without salt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
  {
    key: "quinoa-droog",
    labelNl: "Quinoa, droog",
    portionNl: "60 g droog",
    amount: 118.2,
    portionGroup: "wholegrain",
    source: usda("168874", "SR Legacy"),
    nutrientValue: {
      value: 197,
      unit: "mg",
      per: "100g",
      source: usda("168874", "SR Legacy"),
      sourceNameNl: "Quinoa, uncooked",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
    preparationNote: "Droog gewicht — 60 g droog wordt ongeveer 180 g gekookt.",
  },
  {
    key: "boekweit-gekookt",
    labelNl: "Boekweit, gekookt",
    portionNl: "150 g gekookt",
    amount: 76.5,
    portionGroup: "wholegrain",
    source: usda("170686", "SR Legacy"),
    nutrientValue: {
      value: 51,
      unit: "mg",
      per: "100g",
      source: usda("170686", "SR Legacy"),
      sourceNameNl: "Buckwheat groats, roasted, cooked",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYTAAT,
  },
];

/**
 * Omega-3 — mg EPA+DHA per portie. Twee dingen liggen hier vast.
 *
 * **EPA/DHA en ALA staan niet in dezelfde eenheid.** Plantaardig omega-3 (ALA,
 * uit walnoot, lijnzaad, chia) wordt maar voor enkele procenten omgezet naar
 * EPA en nog minder naar DHA. Een ALA-bron met een mg-waarde ernaast zou
 * suggereren dat je vis ermee vervangt; die bronnen houden daarom
 * `amount: null` en dragen hun boodschap in `noteNl`.
 *
 * **Kweek versus wild is hier de grootste onzekerheid.** Bij gekweekte zalm is
 * het EPA/DHA-gehalte over de laatste decennia gedaald doordat het voer
 * verschoof van vismeel naar plantaardige olie. Zelfde soort, ander gehalte —
 * vandaar `variability: "high"` op vrijwel de hele lijst, en wild en gekweekt
 * apart in plaats van weggemiddeld.
 *
 * NEVO geeft vetzuren niet altijd uitgesplitst per EPA en DHA; USDA FoodData
 * Central wel. Voor déze stof is USDA daarom de primaire bron — zie
 * docs/plan/SPEC_VOEDINGSBRONNEN_TABEL_V2.md §3. Dat geldt alleen hier.
 */
const OMEGA3_SOURCES: readonly FoodSource[] = [
  {
    key: "makreel",
    labelNl: "Makreel",
    portionNl: "125 g",
    amount: 3000,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Vetgehalte verschilt sterk per seizoen en vangstgebied.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "zalm-wild",
    labelNl: "Wilde zalm",
    portionNl: "125 g",
    amount: 2200,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Soort en vangstgebied bepalen het vetgehalte.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "haring",
    labelNl: "Haring",
    portionNl: "100 g",
    amount: 1900,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Hollandse nieuwe is vetter dan haring buiten het seizoen.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "zalm-gekweekt",
    labelNl: "Gekweekte zalm",
    portionNl: "125 g",
    amount: 1800,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy:
      "Hangt af van het voer: sinds kwekerijen deels op plantaardige olie overgingen, ligt het EPA/DHA-gehalte lager dan vroeger.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "ansjovis",
    labelNl: "Ansjovis",
    portionNl: "50 g",
    amount: 1500,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Vetgehalte verschilt per seizoen en vangstgebied.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
    noteNl: "Laag in de voedselketen — daardoor weinig kwikstapeling.",
  },
  {
    key: "sardines",
    labelNl: "Sardines uit blik",
    portionNl: "100 g",
    amount: 1400,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Op olie of op water ingeblikt scheelt in het vetzuurprofiel.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
    noteNl: "Goedkoop, houdbaar, en laag in de voedselketen.",
  },
  {
    key: "sprot",
    labelNl: "Sprot",
    portionNl: "100 g",
    amount: 1300,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Vetgehalte verschilt sterk per seizoen.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "gerookte-forel",
    labelNl: "Gerookte forel",
    portionNl: "100 g",
    amount: 1000,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Vrijwel altijd gekweekt; het voer bepaalt het gehalte.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "algenolie",
    labelNl: "Algenolie (voedingsolie)",
    portionNl: "5 ml (1 tl)",
    amount: 800,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Gehalte verschilt per merk en algensoort.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
    noteNl:
      "De enige plantaardige bron van DHA zelf — vis haalt het uiteindelijk ook uit algen.",
  },
  {
    key: "verrijkte-eieren",
    labelNl: "Omega-3 verrijkte eieren",
    portionNl: "2 stuks",
    amount: 220,
    portionGroup: "egg",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Volledig afhankelijk van het kippenvoer; per merk verschillend.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
  },
  {
    key: "tonijn-blik",
    labelNl: "Tonijn uit blik",
    portionNl: "100 g uitgelekt",
    amount: 200,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Witte tonijn bevat meer dan lichte; op olie ingeblikt verliest bij uitlekken.",
    bioavailability: "normal",
    omega3Kind: "epa_dha",
    noteNl:
      "Wordt vaak voor vette vis aangezien, maar levert daar een fractie van — voor eiwit prima, voor omega-3 niet.",
  },
  {
    key: "walnoten",
    labelNl: "Walnoten",
    portionNl: "25 g",
    amount: null,
    portionGroup: "nuts",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het vetzuurprofiel.",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "ALA moet eerst worden omgezet naar EPA en DHA, en dat lukt maar voor een paar procent.",
    omega3Kind: "ala",
    noteNl:
      "Plantaardig omega-3 (ALA). Je lichaam zet daar maar een paar procent van om naar EPA/DHA — het vervangt vis niet.",
  },
  {
    key: "lijnzaad",
    labelNl: "Lijnzaad, gemalen",
    portionNl: "15 g",
    amount: null,
    portionGroup: "nuts",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "ALA moet eerst worden omgezet naar EPA en DHA, en dat lukt maar voor een paar procent.",
    omega3Kind: "ala",
    noteNl: "Ook ALA. Alleen gemalen — heel lijnzaad gaat er onbenut door.",
    preparationNote: "Malen vlak voor gebruik; gemalen lijnzaad wordt snel ranzig.",
  },
  {
    key: "chiazaad",
    labelNl: "Chiazaad",
    portionNl: "15 g",
    amount: null,
    portionGroup: "nuts",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "ALA moet eerst worden omgezet naar EPA en DHA, en dat lukt maar voor een paar procent.",
    omega3Kind: "ala",
    noteNl: "Ook ALA — zelfde verhaal als lijnzaad en walnoot.",
  },
];

/**
 * Vitamine D — µg per portie. De kortste lijst, en dat is de boodschap: in
 * Nederland dekt voeding dit gat structureel niet. Zonlicht is de hoofdroute
 * en staat daarom in de lijst met `amount: null` — okt–mrt staat die route
 * vrijwel stil, en juist dan kan voeding het niet overnemen.
 *
 * Elke uitbreiding hier moet die boodschap versterken, niet verdunnen: een
 * langere lijst mag niet suggereren dat je het alsnog van je bord haalt.
 */
const VITAMIN_D_SOURCES: readonly FoodSource[] = [
  {
    key: "haring",
    labelNl: "Haring",
    portionNl: "100 g",
    amount: 25,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Seizoen en vetgehalte werken sterk door.",
    bioavailability: "normal",
  },
  {
    key: "zalm",
    labelNl: "Zalm",
    portionNl: "125 g",
    amount: 12,
    portionGroup: "oilyFish",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy:
      "Wilde zalm bevat fors meer vitamine D dan gekweekte — het verschil kan een veelvoud zijn.",
    bioavailability: "normal",
  },
  {
    key: "makreel",
    labelNl: "Makreel",
    portionNl: "125 g",
    amount: 10.0,
    portionGroup: "oilyFish",
    source: { origin: "nevo", ref: "353", edition: "2025/9.0" },
    nutrientValue: {
      value: 8.0,
      unit: "µg",
      per: "100g",
      source: { origin: "nevo", ref: "353", edition: "2025/9.0" },
      sourceNameNl: "Makreel rauw",
    },
    verified: true,
    variability: "high",
    variabilityWhy: "Seizoen en vangstgebied werken sterk door.",
    bioavailability: "normal",
  },
  {
    key: "sardines",
    labelNl: "Sardines uit blik",
    portionNl: "100 g",
    amount: 3.3,
    portionGroup: "oilyFish",
    source: { origin: "nevo", ref: "355", edition: "2025/9.0" },
    nutrientValue: {
      value: 3.3,
      unit: "µg",
      per: "100g",
      source: { origin: "nevo", ref: "355", edition: "2025/9.0" },
      sourceNameNl: "Sardines in olie blik",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Verschilt per herkomst en inblikwijze.",
    bioavailability: "normal",
  },
  {
    key: "leverpastei",
    labelNl: "Leverpastei",
    portionNl: "30 g",
    amount: 3,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Verschilt sterk per bereiding en merk.",
    bioavailability: "normal",
  },
  {
    key: "halvarine",
    labelNl: "Halvarine of margarine",
    portionNl: "30 g",
    amount: 2.3,
    portionGroup: "other",
    source: { origin: "nevo", ref: "2566", edition: "2025/9.0" },
    nutrientValue: {
      value: 7.5,
      unit: "µg",
      per: "100g",
      source: { origin: "nevo", ref: "2566", edition: "2025/9.0" },
      sourceNameNl: "Halvarine 40% vet <17g verz vetz ongezouten",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    noteNl: "In Nederland wettelijk verrijkt met vitamine D.",
  },
  {
    key: "eieren",
    labelNl: "Eieren",
    portionNl: "2 stuks",
    amount: 2.1,
    portionGroup: "egg",
    source: { origin: "nevo", ref: "84", edition: "2025/9.0" },
    nutrientValue: {
      value: 1.8,
      unit: "µg",
      per: "100g",
      source: { origin: "nevo", ref: "84", edition: "2025/9.0" },
      sourceNameNl: "Ei kippen- gekookt gem",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Kippen met buitenloop leggen eieren met meer vitamine D.",
    bioavailability: "normal",
  },
  {
    key: "paddenstoelen-uv",
    labelNl: "Paddenstoelen, UV-behandeld",
    portionNl: "100 g",
    amount: 2,
    portionGroup: "vegetables",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy:
      "Alleen UV-behandelde paddenstoelen bevatten noemenswaardig vitamine D; gewone vrijwel niets.",
    bioavailability: "reduced",
    bioavailabilityWhy:
      "Paddenstoelen leveren vitamine D2, dat de bloedspiegel minder effectief verhoogt dan de D3 uit vis en zon.",
  },
  {
    key: "plantaardige-drank-verrijkt",
    labelNl: "Plantaardige drank, verrijkt",
    portionNl: "250 ml",
    amount: 1.9,
    portionGroup: "dairy",
    source: UNVERIFIED,
    verified: false,
    variability: "moderate",
    variabilityWhy: "Alleen verrijkte varianten; het niveau verschilt per merk.",
    bioavailability: "normal",
    noteNl: "Ongezoet en verrijkt is de bruikbare variant — biologisch is vaak níet verrijkt.",
  },
  {
    key: "zonlicht",
    labelNl: "Zonlicht op je huid",
    portionNl: "15–30 min, apr–sep",
    amount: null,
    portionGroup: "other",
    seasonMonths: [4, 9],
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy:
      "Huidtype, leeftijd, bewolking en hoeveel huid onbedekt is bepalen samen hoeveel je aanmaakt.",
    bioavailability: "normal",
    noteNl:
      "De hoofdroute, en de reden dat voeding dit gat niet dicht. Okt–mrt staat de aanmaak in NL vrijwel stil.",
  },

  // ── USDA-import september 2026 (WebSearch-route; geen observed) ──
  {
    key: "forel",
    labelNl: "Forel, gebakken",
    portionNl: "125 g",
    amount: 23.8,
    portionGroup: "oilyFish",
    source: usda("173718", "SR Legacy"),
    nutrientValue: {
      value: 19,
      unit: "µg",
      per: "100g",
      source: usda("173718", "SR Legacy"),
      sourceNameNl: "Fish, trout, rainbow, farmed, cooked, dry heat",
    },
    verified: true,
    variability: "high",
    variabilityWhy:
      "Wild versus gekweekt en het seizoen doen vitamine D in vis een veelvoud verschillen.",
    bioavailability: "normal",
  },
];

/**
 * Zink — mg per portie. De stof waar de opname het zwaarst weegt: fytaat in
 * volkoren, peulvruchten, noten en zaden bindt zink, en de fytaat:zink-
 * verhouding bepaalt hoeveel er werkelijk aankomt. Bij een hoge verhouding kan
 * de absorptie meer dan halveren. Dierlijke bronnen hebben die rem niet.
 *
 * Dat maakt 1,4 mg zink uit volkorenbrood iets anders dan 1,4 mg uit
 * rundvlees — hetzelfde getal, een andere uitkomst. Precies waarom deze tabel
 * niet optelt.
 */
const ZINC_SOURCES: readonly FoodSource[] = [
  {
    key: "oesters",
    labelNl: "Oesters",
    portionNl: "100 g (6 stuks)",
    amount: 21,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "high",
    variabilityWhy: "Soort, seizoen en groeiwater werken sterk door.",
    bioavailability: "normal",
    noteNl: "Veruit de sterkste bron die er is — ook als je ze maar zelden eet.",
  },
  {
    key: "rundvlees",
    labelNl: "Rundvlees",
    portionNl: "100 g",
    amount: 4.2,
    portionGroup: "leanMeat",
    source: { origin: "nevo", ref: "2336", edition: "2025/9.0" },
    nutrientValue: {
      value: 4.17,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "2336", edition: "2025/9.0" },
      sourceNameNl: "Rundvlees gem rauw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "lamsvlees",
    labelNl: "Lamsvlees",
    portionNl: "100 g",
    amount: 4,
    portionGroup: "leanMeat",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "kalfsvlees",
    labelNl: "Kalfsvlees",
    portionNl: "100 g",
    amount: 3.1,
    portionGroup: "leanMeat",
    source: { origin: "nevo", ref: "5280", edition: "2025/9.0" },
    nutrientValue: {
      value: 3.13,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "5280", edition: "2025/9.0" },
      sourceNameNl: "Kalfsvlees gem rauw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "hennepzaad",
    labelNl: "Hennepzaad, gepeld",
    portionNl: "25 g",
    amount: 2.5,
    portionGroup: "nuts",
    source: { origin: "nevo", ref: "3446", edition: "2025/9.0" },
    nutrientValue: {
      value: 9.9,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "3446", edition: "2025/9.0" },
      sourceNameNl: "Hennepzaad",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "linzen",
    labelNl: "Linzen",
    portionNl: "150 g gekookt",
    amount: 2.1,
    portionGroup: "legumes",
    source: { origin: "nevo", ref: "970", edition: "2025/9.0" },
    nutrientValue: {
      value: 1.4,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "970", edition: "2025/9.0" },
      sourceNameNl: "Linzen groene en bruine gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "pompoenzaden",
    labelNl: "Pompoenzaden",
    portionNl: "25 g",
    amount: 2.0,
    portionGroup: "nuts",
    source: { origin: "nevo", ref: "2806", edition: "2025/9.0" },
    nutrientValue: {
      value: 7.94,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "2806", edition: "2025/9.0" },
      sourceNameNl: "Pompoenpitten",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "kikkererwten",
    labelNl: "Kikkererwten",
    portionNl: "150 g gekookt",
    amount: 1.9,
    portionGroup: "legumes",
    source: { origin: "nevo", ref: "1095", edition: "2025/9.0" },
    nutrientValue: {
      value: 1.29,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "1095", edition: "2025/9.0" },
      sourceNameNl: "Erwten kikker- gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
    preparationNote: "Weken en het weekwater weggooien verlaagt het fytaat.",
  },
  {
    key: "quinoa",
    labelNl: "Quinoa",
    portionNl: "150 g gekookt",
    amount: 1.6,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "3154", edition: "2025/9.0" },
    nutrientValue: {
      value: 1.09,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "3154", edition: "2025/9.0" },
      sourceNameNl: "Quinoa gekookt",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "eieren",
    labelNl: "Eieren",
    portionNl: "2 stuks",
    amount: 1.6,
    portionGroup: "egg",
    source: { origin: "nevo", ref: "84", edition: "2025/9.0" },
    nutrientValue: {
      value: 1.63,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "84", edition: "2025/9.0" },
      sourceNameNl: "Ei kippen- gekookt gem",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "garnalen",
    labelNl: "Garnalen",
    portionNl: "100 g",
    amount: 1.5,
    portionGroup: "other",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "havermout",
    labelNl: "Havermout",
    portionNl: "60 g droog",
    amount: 1.5,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "213", edition: "2025/9.0" },
    nutrientValue: {
      value: 2.5,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "213", edition: "2025/9.0" },
      sourceNameNl: "Vlokken haver-",
    },
    verified: true,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "cashewnoten",
    labelNl: "Cashewnoten",
    portionNl: "25 g",
    amount: 1.4,
    portionGroup: "nuts",
    source: { origin: "nevo", ref: "199", edition: "2025/9.0" },
    nutrientValue: {
      value: 5.8,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "199", edition: "2025/9.0" },
      sourceNameNl: "Noten cashew- ongezouten",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "belegen-kaas",
    labelNl: "Belegen kaas",
    portionNl: "30 g (1 snee)",
    amount: 1.2,
    portionGroup: "dairy",
    source: UNVERIFIED,
    verified: false,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "volkorenbrood",
    labelNl: "Volkorenbrood",
    portionNl: "2 sneden",
    amount: 1.0,
    portionGroup: "wholegrain",
    source: { origin: "nevo", ref: "246", edition: "2025/9.0" },
    nutrientValue: {
      value: 1.41,
      unit: "mg",
      per: "100g",
      source: { origin: "nevo", ref: "246", edition: "2025/9.0" },
      sourceNameNl: "Tarwebrood volkoren gem v fijn en grof",
    },
    verified: true,
    variability: "low",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
    noteNl:
      "Fytaat in volkoren remt de opname — de mg zijn er, je haalt er minder uit.",
    preparationNote:
      "Zuurdesem breekt een deel van het fytaat af tijdens het rijzen; daar komt meer zink uit dan uit gistbrood.",
  },

  // ── USDA-import september 2026 (WebSearch-route; geen observed) ──
  {
    key: "pecannoten",
    labelNl: "Pecannoten",
    portionNl: "25 g (handvol)",
    amount: 1.1,
    portionGroup: "nuts",
    source: usda("170182", "SR Legacy"),
    nutrientValue: {
      value: 4.53,
      unit: "mg",
      per: "100g",
      source: usda("170182", "SR Legacy"),
      sourceNameNl: "Nuts, pecans",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "edamame",
    labelNl: "Edamame",
    portionNl: "150 g",
    amount: 2.1,
    portionGroup: "legumes",
    source: usda("168411", "SR Legacy"),
    nutrientValue: {
      value: 1.37,
      unit: "mg",
      per: "100g",
      source: usda("168411", "SR Legacy"),
      sourceNameNl: "Edamame, frozen, prepared",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Bodem en ras werken door in het mineraalgehalte.",
    bioavailability: "reduced",
    bioavailabilityWhy: FYT,
  },
  {
    key: "jonge-kaas",
    labelNl: "Jonge kaas",
    portionNl: "40 g (2 plakken)",
    amount: 1.6,
    portionGroup: "dairy",
    source: usda("171241", "SR Legacy"),
    nutrientValue: {
      value: 4,
      unit: "mg",
      per: "100g",
      source: usda("171241", "SR Legacy"),
      sourceNameNl: "Cheese, gouda",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "runderlever",
    labelNl: "Runderlever",
    portionNl: "100 g",
    amount: 5.3,
    portionGroup: "leanMeat",
    source: usda("168626", "SR Legacy"),
    nutrientValue: {
      value: 5.3,
      unit: "mg",
      per: "100g",
      source: usda("168626", "SR Legacy"),
      sourceNameNl: "Beef, liver, cooked, braised",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
    noteNl: "Lever draagt zink in een orde die spiervlees niet haalt.",
  },
  {
    key: "mosselen",
    labelNl: "Mosselen",
    portionNl: "150 g",
    amount: 4.1,
    portionGroup: "other",
    source: usda("174217", "SR Legacy"),
    nutrientValue: {
      value: 2.7,
      unit: "mg",
      per: "100g",
      source: usda("174217", "SR Legacy"),
      sourceNameNl: "Mollusks, mussel, blue, cooked, moist heat",
    },
    verified: true,
    variability: "moderate",
    variabilityWhy: "Soort, seizoen en groeiwater werken door.",
    bioavailability: "normal",
  },
  {
    key: "biefstuk",
    labelNl: "Biefstuk",
    portionNl: "100 g",
    amount: 4,
    portionGroup: "leanMeat",
    source: usda("171804", "SR Legacy"),
    nutrientValue: {
      value: 4,
      unit: "mg",
      per: "100g",
      source: usda("171804", "SR Legacy"),
      sourceNameNl: "Beef, top sirloin, steak, trimmed to 1/8\" fat, select, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
  {
    key: "kippenlever",
    labelNl: "Kippenlever",
    portionNl: "100 g",
    amount: 2.7,
    portionGroup: "leanMeat",
    source: usda("171060", "SR Legacy"),
    nutrientValue: {
      value: 2.7,
      unit: "mg",
      per: "100g",
      source: usda("171060", "SR Legacy"),
      sourceNameNl: "Chicken, liver, all classes, raw",
    },
    verified: true,
    variability: "low",
    bioavailability: "normal",
  },
];

/**
 * Is dit gehalte tegen een brondataset gelegd?
 *
 * De invariant die deze functie bewaakt: `verified: true` zonder
 * `nutrientValue` kan niet bestaan — dan is er niets om tegen te leggen. Een
 * test dwingt dat af over de hele tabel.
 */
export function isSourceBacked(source: FoodSource): boolean {
  return source.nutrientValue !== undefined && source.verified;
}

/**
 * Reken een brondwaarde per 100 g om naar de portie van deze rij.
 *
 * Dit is de enige plek waar die vermenigvuldiging hoort te gebeuren, en het is
 * expliciet **onze** bewerking — niet de brondwaarde. Vandaar dat het
 * resultaat naar `amount` gaat en niet terug in `nutrientValue`.
 *
 * @param grams - Portiegrootte in gram. Komt uit `portion-dictionary.ts` of
 *   uit de portie die deze rij zelf noemt; bij een bereik (120–150 g fruit)
 *   geeft de aanroeper zelf aan welke kant hij wil.
 * @returns Het gehalte voor die portie, afgerond op één decimaal — meer
 *   precisie dan de bron zelf heeft zou schijnnauwkeurigheid zijn.
 */
export function amountForPortion(
  value: NutrientValue,
  grams: number,
): number | null {
  if (!Number.isFinite(grams) || grams <= 0) return null;
  return Math.round((value.value * grams) / 100 * 10) / 10;
}

/**
 * Aflopend op `amount`, rijen zonder waarde (`null`) achteraan.
 *
 * Dit is de leesregel uit de {@link FoodSource}-doc, nu afgedwongen bij de
 * constructie in plaats van met de hand onderhouden. Zo landt elke toegevoegde
 * rij vanzelf op zijn plek, en blijft de belofte gelden die
 * `nutrition-categorie-detail.ts` gebruikt ("FOOD_SOURCES staat al aflopend op
 * amount; filteren houdt die volgorde"). Het verandert niets aan lijsten die al
 * gesorteerd waren — het maakt alleen een nieuwe rij toevoegen veilig.
 */
function byAmountDesc(sources: readonly FoodSource[]): readonly FoodSource[] {
  return [...sources].sort(
    (a, b) => (b.amount ?? -Infinity) - (a.amount ?? -Infinity),
  );
}

export const FOOD_SOURCES: Record<NutrientId, readonly FoodSource[]> = {
  protein: byAmountDesc(PROTEIN_SOURCES),
  omega3: byAmountDesc(OMEGA3_SOURCES),
  magnesium: byAmountDesc(MAGNESIUM_SOURCES),
  vitamin_d: byAmountDesc(VITAMIN_D_SOURCES),
  zinc: byAmountDesc(ZINC_SOURCES),
};
