import type { DomainScoreKey, DomainScores } from "@/lib/intake-engine";

export type DeltaDirection = "up" | "down" | "neutral";

export type MeasurementDomainConfig = {
  id: DomainScoreKey;
  label: string;
  color: string;
};

export type MeasurementConfig = {
  domains: MeasurementDomainConfig[];
  indexFormula: (scores: DomainScores) => number;
  locale: string;
};

export type SustainedAction = {
  domainId: DomainScoreKey;
  action: string;
};

export type DomainDeltaEntry = {
  domainId: DomainScoreKey;
  was: number;
  now: number;
  delta: number;
  direction: DeltaDirection;
};

export type VitalityDelta = {
  was: number;
  now: number;
  delta: number;
  direction: DeltaDirection;
};

export type CouplingEntry = {
  domainId: DomainScoreKey;
  action: string;
  delta: number;
};

export type DeltaMethod = {
  sameInstrument: boolean;
  selfReported: boolean;
  directional: boolean;
  notDiagnosis: boolean;
  daysBetween: number;
};

export type DeltaReport = {
  perDomain: DomainDeltaEntry[];
  vitality: VitalityDelta;
  movedPriority: { from: DomainScoreKey; to: DomainScoreKey } | null;
  coupling: CouplingEntry[];
  method: DeltaMethod;
  methodologyChanged: boolean;
};

export type BuildDeltaReportInput = {
  baseline: DomainScores;
  current: DomainScores;
  daysBetween: number;
  sustainedActions: SustainedAction[];
  config: MeasurementConfig;
  baselineRulesVersion?: string;
  currentRulesVersion?: string;
};
