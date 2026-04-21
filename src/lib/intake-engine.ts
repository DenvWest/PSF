import type { QuestionId, SymptomId } from "@/data/intake-questions";

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
    | "Basis Mist"
    | "Stilzitter"
    | "Stille Slijter";
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
  ashwagandha_signal: boolean;
  creatine_signal: boolean;
};

export function getDeficiencySignals(
  answers: Record<string, number>,
): DeficiencySignals {
  const s = getSignals(answers);
  const stressFrequency = getAnswer(answers, "STR_FREQ");
  const stressRecovery = getAnswer(answers, "STR_RECV");
  return {
    omega3_deficiency: s.omega3Deficiency,
    magnesium_signal: s.magnesiumSignal,
    cortisol_risk: s.cortisolRisk,
    ashwagandha_signal: stressFrequency <= 2 && stressRecovery <= 2,
    creatine_signal: s.recoveryDeficit,
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

const PROFILE_NAMES: Record<DomainId, ProfileLabel["name"]> = {
  sleep: "Onrustige Slaper",
  energy: "Lage Batterij",
  stress: "Stressdrager",
  nutrition: "Basis Mist",
  movement: "Stilzitter",
  recovery: "Stille Slijter",
};

const URGENCY_CONFIG: Record<UrgencyLevel, UrgencyResult> = {
  critical: {
    level: "critical",
    label: "Urgente aandacht nodig",
    color: "#C0392B",
  },
  moderate: {
    level: "moderate",
    label: "Ruimte voor verbetering",
    color: "#C4873B",
  },
  mild: {
    level: "mild",
    label: "Fijn te optimaliseren",
    color: "#5A8F6A",
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

function normalizeScore(total: number, max: number): number {
  return Math.round((total / max) * 100);
}

function getSignals(answers: Record<string, number>): RawSignals {
  const omega3Intake = getAnswer(answers, "NUT_O3");
  const sleepQuality = getAnswer(answers, "SLP_QUAL");
  const sleepConsistency = getAnswer(answers, "SLP_CONS");
  const stressFrequency = getAnswer(answers, "STR_FREQ");
  const stressRecovery = getAnswer(answers, "STR_RECV");
  const physicalRecovery = getAnswer(answers, "RCV_PHYS");
  const movementFrequency = getAnswer(answers, "MOV_FREQ");
  const energyPattern = getAnswer(answers, "NRG_PATN");
  const energyDependency = getAnswer(answers, "NRG_DEP");

  return {
    omega3Deficiency: omega3Intake <= 1,
    magnesiumSignal: sleepQuality <= 2 && stressRecovery <= 2,
    cortisolRisk:
      stressFrequency <= 2 &&
      sleepConsistency <= 1 &&
      energyPattern <= 2,
    recoveryDeficit: physicalRecovery <= 1 && movementFrequency >= 3,
    energyCrashPattern: energyPattern <= 2 && energyDependency <= 2,
  };
}

function getSortedDomains(scores: DomainScores): Array<{
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
      getAnswer(answers, "SLP_QUAL") + getAnswer(answers, "SLP_CONS"),
      7,
    ),
    energy_score: normalizeScore(
      getAnswer(answers, "NRG_PATN") + getAnswer(answers, "NRG_DEP"),
      8,
    ),
    stress_score: normalizeScore(
      getAnswer(answers, "STR_FREQ") + getAnswer(answers, "STR_RECV"),
      8,
    ),
    nutrition_score: normalizeScore(
      getAnswer(answers, "NUT_QUAL") + getAnswer(answers, "NUT_O3"),
      7,
    ),
    movement_score: normalizeScore(
      getAnswer(answers, "MOV_FREQ") + getAnswer(answers, "MOV_DAILY"),
      7,
    ),
    recovery_score: normalizeScore(
      getAnswer(answers, "RCV_PHYS") + getAnswer(answers, "RCV_MENT"),
      6,
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
  const primary = getSortedDomains(scores)[0];

  return {
    name: PROFILE_NAMES[primary.domain],
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
  const movementFrequency = getAnswer(answers, "MOV_FREQ");
  const physicalRecovery = getAnswer(answers, "RCV_PHYS");

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
          "Je slaap en stress staan beide onder druk. Magnesium glycinaat ondersteunt ontspanning en nachtrust.",
        link: "/magnesium-vergelijken",
      },
      10,
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Ashwagandha",
        reason:
          "Bij een stress-slaapspiraal kan ashwagandha helpen om stressbelasting en avondlijke onrust te verlagen.",
        link: "/blog/ashwagandha-werking-mannen",
      },
      11,
    );
    pushRankedText(
      longTerm,
      "Koppel een vast slaapritme aan een korte ademhalingsroutine in de avond.",
      5,
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
          "Je eet zelden vette vis. Daarom is omega-3 een brede basisaanvulling voor hart, hersenen en ontstekingsbalans.",
        link: "/omega-3-vergelijken",
      },
      20,
    );
    pushRankedText(
      longTerm,
      "Werk toe naar 1-2 vaste momenten per week met vette vis of houd omega-3 suppletie structureel aan.",
      20,
    );
  }

  if (movementFrequency >= 3 && physicalRecovery <= 1) {
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
          "Bij veel training en traag herstel kan magnesium helpen bij ontspanning, spierfunctie en herstel.",
        link: "/magnesium-vergelijken",
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
        name: "Ashwagandha",
        reason:
          "Je antwoorden wijzen op verhoogde stressbelasting met ontregeld ritme. Ashwagandha past dan als eerste ondersteuning.",
        link: "/blog/ashwagandha-werking-mannen",
      },
      4,
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Bij cortisolrisico ondersteunt magnesium ontspanning, slaapkwaliteit en herstel van het zenuwstelsel.",
        link: "/magnesium-vergelijken",
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
          "Je antwoorden laten een combinatie van onrustige slaap en moeizaam stressherstel zien, een klassiek magnesiumsignaal.",
        link: "/magnesium-vergelijken",
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
