/**
 * Deterministische inname-schat-engine voor de voedings zelf-evaluatie-lus (F1).
 *
 * Regels:
 * - Pure functies, geen I/O, geen randomness.
 * - Grof en frequentie-gebaseerd — geen grammen, geen BMR/TDEE/macro.
 * - Ontbrekende input → band "around" (neutraal, nooit alarmerend).
 * - Drempelwaarden komen uit de referentietabel, niet hardcoded hier.
 * - Elk signaal draagt zijn eigen eenheid; combineren gebeurt nooit op
 *   rauwe getallen (zie SignalUnit).
 */

import {
  nutrientReferences,
  NUTRIENT_IDS,
  type NutrientId,
} from "@/data/nutrition/intake-reference";
import { seasonFromDate } from "@/lib/nutrition-season";

/**
 * Semver van de engine — wordt opgeslagen in intake_intake_log.estimate_version (F0).
 *
 * 1.3.0: vitamin_d-band gebruikt seasonalThresholds i.p.v. vaste grenzen.
 * 1.4.0: eenheidscorrectie. Signalen worden naar porties/week genormaliseerd
 *        vóór de drempelvergelijking, en elke bron krijgt een bijdragefactor
 *        die zijn eigen lat schaalt. Daarvóór maximeerde de engine ongewogen
 *        over velden in verschillende eenheden: "3× noten per week" en
 *        "3 porties groente per dag" leverden dezelfde band. Banden van vóór
 *        deze versie zijn dus niet vergelijkbaar met die van erna —
 *        magnesium en zink schuiven het meest.
 */
export const ESTIMATE_VERSION = "1.4.0";

/**
 * Plat record van frequentie-antwoorden uit het gewoonte-zelfrapport (gewone dag/week).
 * Dit is exact de vorm die in intake_intake_log.raw_inputs (F0) wordt opgeslagen.
 * Alle velden zijn optioneel — ontbrekende input levert band "around".
 */
export interface NutritionSelfReport {
  /** Porties eiwitrijke voeding (vlees/vis/ei/zuivel/peulvruchten) per dag. */
  proteinMealsPerDay?: number;
  /** Porties vette vis (zalm, makreel, haring, sardines) per week. */
  oilyFishPerWeek?: number;
  /** Porties magnesium-rijke voeding (bladgroenten, noten, peulvruchten) op een gewone dag.
   *  Storage-key blijft vegFruitPerDay voor backward-compat met bestaande raw_inputs. */
  vegFruitPerDay?: number;
  /** Porties zuivel (melk, yoghurt, kaas) per dag. */
  dairyServingsPerDay?: number;
  /** Porties vlees, vis of peulvruchten per dag. */
  meatLegumesPerDay?: number;
  /** Keer per week buiten (huid aan daglicht, min. 15 minuten). */
  sunExposurePerWeek?: number;
  /** Noten, zaden of peulvruchten los van warme maaltijd — per week. */
  nutsSeedsLegumesPerWeek?: number;
}

/** Drie inname-banden t.o.v. een veelgebruikte richtlijn. */
export type IntakeBand = "below" | "around" | "meets";

/**
 * Geschatte inname t.o.v. een veelgebruikte richtlijn voor één nutriënt.
 * Dit is exact de element-vorm van de array die in intake_intake_log.estimate (F0) landt.
 */
export interface IntakeEstimate {
  nutrient: NutrientId;
  band: IntakeBand;
  /** Kopie van referenceLabel uit de referentietabel, voor directe weergave. */
  referenceLabel: string;
}

/**
 * De eenheid waarin een zelfrapport-veld is uitgedrukt.
 *
 * Dit type bestaat omdat het ontbreken ervan een echte fout veroorzaakte: de
 * oude `combineSignals` nam `Math.max` over velden die niet in dezelfde
 * eenheid stonden. Bij magnesium werden `vegFruitPerDay` (porties/dag),
 * `meatLegumesPerDay` (porties/dag) en `nutsSeedsLegumesPerWeek`
 * (porties/week) door één en dezelfde drempel gehaald. "3× noten per week" en
 * "3 porties groente per dag" leverden allebei het getal 3 en dus dezelfde
 * band, terwijl er een factor 7 tussen zit.
 */
export type SignalUnit = "perDay" | "perWeek";

/** Eén zelfrapport-signaal met de eenheid waarin het is uitgedrukt. */
export interface UnitSignal {
  /** Het zelfrapport-veld waar dit signaal uit komt. Sleutel voor de UI. */
  field: keyof NutritionSelfReport;
  /** Korte bronnaam voor de rangorde ("Noten, zaden, peulvruchten"). */
  labelNl: string;
  value: number | undefined;
  unit: SignalUnit;
  /**
   * Hoeveel van de drempel één portie uit deze bron dekt, 0–1.
   *
   * Niet elke bron draagt evenveel bij aan dezelfde stof: zuivel is een
   * zwakkere zinkbron dan vlees, en noten dragen magnesium sterker dan een
   * gemiddelde portie groente. De factoren zijn indicatief en herleidbaar naar
   * `food-sources.ts` (relatieve orde van grootte binnen de portiegroep), niet
   * naar een mg-berekening — dat blijft verboden terrein.
   *
   * De factor schaalt de **lat**, niet het signaal: een zwakkere bron moet
   * vaker op tafel komen om dezelfde band te halen. Het signaal zelf blijft
   * het aantal porties dat iemand daadwerkelijk noemde, zodat de primaire
   * bron (`weight: 1`) precies de drempel uit `intake-reference.ts` houdt.
   */
  weight: number;
}

