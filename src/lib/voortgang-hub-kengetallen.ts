import type { PillarId, DashboardData } from "@/types/dashboard";

/**
 * Kengetalrijen voor de leefstijlprofiel-hub — alleen als de eigen domeincheck
 * factRows heeft geleverd. Geen ad-hoc `domain === "slaap"` meer: elk rail-
 * domein met snapshot-factRows verschijnt hier hetzelfde.
 */
export type HubKengetalRow = {
  label: string;
  answerLabel: string;
  benchmarkLabel: string | null;
};

export function resolveHubKengetalRows(
  domain: PillarId,
  data: DashboardData | null | undefined,
): HubKengetalRow[] | null {
  if (!data) return null;

  if (domain === "slaap") {
    const rows = data.sleepCheckinSnapshot?.factRows;
    if (!rows || rows.length === 0) return null;
    return rows.slice(0, 3).map((row) => ({
      label: row.label,
      answerLabel: row.answerLabel,
      benchmarkLabel: row.benchmarkLabel,
    }));
  }

  if (domain === "stress") {
    const rows = data.stressCheckinSnapshot?.factRows;
    if (!rows || rows.length === 0) return null;
    return rows.slice(0, 3).map((row) => ({
      label: row.label,
      answerLabel: row.answerLabel,
      benchmarkLabel: row.benchmarkLabel,
    }));
  }

  if (domain === "beweging") {
    const rows = data.movementCheckinSnapshot?.factRows;
    if (!rows || rows.length === 0) return null;
    return rows.slice(0, 3).map((row) => ({
      label: row.label,
      answerLabel: row.answerLabel,
      benchmarkLabel: row.benchmarkLabel ?? null,
    }));
  }

  return null;
}
