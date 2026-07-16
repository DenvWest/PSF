import type { QuestionId, SymptomId } from "@/data/intake-questions";
import { NUT_PROT_UNKNOWN } from "@/data/intake-questions";
import { isComparisonAllowed } from "@/lib/comparison-availability";
import { COMPARISON_PATHS } from "@/lib/comparison-paths";
import { isRulesVersionBefore } from "@/lib/rules-version";

/**
 * Changelog — bump bij ELKE wijziging in beslis-/adviesregels; voeg één regel toe.
 * 1.0.0 — initiële regelset
 * 1.1.0 — recovery_score alleen RCV_PHYS; urgentie/priority op interventiedomeinen
 * 1.2.0 — vitaliteit = 4 interventiedomeinen; profiellabel driver-based
 * 1.3.0 — verbinding als 5e interventiedomein (CON_SOC); vitaliteit = 5 interventiedomeinen
 * 1.3.1 — creatine_signal recoveryPrimary vereist movementLoad >= 2
 * 1.4.0 — item-herskalering (waarde−1)/(max−1)×100, domein=gemiddelde; NUT_PROT onbekend=0;
 *           CON_SOC kwaliteit-first; NRG_DEP compensatie-construct; movement-label Overtrainer;
 *           urgentie-drempels <30/<50/<60 behouden (empirische herijking deferred tot N≥~100)
 */
export const RULES_VERSION = "1.4.0" as const;

export interface DomainScores {
  sleep_score: number;
  energy_score: number;
  stress_score: number;
  nutrition_score: number;
  movement_score: number;
  recovery_score: number;
  connection_score: number;
}

/** Pre-1.3.0 stored sessions may lack connection_score in domain_scores JSON. */
export function hydrateDomainScores(scores: DomainScores): DomainScores {
  const connection = scores.connection_score;
  if (typeof connection === "number" && Number.isFinite(connection)) {
    return scores;
  }
  return { ...scores, connection_score: 0 };
}

export type DomainId =
  | "sleep"
  | "energy"
  | "stress"
  | "nutrition"
  | "movement"
  | "recovery"
  | "connection";

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
    | "Overtrainer"
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

interface RankedQuickWin {
  priority: number;
  text: string;
  domain: DomainScoreKey;
}

interface RankedSupplementEntry {
  priority: number;
  value: SupplementAdvice;
  domain: DomainScoreKey;
}

interface RankedItem<T> {
  priority: number;
  value: T;
}

export const QUICK_WIN_FALLBACK_BY_DOMAIN: Record<DomainScoreKey, string> = {
  sleep_score: "Kies een vaste bedtijd en houd die drie nachten aan.",
  stress_score: "Eén ding: pak je telefoon pas op na je eerste koffie. Morgen beginnen.",
  energy_score: "Start de dag met een eiwitrijk moment vóór extra cafeïne.",
  nutrition_score: "Voeg bij je volgende maaltijd een eiwitbron toe — ei, kwark, of vis.",
  movement_score: "10 minuten daglicht vóór 10:00 — buiten, zonder telefoon.",
  recovery_score: "Vandaag geen training. Je lichaam bouwt alleen tijdens herstel.",
  connection_score:
    "Plan deze week één betekenisvol contact — kort bellen of samen iets doen telt.",
};

function inferSupplementDomain(advice: SupplementAdvice): DomainScoreKey {
  if (advice.link.includes("magnesium")) {
    return "sleep_score";
  }
  if (advice.link.includes("omega-3")) {
    return "nutrition_score";
  }
  if (advice.link.includes("vitamine-d")) {
    return "nutrition_score";
  }
  return "nutrition_score";
}

function pickStrongestQuickWinFromOtherDomain(
  scores: DomainScores,
  excludeDomain: DomainScoreKey,
): RankedQuickWin | null {
  const sorted = getSortedDomains(scores);
  for (const entry of sorted) {
    if (entry.key === excludeDomain) {
      continue;
    }
    return {
      priority: 1,
      text: QUICK_WIN_FALLBACK_BY_DOMAIN[entry.key],
      domain: entry.key,
    };
  }
  return null;
}