const DAYS_PER_WEEK = 7;

/** Normaliseer één signaal naar porties per week. */
function toWeekly(signal: UnitSignal): number | undefined {
  const { value, unit } = signal;
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return unit === "perDay" ? value * DAYS_PER_WEEK : value;
}

/**
 * Bepaal de band uit meerdere signalen, elk tegen zijn eigen lat.
 *
 * Elk signaal gaat naar porties/week, en de drempel wordt voor dat signaal
 * gedeeld door zijn bijdragefactor: een bron die de helft levert van wat de
 * primaire bron levert, heeft twee keer zoveel porties nodig voor dezelfde
 * band. Zo blijft de drempel uit `intake-reference.ts` exact gelden voor de
 * primaire bron, en verschuiven alleen de zwakkere bronnen.
 *
 * Van de resulterende banden wint de sterkste. Sterkste en niet optellen: de
 * bronnen overlappen elkaar in de vragenlijst (wie "vlees, vis of
 * peulvruchten" antwoordt, heeft die porties vaak al meegeteld bij zijn
 * eiwitmomenten), en optellen zou dubbeltellen. Dit is dezelfde conservatieve
 * keuze als het oude `Math.max`, maar nu op vergelijkbare grootheden in plaats
 * van op rauwe getallen in verschillende eenheden.
 *
 * Ontbrekende signalen worden genegeerd; ontbreekt alles → "around".
 */
const BAND_RANK: Record<IntakeBand, number> = { below: 0, around: 1, meets: 2 };

function bandFromSignals(
  signals: readonly UnitSignal[],
  belowMax: number,
  meetsMin: number,
  thresholdUnit: SignalUnit,
): IntakeBand {
  const factor = thresholdUnit === "perDay" ? DAYS_PER_WEEK : 1;
  const weeklyBelowMax = belowMax * factor;
  const weeklyMeetsMin = meetsMin * factor;

  let best: IntakeBand | undefined;

  for (const signal of signals) {
    const weekly = toWeekly(signal);
    if (weekly === undefined || signal.weight <= 0) continue;

    // De lat voor déze bron: een halve bijdrage vraagt een dubbele frequentie.
    const band = bandFor(
      weekly,
      weeklyBelowMax / signal.weight,
      weeklyMeetsMin / signal.weight,
    );
    if (best === undefined || BAND_RANK[band] > BAND_RANK[best]) {
      best = band;
    }
  }

  return best ?? "around";
}

/** Eén wekelijks getal tegen één wekelijkse lat. */
function bandFor(weekly: number, belowMax: number, meetsMin: number): IntakeBand {
  if (weekly < belowMax) return "below";
  if (weekly >= meetsMin) return "meets";
  return "around";
}

/**
 * In welke eenheid de drempels van `intake-reference.ts` staan.
 *
 * Die tabel drukt zijn grenzen uit in de eenheid van de vraag die de stof
 * meet: eetmomenten per dag voor eiwit, porties per week voor vette vis. Zolang
 * signaal en drempel dezelfde eenheid deelden viel dat niet op; nu het signaal
 * naar porties/week gaat, moet de drempel mee — vandaar dat deze map bestaat
 * en niet impliciet blijft.
 *
 * Deze map hoort inhoudelijk bij de drempels zelf. Hij staat hier en niet in
 * `intake-reference.ts` omdat die tabel productkennis is en dit een detail van
 * de rekenstap; verhuist de eenheid ooit naar `NutrientThresholds`, dan
 * vervalt deze map.
 */
const THRESHOLD_UNIT: Record<NutrientId, SignalUnit> = {
  protein: "perDay",
  omega3: "perWeek",
  magnesium: "perDay",
  vitamin_d: "perWeek",
  zinc: "perDay",
};

/**
 * Welke zelfrapport-velden welk nutriënt dragen, met hun bijdragefactor.
 *
 * Dit is de enige plek waar die koppeling staat: zowel de band-schatting als
 * de bijdrage-rangorde (`nutrition-contribution.ts`) leest hem, zodat de twee
 * lagen nooit uit elkaar kunnen lopen.
 *
 * De factoren zijn indicatief en herleidbaar naar de orde van grootte in
 * `food-sources.ts` — niet naar een mg-berekening. Ze zeggen hoeveel van de
 * lat één portie uit die bron dekt, ten opzichte van de bron waarop de
 * drempel in `intake-reference.ts` geijkt is (die houdt weight 1).
 */
export const NUTRIENT_SIGNAL_SOURCES: Record<
  NutrientId,
  readonly Omit<UnitSignal, "value">[]
