import { buildNutritionHeadline } from "@/lib/nutrition-conclusion";
import {
  buildNutritionFactRows,
  resolveNutritionFocusLayer,
  resolveNutritionGate,
  resolveNutritionLayerStates,
} from "@/lib/nutrition-ladder";
import { contributionProfile } from "@/lib/nutrition-contribution";
import { nutritionReportFromAnswers } from "@/lib/nutrition-score";
import { buildNutritionSufficiency } from "@/lib/nutrition-sufficiency";
import { buildNutrientRouteStatuses } from "@/lib/nutrition-route-status";
import { isVitaminDLowSunSeason } from "@/lib/nutrition-season";
import { CHECK_LOG, CHECKS, PILLAR } from "@/data/dashboard";
import {
  perfectSupplementMeasurementConfig,
} from "@/data/measurement-config";
import { buildDeltaReport } from "@/lib/delta-report";
import { EMPTY_MOVEMENT_PREFS } from "@/lib/movement-prefs";
import { computeVitaliteit, resolveVitaliteitFacets } from "@/lib/vitaliteit";
import { RULES_VERSION } from "@/lib/intake-engine";
import type {
  Check,
  CheckId,
  CheckLogEntry,
  CheckScores,
  CheckSnapshot,
  CheckTrend,
  DashboardData,
  DomainMeasurement,
  PillarId,
} from "@/types/dashboard";
import type { DomainScores } from "@/lib/intake-engine";
import type { StoredSupplementVerdict, VerdictEvidence } from "@/types/verdict";

const DEV_INTAKE_ANSWERS: Record<string, number> = {
  SLP_QUAL: 3,
  SLP_CONS: 2,
  SLP_ONSET: 3,
  SLP_WAKE: 3,
  NRG_PATN: 3,
  NRG_DEP: 4,
  STR_FREQ: 2,
  STR_RCV: 2,
  NUT_O3: 1,
  NUT_PROT: 2,
  MOV_STR: 4,
  MOV_CARD: 4,
  RCV_PHYS: 2,
  CON_SOC: 2,
  LIF_ALC: 4,
  LIF_SUN: 3,
};

function devAnswersForCheck(checkId: "check1" | "check2"): Record<string, number> {
  if (checkId === "check1") {
    return DEV_INTAKE_ANSWERS;
  }
  return {
    ...DEV_INTAKE_ANSWERS,
    SLP_QUAL: 2,
    SLP_ONSET: 2,
    NUT_PROT: 3,
    NUT_O3: 2,
  };
}

/**
 * Voedingslog + oordelen voor de dev-staat. Zonder deze twee blijft de
 * Keuze-tab leeg — de voedingspoort is dicht en er is geen enkel oordeel om te
 * tonen — en dan is precies het scherm dat het aanbod draagt lokaal niet te
 * beoordelen. De set dekt bewust alle vier de tonen: aanvullen, niet nodig,
 * eerst leefstijl en een oordeel zonder bewaarde snapshot.
 */
const DEV_NUTRITION_INTAKE: DashboardData["nutritionIntake"] = {
  date: "2026-07-18",
  items: [
    { label: "Eiwit", band: "below", nutrient: "protein" },
    { label: "Omega-3", band: "below", nutrient: "omega3" },
    { label: "Magnesium", band: "around", nutrient: "magnesium" },
    { label: "Vitamine D", band: "below", nutrient: "vitamin_d" },
    { label: "Zink", band: "meets", nutrient: "zinc" },
  ],
};

/**
 * De eetbasis-ladder van de dev-persona, berekend uit antwoorden in plaats van
 * met de hand geschreven: zo loopt de dev-weergave door dezelfde engine als
 * productie en kan een fixture niet stilletjes uit de pas gaan lopen.
 *
 * Deze antwoorden zetten de winst bewust op laag 1 — twee plantporties, weinig
 * volkoren, vis nooit — zodat het scherm zijn drukste toestand toont.
 */
