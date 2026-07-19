// EXPERIMENTAL: scaffold for future multi-tenant work. Not used by production pages. Do not refactor production routes against this API yet.

import type { SymptomId } from "@/data/intake-questions";
import { INTAKE_CTA, INTAKE_DELIVERABLE } from "@/lib/intake-product-copy";
import { createIntakeStrategy, type IntakeAnswers, type IntakeResults } from "./intake-strategy";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatIntakeState {
  messages: ChatMessage[];
  collectedAnswers: Record<string, number>;
  collectedSymptoms: SymptomId[];
  ageRange?: string;
  phase: "collecting" | "computing" | "complete";
  results?: IntakeResults;
}

const QUESTION_MAP: Record<string, { label: string; domain: string }> = {
  SLP_QUAL: { label: "Hoe vaak word je uitgerust wakker?", domain: "slaap" },
  SLP_CONS: { label: "Houd je een vast slaap-waakritme aan?", domain: "slaap" },
  SLP_ONSET: { label: "Hoe lang doe je erover om in te slapen?", domain: "slaap" },
  SLP_WAKE: { label: "Hoe vaak word je 's nachts wakker?", domain: "slaap" },
  NRG_PATN: { label: "Hoe is je energie overdag?", domain: "energie" },
  NRG_DEP: {
    label: "Heb je oppeppers nodig om de dag door te komen?",
    domain: "energie",
  },
  STR_FREQ: { label: "Hoe vaak ervaar je stress?", domain: "stress" },
  STR_RCV: {
    label: "Kom je op drukke dagen tot rust?",
    domain: "stress",
  },
  NUT_O3: { label: "Hoe vaak eet je vette vis of omega-3 rijke voeding?", domain: "voeding" },
  NUT_PROT: {
    label: "Hoe vaak bevat een maaltijd eiwit bij jou?",
    domain: "voeding",
  },
  MOV_STR: { label: "Hoe vaak doe je krachttraining?", domain: "beweging" },
  MOV_CARD: { label: "Hoe vaak beweeg je matig intensief (praten lukt, zingen niet)?", domain: "beweging" },
  RCV_PHYS: { label: "Hoe goed herstelt je lichaam na inspanning?", domain: "herstel" },
  LIF_ALC: { label: "Hoe vaak drink je 3+ glazen alcohol op één avond?", domain: "leefstijl" },
  LIF_SUN: { label: "Hoeveel buitenlicht krijg je gemiddeld?", domain: "leefstijl" },
};

const QUESTION_ORDER = [
  "SLP_QUAL", "SLP_CONS", "SLP_ONSET", "SLP_WAKE",
  "NRG_PATN", "NRG_DEP",
  "STR_FREQ", "STR_RCV",
  "NUT_O3", "NUT_PROT",
  "MOV_STR", "MOV_CARD",
  "RCV_PHYS",
  "LIF_ALC", "LIF_SUN",
];

export function createInitialChatState(): ChatIntakeState {
  return {
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(),
      },
      {
        role: "assistant",
        content:
          `Hallo! Ik help je met een korte leefstijlcheck. Ik stel je 15 vragen over slaap, energie, stress, voeding, beweging, herstel en leefstijl. Op basis van je antwoorden krijg je een persoonlijk ${INTAKE_DELIVERABLE.labelCapitalized}. Laten we beginnen!\n\nHoe beoordeel je je slaapkwaliteit? (1 = slecht, 4 = uitstekend)`,
      },
    ],
    collectedAnswers: {},
    collectedSymptoms: [],
    phase: "collecting",
  };
}

export function getNextQuestion(state: ChatIntakeState): string | null {
  for (const qId of QUESTION_ORDER) {
    if (!(qId in state.collectedAnswers)) {
      return qId;
    }
  }
  return null;
}

export function processUserResponse(
  state: ChatIntakeState,
  userMessage: string,
): ChatIntakeState {
  const nextQ = getNextQuestion(state);
  if (!nextQ) {
    return computeResults(state);
  }

  const parsed = parseNumericAnswer(userMessage);
  if (parsed === null) {
    return {
      ...state,
      messages: [
        ...state.messages,
        { role: "user", content: userMessage },
        {
          role: "assistant",
          content: "Ik verwacht een getal tussen 1 en 4. Kun je je antwoord als cijfer geven?",
        },
      ],
    };
  }

  const updatedAnswers = { ...state.collectedAnswers, [nextQ]: parsed };
  const updatedState: ChatIntakeState = {
    ...state,
    collectedAnswers: updatedAnswers,
    messages: [
      ...state.messages,
      { role: "user", content: userMessage },
    ],
  };

  const followUpQ = getNextQuestion(updatedState);
  if (!followUpQ) {
    return computeResults(updatedState);
  }

  const questionInfo = QUESTION_MAP[followUpQ];
  return {
    ...updatedState,
    messages: [
      ...updatedState.messages,
      {
        role: "assistant",
        content: `${questionInfo.label} (1 = laag/slecht, 4 = hoog/goed)`,
      },
    ],
  };
}

function computeResults(state: ChatIntakeState): ChatIntakeState {
  const strategy = createIntakeStrategy("chat");
  const input: IntakeAnswers = {
    answers: state.collectedAnswers,
    symptoms: state.collectedSymptoms,
    ageRange: state.ageRange,
  };

  const results = strategy.computeResults(input);

  return {
    ...state,
    phase: "complete",
    results,
    messages: [
      ...state.messages,
      {
        role: "assistant",
        content: formatResults(results),
      },
    ],
  };
}

function formatResults(results: IntakeResults): string {
  const { profile, urgency, advice } = results;
  let msg = `${INTAKE_CTA.chatPatternPrefix} **${profile.name}**\n`;
  msg += `Status: ${urgency.label}\n\n`;

  if (advice.quickWins.length > 0) {
    msg += `**${INTAKE_CTA.chatBeginStepsHeading}**\n`;
    for (const win of advice.quickWins) {
      msg += `• ${win}\n`;
    }
    msg += "\n";
  }

  if (advice.supplements.length > 0) {
    msg += "**Supplementsuggesties:**\n";
    for (const supp of advice.supplements) {
      msg += `• ${supp.name}: ${supp.reason}\n`;
    }
    msg += "\n";
  }

  if (advice.longTerm.length > 0) {
    msg += "**Lange termijn:**\n";
    for (const lt of advice.longTerm) {
      msg += `• ${lt}\n`;
    }
  }

  return msg;
}

function parseNumericAnswer(input: string): number | null {
  const trimmed = input.trim();
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 1 || num > 4) return null;
  return num;
}

function buildSystemPrompt(): string {
  return `Je bent een leefstijladviseur van PerfectSupplement. Je helpt mannen 40+ met een korte intake over slaap, energie, stress, voeding, beweging, herstel en leefstijl. Stel één vraag tegelijk. Verwacht een score van 1-4. Wees kort, vriendelijk en to-the-point. Geef geen medisch advies.`;
}