function enforceCrossDomainBalance(
  quickWins: RankedQuickWin[],
  supplements: RankedSupplementEntry[],
  scores: DomainScores,
): RankedQuickWin[] {
  if (supplements.length === 0) {
    return quickWins;
  }
  const topSupplement = [...supplements].sort(
    (left, right) => left.priority - right.priority,
  )[0];
  const supplementDomain = topSupplement.domain;
  const hasOtherDomain = quickWins.some(
    (item) => item.domain !== supplementDomain,
  );
  if (hasOtherDomain) {
    return quickWins;
  }
  const fallback = pickStrongestQuickWinFromOtherDomain(scores, supplementDomain);
  if (!fallback) {
    return quickWins;
  }
  return [...quickWins, fallback];
}

interface RawSignals {
  omega3Deficiency: boolean;
  magnesiumSignal: boolean;
  cortisolRisk: boolean;
  recoveryDeficit: boolean;
  energyCrashPattern: boolean;
  lowRecoveryNoLoad: boolean;
  sleepIssueNoStress: boolean;
  energyDipUnexplained: boolean;
}

/** Snake_case signalen voor supplement-triggers (o.a. recommendation-engine). */
export type DeficiencySignals = {
  omega3_deficiency: boolean;
  magnesium_signal: boolean;
  cortisol_risk: boolean;
  creatine_signal: boolean;
  melatonine_signal: boolean;
  /** Lage eiwitinname + trainen of traag herstel — hub/vergelijking, niet supplementroute. */
  protein_gap_signal: boolean;
  /** K1: onderherstel zonder trainingsbelasting. */
  low_recovery_no_load: boolean;
  /** K2: inslaapprobleem terwijl stress beheersbaar lijkt. */
  sleep_issue_no_stress: boolean;
  /** K3: energiedip zonder slaap/voeding-verklaring. */
  energy_dip_unexplained: boolean;
};

export function getDeficiencySignals(
  answers: Record<string, number>,
): DeficiencySignals {
  const scores = calcDomainScores(answers);
  const s = getSignals(answers, scores);
  const stressFrequency = getAnswer(answers, "STR_FREQ");
  const movementLoad = getMovementLoad(answers);
  const rcvPhys = getAnswer(answers, "RCV_PHYS");
  const overtrainerPattern = movementLoad >= 3 && rcvPhys <= 1;
  /** Herstel als laagste domein telt alleen als signaal-tak bij matige+ trainingsbelasting (1.3.1). */
  const recoveryPrimary =
    getSortedDomains(scores)[0].domain === "recovery" && movementLoad >= 2;
  const creatine_signal =
    (scores.recovery_score < 50 && movementLoad >= 3) ||
    recoveryPrimary ||
    overtrainerPattern;
  const sleepOnset = getAnswer(answers, "SLP_ONSET");
  const melatonine_signal = sleepOnset <= 2 && stressFrequency >= 3;
  const proteinRaw = answers.NUT_PROT;
  const proteinIntake =
    typeof proteinRaw === "number" && Number.isFinite(proteinRaw) ? proteinRaw : 0;
  const proteinKnownLow =
    proteinIntake !== NUT_PROT_UNKNOWN && proteinIntake >= 1 && proteinIntake <= 2;
  const protein_gap_signal =
    proteinKnownLow &&
    (movementLoad >= 2 || rcvPhys <= 1 || overtrainerPattern);
  return {
    omega3_deficiency: s.omega3Deficiency,
    magnesium_signal: s.magnesiumSignal,
    cortisol_risk: s.cortisolRisk,
    creatine_signal,
    melatonine_signal,
    protein_gap_signal,
    low_recovery_no_load: s.lowRecoveryNoLoad,
    sleep_issue_no_stress: s.sleepIssueNoStress,
    energy_dip_unexplained: s.energyDipUnexplained,
  };
}

const ENERGY_DRIVER_SCORE_KEYS: ReadonlyArray<{
  domain: Extract<DomainId, "sleep" | "nutrition" | "movement">;
  key: DomainScoreKey;
}> = [
  { domain: "sleep", key: "sleep_score" },
  { domain: "nutrition", key: "nutrition_score" },
  { domain: "movement", key: "movement_score" },
];

