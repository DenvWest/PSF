import type { QuestionId, SymptomId } from "@/data/intake-questions";
import { COMPARISON_PATHS } from "@/lib/comparison-paths";

export interface DomainScores {
  sleep_score: number;
  energy_score: number;
  stress_score: number;
  nutrition_score: number;
  movement_score: number;
  recovery_score: number;
}

export type DomainId =
  | "sleep"
  | "energy"
  | "stress"
  | "nutrition"
  | "movement"
  | "recovery";

export type DomainScoreKey = keyof DomainScores;

export type UrgencyLevel = "critical" | "moderate" | "mild" | "healthy";

export interface UrgencyResult {
  level: UrgencyLevel;
  label: string;
  color: string;
}

export interface ProfileLabel {
  name:
    | "Onrustige Slaper"
    | "Lage Batterij"
    | "Stressdrager"
    | "In Balans";
  domain: DomainId;
  score: number;
}

export interface SupplementAdvice {
  name: string;
  reason: string;
  link: string;
}

export interface AdviceResult {
  quickWins: string[];
  supplements: SupplementAdvice[];
  longTerm: string[];
}

interface RankedItem<T> {
  priority: number;
  value: T;
}

interface RawSignals {
  omega3Deficiency: boolean;
  magnesiumSignal: boolean;
  cortisolRisk: boolean;
  recoveryDeficit: boolean;
  energyCrashPattern: boolean;
}

/** Snake_case signalen voor supplement-triggers (o.a. `getSupplementRoute`). */
export type DeficiencySignals = {
  omega3_deficiency: boolean;
  magnesium_signal: boolean;
  cortisol_risk: boolean;
  creatine_signal: boolean;
  melatonine_signal: boolean;
  /** Lage eiwitinname + trainen of traag herstel — hub/vergelijking, niet supplementroute. */
  protein_gap_signal: boolean;
};

export function getDeficiencySignals(
  answers: Record<string, number>,
): DeficiencySignals {
  const s = getSignals(answers);
  const stressFrequency = getAnswer(answers, "STR_FREQ");
  const scores = calcDomainScores(answers);
  const movementLoad = getMovementLoad(answers);
  const rcvPhys = getAnswer(answers, "RCV_PHYS");
  const overtrainerPattern = movementLoad >= 3 && rcvPhys <= 1;
  const recoveryPrimary = getSortedDomains(scores)[0].domain === "recovery";
  const creatine_signal =
    (scores.recovery_score < 50 && movementLoad >= 3) ||
    recoveryPrimary ||
    overtrainerPattern;
  const sleepOnset = getAnswer(answers, "SLP_ONSET");
  const melatonine_signal = sleepOnset <= 2 && stressFrequency >= 3;
  const proteinIntake = getAnswer(answers, "NUT_PROT");
  const protein_gap_signal =
    proteinIntake <= 2 &&
    (movementLoad >= 2 || rcvPhys <= 1 || overtrainerPattern);
  return {
    omega3_deficiency: s.omega3Deficiency,
    magnesium_signal: s.magnesiumSignal,
    cortisol_risk: s.cortisolRisk,
    creatine_signal,
    melatonine_signal,
    protein_gap_signal,
  };
}

const DOMAIN_SCORE_KEYS: readonly DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
];

const DOMAIN_KEY_TO_ID: Record<DomainScoreKey, DomainId> = {
  sleep_score: "sleep",
  energy_score: "energy",
  stress_score: "stress",
  nutrition_score: "nutrition",
  movement_score: "movement",
  recovery_score: "recovery",
};

type NamedProfileDomain = Exclude<DomainId, "nutrition" | "recovery">;

const NAMED_DOMAIN_LABELS: Record<NamedProfileDomain, ProfileLabel["name"]> = {
  sleep: "Onrustige Slaper",
  energy: "Lage Batterij",
  stress: "Stressdrager",
  movement: "Lage Batterij",
};

function firstNonNutritionRecoveryDomain(
  sorted: ReturnType<typeof getSortedDomains>,
  startIndex: number,
): (typeof sorted)[number] | undefined {
  for (let i = startIndex; i < sorted.length; i++) {
    const entry = sorted[i];
    if (entry.domain !== "nutrition" && entry.domain !== "recovery") {
      return entry;
    }
  }
  return undefined;
}

