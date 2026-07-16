import {
  computePerDomainDelta,
  sanitizePerDomainDelta,
} from "@/lib/intake-baseline";
import type { DomainScoreKey } from "@/lib/intake-engine";
import { hasMethodologyChange } from "@/lib/rules-version";
import type {
  BuildDeltaReportInput,
  CouplingEntry,
  DeltaDirection,
  DeltaReport,
  DomainDeltaEntry,
  VitalityDelta,
} from "@/types/delta-report";

function resolveDirection(delta: number): DeltaDirection {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "neutral";
}

function resolveRulesVersions(input: BuildDeltaReportInput): {
  baselineRulesVersion: string;
  currentRulesVersion: string;
} | null {
  const { baselineRulesVersion, currentRulesVersion } = input;
  if (!baselineRulesVersion || !currentRulesVersion) {
    return null;
  }
  return { baselineRulesVersion, currentRulesVersion };
}

function buildVitalityDelta(
  baseline: BuildDeltaReportInput["baseline"],
  current: BuildDeltaReportInput["current"],
  indexFormula: BuildDeltaReportInput["config"]["indexFormula"],
  methodologyChanged: boolean,
): VitalityDelta {
  const was = indexFormula(baseline);
  const now = indexFormula(current);
  const delta = methodologyChanged ? 0 : now - was;
  return { was, now, delta, direction: resolveDirection(delta) };
}

function buildPerDomain(
  baseline: BuildDeltaReportInput["baseline"],
  current: BuildDeltaReportInput["current"],
  config: BuildDeltaReportInput["config"],
  rulesVersions: {
    baselineRulesVersion: string;
    currentRulesVersion: string;
  } | null,
): DomainDeltaEntry[] {
  const deltas = rulesVersions
    ? sanitizePerDomainDelta({
        baseline,
        current,
        baselineRulesVersion: rulesVersions.baselineRulesVersion,
        currentRulesVersion: rulesVersions.currentRulesVersion,
      })
    : computePerDomainDelta(baseline, current);

  return config.domains
    .map((domain) => {
      const was = baseline[domain.id];
      const now = current[domain.id];
      const delta = deltas[domain.id];
      return {
        domainId: domain.id,
        was,
        now,
        delta,
        direction: resolveDirection(delta),
      };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

function resolveWeakestDomain(
  scores: BuildDeltaReportInput["current"],
  config: BuildDeltaReportInput["config"],
): DomainScoreKey {
  let weakest = config.domains[0].id;
  let lowest = scores[weakest];

  for (const domain of config.domains) {
    const value = scores[domain.id];
    if (value < lowest) {
      lowest = value;
      weakest = domain.id;
    }
  }

  return weakest;
}

function buildMovedPriority(
  baseline: BuildDeltaReportInput["baseline"],
  current: BuildDeltaReportInput["current"],
  config: BuildDeltaReportInput["config"],
): DeltaReport["movedPriority"] {
  const from = resolveWeakestDomain(baseline, config);
  const to = resolveWeakestDomain(current, config);
  return from === to ? null : { from, to };
}

function buildCoupling(
  sustainedActions: BuildDeltaReportInput["sustainedActions"],
  perDomain: DomainDeltaEntry[],
): CouplingEntry[] {
  const deltaByDomain = new Map(
    perDomain.map((entry) => [entry.domainId, entry.delta]),
  );

  return sustainedActions
    .map((action) => {
      const delta = deltaByDomain.get(action.domainId);
      if (delta === undefined || delta <= 0) {
        return null;
      }
      return {
        domainId: action.domainId,
        action: action.action,
        delta,
      };
    })
    .filter((entry): entry is CouplingEntry => entry !== null)
    .sort((a, b) => b.delta - a.delta);
}

export function buildDeltaReport(input: BuildDeltaReportInput): DeltaReport {
  const { baseline, current, daysBetween, sustainedActions, config } = input;
  const rulesVersions = resolveRulesVersions(input);
  const methodologyChanged = rulesVersions
    ? hasMethodologyChange(
        rulesVersions.baselineRulesVersion,
        rulesVersions.currentRulesVersion,
      )
    : false;
  const perDomain = buildPerDomain(baseline, current, config, rulesVersions);

  return {
    perDomain,
    vitality: buildVitalityDelta(
      baseline,
      current,
      config.indexFormula,
      methodologyChanged,
    ),
    movedPriority: buildMovedPriority(baseline, current, config),
    coupling: buildCoupling(sustainedActions, perDomain),
    method: {
      sameInstrument: true,
      selfReported: true,
      directional: true,
      notDiagnosis: true,
      daysBetween,
    },
    methodologyChanged,
  };
}