const DEV_NUTRITION_READOUT: DashboardData["nutritionCheckinReadout"] = (() => {
  const report = {
    sliders: {
      vegetables: 2,
      fruit: 4,
      berries: 2,
      nutsSeedsLegumes: 1,
      oilyFish: 0,
      proteinMeals: 2,
      meatLegumes: 1,
      dairy: 1,
      daylight: 2,
      wholegrain: 1,
      sugaryDrinks: 5,
    },
    preference: "none",
    allergies: [] as string[],
  };
  const factRows = buildNutritionFactRows(report);
  const layerStates = resolveNutritionLayerStates(factRows);
  const routes = buildNutrientRouteStatuses(report, {
    isDarkSeason: isVitaminDLowSunSeason(),
  });
  const selfReport = nutritionReportFromAnswers(report.sliders);
  const contribution = contributionProfile(selfReport);
  const personalization = {
    weightKg: 82,
    trainingLoad: 3 as number | undefined,
    proteinTarget: { gramsLow: 95, gramsHigh: 110 },
    ageRange: "45-54",
  };
  const sufficiency = buildNutritionSufficiency({
    intakeItems: DEV_NUTRITION_INTAKE!.items.map((item) => ({
      nutrient: item.nutrient,
      band: item.band,
    })),
    routes,
    contribution,
    personalization,
  });
  layerStates[4] = sufficiency.layerState;
  return {
    date: "2026-07-18",
    headline: buildNutritionHeadline(factRows),
    factRows,
    focusLayer: resolveNutritionFocusLayer(factRows),
    layerStates,
    gate: resolveNutritionGate(factRows),
    routes,
    ladderReport: report,
    sufficiency,
    contribution,
    personalization,
  };
})();

const DEV_VERDICT_EVIDENCE: VerdictEvidence = {
  scores: toDomainScores(CHECKS.check2.scores),
  signals: {
    omega3_deficiency: true,
    magnesium_signal: true,
    cortisol_risk: false,
    creatine_signal: false,
    melatonine_signal: false,
    protein_gap_signal: true,
    low_recovery_no_load: false,
    sleep_issue_no_stress: false,
    energy_dip_unexplained: false,
  },
  profileLabel: "Onrustige Slaper",
  triggeredBy: [{ type: "signal", signal: "magnesium_signal" }],
  nutritionLogCompleted: true,
};

function devVerdict(
  ingredientKey: string,
  verdict: StoredSupplementVerdict["verdict"],
  reasonKey: string,
  basedOn: VerdictEvidence | null = DEV_VERDICT_EVIDENCE,
): StoredSupplementVerdict {
  return {
    id: `dev-${ingredientKey}`,
    ingredientKey,
    verdict,
    reasonKey,
    rulesVersion: RULES_VERSION,
    nextReviewAt: null,
    createdAt: "2026-07-18T09:00:00.000Z",
    supersededAt: null,
    basedOn,
  };
}

const DEV_SUPPLEMENT_VERDICTS: StoredSupplementVerdict[] = [
  devVerdict("magnesium", "kopen", "trigger_matched"),
  devVerdict("omega3", "kopen", "trigger_matched", {
    ...DEV_VERDICT_EVIDENCE,
    triggeredBy: [{ type: "signal", signal: "omega3_deficiency" }],
  }),
  devVerdict("eiwitpoeder", "kopen", "trigger_matched", {
    ...DEV_VERDICT_EVIDENCE,
    triggeredBy: [
      { type: "signal", signal: "protein_gap_signal" },
      { type: "domain_below", domain: "nutrition_score", score: 38, threshold: 50 },
    ],
  }),
  devVerdict("vitamineD", "niet_nodig", "no_trigger_matched", {
    ...DEV_VERDICT_EVIDENCE,
    triggeredBy: [],
  }),
  devVerdict("zink", "niet_nodig", "no_trigger_matched", null),
  devVerdict("creatine", "kopen", "trigger_matched", {
    ...DEV_VERDICT_EVIDENCE,
    triggeredBy: [{ type: "hub_legacy", rule: "creatine_custom_matcher" }],
  }),
  // De enige eerlijke "wacht"-toon die we hebben: ashwagandha staat echt
  // on-hold bij EFSA. Hij hoort bij geen enkel domein-schap, dus hij verschijnt
  // alleen op de surfaces die álle oordelen tonen.
  devVerdict("ashwagandha", "eerst_leefstijl", "claim_on_hold", null),
];

