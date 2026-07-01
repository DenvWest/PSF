import type { QuestionId } from "@/data/intake-questions";
import { getDisplayStatus, type DisplayStatus } from "@/lib/score-display";
import type { DomainScores } from "@/lib/intake-engine";
import type { PillarId } from "@/types/dashboard";

type HabitKernelInput = {
  vitality: number;
  priorityId: PillarId;
  priorityScore: number;
  answers: Record<string, number> | null;
  domainScores: DomainScores;
};

export type HabitScoreKernel = {
  vitalityBand: DisplayStatus;
  confidence: number;
  driverPillarId: PillarId;
  driverPillarLabel: string;
  driverPillarScore: number;
  driverHabitId: string;
  driverHabitLine: string;
  driverLinkLine: string;
  nextBestHabit: string;
};

const PILLAR_LABEL: Record<PillarId, string> = {
  slaap: "Slaap",
  energie: "Energie",
  stress: "Stress",
  voeding: "Voeding",
  beweging: "Beweging",
  herstel: "Herstel",
  verbinding: "Verbinding",
};

const PILLAR_QUESTIONS: Record<PillarId, QuestionId[]> = {
  slaap: ["SLP_QUAL", "SLP_CONS", "SLP_ONSET", "SLP_WAKE"],
  energie: ["NRG_PATN", "NRG_DEP"],
  stress: ["STR_FREQ", "STR_RCV"],
  voeding: ["NUT_O3", "NUT_PROT"],
  beweging: ["MOV_STR", "MOV_CARD"],
  herstel: ["RCV_PHYS"],
  verbinding: ["CON_SOC"],
};