const URGENCY_CONFIG: Record<UrgencyLevel, UrgencyResult> = {
  critical: {
    level: "critical",
    label: "Meerdere domeinen vragen aandacht",
    color: "#C0392B",
  },
  moderate: {
    level: "moderate",
    label: "Een of twee domeinen vragen aandacht",
    color: "#C4873B",
  },
  mild: {
    level: "mild",
    label: "Lichte aandachtspunten",
    color: "var(--ps-green)",
  },
  healthy: {
    level: "healthy",
    label: "Sterke basis",
    color: "#3A7D5C",
  },
};

function getAnswer(answers: Record<string, number>, id: QuestionId): number {
  const value = answers[id];
  return typeof value === "number" ? value : 0;
}

/** Stressherstel / herstelmomenten (STR_RCV; legacy STR_RECV / RCV_MENT). */
function getStressRecoveryAnswer(answers: Record<string, number>): number {
  if (answers.STR_RCV != null) {
    return getAnswer(answers, "STR_RCV");
  }
  if (answers.STR_RECV != null) {
    return answers.STR_RECV;
  }
  if (answers.RCV_MENT != null) {
    return answers.RCV_MENT;
  }
  return 0;
}

/** Hoogste trainingsbelasting uit kracht- en cardiofrequentie (1–4). */
function getMovementLoad(answers: Record<string, number>): number {
  return Math.max(
    getAnswer(answers, "MOV_CARD"),
    getAnswer(answers, "MOV_STR"),
  );
}

function normalizeScore(total: number, max: number): number {
  return Math.round((total / max) * 100);
}

function getSignals(answers: Record<string, number>): RawSignals {
  const omega3Intake = getAnswer(answers, "NUT_O3");
  const sleepQuality = getAnswer(answers, "SLP_QUAL");
  const sleepConsistency = getAnswer(answers, "SLP_CONS");
  const stressFrequency = getAnswer(answers, "STR_FREQ");
  const stressRecovery = getStressRecoveryAnswer(answers);
  const physicalRecovery = getAnswer(answers, "RCV_PHYS");
  const movementLoad = getMovementLoad(answers);
  const sleepWake = getAnswer(answers, "SLP_WAKE");
  const energyPattern = getAnswer(answers, "NRG_PATN");
  const energyDependency = getAnswer(answers, "NRG_DEP");

  return {
    omega3Deficiency: omega3Intake <= 1,
    magnesiumSignal:
      sleepWake <= 2 || (sleepQuality <= 2 && stressRecovery <= 2),
    cortisolRisk:
      stressFrequency <= 2 &&
      sleepConsistency <= 1 &&
      energyPattern <= 2,
    recoveryDeficit: physicalRecovery <= 1 && movementLoad >= 3,
    energyCrashPattern: energyPattern <= 2 && energyDependency <= 2,
  };
}

export function getSortedDomains(scores: DomainScores): Array<{
  key: DomainScoreKey;
  domain: DomainId;
  score: number;
}> {
  return DOMAIN_SCORE_KEYS.map((key) => ({
    key,
    domain: DOMAIN_KEY_TO_ID[key],
    score: scores[key],
  })).sort((left, right) => left.score - right.score);
}

/** Primaire aandachtsdomein voor advies (kan afwijken van het profiel-label). */
export function getAdvicePrimaryDomain(scores: DomainScores): DomainId {
  // Slaap krijgt bewust voorrang vóór getSortedDomains — ook bij profiel-label.
  if (scores.sleep_score < 40) {
    return "sleep";
  }

  return getSortedDomains(scores)[0].domain;
}

function pushRankedText(
  items: RankedItem<string>[],
  value: string,
  priority: number,
): void {
  items.push({ priority, value });
}

function pushRankedSupplement(
  items: RankedItem<SupplementAdvice>[],
  value: SupplementAdvice,
  priority: number,
): void {
  items.push({ priority, value });
}

function uniqueTopTexts(items: RankedItem<string>[]): string[] {
  const seen = new Set<string>();

  return items
    .sort((left, right) => left.priority - right.priority)
    .map((item) => item.value)
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }

      seen.add(value);
      return true;
    })
    .slice(0, 3);
}