function pickLowestEnergyDriverDomain(scores: DomainScores): {
  domain: Extract<DomainId, "sleep" | "nutrition" | "movement">;
  score: number;
} {
  let best = ENERGY_DRIVER_SCORE_KEYS[0];
  for (const candidate of ENERGY_DRIVER_SCORE_KEYS.slice(1)) {
    const candidateScore = scores[candidate.key];
    const bestScore = scores[best.key];
    if (candidateScore < bestScore) {
      best = candidate;
    }
  }
  return { domain: best.domain, score: scores[best.key] };
}

export function isInterventionProfileDomain(
  domain: DomainId,
): domain is Exclude<DomainId, "energy" | "recovery"> {
  return domain !== "energy" && domain !== "recovery";
}

const DOMAIN_SCORE_KEYS: readonly DomainScoreKey[] = [
  "sleep_score",
  "energy_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "recovery_score",
  "connection_score",
];

/** Gedragsdomeinen waarop gestuurd wordt — geen readout (energie/herstel). */
export const INTERVENTION_DOMAIN_SCORE_KEYS: readonly DomainScoreKey[] = [
  "sleep_score",
  "stress_score",
  "nutrition_score",
  "movement_score",
  "connection_score",
] as const;

const DOMAIN_KEY_TO_ID: Record<DomainScoreKey, DomainId> = {
  sleep_score: "sleep",
  energy_score: "energy",
  stress_score: "stress",
  nutrition_score: "nutrition",
  movement_score: "movement",
  recovery_score: "recovery",
  connection_score: "connection",
};

type NamedProfileDomain = Exclude<DomainId, "nutrition" | "recovery" | "connection">;

const NAMED_DOMAIN_LABELS: Record<NamedProfileDomain, ProfileLabel["name"]> = {
  sleep: "Onrustige Slaper",
  energy: "Lage Batterij",
  stress: "Stressdrager",
  movement: "Overtrainer",
};