function toDomainScores(scores: CheckScores): DomainScores {
  return {
    sleep_score: scores.slaap,
    energy_score: scores.energie,
    stress_score: scores.stress,
    nutrition_score: scores.voeding,
    movement_score: scores.beweging,
    recovery_score: scores.herstel,
    connection_score: scores.verbinding,
  };
}

function toSnapshot(check: Check): CheckSnapshot {
  return {
    scores: check.scores,
    vitality: computeVitaliteit(resolveVitaliteitFacets(toDomainScores(check.scores))),
    date: check.date,
  };
}

function filterHistory(checkId: CheckId): CheckLogEntry[] {
  const check = CHECKS[checkId];
  return CHECK_LOG.filter((entry) => entry.seq <= check.seq);
}

/**
 * Dev-meetreeks per domein: dezelfde vorm die `account-dashboard` uit
 * `intake_domain_checkin` haalt, zodat Voortgang lokaal een echte reeks toont.
 */
function devMeasurement(
  domain: string,
  dateIso: string,
  dateLabel: string,
  daysAgo: number,
  score: number,
  source: DomainMeasurement["source"],
  values: DomainMeasurement["values"],
): DomainMeasurement {
  return { id: `${domain}-${dateIso}-${source}`, dateIso, dateLabel, daysAgo, score, source, values };
}

function devDomainMeasurements(
  mode: "scored" | "retest",
): DashboardData["domainMeasurements"] {
  const shift = mode === "retest" ? 18 : 0;
  return {
    slaap: [
      devMeasurement("slaap", "2026-06-10", "10 jun 2026", 24 + shift, 52, "intake", []),
      devMeasurement("slaap", "2026-06-24", "24 jun 2026", 10 + shift, 58, "checkin", [
        { key: "bedtijd", label: "Bedtijd", answerLabel: "Rond 23:30", benchmarkLabel: "Vast tijdstip helpt je ritme", level: 2, levelMax: 3, scale: "richtlijn" },
        { key: "inslapen", label: "Inslaaptijd", answerLabel: "20-30 minuten", benchmarkLabel: "Onder 20 min is gangbaar", level: 1, levelMax: 3, scale: "richtlijn" },
        { key: "wakker", label: "Nachtelijk wakker", answerLabel: "1x per nacht", benchmarkLabel: null, level: 2, levelMax: 3, scale: "zelfrapportage" },
      ]),
      devMeasurement("slaap", "2026-07-01", "1 jul 2026", 3 + shift, 63, "checkin", [
        { key: "bedtijd", label: "Bedtijd", answerLabel: "Rond 23:00", benchmarkLabel: "Vast tijdstip helpt je ritme", level: 3, levelMax: 3, scale: "richtlijn" },
        { key: "inslapen", label: "Inslaaptijd", answerLabel: "10-20 minuten", benchmarkLabel: "Onder 20 min is gangbaar", level: 2, levelMax: 3, scale: "richtlijn" },
        { key: "wakker", label: "Nachtelijk wakker", answerLabel: "Zelden", benchmarkLabel: null, level: 3, levelMax: 3, scale: "zelfrapportage" },
      ]),
    ],
    stress: [
      devMeasurement("stress", "2026-06-10", "10 jun 2026", 24 + shift, 44, "intake", []),
      devMeasurement("stress", "2026-06-25", "25 jun 2026", 9 + shift, 49, "checkin", [
        { key: "STR_FREQ", label: "Spanning", answerLabel: "Regelmatig", benchmarkLabel: null, level: 2, levelMax: 4, scale: "zelfrapportage" },
        { key: "STR_RCV", label: "Tot rust komen", answerLabel: "Stress stapelt op of herstel blijft achterwege", benchmarkLabel: null, level: 2, levelMax: 4, scale: "zelfrapportage" },
        { key: "STR_CHARGE", label: "Laatst opgeladen", answerLabel: "Afgelopen week", benchmarkLabel: null, level: 3, levelMax: 4, scale: "zelfrapportage" },
      ]),
    ],
    voeding: [
      devMeasurement("voeding", "2026-06-10", "10 jun 2026", 24 + shift, 55, "intake", []),
      devMeasurement("voeding", "2026-07-04", "4 jul 2026", 0 + shift, 61, "nutrition_log", [
        { key: "vegetables", label: "Magnesiumrijke voeding", answerLabel: "2\u00d7 per dag", benchmarkLabel: null, level: null, levelMax: 1, scale: "zelfrapportage" },
        { key: "oilyFish", label: "Vette vis", answerLabel: "1\u00d7 per week", benchmarkLabel: null, level: null, levelMax: 1, scale: "zelfrapportage" },
        { key: "proteinMeals", label: "Eiwitrijke eetmomenten", answerLabel: "1\u00d7 per dag", benchmarkLabel: null, level: null, levelMax: 1, scale: "zelfrapportage" },
        { key: "daylight", label: "Buiten in daglicht", answerLabel: "3\u00d7 per week", benchmarkLabel: null, level: null, levelMax: 1, scale: "zelfrapportage" },
      ]),
    ],
    beweging: [
      devMeasurement("beweging", "2026-06-10", "10 jun 2026", 24 + shift, 68, "intake", []),
    ],
    energie: [
      devMeasurement("energie", "2026-06-10", "10 jun 2026", 24 + shift, 47, "intake", []),
    ],
    herstel: [
      devMeasurement("herstel", "2026-06-10", "10 jun 2026", 24 + shift, 51, "intake", []),
    ],
    verbinding: [
      devMeasurement("verbinding", "2026-06-10", "10 jun 2026", 24 + shift, 58, "intake", []),
    ],
  };
}

