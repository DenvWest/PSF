import {
  getInterventionsForTheme,
  type InterventionBuckets,
  type MatchedIntervention,
} from "@/lib/content/match-interventions";
import type { ThemeSlug } from "@/lib/content/themes";
import {
  calcDomainScores,
  getDeficiencySignals,
  getProfileLabel,
  type DomainScores,
} from "@/lib/intake-engine";
import type { NurtureInterventionHighlight } from "@/lib/email-templates/nurture/helpers";
import type { NurtureEmailData } from "@/lib/email-templates/nurture/types";
import { loadIntakeSessionPayloadBySessionId } from "@/lib/intake-session-server";
import { getPrimaryTheme } from "@/lib/primary-theme";
import type { QuestionId, SymptomId } from "@/data/intake-questions";

function parseAnswers(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

function parseSymptoms(raw: unknown): SymptomId[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const out: SymptomId[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      out.push(item as SymptomId);
    }
  }
  return out.length > 0 ? out : null;
}

function isDomainScores(value: unknown): value is DomainScores {
  if (!value || typeof value !== "object") {
    return false;
  }
  const keys: (keyof DomainScores)[] = [
    "sleep_score",
    "energy_score",
    "stress_score",
    "nutrition_score",
    "movement_score",
    "recovery_score",
  ];
  const o = value as Record<string, unknown>;
  return keys.every((k) => typeof o[k] === "number" && Number.isFinite(o[k]));
}

export async function getSleepInterventionBucketsForSession(
  sessionId: string,
): Promise<InterventionBuckets | null> {
  const loaded = await loadIntakeSessionPayloadBySessionId(sessionId);
  if (!loaded.ok || !loaded.session) {
    return null;
  }

  const session = loaded.session;
  const answers = parseAnswers(session.answers);
  const symptoms = parseSymptoms(session.symptoms);
  const scores = isDomainScores(session.scores)
    ? session.scores
    : answers
      ? calcDomainScores(answers as Record<QuestionId, number>)
      : null;

  if (!scores || !answers || !symptoms) {
    return null;
  }

  const themeSlug = getPrimaryTheme(scores, answers);
  if (themeSlug !== "sleep") {
    return null;
  }

  const deficiencySignals = getDeficiencySignals(answers as Record<QuestionId, number>);
  const profileLabel = getProfileLabel(scores);

  const plan = await getInterventionsForTheme(
    themeSlug as ThemeSlug,
    scores,
    deficiencySignals,
    profileLabel,
    answers as Record<QuestionId, number>,
  );

  if (plan.source !== "database") {
    return null;
  }

  const { buckets } = plan;
  if (
    !buckets.free_action ||
    !buckets.measurement ||
    !buckets.supplement
  ) {
    return null;
  }

  return buckets;
}

export function interventionForNurtureDay(
  buckets: InterventionBuckets,
  sequenceDay: number,
): MatchedIntervention | null {
  switch (sequenceDay) {
    case 3:
      return buckets.free_action;
    case 14:
      return buckets.measurement;
    case 21:
      return buckets.supplement;
    default:
      return null;
  }
}

export function nurtureInterventionHighlight(
  intervention: MatchedIntervention,
): NurtureInterventionHighlight {
  const kindLabel =
    intervention.kind === "free_action"
      ? "Gratis actie"
      : intervention.kind === "measurement"
        ? "Meten"
        : "Supplement";
  const body =
    intervention.goalPhrase?.trim() || intervention.description.trim();
  return {
    title: intervention.name,
    body,
    kindLabel,
    comparePath: intervention.comparisonPath,
  };
}

export function resolveNurtureInterventionHighlight(
  data: Pick<NurtureEmailData, "interventionBuckets" | "sequenceDay">,
): NurtureInterventionHighlight | null {
  const buckets = data.interventionBuckets;
  if (!buckets) {
    return null;
  }
  const intervention = interventionForNurtureDay(buckets, data.sequenceDay);
  if (!intervention) {
    return null;
  }
  return nurtureInterventionHighlight(intervention);
}
