import type { SymptomId } from "@/data/intake-questions";
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
  SLP_QUAL: { label: "Hoe beoordeel je je slaapkwaliteit?", domain: "slaap" },
  SLP_CONS: { label: "Hoe consistent is je slaapritme?", domain: "slaap" },
  NRG_PATN: { label: "Hoe is je energiepatroon over de dag?", domain: "energie" },
  NRG_DEP: { label: "Hoeveel ben je afhankelijk van cafeïne of suiker?", domain: "energie" },
  STR_FREQ: { label: "Hoe vaak ervaar je stress?", domain: "stress" },
  STR_RECV: { label: "Hoe goed herstel je van stress?", domain: "stress" },
  NUT_QUAL: { label: "Hoe beoordeel je je voedingskwaliteit?", domain: "voeding" },
  NUT_O3: { label: "Hoe vaak eet je vette vis of omega-3 rijke voeding?", domain: "voeding" },
  NUT_PROT: { label: "Hoe beoordeel je je eiwitinname?", domain: "voeding" },
  MOV_FREQ: { label: "Hoe vaak beweeg je intensief per week?", domain: "beweging" },
  MOV_DAILY: { label: "Hoeveel beweeg je dagelijks (wandelen, fietsen)?", domain: "beweging" },
  RCV_PHYS: { label: "Hoe goed herstelt je lichaam na inspanning?", domain: "herstel" },
  RCV_MENT: { label: "Hoe goed herstelt je hoofd na een drukke dag?", domain: "herstel" },
};

const QUESTION_ORDER = [
  "SLP_QUAL", "SLP_CONS", "NRG_PATN", "NRG_DEP",
  "STR_FREQ", "STR_RECV", "NUT_QUAL", "NUT_O3",
  "NUT_PROT", "MOV_FREQ", "MOV_DAILY", "RCV_PHYS", "RCV_MENT",
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
          "Hallo! Ik help je met een korte leefstijlcheck. Ik stel je 13 vragen over slaap, energie, stress, voeding, beweging en herstel. Op basis van je antwoorden krijg je een persoonlijk Herstelplan. Laten we beginnen!\n\nHoe beoordeel je je slaapkwaliteit? (1 = slecht, 4 = uitstekend)",
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
  let msg = `Je profiel: **${profile.name}**\n`;
  msg += `Status: ${urgency.label}\n\n`;

  if (advice.quickWins.length > 0) {
    msg += "**Quick wins:**\n";
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
  return `Je bent een leefstijladviseur van PerfectSupplement. Je helpt mannen 40+ met een korte intake over 6 domeinen: slaap, energie, stress, voeding, beweging en herstel. Stel één vraag tegelijk. Verwacht een score van 1-4. Wees kort, vriendelijk en to-the-point. Geef geen medisch advies.`;
}
