/**
 * Bijdrage-laag — "waar komt deze stof bij jou vandaan, en hoe zeker weten we dat?"
 *
 * ## Wat dit is, en waarom het naast de band-engine staat
 *
 * `estimateNutritionIntake` geeft één band per nutriënt: below, around of
 * meets. Dat is de uitkomst, en de supplement-poort hangt eraan. Deze laag
 * beantwoordt de vraag daarvóór: wélke van je eigen antwoorden die band
 * draagt, en welke bronnen buiten beeld blijven.
 *
 * Die vraag is nieuw. `intake-reference.ts` zegt vandaag bij magnesium
 * "vertrouwen 1 van 4 — je band komt uit een groente-en-fruit-telling,
 * terwijl noten, volkoren en peulvruchten de sterkere bronnen zijn". Dat is
 * een handgeschreven zin die iemand ooit klopte. Hier wordt het gerekend: als
 * de dragende bronnen niet gemeten worden, zakt het vertrouwen vanzelf.
 *
 * Bewust een aparte module en geen uitbreiding van de band-engine: die keten
 * voedt de supplement-poort en `intake_intake_log.estimate`. Deze laag leest
 * dezelfde signaaltabel (`NUTRIENT_SIGNAL_SOURCES`) maar schrijft nergens
 * naartoe — hij kan dus niet stilletjes een band verschuiven.
 *
 * ## De harde grens die hier onverkort geldt
 *
 * **Geen milligrammen, geen dagtotalen, geen percentage van een ADH.** De
 * `share` hieronder is een aandeel binnen je eigen antwoorden, niet een
 * fractie van een norm. Drie redenen, en ze stapelen — dezelfde drie die in
 * `nutrient-routes.ts` staan:
 *
 * 1. De check meet frequenties, geen grammen.
 * 2. Elke rij in `food-sources.ts` staat op `verified: false`.
 * 3. Bij magnesium en zink bepaalt fytaat de opname méér dan het gehalte.
 *
 * Wat deze laag dus wél mag zeggen: "je magnesium komt vooral uit je noten,
 * groente draagt bij jou minder bij". Dat is een uitspraak over de verhouding
 * tussen je eigen antwoorden — dezelfde categorie als `nutrition-verhouding.ts`,
 * en geen inname-claim tegenover een richtlijn.
 */

import {
  NUTRIENT_SIGNAL_SOURCES,
  signalsFor,
  type NutritionSelfReport,
  type SignalUnit,
  type UnitSignal,
} from "@/lib/nutrition-intake-estimate";
import {
  NUTRIENT_IDS,
  type NutrientId,
} from "@/data/nutrition/intake-reference";

const DAYS_PER_WEEK = 7;

/**
 * Hoeveel we van deze schatting mogen verwachten, 1 (laag) tot 4 (hoog).
 *
 * Zelfde schaal als `NutrientConfidence` in `intake-reference.ts` — daar staat
 * hij handmatig, hier wordt hij gerekend. Waar ze uiteenlopen, is dat een
 * signaal dat de handmatige waarde herijking verdient, niet dat één van beide
 * fout is: de tabel weegt ook dingen mee die deze laag niet ziet (hoe hard de
 * onderliggende richtlijn zelf is, bijvoorbeeld).
 */
export type ContributionConfidence = 1 | 2 | 3 | 4;

/** Wat één bron bijdraagt aan één nutriënt, bij deze gebruiker. */
export interface SourceContribution {
  /** Zelfrapport-veld, sleutel voor UI en events. */
  field: keyof NutritionSelfReport;
  labelNl: string;
  /** Wat de gebruiker antwoordde, in de eenheid van de vraag. */
  value: number | undefined;
  unit: SignalUnit;
  /**
   * Genormaliseerde bijdrage: porties/week × bijdragefactor. Dimensieloos en
   * alleen onderling vergelijkbaar binnen hetzelfde nutriënt — nooit tonen als
   * getal, alleen als rangorde of aandeel.
   */
  weighted: number;
  /**
   * Aandeel van deze bron in het totaal van dit nutriënt, 0–1.
   *
   * Dit is een verhouding tussen je eigen antwoorden, geen fractie van een
   * richtlijn: `share: 0.6` betekent "van wat jij aan magnesiumbronnen noemde,
   * komt 60% uit deze", niet "je haalt 60% van je ADH".
   */
  share: number;
  /** True als de gebruiker deze vraag niet beantwoordde. */
  missing: boolean;
}