function uniqueTopSupplements(
  items: RankedItem<SupplementAdvice>[],
): SupplementAdvice[] {
  const seen = new Set<string>();

  return items
    .sort((left, right) => left.priority - right.priority)
    .map((item) => item.value)
    .filter((value) => {
      if (seen.has(value.name)) {
        return false;
      }

      seen.add(value.name);
      return true;
    })
    .slice(0, 3);
}

export function calcDomainScores(
  answers: Record<string, number>,
): DomainScores {
  return {
    sleep_score: normalizeScore(
      getAnswer(answers, "SLP_QUAL") +
        getAnswer(answers, "SLP_CONS") +
        getAnswer(answers, "SLP_ONSET") +
        getAnswer(answers, "SLP_WAKE"),
      15,
    ),
    energy_score: normalizeScore(
      getAnswer(answers, "NRG_PATN") + getAnswer(answers, "NRG_DEP"),
      8,
    ),
    stress_score: normalizeScore(
      getAnswer(answers, "STR_FREQ") + getStressRecoveryAnswer(answers),
      8,
    ),
    nutrition_score: normalizeScore(
      getAnswer(answers, "NUT_O3") + getAnswer(answers, "NUT_PROT"),
      7,
    ),
    movement_score: normalizeScore(
      getAnswer(answers, "MOV_STR") + getAnswer(answers, "MOV_CARD"),
      8,
    ),
    recovery_score: normalizeScore(
      getAnswer(answers, "RCV_PHYS") + getStressRecoveryAnswer(answers),
      7,
    ),
  };
}

export function getUrgency(scores: DomainScores): UrgencyResult {
  const values = Object.values(scores);
  const under30 = values.filter((value) => value < 30).length;
  const under50 = values.filter((value) => value < 50).length;
  const under60 = values.filter((value) => value < 60).length;

  if (under30 >= 2) {
    return URGENCY_CONFIG.critical;
  }

  if (under30 >= 1 || under50 >= 3) {
    return URGENCY_CONFIG.moderate;
  }

  if (values.every((value) => value > 60)) {
    return URGENCY_CONFIG.healthy;
  }

  if (values.every((value) => value > 30) && under60 >= 2) {
    return URGENCY_CONFIG.mild;
  }

  return URGENCY_CONFIG.mild;
}

export function getProfileLabel(scores: DomainScores): ProfileLabel {
  if (scores.sleep_score < 40) {
    return {
      name: "Onrustige Slaper",
      domain: "sleep",
      score: scores.sleep_score,
    };
  }
  if (scores.stress_score < 40) {
    return {
      name: "Stressdrager",
      domain: "stress",
      score: scores.stress_score,
    };
  }

  if (scores.energy_score < 40 || scores.movement_score < 35) {
    const energyLow = scores.energy_score < 40;
    const movementLow = scores.movement_score < 35;
    let domain: DomainId;
    if (energyLow && movementLow) {
      domain =
        scores.energy_score <= scores.movement_score ? "energy" : "movement";
    } else if (energyLow) {
      domain = "energy";
    } else {
      domain = "movement";
    }
    const score =
      domain === "energy" ? scores.energy_score : scores.movement_score;
    return {
      name: "Lage Batterij",
      domain,
      score,
    };
  }

  const sorted = getSortedDomains(scores);
  const primary = sorted[0];

  if (primary.score > 60) {
    return {
      name: "In Balans",
      domain: primary.domain,
      score: primary.score,
    };
  }

  if (primary.domain === "nutrition") {
    return {
      name: "In Balans",
      domain: "nutrition",
      score: primary.score,
    };
  }

  if (primary.domain === "recovery") {
    const fallback = firstNonNutritionRecoveryDomain(sorted, 1);
    if (fallback) {
      return {
        name: NAMED_DOMAIN_LABELS[fallback.domain as NamedProfileDomain],
        domain: fallback.domain,
        score: fallback.score,
      };
    }
    return {
      name: "In Balans",
      domain: "recovery",
      score: primary.score,
    };
  }

  if (primary.domain === "movement") {
    for (let i = 1; i < sorted.length; i++) {
      const entry = sorted[i];
      if (entry.domain === "nutrition" || entry.domain === "recovery") {
        continue;
      }
      if (entry.domain === "energy" && scores.energy_score >= 40) {
        continue;
      }
      return {
        name: NAMED_DOMAIN_LABELS[entry.domain as NamedProfileDomain],
        domain: entry.domain,
        score: entry.score,
      };
    }
    return {
      name: "In Balans",
      domain: "movement",
      score: primary.score,
    };
  }

  return {
    name: NAMED_DOMAIN_LABELS[primary.domain as NamedProfileDomain],
    domain: primary.domain,
    score: primary.score,
  };
}