const DEV_PILLAR_IDS: PillarId[] = [
  "slaap",
  "energie",
  "stress",
  "voeding",
  "beweging",
  "herstel",
  "verbinding",
];

/**
 * Scores en trend uit de meetreeks halen, net als in productie.
 *
 * In `account-dashboard.ts` is `currentScores[pijler]` per definitie het
 * laatste punt van `series[pijler]`, en `domainMeasurements` komt uit diezelfde
 * reeks. De dev-fixture schreef beide los van elkaar op, waardoor de ringen
 * andere getallen toonden dan de meetreeks eronder (voeding 38 tegen 61) en
 * `enginePriority` een ander domein aanwees dan de reeks rechtvaardigde. Dat is
 * geen productiegedrag maar een fixture-artefact — en precies het soort
 * afwijking dat je lokaal op het verkeerde been zet.
 *
 * Een domein zonder meetpunten valt terug op de score van de check zelf, zodat
 * de fixture blijft werken als er ooit een reeks wegvalt.
 */
function devCurrentFromMeasurements(
  mode: "scored" | "retest",
  fallback: CheckScores,
): { scores: CheckScores; trend: CheckTrend } {
  const measurements = devDomainMeasurements(mode);
  const scores = {} as CheckScores;
  const trend = {} as CheckTrend;

  for (const pillar of DEV_PILLAR_IDS) {
    const points = [...(measurements[pillar] ?? [])].sort((a, b) =>
      a.dateIso.localeCompare(b.dateIso),
    );
    if (points.length === 0) {
      scores[pillar] = fallback[pillar];
      trend[pillar] = [fallback[pillar]];
      continue;
    }
    scores[pillar] = points[points.length - 1].score;
    trend[pillar] = points.slice(-6).map((point) => point.score);
  }

  return { scores, trend };
}