function firstNonNutritionRecoveryDomain(
  sorted: ReturnType<typeof getSortedDomains>,
  startIndex: number,
): (typeof sorted)[number] | undefined {
  for (let i = startIndex; i < sorted.length; i++) {
    const entry = sorted[i];
    if (
      entry.domain !== "nutrition" &&
      entry.domain !== "recovery" &&
      entry.domain !== "connection"
    ) {
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

function scaleItemScore(value: number, maxOption: number): number | null {
  if (!Number.isFinite(value) || value <= 0 || value > maxOption) {
    return null;
  }
  if (maxOption <= 1) {
    return 100;
  }
  return Math.round(((value - 1) / (maxOption - 1)) * 100);
}

function averageItemScores(items: Array<number | null>): number {
  const scored = items.filter((item): item is number => item !== null);
  if (scored.length === 0) {
    return 0;
  }
  return Math.round(scored.reduce((sum, item) => sum + item, 0) / scored.length);
}

function nutritionProteinItemScore(value: number): number | null {
  if (value === NUT_PROT_UNKNOWN) {
    return null;
  }
  return scaleItemScore(value, 4);
}

function calcDomainScoresLegacy(answers: Record<string, number>): DomainScores {
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
    recovery_score: normalizeScore(getAnswer(answers, "RCV_PHYS"), 3),
    connection_score: normalizeScore(getAnswer(answers, "CON_SOC"), 4),
  };
}

function calcDomainScoresV140(answers: Record<string, number>): DomainScores {
  return {
    sleep_score: averageItemScores([
      scaleItemScore(getAnswer(answers, "SLP_QUAL"), 4),
      scaleItemScore(getAnswer(answers, "SLP_CONS"), 3),
      scaleItemScore(getAnswer(answers, "SLP_ONSET"), 4),
      scaleItemScore(getAnswer(answers, "SLP_WAKE"), 4),
    ]),
    energy_score: averageItemScores([
      scaleItemScore(getAnswer(answers, "NRG_PATN"), 4),
      scaleItemScore(getAnswer(answers, "NRG_DEP"), 4),
    ]),
    stress_score: averageItemScores([
      scaleItemScore(getAnswer(answers, "STR_FREQ"), 4),
      scaleItemScore(getStressRecoveryAnswer(answers), 4),
    ]),
    nutrition_score: averageItemScores([
      scaleItemScore(getAnswer(answers, "NUT_O3"), 3),
      nutritionProteinItemScore(getAnswer(answers, "NUT_PROT")),
    ]),
    movement_score: averageItemScores([
      scaleItemScore(getAnswer(answers, "MOV_STR"), 4),
      scaleItemScore(getAnswer(answers, "MOV_CARD"), 4),
    ]),
    recovery_score: scaleItemScore(getAnswer(answers, "RCV_PHYS"), 3) ?? 0,
    connection_score: scaleItemScore(getAnswer(answers, "CON_SOC"), 4) ?? 0,
  };
}

function getSignals(
  answers: Record<string, number>,
  scores?: DomainScores,
): RawSignals {
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
  const sleepOnset = getAnswer(answers, "SLP_ONSET");
  const resolvedScores = scores ?? calcDomainScores(answers);

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
    lowRecoveryNoLoad:
      resolvedScores.recovery_score < 45 && movementLoad < 2,
    sleepIssueNoStress: sleepOnset <= 2 && stressFrequency >= 3,
    energyDipUnexplained:
      resolvedScores.energy_score < 40 &&
      resolvedScores.sleep_score >= 50 &&
      resolvedScores.nutrition_score >= 50,
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

export function getSortedInterventionDomains(scores: DomainScores): Array<{
  key: DomainScoreKey;
  domain: DomainId;
  score: number;
}> {
  return INTERVENTION_DOMAIN_SCORE_KEYS.map((key) => ({
    key,
    domain: DOMAIN_KEY_TO_ID[key],
    score: scores[key],
  })).sort((left, right) => left.score - right.score);
}

function getInterventionScoreValues(scores: DomainScores): number[] {
  return INTERVENTION_DOMAIN_SCORE_KEYS.map((key) => scores[key]);
}

/** Primaire aandachtsdomein voor advies (kan afwijken van het profiel-label). */
export function getAdvicePrimaryDomain(scores: DomainScores): DomainId {
  // Slaap krijgt bewust voorrang vóór getSortedDomains — ook bij profiel-label.
  if (scores.sleep_score < 40) {
    return "sleep";
  }

  return getSortedInterventionDomains(scores)[0].domain;
}

function pushRankedLongTerm(
  items: RankedItem<string>[],
  value: string,
  priority: number,
): void {
  items.push({ priority, value });
}

function pushRankedText(
  items: RankedQuickWin[],
  value: string,
  priority: number,
  domain: DomainScoreKey,
): void {
  items.push({ priority, text: value, domain });
}

function pushRankedSupplement(
  items: RankedSupplementEntry[],
  value: SupplementAdvice,
  priority: number,
  domain?: DomainScoreKey,
): void {
  items.push({
    priority,
    value,
    domain: domain ?? inferSupplementDomain(value),
  });
}

function uniqueTopQuickWins(items: RankedQuickWin[]): RankedQuickWin[] {
  const seen = new Set<string>();

  return items
    .sort((left, right) => left.priority - right.priority)
    .filter((item) => {
      if (seen.has(item.text)) {
        return false;
      }
      seen.add(item.text);
      return true;
    })
    .slice(0, 3);
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

function supplementAdviceAllowed(advice: SupplementAdvice): boolean {
  if (!advice.link.startsWith("/beste/")) {
    return true;
  }
  const slug = advice.link.replace(/^\/beste\//, "");
  return isComparisonAllowed(slug);
}

function uniqueTopSupplements(
  items: RankedSupplementEntry[],
): SupplementAdvice[] {
  const seen = new Set<string>();

  return items
    .sort((left, right) => left.priority - right.priority)
    .map((item) => item.value)
    .filter((value) => {
      if (!supplementAdviceAllowed(value)) {
        return false;
      }
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
  rulesVersion: string = RULES_VERSION,
): DomainScores {
  if (isRulesVersionBefore(rulesVersion, "1.4.0")) {
    return calcDomainScoresLegacy(answers);
  }
  return calcDomainScoresV140(answers);
}

export function getUrgency(scores: DomainScores): UrgencyResult {
  const values = getInterventionScoreValues(scores);
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

  if (scores.movement_score < 35) {
    return {
      name: "Overtrainer",
      domain: "movement",
      score: scores.movement_score,
    };
  }

  if (scores.energy_score < 40) {
    const driver = pickLowestEnergyDriverDomain(scores);
    return {
      name: "Lage Batterij",
      domain: driver.domain,
      score: driver.score,
    };
  }

  const sorted = getSortedInterventionDomains(scores);
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

  if (primary.domain === "connection") {
    return {
      name: "In Balans",
      domain: "connection",
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
      if (
        entry.domain === "nutrition" ||
        entry.domain === "recovery" ||
        entry.domain === "connection"
      ) {
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
  const quickWins: RankedQuickWin[] = [];
  const supplements: RankedSupplementEntry[] = [];
  const longTerm: RankedItem<string>[] = [];
  const selectedSymptoms = new Set(symptoms);
  const signals = getSignals(answers, scores);
  const movementLoad = getMovementLoad(answers);
  const physicalRecovery = getAnswer(answers, "RCV_PHYS");
  const lifAlc = getAnswer(answers, "LIF_ALC");
  const lifSun = getAnswer(answers, "LIF_SUN");
  const weakestDomain = getSortedInterventionDomains(scores)[0];
  const nutritionScoreLow =
    weakestDomain.domain === "nutrition" && weakestDomain.score <= 60;

  if (nutritionScoreLow) {
    pushRankedLongTerm(
      longTerm,
      "Twijfel je of je voeding voldoende vitamines en mineralen levert? Vraag bij aanhoudende klachten je huisarts om bloedonderzoek — zekerheid haal je bij de arts, niet uit een vragenlijst.",
      1,
    );
  }

  if (scores.sleep_score < 50 && scores.stress_score < 50) {
    pushRankedText(
      quickWins,
      "Begin met 5 minuten ademhalingsoefening voor het slapen.",
      5,
      "sleep_score",
    );
    pushRankedText(
      quickWins,
      "Voeg dagelijks bladgroenten, noten of peulvruchten toe — magnesium uit voeding gaat vóór supplement.",
      6,
      "nutrition_score",
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Na ritme en voeding: magnesium draagt bij tot normale psychologische functie, tot de normale werking van het zenuwstelsel en tot vermindering van vermoeidheid.",
        link: COMPARISON_PATHS.magnesium,
      },
      10,
      "sleep_score",
    );
    pushRankedLongTerm(
      longTerm,
      "Koppel een vast slaapritme aan een korte ademhalingsroutine in de avond.",
      5,
    );
  }

  if (signals.lowRecoveryNoLoad) {
    pushRankedText(
      quickWins,
      "Meer trainen is nu niet de oplossing — je lichaam vraagt om rust en slaap, niet extra volume.",
      2,
      "recovery_score",
    );
    pushRankedText(
      quickWins,
      "Plan vanavond een vaste bedtijd en houd die drie nachten aan — herstel begint bij slaap, niet bij extra sessies.",
      3,
      "sleep_score",
    );
    pushRankedText(
      quickWins,
      "Neem vandaag 5 minuten voor rustige uitademing vóór je je telefoon pakt — dat helpt je systeem landen.",
      4,
      "stress_score",
    );
  }

  if (signals.sleepIssueNoStress) {
    pushRankedText(
      quickWins,
      "Kies een vaste bedtijd en dim het licht een uur van tevoren — geen stressprotocol nodig, wel ritme.",
      3,
      "sleep_score",
    );
    pushRankedText(
      quickWins,
      "Schermen weg 60 min voor bed. Je brein heeft dat signaal nodig om af te schakelen.",
      4,
      "sleep_score",
    );
    pushRankedText(
      quickWins,
      "Voeg dagelijks bladgroenten, noten of peulvruchten toe — magnesium uit voeding eerst.",
      5,
      "nutrition_score",
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Na ritme, licht en voeding: magnesium draagt bij tot normale psychologische functie en vermindering van vermoeidheid.",
        link: COMPARISON_PATHS.magnesium,
      },
      10,
      "sleep_score",
    );
    pushRankedText(
      quickWins,
      "Bij vooral inslaapproblemen: eerst ritme en licht. Informatie over melatonine (geen productvergelijking) staat in de supplementgids.",
      5,
      "sleep_score",
    );
  }

  if (signals.energyDipUnexplained) {
    pushRankedText(
      quickWins,
      "15 minuten wandelen na de lunch — daglicht en beweging vóór je aan supplementen denkt.",
      3,
      "movement_score",
    );
    pushRankedText(
      quickWins,
      "10 minuten buiten vóór 10:00. Daglicht reset je ritme en helpt vaak meer dan een extra kop koffie.",
      4,
      "movement_score",
    );
  }

  if (lifAlc <= 2) {
    pushRankedText(
      quickWins,
      "Plan 2–3 avonden per week zonder alcohol — je slaap en ochtendenergie profiteren daar vaak direct van.",
      6,
      "sleep_score",
    );
  }

  // Tijdelijk: lifSun <= 2 kan ook supplementeerders raken tot takesSupplements
  // (Fase 1, stap "Lichaam & risico") die trigger uitsluit.
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
      "nutrition_score",
    );
  }

  const proteinIntake = getAnswer(answers, "NUT_PROT");
  if (proteinIntake <= 2) {
    pushRankedText(
      quickWins,
      "Begin elke maaltijd eiwitrijk. Denk aan zuivel, eieren, vis, peulvruchten of vegetarisch.",
      2,
      "nutrition_score",
    );
  }

  if (scores.energy_score < 40 && scores.nutrition_score < 50) {
    pushRankedText(
      quickWins,
      "Start de dag met een eiwitrijk ontbijt, nog voor extra cafeine.",
      15,
      "energy_score",
    );
    pushRankedLongTerm(
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
      "nutrition_score",
    );
    pushRankedLongTerm(
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
      "recovery_score",
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
      "recovery_score",
    );
    pushRankedLongTerm(
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
      "stress_score",
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
      "stress_score",
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
      "nutrition_score",
    );
    pushRankedLongTerm(
      longTerm,
      "Breng eerst ritme terug in je dag: vaste slaaptijden, minder avondprikkels en geplande pauzes.",
      2,
    );
  }

  if (signals.magnesiumSignal && !signals.cortisolRisk) {
    pushRankedText(
      quickWins,
      "Voeg dagelijks bladgroenten, noten of peulvruchten toe aan je maaltijden — check in 1 minuut hoe je voeding eruitziet.",
      5,
      "nutrition_score",
    );
    pushRankedSupplement(
      supplements,
      {
        name: "Magnesium glycinaat",
        reason:
          "Na voeding en ritme: magnesium draagt bij tot normale psychologische functie en vermindering van vermoeidheid.",
        link: COMPARISON_PATHS.magnesium,
      },
      16,
      "sleep_score",
    );
  }

  if (signals.energyCrashPattern && scores.energy_score < 50) {
    pushRankedText(
      quickWins,
      "Schuif cafeine na 14:00 zoveel mogelijk naar nul om je energiedips niet verder te verdiepen.",
      18,
      "energy_score",
    );
  }

  if (signals.recoveryDeficit && scores.recovery_score < 50) {
    pushRankedLongTerm(
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
      "sleep_score",
    );
  }

  if (selectedSymptoms.has("stress")) {
    pushRankedLongTerm(
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
      "movement_score",
    );
  }

  const topQuickWinsRaw = enforceCrossDomainBalance(
    uniqueTopQuickWins(quickWins),
    supplements,
    scores,
  );
  const topQuickWins = topQuickWinsRaw.map((item) => item.text);
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
