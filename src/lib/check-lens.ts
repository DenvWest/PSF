import { PILLAR } from "@/data/dashboard";
import type { DomainScores } from "@/lib/intake-engine";
import { getPrimaryTheme } from "@/lib/primary-theme";
import { MEASURED_DOMAIN_TO_PILLAR } from "@/lib/measured-pillar-map";
import type { GuideThema } from "@/types/guide-opt-in";
import type { PillarId } from "@/types/dashboard";

export const CHECK_LENS_COPY = {
  eyebrow: "UIT JOUW LEEFSTIJLCHECK",
  resultsLabel: "Terug naar je overzicht",
  matchBadge: "Past bij jou",
} as const;

/** Welk gemeten domein een gezondheidsgids uitleest. `null` = de check meet dit thema niet. */
const GUIDE_DOMAIN: Record<GuideThema, { key: keyof DomainScores; pillar: PillarId } | null> = {
  slaap: { key: "sleep_score", pillar: "slaap" },
  stress: { key: "stress_score", pillar: "stress" },
  energie: { key: "energy_score", pillar: "energie" },
  herstel: { key: "recovery_score", pillar: "herstel" },
  voeding: { key: "nutrition_score", pillar: "voeding" },
  beweging: { key: "movement_score", pillar: "beweging" },
  testosteron: null,
};

export type CheckLensTarget = { kind: "guide"; thema: GuideThema };

export type CheckLensTone = "focus" | "pressure" | "watch" | "strength";

export type CheckLensModel = {
  tone: CheckLensTone;
  badge: string | null;
  score: { label: string; value: number; color: string } | null;
  lines: string[];
  cta: { href: string; label: string } | null;
};

export type CheckLensInput = {
  scores: DomainScores;
  answers: Record<string, number>;
};

function toneForScore(score: number): Exclude<CheckLensTone, "focus"> {
  if (score < 40) return "pressure";
  if (score < 60) return "watch";
  return "strength";
}

function focusPillar(input: CheckLensInput): { id: PillarId; label: string; score: number } {
  const theme = getPrimaryTheme(input.scores, input.answers);
  const id = MEASURED_DOMAIN_TO_PILLAR[theme];
  return {
    id,
    label: PILLAR[id].label,
    score: Math.round(scoreForPillar(input.scores, id)),
  };
}

const PILLAR_SCORE_KEY: Partial<Record<PillarId, keyof DomainScores>> = {
  slaap: "sleep_score",
  stress: "stress_score",
  energie: "energy_score",
  herstel: "recovery_score",
  voeding: "nutrition_score",
  beweging: "movement_score",
  verbinding: "connection_score",
};

function scoreForPillar(scores: DomainScores, pillar: PillarId): number {
  const key = PILLAR_SCORE_KEY[pillar];
  return key ? scores[key] : 0;
}

function buildGuideLens(thema: GuideThema, input: CheckLensInput): CheckLensModel {
  const focus = focusPillar(input);
  const mapping = GUIDE_DOMAIN[thema];

  if (!mapping) {
    return {
      tone: "watch",
      badge: null,
      score: null,
      lines: [
        `Je check meet dit thema niet apart. Je startpunt is ${focus.label} (${focus.score}/100) — lees deze gids met dat in je achterhoofd.`,
      ],
      cta: null,
    };
  }

  const pillar = PILLAR[mapping.pillar];
  const value = Math.round(input.scores[mapping.key]);
  const isFocus = mapping.pillar === focus.id;
  const tone: CheckLensTone = isFocus ? "focus" : toneForScore(value);

  const lines: string[] = [];
  if (isFocus) {
    lines.push(
      `Je check wees ${pillar.label.toLowerCase()} aan als je startpunt — daar gaat deze gids over.`,
    );
  } else if (tone === "pressure") {
    lines.push(
      `${pillar.label} staat bij jou onder druk. Deze gids pakt precies dat aan; je startpunt blijft ${focus.label.toLowerCase()}.`,
    );
  } else if (tone === "watch") {
    lines.push(
      `${pillar.label} heeft bij jou ruimte om te winnen. Je startpunt blijft ${focus.label.toLowerCase()} (${focus.score}/100).`,
    );
  } else {
    lines.push(
      `${pillar.label} is een van je sterkere domeinen. Lees dit als onderhoud — je winst zit nu bij ${focus.label.toLowerCase()} (${focus.score}/100).`,
    );
  }

  return {
    tone,
    badge: isFocus ? CHECK_LENS_COPY.matchBadge : null,
    score: { label: pillar.label, value, color: pillar.color },
    lines,
    cta: null,
  };
}

/**
 * Vertaalt een afgeronde leefstijlcheck naar één alinea die uitlegt hoe déze
 * pagina zich verhoudt tot wat er gemeten is. Nooit een diagnose: alleen de
 * gemeten score, het startpunt en of de pagina daarbij past.
 */
export function buildCheckLens(
  target: CheckLensTarget,
  input: CheckLensInput,
): CheckLensModel {
  return buildGuideLens(target.thema, input);
}