> = {
  // Eiwitrijke eetmomenten per dag is de bron waarop de drempel geijkt is;
  // vlees/vis/peulvruchten is het alternatief als die vraag onbeantwoord bleef.
  //
  // Beide op weight 1: een portie telt als een eetmoment. Dat is niet exact —
  // twee porties bij hetzelfde avondeten zijn één moment — maar de
  // vragenlijst kan dat verschil niet zien, en een lagere factor zou een harde
  // bandgrens leggen op een zachte aanname.
  protein: [
    { field: "proteinMealsPerDay", labelNl: "Eiwitmomenten", unit: "perDay", weight: 1 },
    { field: "meatLegumesPerDay", labelNl: "Vlees, vis, peulvruchten", unit: "perDay", weight: 1 },
  ],

  // Eén bron, geen combinatie: vette vis is de enige gewone voedingsbron van
  // EPA en DHA. Plantaardige omega-3 (ALA) wordt maar voor enkele procenten
  // omgezet en staat in food-sources.ts daarom op amount: null.
  omega3: [
    { field: "oilyFishPerWeek", labelNl: "Vette vis", unit: "perWeek", weight: 1 },
  ],

  // De drempel (2/4 porties per dag) hoort bij de dagelijkse plantporties-
  // vraag — die houdt weight 1. Noten, zaden en peulvruchten zijn per portie
  // juist de dichtste magnesiumbron van de drie: food-sources.ts zet
  // pompoenpitten en amandelen boven broccoli en spinazie, vandaar 1,4. Vlees
  // is een zwakke magnesiumbron (0,4).
  magnesium: [
    { field: "vegFruitPerDay", labelNl: "Groente en plantporties", unit: "perDay", weight: 1 },
    { field: "nutsSeedsLegumesPerWeek", labelNl: "Noten, zaden, peulvruchten", unit: "perWeek", weight: 1.4 },
    { field: "meatLegumesPerDay", labelNl: "Vlees, vis, peulvruchten", unit: "perDay", weight: 0.4 },
  ],

  // Zonlicht, niet voeding: in Nederland komt vitamine D vooral van de huid.
  // De winter-drempel in intake-reference.ts zorgt dat deze bron dan geen
  // "meets" meer kan opleveren.
  vitamin_d: [
    { field: "sunExposurePerWeek", labelNl: "Buiten in daglicht", unit: "perWeek", weight: 1 },
  ],

  // Vlees en vis zijn de dragende zinkbronnen; zuivel levert zink maar
  // beduidend minder per portie (0,5). Die twee ongewogen maximeren gaf een
  // zuivelrijk patroon dezelfde band als een vleesrijk patroon.
  zinc: [
    { field: "meatLegumesPerDay", labelNl: "Vlees, vis, peulvruchten", unit: "perDay", weight: 1 },
    { field: "dairyServingsPerDay", labelNl: "Zuivel", unit: "perDay", weight: 0.5 },
  ],
};

/** Vul de signaaltabel voor één nutriënt met de waarden uit een zelfrapport. */
export function signalsFor(
  nutrient: NutrientId,
  report: NutritionSelfReport,
): readonly UnitSignal[] {
  return NUTRIENT_SIGNAL_SOURCES[nutrient].map((source) => ({
    ...source,
    value: report[source.field],
  }));
}

/**
 * De drempels die voor dit nutriënt gelden, gegeven het seizoen.
 * Apart omdat zowel de band-schatting als de bijdrage-laag ze nodig heeft.
 */
export function thresholdsFor(
  nutrient: NutrientId,
  referenceDate: Date = new Date(),
): { belowMax: number; meetsMin: number; unit: SignalUnit } {
  const ref = nutrientReferences[nutrient];
  const { belowMax, meetsMin } =
    nutrient === "vitamin_d" && ref.seasonalThresholds
      ? ref.seasonalThresholds[seasonFromDate(referenceDate)]
      : ref.thresholds;
  return { belowMax, meetsMin, unit: THRESHOLD_UNIT[nutrient] };
}

/**
 * Schat de voedings-inname per nutriënt op basis van een gewoonte-zelfrapport (gewone dag/week).
 * Deterministisch, puur (bij gelijke referenceDate) — dezelfde input geeft altijd dezelfde output.
 *
 * @param report - Frequentie-antwoorden van de gebruiker (F0: raw_inputs).
 * @param referenceDate - Bepaalt het seizoen voor vitamin_d (zie seasonalThresholds
 *   in intake-reference.ts); default vandaag. Geef dezelfde datum door als aan
 *   buildNutritionAdvice()/getNutrientLifestyleAction() zodat band en copy synchroon lopen.
 * @returns Array van IntakeEstimate (F0: estimate), één per nutriënt.
 */
export function estimateNutritionIntake(
  report: NutritionSelfReport,
  referenceDate: Date = new Date(),
): IntakeEstimate[] {
  return NUTRIENT_IDS.map((id) => {
    const { belowMax, meetsMin, unit } = thresholdsFor(id, referenceDate);
    const band = bandFromSignals(signalsFor(id, report), belowMax, meetsMin, unit);

    return {
      nutrient: id,
      band,
      referenceLabel: nutrientReferences[id].referenceLabel,
    };
  });
}