export function getAdvice(
  scores: DomainScores,
  answers: Record<string, number>,
  symptoms: SymptomId[],
): AdviceResult {
  const quickWins: RankedItem<string>[] = [];
  const supplements: RankedItem<SupplementAdvice>[] = [];
  const longTerm: RankedItem<string>[] = [];
  const selectedSymptoms = new Set(symptoms);
  const primaryDomain = getAdvicePrimaryDomain(scores);
  const signals = getSignals(answers);
  const movementLoad = getMovementLoad(answers);
  const physicalRecovery = getAnswer(answers, "RCV_PHYS");
  const lifAlc = getAnswer(answers, "LIF_ALC");
  const lifSun = getAnswer(answers, "LIF_SUN");
  const weakestDomain = getSortedDomains(scores)[0];
  const nutritionScoreLow =
    weakestDomain.domain === "nutrition" && weakestDomain.score <= 60;

  if (nutritionScoreLow) {
    pushRankedText(
      longTerm,
      "Twijfel je aan tekorten in vitamines of mineralen? Vraag bij aanhoudende klachten je huisarts om bloedonderzoek — zekerheid haal je bij de arts, niet uit een vragenlijst.",
      1,
    );
  }

  if (primaryDomain === "sleep") {
    pushRankedText(
      quickWins,
      "Zet je telefoon om 21:00 op vliegtuigmodus en dim het licht in huis.",
      0,
    );
    pushRankedText(
      longTerm,
      "Bouw een vast slaap-waakritme op, ook in het weekend.",
      0,
    );
  }

  if (scores.sleep_score < 50 && scores.stress_score < 50) {
    pushRankedText(
      quickWins,
      "Begin met 5 minuten ademhalingsoefening voor het slapen.",
      5,
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Je slaap- en stresscores geven samen een signaal; magnesium draagt bij tot normale psychologische functie, tot de normale werking van het zenuwstelsel en tot vermindering van vermoeidheid.",
        link: COMPARISON_PATHS.magnesium,
      },
      10,
    );
    pushRankedText(
      longTerm,
      "Koppel een vast slaapritme aan een korte ademhalingsroutine in de avond.",
      5,
    );
  }

  const slpOnset = getAnswer(answers, "SLP_ONSET");
  const strFreq = getAnswer(answers, "STR_FREQ");
  if (slpOnset <= 2 && strFreq >= 3) {
    pushRankedSupplement(
      supplements,
      {
        name: "Melatonine",
        reason:
          "Je ligt regelmatig lang wakker terwijl stress beheersbaar lijkt. Melatonine kan helpen je slaap-waakritme te herstellen (bij minimaal 1 mg voor het slapen volgens claimvoorwaarden).",
        link: COMPARISON_PATHS.melatonine,
      },
      8,
    );
  }

  if (lifAlc <= 2) {
    pushRankedText(
      quickWins,
      "Plan 2–3 avonden per week zonder alcohol — je slaap en ochtendenergie profiteren daar vaak direct van.",
      6,
    );
  }

  if (lifSun <= 2) {
    pushRankedSupplement(
      supplements,
      {
        name: "Vitamine D",
        reason:
          "Je krijgt weinig zon en geen supplement. Vitamine D draagt bij tot normale botten, spierfunctie en het immuunsysteem — relevant in het Nederlandse klimaat.",
        link: "/supplementen/vitamine-d",
      },
      25,
    );
  }

  const proteinIntake = getAnswer(answers, "NUT_PROT");
  if (proteinIntake <= 2) {
    pushRankedText(
      quickWins,
      "Begin elke maaltijd eiwitrijk. Denk aan zuivel, eieren, vis, peulvruchten of vegetarisch.",
      2,
    );
  }

  if (scores.energy_score < 40 && scores.nutrition_score < 50) {
    pushRankedText(
      quickWins,
      "Start de dag met een eiwitrijk ontbijt, nog voor extra cafeine.",
      15,
    );
    pushRankedText(
      longTerm,
      "Herstel eerst je voedingsbasis met regelmatige, volwaardige maaltijden voordat je energie in supplementen zoekt.",
      15,
    );
  }

  if (signals.omega3Deficiency) {
    pushRankedSupplement(
      supplements,
      {
        name: "Omega-3 (EPA/DHA)",
        reason:
          "Je eet zelden vette vis. EPA en DHA dragen onder meer bij tot normale hartfunctie en DHA tot instandhouding van hersenfunctie (bij voldoende dagdosis volgens claimvoorwaarden).",
        link: COMPARISON_PATHS["omega-3-supplement"],
      },
      20,
    );
    pushRankedText(
      longTerm,
      "Werk toe naar 1-2 vaste momenten per week met vette vis of houd omega-3 suppletie structureel aan.",
      20,
    );
  }

  if (movementLoad >= 3 && physicalRecovery <= 1) {
    pushRankedText(
      quickWins,
      "Je traint hard maar herstelt slecht: plan vandaag een rustdag.",
      12,
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Bij veel training helpt magnesium onder meer bij normale spierfunctie en dragen bij tot vermindering van vermoeidheid.",
        link: COMPARISON_PATHS.magnesium,
      },
      14,
    );
    pushRankedText(
      longTerm,
      "Controleer je eiwitinname en bouw vaste rustdagen in om overbelasting te voorkomen.",
      12,
    );
  }

  if (signals.cortisolRisk) {
    pushRankedText(
      quickWins,
      "Zet stressmanagement deze week boven extra stimulanten of nieuwe supplementroutines.",
      2,
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Magnesium draagt bij tot normale werking van zenuwstelsel en spieren en tot een normale psychologische functie — passend bij dit profiel naast leefstijl.",
        link: COMPARISON_PATHS.magnesium,
      },
      5,
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Vitamine D",
        reason:
          "Vitamine D is hier een aanvullende optie wanneer stress, lage energie en beperkt herstel samenkomen.",
        link: "/supplementen/vitamine-d",
      },
      30,
    );
    pushRankedText(
      longTerm,
      "Breng eerst ritme terug in je dag: vaste slaaptijden, minder avondprikkels en geplande pauzes.",
      2,
    );
  }

  if (signals.magnesiumSignal && !signals.cortisolRisk) {
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Je antwoorden tonen onder andere onrust rond slapen en herstel; magnesium draagt bij tot normale psychologische functie en vermindering van vermoeidheid.",
        link: COMPARISON_PATHS.magnesium,
      },
      16,
    );
  }

  if (signals.energyCrashPattern && scores.energy_score < 50) {
    pushRankedText(
      quickWins,
      "Schuif cafeine na 14:00 zoveel mogelijk naar nul om je energiedips niet verder te verdiepen.",
      18,
    );
  }

  if (signals.recoveryDeficit && scores.recovery_score < 50) {
    pushRankedText(
      longTerm,
      "Neem herstel net zo serieus als training: plan elke week minimaal een volledige rustdag.",
      18,
    );
  }

  if (selectedSymptoms.has("slaap")) {
    pushRankedText(
      quickWins,
      "Houd je slaapkamer vanavond koel, donker en stil.",
      90,
    );
  }

  if (selectedSymptoms.has("stress")) {
    pushRankedText(
      longTerm,
      "Blok vaste herstelmomenten in je agenda voordat je week volloopt.",
      90,
    );
  }

  if (selectedSymptoms.has("energie")) {
    pushRankedText(
      quickWins,
      "Maak na de lunch een wandeling van 10 minuten om je energieniveau te stabiliseren.",
      90,
    );
  }

  const topQuickWins = uniqueTopTexts(quickWins);
  const topSupplements = uniqueTopSupplements(supplements);
  const topLongTerm = uniqueTopTexts(longTerm);

  return {
    quickWins:
      topQuickWins.length > 0
        ? topQuickWins
        : ["Houd je huidige basis vast en bewaak je dagelijkse ritme."],
    supplements: topSupplements,
    longTerm:
      topLongTerm.length > 0
        ? topLongTerm
        : ["Blijf consistent met slaap, voeding, beweging en herstel."],
  };
}