/** Het bijdragebeeld van één nutriënt. */
export interface NutrientContribution {
  nutrient: NutrientId;
  /** Aflopend op `weighted`; onbeantwoorde bronnen achteraan op 0. */
  sources: readonly SourceContribution[];
  /** De sterkste bron, of null als de gebruiker er geen enkele beantwoordde. */
  leading: SourceContribution | null;
  /**
   * Hoeveel van het bijdragegewicht van dit nutriënt daadwerkelijk gemeten is.
   *
   * 1 = elke bron die dit nutriënt draagt is beantwoord; 0 = geen enkele. Dit
   * is de dekkingsgraad van het instrument voor deze stof, los van wat de
   * antwoorden zeggen.
   */
  coverage: number;
  confidence: ContributionConfidence;
  /** Waarom die zekerheid, in één zin. Nooit statustaal. */
  confidenceWhy: string;
}

/** Normaliseer naar porties per week; undefined blijft undefined. */
function toWeekly(signal: UnitSignal): number | undefined {
  const { value, unit } = signal;
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return unit === "perDay" ? value * DAYS_PER_WEEK : value;
}

/**
 * Bereken het bijdragebeeld voor één nutriënt.
 *
 * @param nutrient - De stof.
 * @param report - Het zelfrapport (F0: raw_inputs).
 * @param _referenceDate - Nog niet gebruikt: welke bron een stof draagt hangt
 *   niet van het seizoen af, alleen de bandgrens doet dat (de winter-drempel
 *   voor vitamine D in `intake-reference.ts`). De parameter staat er zodat
 *   deze functie dezelfde signatuur houdt als `estimateNutritionIntake` en
 *   aanroepers de datum niet hoeven weg te laten — en zodat een toekomstige
 *   seizoensafhankelijke bron hem kan gebruiken zonder call-site-wijziging.
 */
export function contributionFor(
  nutrient: NutrientId,
  report: NutritionSelfReport,
  _referenceDate: Date = new Date(),
): NutrientContribution {
  const signals = signalsFor(nutrient, report);

  const sources: SourceContribution[] = signals.map((signal) => {
    const weekly = toWeekly(signal);
    return {
      field: signal.field,
      labelNl: signal.labelNl,
      value: signal.value,
      unit: signal.unit,
      weighted: weekly === undefined ? 0 : weekly * signal.weight,
      share: 0,
      missing: weekly === undefined,
    };
  });

  const total = sources.reduce((sum, source) => sum + source.weighted, 0);
  for (const source of sources) {
    source.share = total > 0 ? source.weighted / total : 0;
  }

  // Aflopend op bijdrage; bij gelijke bijdrage blijft de tabelvolgorde staan
  // (Array.prototype.sort is stabiel), en die zet de bron waarop de drempel
  // geijkt is vooraan.
  sources.sort((a, b) => b.weighted - a.weighted);

  const leading =
    sources.length > 0 && sources[0].weighted > 0 ? sources[0] : null;

  const coverage = coverageFor(nutrient, report);
  const { confidence, confidenceWhy } = confidenceFrom(nutrient, coverage, leading);

  return { nutrient, sources, leading, coverage, confidence, confidenceWhy };
}

/** Het bijdragebeeld voor alle vijf nutriënten. */
export function contributionProfile(
  report: NutritionSelfReport,
  referenceDate: Date = new Date(),
): NutrientContribution[] {
  return NUTRIENT_IDS.map((id) => contributionFor(id, report, referenceDate));
}