function getAnswer(answers: Record<string, number>, id: QuestionId): number {
  const value = answers[id];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function resolveWeakestQuestion(
  priorityId: PillarId,
  answers: Record<string, number>,
): { id: QuestionId; value: number } {
  const ids = PILLAR_QUESTIONS[priorityId];
  let weakest = { id: ids[0], value: getAnswer(answers, ids[0]) || 99 };

  for (const id of ids.slice(1)) {
    const value = getAnswer(answers, id) || 99;
    if (value < weakest.value) {
      weakest = { id, value };
    }
  }
  return weakest;
}

function resolveDriverHabitLine(id: QuestionId, value: number): string {
  if (id === "NUT_PROT" && value <= 2) {
    return value === 1
      ? "Je let nauwelijks op je eiwitinname."
      : "Je eiwitinname blijft nu te laag.";
  }
  if (id === "NUT_O3" && value <= 2) {
    return "Vette vis komt te weinig terug in je week.";
  }
  if (id === "SLP_ONSET" && value <= 2) {
    return "Inslapen kost je structureel te veel tijd.";
  }
  if (id === "SLP_WAKE" && value <= 2) {
    return "Je nachten zijn te vaak onderbroken.";
  }
  if (id === "SLP_CONS" && value <= 2) {
    return "Je slaapritme is te wisselend.";
  }
  if (id === "STR_FREQ" && value <= 2) {
    return "Spanning ligt te vaak boven je herstel.";
  }
  if (id === "STR_RCV" && value <= 2) {
    return "Herstelmomenten ontbreken op drukke dagen.";
  }
  if (id === "MOV_STR" && value <= 2) {
    return "Krachttraining komt te weinig terug in je week.";
  }
  if (id === "MOV_CARD" && value <= 2) {
    return "Je totale beweegvolume blijft te laag.";
  }
  if (id === "RCV_PHYS" && value <= 2) {
    return value === 1
      ? "Herstel na belasting duurt te lang."
      : "Je hersteltempo blijft achter.";
  }
  if (id === "CON_SOC" && value <= 2) {
    return "Betekenisvol contact of steun schiet erbij in.";
  }
  if (id === "NRG_PATN" && value <= 2) {
    return "Je energiecurve is instabiel.";
  }
  if (id === "NRG_DEP" && value <= 2) {
    return "Je leunt te vaak op snelle prikkels voor energie.";
  }
  return "Je leefstijlritme is nog niet stabiel genoeg.";
}

function resolveNextBestHabit(id: QuestionId, value: number): string {
  if (id === "NUT_PROT" && value <= 2) {
    return "Focus nu: zet bij elke maaltijd eerst een eiwitbron neer.";
  }
  if (id === "NUT_O3" && value <= 2) {
    return "Focus nu: plan twee vismomenten in je week.";
  }
  if (id === "SLP_ONSET" && value <= 2) {
    return "Focus nu: 60 minuten schermvrij voor bedtijd.";
  }
  if (id === "SLP_WAKE" && value <= 2) {
    return "Focus nu: houd je avondroutine zeven dagen gelijk.";
  }
  if (id === "SLP_CONS" && value <= 2) {
    return "Focus nu: vaste slaap- en wektijd, ook in het weekend.";
  }
  if (id === "STR_FREQ" && value <= 2) {
    return "Focus nu: plan dagelijks tien minuten herstel.";
  }
  if (id === "STR_RCV" && value <= 2) {
    return "Focus nu: na drukte twee minuten rustig uitademen.";
  }
  if (id === "MOV_STR" && value <= 2) {
    return "Focus nu: twee korte krachtsessies per week.";
  }
  if (id === "MOV_CARD" && value <= 2) {
    return "Focus nu: elke dag twintig minuten stevig wandelen.";
  }
  if (id === "RCV_PHYS" && value <= 2) {
    return "Focus nu: plan herstel net zo strak als training.";
  }
  if (id === "CON_SOC" && value <= 2) {
    return "Focus nu: plan één vast contactmoment deze week.";
  }
  if (id === "NRG_PATN" && value <= 2) {
    return "Focus nu: start je ochtend met daglicht en eiwit.";
  }
  if (id === "NRG_DEP" && value <= 2) {
    return "Focus nu: vervang een prikkelmoment door een herstelmoment.";
  }
  return "Focus nu: kies één habit en houd die zeven dagen vast.";
}

function resolveScoreMeaning(vitality: number, band: DisplayStatus): string {
  if (band === "Prioriteit") {
    return `Vitaliteit ${vitality}: je basis is kwetsbaar.`;
  }
  if (band === "Aandacht") {
    return `Vitaliteit ${vitality}: je basis is bruikbaar, maar instabiel.`;
  }
  if (band === "Voldoende") {
    return `Vitaliteit ${vitality}: je basis staat, met duidelijke winstkans.`;
  }
  return `Vitaliteit ${vitality}: je basis is sterk, met ruimte voor verfijning.`;
}

export function buildHabitScoreKernel(input: HabitKernelInput): HabitScoreKernel {
  const vitalityBand = getDisplayStatus(input.vitality);
  const label = PILLAR_LABEL[input.priorityId];
  const baseConfidence = input.answers ? 0.78 : 0.42;

  if (!input.answers) {
    return {
      vitalityBand,
      confidence: Number(baseConfidence.toFixed(2)),
      driverPillarId: input.priorityId,
      driverPillarLabel: label,
      driverPillarScore: input.priorityScore,
      driverHabitId: "unknown",
      driverHabitLine: "We missen nog detail om je driver-habit scherp te maken.",
      driverLinkLine: `${label} staat op ${input.priorityScore} en houdt je vitaliteit op ${input.vitality}.`,
      nextBestHabit: "Focus nu: doe opnieuw de check voor een scherpere habit-focus.",
    };
  }

  const weakest = resolveWeakestQuestion(input.priorityId, input.answers);
  const driverHabitId = `${weakest.id}:${weakest.value}`;
  const driverHabitLine = resolveDriverHabitLine(weakest.id, weakest.value);

  const driverLinkLine = `${label} staat op ${input.priorityScore} en houdt vitaliteit op ${input.vitality}.`;

  return {
    vitalityBand,
    confidence: Number((baseConfidence + 0.18).toFixed(2)),
    driverPillarId: input.priorityId,
    driverPillarLabel: label,
    driverPillarScore: input.priorityScore,
    driverHabitId,
    driverHabitLine,
    driverLinkLine,
    nextBestHabit: resolveNextBestHabit(weakest.id, weakest.value),
  };
}

export function getVitalityScoreMeaning(vitality: number): string {
  return resolveScoreMeaning(vitality, getDisplayStatus(vitality));
}
