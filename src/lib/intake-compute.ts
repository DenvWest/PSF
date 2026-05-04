import {
  INTAKE_AGE_RANGE_OPTIONS,
  QUESTIONS,
  SYMPTOMS,
  type IntakeAgeRange,
  type SymptomId,
} from "@/data/intake-questions";
import type { IntakeAnswers } from "@/types/intake-answers";
import {
  calcDomainScores,
  getProfileLabel,
  getUrgency,
  type DomainScores,
} from "@/lib/intake-engine";

const AGE_SET = new Set<string>(INTAKE_AGE_RANGE_OPTIONS);
const SYMPTOM_SET = new Set<SymptomId>(SYMPTOMS.map((s) => s.id));

const QUESTION_VALID_VALUES: Record<
  keyof IntakeAnswers,
  Set<number>
> = {} as Record<keyof IntakeAnswers, Set<number>>;

for (const q of QUESTIONS) {
  QUESTION_VALID_VALUES[q.id] = new Set(q.options.map((o) => o.value));
}

export type IntakePersistenceFields = {
  scores: DomainScores;
  urgency: string;
  profile: string;
};

/**
 * Berekent scores en persisteerbare urgency/profile-strings (zelfde als bestaande client-flow).
 */
export function computeIntakePersistenceFields(
  answers: Record<string, number>,
): IntakePersistenceFields {
  const scores = calcDomainScores(answers);
  return {
    scores,
    urgency: getUrgency(scores).label,
    profile: getProfileLabel(scores).name,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type ValidatedIntakeBody = {
  ageRange: IntakeAgeRange;
  symptoms: SymptomId[];
  answers: IntakeAnswers;
};

/**
 * Valideert allowlists voor leeftijd, symptomen en antwoorden t.o.v. intake-definities.
 */
export function validateIntakeSubmission(body: unknown):
  | { ok: true; value: ValidatedIntakeBody }
  | { ok: false; error: string } {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Ongeldig verzoek" };
  }

  const ageRange = body.ageRange;
  if (typeof ageRange !== "string" || !AGE_SET.has(ageRange)) {
    return { ok: false, error: "Ongeldige leeftijdscategorie." };
  }

  const symptomsRaw = body.symptoms;
  if (!Array.isArray(symptomsRaw)) {
    return { ok: false, error: "Ongeldige symptomen." };
  }

  const symptoms: SymptomId[] = [];
  const seenSym = new Set<SymptomId>();
  for (const item of symptomsRaw) {
    if (typeof item !== "string" || !SYMPTOM_SET.has(item as SymptomId)) {
      return { ok: false, error: "Onbekend symptoom." };
    }
    const sid = item as SymptomId;
    if (!seenSym.has(sid)) {
      seenSym.add(sid);
      symptoms.push(sid);
    }
  }

  if (symptoms.length === 0) {
    return { ok: false, error: "Selecteer minimaal één symptoom." };
  }

  const answersRaw = body.answers;
  if (!isPlainObject(answersRaw)) {
    return { ok: false, error: "Ongeldige antwoorden." };
  }

  const answers = {} as IntakeAnswers;

  for (const q of QUESTIONS) {
    const raw = answersRaw[q.id];
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return { ok: false, error: "Ontbrekende of ongeldige antwoorden." };
    }
    const allowed = QUESTION_VALID_VALUES[q.id];
    if (!allowed?.has(raw)) {
      return { ok: false, error: "Ongeldige antwoordwaarde." };
    }
    answers[q.id] = raw;
  }

  return {
    ok: true,
    value: {
      ageRange: ageRange as IntakeAgeRange,
      symptoms,
      answers,
    },
  };
}