export function buildDevDashboardData(
  mode: "scored" | "retest",
): DashboardData {
  const currentCheck = mode === "retest" ? CHECKS.check2 : CHECKS.check1;
  const measured = devCurrentFromMeasurements(mode, currentCheck.scores);
  const currentSnapshot: CheckSnapshot = {
    scores: measured.scores,
    vitality: computeVitaliteit(resolveVitaliteitFacets(toDomainScores(measured.scores))),
    date: currentCheck.date,
  };
  const history = filterHistory(mode === "retest" ? "check2" : "check1");
  const prev =
    mode === "retest"
      ? toSnapshot(CHECKS.check1)
      : history.length > 1
        ? {
            scores: currentSnapshot.scores,
            vitality: history[history.length - 2].vitality,
            date: history[history.length - 2].date,
          }
        : null;

  const deltaReport =
    mode === "retest"
      ? buildDeltaReport({
          baseline: toDomainScores(CHECKS.check1.scores),
          current: toDomainScores(CHECKS.check2.scores),
          daysBetween: 30,
          sustainedActions: [
            {
              domainId: "nutrition_score",
              action: PILLAR.voeding.quickWin.title,
            },
            {
              domainId: "movement_score",
              action: PILLAR.beweging.quickWin.title,
            },
          ],
          config: perfectSupplementMeasurementConfig,
          baselineRulesVersion: RULES_VERSION,
          currentRulesVersion: RULES_VERSION,
        })
      : null;

  return {
    empty: false,
    current: {
      ...currentSnapshot,
      trend: measured.trend,
    },
    prev,
    history,
    retest: mode === "retest",
    nutritionIntake: DEV_NUTRITION_INTAKE,
    nutritionCheckinReadout: DEV_NUTRITION_READOUT,
    nutritionLastLoggedAt: "2026-07-18T09:00:00.000Z",
    nutritionRelogDue: false,
    daysSinceNutritionLog: 3,
    movementRecoveryTrend: [
      { date: "2026-07-10", value: 3 },
      { date: "2026-07-14", value: 2 },
      { date: "2026-07-18", value: 4 },
    ],
    movementRcvFeel: 3,
    movementRcvFeelAt: "2026-07-18T10:00:00.000Z",
    remeasure:
      mode === "retest"
        ? { dueDate: "10 jul 2026", dueDateIso: "2026-07-10", daysUntil: -8 }
        : { dueDate: "10 jul 2026", dueDateIso: "2026-07-10", daysUntil: 22 },
    cycleEvidence:
      mode === "retest"
        ? {
            activeDays: 18,
            cycleDay: 30,
            cycleDayRaw: 30,
            daysUntilRemeasure: 0,
            cycleStartDate: "2026-06-10",
            cycleEndDate: "2026-07-10",
          }
        : {
            activeDays: 8,
            cycleDay: 8,
            cycleDayRaw: 8,
            daysUntilRemeasure: 22,
            cycleStartDate: "2026-06-10",
            cycleEndDate: "2026-07-10",
          },
    deltaReport,
    profileLabel: "Lage Batterij",
    firstName: "Dennis",
    answers: devAnswersForCheck(mode === "retest" ? "check2" : "check1"),
    sessionId: "dev-session",
    planProgress: null,
    movementPlanProgress: null,
    planDomain: "nutrition",
    priorityPref: null,
    sleepCheckinFocus: null,
    sleepCheckinSnapshot: null,
    movementCheckinSnapshot: null,
    hasStressCheckin: false,
    stressCheckinReport: null,
    // Dev-staten: één verlopen check (slaap), één die aftelt (stress), één vers
    // (voeding) en één die nog nooit gedaan is (beweging).
    domainCheckDaysAgo:
      mode === "retest"
        ? { slaap: 21, stress: 5, voeding: 0 }
        : { slaap: 3, stress: 9 },
    domainMeasurements: devDomainMeasurements(mode),
    movementPrefs: EMPTY_MOVEMENT_PREFS,
    supplementVerdicts: DEV_SUPPLEMENT_VERDICTS,
    proteinTarget: { gramsLow: 95, gramsHigh: 110 },
    ageRange: "55+",
  };
}
