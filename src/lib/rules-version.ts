export type RulesVersionParts = {
  major: number;
  minor: number;
  patch: number;
};

export function parseRulesVersion(version: string): RulesVersionParts | null {
  const trimmed = version.trim();
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(trimmed);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function compareRulesVersions(left: string, right: string): number | null {
  const a = parseRulesVersion(left);
  const b = parseRulesVersion(right);
  if (!a || !b) {
    return null;
  }

  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

export function isRulesVersionBefore(
  version: string,
  threshold: string,
): boolean {
  const cmp = compareRulesVersions(version, threshold);
  return cmp !== null && cmp < 0;
}

/** Recovery-delta alleen vergelijkbaar vanaf 1.1.0 (RCV_PHYS-only). */
export const RECOVERY_DELTA_COMPARABLE_FROM = "1.1.0" as const;

/** Vitaliteit-delta alleen vergelijkbaar vanaf 1.3.0 (5 interventie-facets). */
export const VITALITY_DELTA_COMPARABLE_FROM = "1.3.0" as const;

/** Verbinding-delta alleen vergelijkbaar vanaf 1.3.0 (CON_SOC). */
export const CONNECTION_DELTA_COMPARABLE_FROM = "1.3.0" as const;

export function isRecoveryDeltaComparable(
  baselineVersion: string,
  currentVersion: string,
): boolean {
  if (baselineVersion === currentVersion) {
    return true;
  }
  return (
    !isRulesVersionBefore(baselineVersion, RECOVERY_DELTA_COMPARABLE_FROM) &&
    !isRulesVersionBefore(currentVersion, RECOVERY_DELTA_COMPARABLE_FROM)
  );
}

export function isVitalityDeltaComparable(
  baselineVersion: string,
  currentVersion: string,
): boolean {
  if (baselineVersion === currentVersion) {
    return true;
  }
  return (
    !isRulesVersionBefore(baselineVersion, VITALITY_DELTA_COMPARABLE_FROM) &&
    !isRulesVersionBefore(currentVersion, VITALITY_DELTA_COMPARABLE_FROM)
  );
}

export function isConnectionDeltaComparable(
  baselineVersion: string,
  currentVersion: string,
): boolean {
  if (baselineVersion === currentVersion) {
    return true;
  }
  return (
    !isRulesVersionBefore(baselineVersion, CONNECTION_DELTA_COMPARABLE_FROM) &&
    !isRulesVersionBefore(currentVersion, CONNECTION_DELTA_COMPARABLE_FROM)
  );
}

export function hasMethodologyChange(
  baselineVersion: string,
  currentVersion: string,
): boolean {
  return (
    !isRecoveryDeltaComparable(baselineVersion, currentVersion) ||
    !isVitalityDeltaComparable(baselineVersion, currentVersion) ||
    !isConnectionDeltaComparable(baselineVersion, currentVersion)
  );
}