/**
 * Welk deel van het bijdragegewicht van dit nutriënt beantwoord is.
 *
 * Gewogen en niet geteld: een nutriënt waarvan de sterkste bron ontbreekt maar
 * de zwakste beantwoord is, is slechter gedekt dan andersom — ook al is in
 * beide gevallen één van de twee vragen ingevuld.
 */
export function coverageFor(
  nutrient: NutrientId,
  report: NutritionSelfReport,
): number {
  const sources = NUTRIENT_SIGNAL_SOURCES[nutrient];
  const totalWeight = sources.reduce((sum, source) => sum + source.weight, 0);
  if (totalWeight === 0) return 0;

  const answered = sources.reduce((sum, source) => {
    const value = report[source.field];
    const isAnswered =
      value !== undefined && Number.isFinite(value) && value >= 0;
    return isAnswered ? sum + source.weight : sum;
  }, 0);

  return answered / totalWeight;
}

/**
 * Leid het vertrouwen af uit de dekking en uit welke bron de band draagt.
 *
 * Twee dingen verlagen het:
 *
 * 1. **Onvolledige dekking** — bronnen die dit nutriënt dragen zijn niet
 *    beantwoord. Dan is de band gebaseerd op een deel van het verhaal.
 * 2. **Een proxy als drager** — de sterkste bron is niet de bron waarop de
 *    drempel geijkt is (weight 1), maar een zwakkere. Dan komt de band uit een
 *    omrekening in plaats van uit een directe meting, en die omrekening is
 *    precies waar de onzekerheid zit.
 *
 * Vitamine D is de uitzondering die apart genoemd wordt: die band komt uit een
 * zonlichtvraag, en hoe vaak iemand buiten komt zegt weinig over hoeveel er
 * werkelijk wordt aangemaakt — duur, tijdstip en huidtype doen daar meer.
 * Volledige dekking maakt die schatting niet zekerder.
 */
function confidenceFrom(
  nutrient: NutrientId,
  coverage: number,
  leading: SourceContribution | null,
): { confidence: ContributionConfidence; confidenceWhy: string } {
  if (leading === null) {
    return {
      confidence: 1,
      confidenceWhy:
        "Je hebt geen van de vragen beantwoord die deze stof in beeld brengen.",
    };
  }

  // De bron waarop de drempel geijkt is, staat in de tabel op weight 1.
  const calibrated = NUTRIENT_SIGNAL_SOURCES[nutrient].find(
    (source) => source.weight === 1,
  );
  const leadingIsCalibrated = calibrated?.field === leading.field;

  if (nutrient === "vitamin_d") {
    return {
      confidence: 1,
      confidenceWhy:
        "Je band komt uit hoe vaak je buiten bent, en aanmaak hangt vooral af van duur, tijdstip en seizoen — die vraag kan dat niet zien.",
    };
  }

  if (coverage < 0.5) {
    return {
      confidence: 1,
      confidenceWhy:
        "De sterkste bronnen voor deze stof staan niet in je antwoorden, dus deze schatting rust op een klein deel van het verhaal.",
    };
  }

  if (!leadingIsCalibrated) {
    return {
      confidence: 2,
      confidenceWhy: `Je band leunt op ${leading.labelNl.toLowerCase()}, en die is omgerekend naar de vraag waar de drempel op geijkt is — dat is een schatting bovenop een schatting.`,
    };
  }

  if (coverage < 1) {
    return {
      confidence: 3,
      confidenceWhy:
        "De bron waar de drempel op geijkt is heb je beantwoord; een deel van de andere bronnen niet.",
    };
  }

  return {
    confidence: 4,
    confidenceWhy:
      "Je hebt elke bron beantwoord die deze stof draagt, en de drempel is geijkt op precies die vraag.",
  };
}
