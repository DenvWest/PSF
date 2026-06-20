export type DashboardUnlockVariant = "a" | "b";

export const DASHBOARD_UNLOCK_VARIANT_COOKIE = "ps_dashboard_unlock_variant";

export function parseDashboardUnlockVariant(
  value: string | undefined | null,
): DashboardUnlockVariant | null {
  if (value === "a" || value === "b") {
    return value;
  }
  return null;
}

export function pickDashboardUnlockVariant(): DashboardUnlockVariant {
  return Math.random() < 0.5 ? "a" : "b";
}

export function resolveDashboardUnlockVariant(input: {
  queryVariant?: string | null;
  cookieVariant?: string | null;
}): { variant: DashboardUnlockVariant; persistCookie: boolean } {
  const fromQuery = parseDashboardUnlockVariant(input.queryVariant);
  if (fromQuery) {
    return { variant: fromQuery, persistCookie: false };
  }

  const fromCookie = parseDashboardUnlockVariant(input.cookieVariant);
  if (fromCookie) {
    return { variant: fromCookie, persistCookie: false };
  }

  return { variant: pickDashboardUnlockVariant(), persistCookie: true };
}
